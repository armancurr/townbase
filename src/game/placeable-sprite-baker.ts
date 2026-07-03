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
const CANVAS_PX = 512;
const PX_PER_WORLD = TARGET_DIAMOND_PX / Math.SQRT2;
const HALF_SPAN = CANVAS_PX / 2 / PX_PER_WORLD;
const ROTATIONS: TileRotation[] = [0, 90, 180, 270];

export type BakedPlaceableSprites = {
  canvases: Map<string, HTMLCanvasElement>;
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

function frameModel(model: THREE.Object3D, rotationDeg: TileRotation) {
  model.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
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

export async function bakePlaceableSprites(
  assets: PlaceableAsset[],
): Promise<BakedPlaceableSprites> {
  const canvases = new Map<string, HTMLCanvasElement>();
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

    for (const rotation of ROTATIONS) {
      const model = cloneWithMaterials(source);
      frameModel(model, rotation);

      const root = new THREE.Group();
      root.add(model);
      scene.add(root);
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
      canvases.set(placeableSpriteKey(asset.id, rotation), canvas);
    }
  }

  renderer.dispose();
  return { canvases, diamondPx: TARGET_DIAMOND_PX };
}
