import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  placeableSpriteKey,
  type AssetPack,
  type PlaceableAsset,
  type TileRotation,
} from "./placed-assets";

// ---------------------------------------------------------------------------
// Placeable sprite baker
//
// Phaser owns the live editor scene. The Kenney assets are GLBs, so each
// (asset, rotation) is rendered once into a transparent canvas with a 2:1
// isometric camera, then registered as a Phaser texture.
// ---------------------------------------------------------------------------

const textureModules = {
  roads: import.meta.glob(
    "../../assets/kenney_city-kit-roads/Models/GLB format/Textures/*.png",
    { query: "?url", import: "default", eager: true },
  ) as Record<string, string>,
  commercial: import.meta.glob(
    "../../assets/kenney_city-kit-commercial_2.1/Models/GLB format/Textures/*.png",
    { query: "?url", import: "default", eager: true },
  ) as Record<string, string>,
  industrial: import.meta.glob(
    "../../assets/kenney_city-kit-industrial_1.0/Models/GLB format/Textures/*.png",
    { query: "?url", import: "default", eager: true },
  ) as Record<string, string>,
} satisfies Record<AssetPack, Record<string, string>>;

const CAMERA_DIRECTION = new THREE.Vector3(1, 0.8165, 1).normalize();
const CAMERA_DISTANCE = 18;
const TARGET_DIAMOND_PX = 256;
const CANVAS_PX = 2048;
const CROP_PADDING_PX = 8;
const PX_PER_WORLD = TARGET_DIAMOND_PX / Math.SQRT2;
const HALF_SPAN = CANVAS_PX / 2 / PX_PER_WORLD;
const ROTATIONS: TileRotation[] = [0, 90, 180, 270];

export type SpriteFootprint = {
  cols: number;
  rows: number;
};

export type BakedPlaceableSprite = {
  canvas: HTMLCanvasElement;
  originX: number;
  originY: number;
  footprint: SpriteFootprint;
};

export type BakedPlaceableSprites = {
  sprites: Map<string, BakedPlaceableSprite>;
  diamondPx: number;
};

function createLoadingManager(getPack: () => AssetPack) {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    const textureName = url.split("/").pop();
    if (textureName) {
      const texturePath = Object.keys(textureModules[getPack()]).find((path) =>
        path.endsWith(`/${textureName}`),
      );
      if (texturePath) {
        return textureModules[getPack()][texturePath];
      }
    }

    return url;
  });
  return manager;
}

function boundsForModel(model: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  return { box, size };
}

function footprintForSize(size: THREE.Vector3, rotationDeg: TileRotation): SpriteFootprint {
  const cols = Math.max(1, Math.ceil(size.x - 0.05));
  const rows = Math.max(1, Math.ceil(size.z - 0.05));

  if (rotationDeg === 90 || rotationDeg === 270) {
    return { cols: rows, rows: cols };
  }

  return { cols, rows };
}

function frameModel(model: THREE.Object3D, rotationDeg: TileRotation) {
  const { box } = boundsForModel(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
  model.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
  model.updateMatrixWorld(true);
}

function cloneWithMaterials(source: THREE.Object3D) {
  const clone = source.clone(true);
  clone.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => material.clone());
    } else {
      mesh.material = mesh.material.clone();
    }
  });
  return clone;
}

function projectedCanvasPoint(
  point: THREE.Vector3,
  camera: THREE.Camera,
  canvasSize: number,
) {
  const projected = point.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * canvasSize,
    y: (-projected.y * 0.5 + 0.5) * canvasSize,
  };
}

function projectedBoundsForBox(box: THREE.Box3, camera: THREE.Camera, canvasSize: number) {
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ].map((corner) => projectedCanvasPoint(corner, camera, canvasSize));

  return {
    minX: Math.min(...corners.map((corner) => corner.x)),
    minY: Math.min(...corners.map((corner) => corner.y)),
    maxX: Math.max(...corners.map((corner) => corner.x)),
    maxY: Math.max(...corners.map((corner) => corner.y)),
  };
}

function cropRenderedCanvas(
  source: HTMLCanvasElement,
  origin: { x: number; y: number },
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
) {
  const cropX = Math.max(0, Math.floor(bounds.minX) - CROP_PADDING_PX);
  const cropY = Math.max(0, Math.floor(bounds.minY) - CROP_PADDING_PX);
  const cropRight = Math.min(source.width - 1, Math.ceil(bounds.maxX) + CROP_PADDING_PX);
  const cropBottom = Math.min(source.height - 1, Math.ceil(bounds.maxY) + CROP_PADDING_PX);
  const cropWidth = cropRight - cropX + 1;
  const cropHeight = cropBottom - cropY + 1;

  const canvas = document.createElement("canvas");
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to acquire 2D context for cropped placeable sprite.");
  }

  ctx.drawImage(
    source,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return {
    canvas,
    originX: origin.x - cropX,
    originY: origin.y - cropY,
  };
}

function renderCroppedModel(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  model: THREE.Object3D,
) {
  const root = new THREE.Group();
  root.add(model);
  scene.add(root);
  const projectedBounds = projectedBoundsForBox(
    new THREE.Box3().setFromObject(model),
    camera,
    CANVAS_PX,
  );
  renderer.clear();
  renderer.render(scene, camera);
  scene.remove(root);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_PX;
  canvas.height = CANVAS_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to acquire 2D context for placeable sprite bake.");
  }

  ctx.drawImage(renderer.domElement, 0, 0);
  const origin = projectedCanvasPoint(new THREE.Vector3(0, 0, 0), camera, CANVAS_PX);
  return cropRenderedCanvas(canvas, origin, projectedBounds);
}

export async function bakePlaceableSprites(
  assets: PlaceableAsset[],
): Promise<BakedPlaceableSprites> {
  const sprites = new Map<string, BakedPlaceableSprite>();
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(CANVAS_PX, CANVAS_PX, false);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x60708a, 2.1));
  const sun = new THREE.DirectionalLight(0xfff2d4, 2.6);
  sun.position.set(-6, 10, 4);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const camera = new THREE.OrthographicCamera(
    -HALF_SPAN,
    HALF_SPAN,
    HALF_SPAN,
    -HALF_SPAN,
    0.1,
    100,
  );
  camera.position.copy(CAMERA_DIRECTION).multiplyScalar(CAMERA_DISTANCE);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  let currentPack: AssetPack = "roads";
  const loader = new GLTFLoader(createLoadingManager(() => currentPack));
  const gltfCache = new Map<string, THREE.Group>();

  for (const asset of assets) {
    let source = gltfCache.get(asset.id);
    if (!source) {
      currentPack = asset.pack;
      const gltf = await loader.loadAsync(asset.modelUrl);
      source = gltf.scene;
      gltfCache.set(asset.id, source);
    }
    const { size } = boundsForModel(source);

    for (const rotation of ROTATIONS) {
      const model = cloneWithMaterials(source);
      frameModel(model, rotation);

      const cropped = renderCroppedModel(renderer, scene, camera, model);
      sprites.set(placeableSpriteKey(asset.id, rotation), {
        ...cropped,
        footprint: footprintForSize(size, rotation),
      });
    }
  }

  renderer.dispose();
  return { sprites, diamondPx: TARGET_DIAMOND_PX };
}
