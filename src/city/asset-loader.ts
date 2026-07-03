import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { CityAssetKey, CityObjectDefinition } from "./city-layout";

type LoadedAsset = {
  key: CityAssetKey;
  scene: THREE.Group;
};

type AssetPack = NonNullable<CityObjectDefinition["pack"]>;
type LoadableAssetPack = Exclude<AssetPack, "suburban">;

const MODEL_SCALE_MULTIPLIER = 1.85;

const industrialAssetModules = import.meta.glob(
  "../../assets/kenney_city-kit-industrial_1.0/Models/GLB format/*.glb",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const commercialAssetModules = import.meta.glob(
  "../../assets/kenney_city-kit-commercial_2.1/Models/GLB format/*.glb",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const textureModules = import.meta.glob(
  "../../assets/kenney_city-kit-industrial_1.0/Models/Textures/*.png",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const packTextureUrls = {
  industrial: new URL(
    "../../assets/kenney_city-kit-industrial_1.0/Models/GLB format/Textures/colormap.png",
    import.meta.url,
  ).href,
  commercial: new URL(
    "../../assets/kenney_city-kit-commercial_2.1/Models/GLB format/Textures/colormap.png",
    import.meta.url,
  ).href,
} satisfies Record<LoadableAssetPack, string>;

const assetUrls = new Map<string, string>();
const textureUrls = new Map<NonNullable<CityObjectDefinition["variant"]>, string>();

for (const [path, url] of Object.entries(industrialAssetModules)) {
  const fileName = path.split("/").pop()?.replace(".glb", "") as CityAssetKey | undefined;
  if (fileName) {
    assetUrls.set(assetCacheKey("industrial", fileName), url);
  }
}

for (const [path, url] of Object.entries(commercialAssetModules)) {
  const fileName = path.split("/").pop()?.replace(".glb", "") as CityAssetKey | undefined;
  if (fileName) {
    assetUrls.set(assetCacheKey("commercial", fileName), url);
  }
}

for (const [path, url] of Object.entries(textureModules)) {
  const variant = path.match(/variation-([abc])\.png$/)?.[1] as
    | NonNullable<CityObjectDefinition["variant"]>
    | undefined;
  if (variant) {
    textureUrls.set(variant, url);
  }
}

function assetCacheKey(pack: LoadableAssetPack, key: CityAssetKey) {
  return `${pack}:${key}`;
}

function createLoadingManager(pack: LoadableAssetPack) {
  const manager = new THREE.LoadingManager();

  manager.setURLModifier((url) => {
    if (url.endsWith("Textures/colormap.png")) {
      return packTextureUrls[pack];
    }

    return url;
  });

  return manager;
}

export class CityAssetLoader {
  private readonly loaders = {
    industrial: new GLTFLoader(createLoadingManager("industrial")),
    commercial: new GLTFLoader(createLoadingManager("commercial")),
  } satisfies Record<LoadableAssetPack, GLTFLoader>;
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly assets = new Map<string, Promise<LoadedAsset>>();
  private readonly textures = new Map<string, Promise<THREE.Texture>>();

  get loadedCount() {
    return this.assets.size;
  }

  async createObject(definition: CityObjectDefinition) {
    const pack = definition.pack ?? "industrial";
    if (pack === "suburban") {
      return new THREE.Group();
    }

    const loadedAsset = await this.load(pack, definition.asset);
    const object = loadedAsset.scene.clone(true);

    this.prepareObject(object);

    if (pack === "industrial" && definition.variant) {
      await this.applyVariantTexture(object, definition.variant);
    }

    object.position.set(definition.x, 0, definition.z);
    object.rotation.y = definition.rotationY ?? 0;
    object.scale.setScalar((definition.scale ?? 1) * MODEL_SCALE_MULTIPLIER);
    object.name = definition.asset;

    return object;
  }

  private load(pack: LoadableAssetPack, key: CityAssetKey) {
    const cacheKey = assetCacheKey(pack, key);
    const cached = this.assets.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = assetUrls.get(cacheKey);
    if (!url) {
      throw new Error(`Missing ${pack} city asset: ${key}`);
    }

    const request = this.loaders[pack].loadAsync(url).then((gltf) => ({
      key,
      scene: gltf.scene,
    }));

    this.assets.set(cacheKey, request);
    return request;
  }

  private loadTexture(variant: NonNullable<CityObjectDefinition["variant"]>) {
    const url = textureUrls.get(variant);
    if (!url) {
      throw new Error(`Missing industrial texture variation: ${variant}`);
    }

    const cached = this.textures.get(url);
    if (cached) {
      return cached;
    }

    const request = this.textureLoader.loadAsync(url).then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      return texture;
    });

    this.textures.set(url, request);
    return request;
  }

  private async applyVariantTexture(
    object: THREE.Object3D,
    variant: NonNullable<CityObjectDefinition["variant"]>,
  ) {
    const texture = await this.loadTexture(variant);

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const nextMaterials = materials.map((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) {
          return material;
        }

        const nextMaterial = material.clone();
        nextMaterial.map = texture;
        nextMaterial.needsUpdate = true;
        return nextMaterial;
      });

      child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];
    });
  }

  private prepareObject(object: THREE.Object3D) {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });
  }
}
