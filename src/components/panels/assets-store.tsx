import type { PlaceableAsset } from "../../types";

type AssetsStoreProps = {
  assets: PlaceableAsset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
};

export function AssetsStore({ assets, selectedAssetId, onSelectAsset }: AssetsStoreProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Assets store">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#f7fbf2]">Assets Store</h2>
          <p className="mt-1 text-xs text-[#cdd8c4]/70">Select an asset, then place it on the map.</p>
        </div>
        <span className="shrink-0 text-xs text-[#cdd8c4]/60">{assets.length}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-auto pr-1 scrollbar-none">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelectAsset(asset.id)}
            className={`group aspect-square rounded-md border p-2 transition ${
              selectedAssetId === asset.id
                ? "border-[#d9e4cd] bg-[#d9e4cd]"
                : "border-[#3f4e47] bg-[#17201d]/74 hover:border-[#96a79d] hover:bg-[#22302b]"
            }`}
            title={asset.label}
            aria-label={`Select ${asset.label}`}
            aria-pressed={selectedAssetId === asset.id}
          >
            <img src={asset.previewUrl} alt="" className="h-full w-full object-contain" loading="lazy" />
          </button>
        ))}
      </div>
    </section>
  );
}
