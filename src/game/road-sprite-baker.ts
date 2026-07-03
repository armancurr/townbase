import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { RoadAssetKey } from "../city/city-layout";
import { roadSpriteKey, type RoadRotation, type RoadTile } from "./road-layout";

// ---------------------------------------------------------------------------
// Road sprite baker
//
// The game itself is a flat 2D Phaser isometric scene, but the road art comes
// from the Kenney city-kit glb models. To get crisp, correctly-projected road
// tiles we render each model once, offscreen, with three.js and hand the
// resulting canvas to Phaser as a texture. three.js is never used during
// gameplay - it is purely an asset baker invoked at boot.
// ---------------------------------------------------------------------------

const roadTextureUrl = new URL(
  "../../assets/kenney_city-kit-roads/Models/GLB format/Textures/colormap.png",
  import.meta.url,
).href;

const roadAssetModules = import.meta.glob(
  "../../assets/kenney_city-kit-roads/Models/GLB format/*.glb",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

const roadAssetUrls = new Map<RoadAssetKey, string>();
for (const [path, url] of Object.entries(roadAssetModules)) {
  const fileName = path.split("/").pop()?.replace(".glb", "") as
    | RoadAssetKey
    | undefined;
  if (fileName) {
    roadAssetUrls.set(fileName, url);
  }
}

// Isometric projection tuned to a true 2:1 diamond so baked sprites register
// exactly with the scene's 128x64 grid cells. Azimuth 45deg, elevation 30deg
// (sin 30 = 0.5 -> width:height = 2:1).
const CAMERA_DIRECTION = new THREE.Vector3(1, 0.8165, 1).normalize();
const CAMERA_DISTANCE = 12;

// Baked resolution. The diamond (a 1x1 tile footprint) is rendered at
// TARGET_DIAMOND_PX wide; the canvas is padded so raised elements (curbs,
// lights) are not clipped. Baking at 2x the on-screen size keeps sprites crisp
// after Phaser downscales them.
const TARGET_DIAMOND_PX = 256;
const CANVAS_PX = 384;

// World units mapped to the canvas so a unit tile's horizontal diagonal
// (sqrt(2) world units) spans TARGET_DIAMOND_PX pixels.
const PX_PER_WORLD = TARGET_DIAMOND_PX / Math.SQRT2;
const HALF_SPAN = CANVAS_PX / 2 / PX_PER_WORLD;

export type BakedRoadSprites = {
  canvases: Map<string, HTMLCanvasElement>;
  // Pixel width the baked diamond occupies; used to derive the on-screen scale.
  diamondPx: number;
};

function createLoadingManager() {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    if (url.endsWith("Textures/colormap.png")) {
      return roadTextureUrl;
    }
    return url;
  });
  return manager;
}

function frameModel(model: THREE.Object3D, rotationDeg: RoadRotation) {
  model.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
  model.updateMatrixWorld(true);

  // Centre the footprint on the origin (X/Z) and seat the base on y = 0 so the
  // tile centre projects to the canvas centre regardless of the model's own
  // pivot.
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
}

export async function bakeRoadSprites(
  tiles: RoadTile[],
): Promise<BakedRoadSprites> {
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

  const loader = new GLTFLoader(createLoadingManager());
  const gltfCache = new Map<RoadAssetKey, THREE.Group>();

  // Unique (asset, rotation) combinations required by the layout.
  const combos = new Map<string, { asset: RoadAssetKey; rotation: RoadRotation }>();
  for (const tile of tiles) {
    const rotation = tile.rotation ?? 0;
    combos.set(roadSpriteKey(tile.asset, rotation), {
      asset: tile.asset,
      rotation,
    });
  }

  for (const [key, { asset, rotation }] of combos) {
    let source = gltfCache.get(asset);
    if (!source) {
      const url = roadAssetUrls.get(asset);
      if (!url) {
        throw new Error(`Missing road asset: ${asset}`);
      }
      const gltf = await loader.loadAsync(url);
      source = gltf.scene;
      gltfCache.set(asset, source);
    }

    const model = source.clone(true);
    frameModel(model, rotation);

    const root = new THREE.Group();
    root.add(model);
    scene.add(root);
    renderer.render(scene, camera);
    scene.remove(root);

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_PX;
    canvas.height = CANVAS_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to acquire 2D context for road sprite bake.");
    }
    ctx.drawImage(renderer.domElement, 0, 0);
    canvases.set(key, canvas);
  }

  renderer.dispose();

  return { canvases, diamondPx: TARGET_DIAMOND_PX };
}
