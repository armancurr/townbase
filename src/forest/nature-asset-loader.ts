import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { natureAssetKeys, type ForestObjectDefinition, type NatureAssetKey } from "./forest-layout";

type LoadedNatureAsset = {
  key: NatureAssetKey;
  scene: THREE.Group;
};

const assetUrls = Object.fromEntries(
  natureAssetKeys.map((key) => [
    key,
    new URL(`../../assets/kenney_nature-kit/Models/GLTF format/${key}.glb`, import.meta.url).href,
  ]),
) as Record<NatureAssetKey, string>;

export class NatureAssetLoader {
  private readonly loader = new GLTFLoader();
  private readonly assets = new Map<NatureAssetKey, Promise<LoadedNatureAsset>>();

  async createObject(definition: ForestObjectDefinition) {
    const loadedAsset = await this.load(definition.asset);
    const object = loadedAsset.scene.clone(true);

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });

    object.position.set(definition.x, 0, definition.z);
    object.rotation.y = definition.rotationY ?? 0;
    object.scale.setScalar(definition.scale ?? 1);
    object.name = definition.asset;

    return object;
  }

  private load(key: NatureAssetKey) {
    const cached = this.assets.get(key);
    if (cached) {
      return cached;
    }

    const url = assetUrls[key];
    if (!url) {
      throw new Error(`Missing nature asset: ${key}`);
    }

    const request = this.loader.loadAsync(url).then((gltf) => ({
      key,
      scene: gltf.scene,
    }));

    this.assets.set(key, request);
    return request;
  }
}
