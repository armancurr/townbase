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

const roadAssetUrls = {
  "road-straight": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-straight.glb",
    import.meta.url,
  ).href,
  "road-straight-half": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-straight-half.glb",
    import.meta.url,
  ).href,
  "road-intersection": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-intersection.glb",
    import.meta.url,
  ).href,
  "road-crossroad": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-crossroad.glb",
    import.meta.url,
  ).href,
  "road-curve": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-curve.glb",
    import.meta.url,
  ).href,
  "road-bend": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-bend.glb",
    import.meta.url,
  ).href,
  "road-square": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-square.glb",
    import.meta.url,
  ).href,
  "road-end": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-end.glb",
    import.meta.url,
  ).href,
  "road-roundabout": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-roundabout.glb",
    import.meta.url,
  ).href,
  "road-side": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-side.glb",
    import.meta.url,
  ).href,
  "road-side-entry": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-side-entry.glb",
    import.meta.url,
  ).href,
  "road-side-exit": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-side-exit.glb",
    import.meta.url,
  ).href,
  "road-driveway-single": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-driveway-single.glb",
    import.meta.url,
  ).href,
  "road-driveway-double": new URL(
    "../../assets/kenney_city-kit-roads/Models/GLB format/road-driveway-double.glb",
    import.meta.url,
  ).href,
} satisfies Record<RoadAssetKey, string>;

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

    const url = roadAssetUrls[key];

    const request = this.loader.loadAsync(url).then((gltf) => ({
      key,
      scene: gltf.scene,
    }));

    this.assets.set(key, request);
    return request;
  }
}
