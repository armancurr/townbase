import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { RoadAssetKey, RoadTileDefinition } from "./city-layout";

type LoadedRoadAsset = {
  key: RoadAssetKey;
  scene: THREE.Group;
};

const roadTextureUrl = new URL(
  "../../assets/kenney_city-kit-roads/Models/GLB format/Textures/colormap.png",
  import.meta.url,
).href;

const roadAssetModules = import.meta.glob(
  "../../assets/kenney_city-kit-roads/Models/GLB format/*.glb",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const roadAssetUrls = new Map<RoadAssetKey, string>();

for (const [path, url] of Object.entries(roadAssetModules)) {
  const fileName = path.split("/").pop()?.replace(".glb", "") as RoadAssetKey | undefined;
  if (fileName) {
    roadAssetUrls.set(fileName, url);
  }
}

function createRoadLoadingManager() {
  const manager = new THREE.LoadingManager();

  manager.setURLModifier((url) => {
    if (url.endsWith("Textures/colormap.png")) {
      return roadTextureUrl;
    }

    return url;
  });

  return manager;
}

export class RoadAssetLoader {
  private readonly loader = new GLTFLoader(createRoadLoadingManager());
  private readonly assets = new Map<RoadAssetKey, Promise<LoadedRoadAsset>>();

  async createTile(definition: RoadTileDefinition, tileSize: number) {
    const loadedAsset = await this.load(definition.asset);
    const object = loadedAsset.scene.clone(true);

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    object.position.set(definition.gridX * tileSize, 0.04, definition.gridZ * tileSize);
    object.rotation.y = THREE.MathUtils.degToRad(definition.rotation);
    object.scale.setScalar(tileSize);
    object.name = definition.id;

    return object;
  }

  private load(key: RoadAssetKey) {
    const cached = this.assets.get(key);
    if (cached) {
      return cached;
    }

    const url = roadAssetUrls.get(key);
    if (!url) {
      throw new Error(`Missing road asset: ${key}`);
    }

    const request = this.loader.loadAsync(url).then((gltf) => ({
      key,
      scene: gltf.scene,
    }));

    this.assets.set(key, request);
    return request;
  }
}
