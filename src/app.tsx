import { useEffect, useMemo, useRef, useState } from "react";
import Phaser from "phaser";
import { CityScene } from "./city/city-scene";
import { IsometricMovementScene } from "./game/isometric-movement-scene";
import { createMovementGameConfig } from "./game/movement-game-config";
import { bakePlaceableSprites } from "./game/placeable-sprite-baker";
import {
  assetPackLabels,
  assetPackOrder,
  placeableAssets,
  placeableAssetsById,
  type PlacedTile,
  type TileRotation,
} from "./game/placed-assets";

const PLACED_TILES_STORAGE_KEY = "bystanderland:placed-tiles:v1";

type CityStats = {
  roadTiles: number;
  blocks: number;
  homes: number;
  cameraMode: string;
};

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return pathname;
}

function isTileRotation(value: unknown): value is TileRotation {
  return value === 0 || value === 90 || value === 180 || value === 270;
}

function loadPlacedTiles() {
  const raw = window.localStorage.getItem(PLACED_TILES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((tile): tile is PlacedTile => {
      if (!tile || typeof tile !== "object") {
        return false;
      }

      const candidate = tile as Partial<PlacedTile>;
      const col = candidate.col;
      const row = candidate.row;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.assetId === "string" &&
        placeableAssetsById.has(candidate.assetId) &&
        typeof col === "number" &&
        Number.isInteger(col) &&
        typeof row === "number" &&
        Number.isInteger(row) &&
        col >= 0 &&
        col < 40 &&
        row >= 0 &&
        row < 40 &&
        isTileRotation(candidate.rotation)
      );
    });
  } catch {
    return [];
  }
}

function savePlacedTiles(tiles: PlacedTile[]) {
  window.localStorage.setItem(PLACED_TILES_STORAGE_KEY, JSON.stringify(tiles));
}

function CityRoute() {
  const sceneRef = useRef<CityScene | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stats, setStats] = useState<CityStats>({
    roadTiles: 0,
    blocks: 0,
    homes: 0,
    cameraMode: "Orthographic",
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new CityScene(container, {
      onStatsChange: setStats,
    });
    sceneRef.current = scene;

    return () => {
      sceneRef.current = null;
      scene.dispose();
    };
  }, []);

  return (
    <main className="city-shell">
      <div ref={containerRef} className="city-viewport" />
      <section className="city-overlay" aria-label="Map status">
        <div>
          <p className="city-kicker">Suburban Township</p>
        </div>
        <dl className="city-status">
          <div>
            <dt>Road tiles</dt>
            <dd>{stats.roadTiles}</dd>
          </div>
          <div>
            <dt>Blocks</dt>
            <dd>{stats.blocks}</dd>
          </div>
          <div>
            <dt>Homes</dt>
            <dd>{stats.homes}</dd>
          </div>
          <div>
            <dt>Camera</dt>
            <dd>{stats.cameraMode}</dd>
          </div>
        </dl>
        <button type="button" onClick={() => sceneRef.current?.resetCamera()}>
          Reset camera
        </button>
      </section>
    </main>
  );
}

function MovementRoute() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedAssetIdRef = useRef(placeableAssets[0]?.id ?? "");
  const toolRef = useRef<"asset" | "erase">("asset");
  const rotationRef = useRef<TileRotation>(0);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>(loadPlacedTiles);
  const [selectedAssetId, setSelectedAssetId] = useState(selectedAssetIdRef.current);
  const [tool, setTool] = useState<"asset" | "erase">("asset");
  const [rotation, setRotation] = useState<TileRotation>(0);
  const [isBaking, setIsBaking] = useState(true);

  const assetsByPack = useMemo(
    () =>
      assetPackOrder.map((pack) => ({
        pack,
        label: assetPackLabels[pack],
        assets: placeableAssets.filter((asset) => asset.pack === pack),
      })),
    [],
  );

  useEffect(() => {
    selectedAssetIdRef.current = selectedAssetId;
  }, [selectedAssetId]);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;

    void bakePlaceableSprites(placeableAssets).then((baked) => {
      if (disposed) {
        return;
      }

      const game = new Phaser.Game(
        createMovementGameConfig(container, {
          placedTiles,
          placeableSprites: baked,
          onCellClick: (col, row) => {
            setPlacedTiles((current) => {
              const withoutCell = current.filter(
                (tile) => tile.col !== col || tile.row !== row,
              );

              if (toolRef.current === "erase") {
                return withoutCell;
              }

              const assetId = selectedAssetIdRef.current;
              if (!placeableAssetsById.has(assetId)) {
                return current;
              }

              return [
                ...withoutCell,
                {
                  id: `tile:${col}:${row}`,
                  assetId,
                  col,
                  row,
                  rotation: rotationRef.current,
                },
              ];
            });
          },
        }),
      );
      gameRef.current = game;
      setIsBaking(false);
    });

    return () => {
      disposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    savePlacedTiles(placedTiles);

    const game = gameRef.current;
    if (!game) {
      return;
    }

    const scene = game.scene.getScene("isometric-movement-scene") as
      | IsometricMovementScene
      | undefined;
    scene?.setPlacedTiles(placedTiles);
  }, [placedTiles]);

  function selectAsset(assetId: string) {
    setSelectedAssetId(assetId);
    setTool("asset");
  }

  function rotateSelection() {
    setRotation((current) => (((current + 90) % 360) as TileRotation));
  }

  function clearMap() {
    setPlacedTiles([]);
  }

  const selectedAsset = placeableAssetsById.get(selectedAssetId);

  return (
    <main className="movement-shell">
      <div ref={containerRef} className="movement-viewport" />
      <aside className="editor-toolbar" aria-label="Asset placement tools">
        <div className="editor-toolbar__header">
          <strong>Build</strong>
          <span>{placedTiles.length} placed</span>
        </div>

        <div className="editor-preview">
          {selectedAsset ? (
            <img
              src={selectedAsset.previewUrl}
              alt=""
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          ) : null}
          <div>
            <strong>{tool === "erase" ? "Erase" : selectedAsset?.label}</strong>
            <span>{rotation} deg</span>
          </div>
        </div>

        <div className="editor-actions">
          <button type="button" onClick={rotateSelection} title="Rotate selection">
            ↻
          </button>
          <button
            type="button"
            className={tool === "erase" ? "is-active" : ""}
            onClick={() => setTool("erase")}
            title="Erase"
          >
            ⌫
          </button>
          <button type="button" onClick={clearMap} title="Clear map">
            Clear
          </button>
        </div>

        {isBaking ? <p className="editor-loading">Preparing assets...</p> : null}

        <div className="editor-pack-list">
          {assetsByPack.map(({ pack, label, assets }) => (
            <div key={pack} className="editor-section">
              <h2>
                {label} <span>{assets.length}</span>
              </h2>
              <div className="asset-grid">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className={
                      tool === "asset" && selectedAssetId === asset.id ? "is-active" : ""
                    }
                    onClick={() => selectAsset(asset.id)}
                    title={asset.label}
                  >
                    <img src={asset.previewUrl} alt="" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}

export function App() {
  const pathname = usePathname();

  if (pathname === "/city") {
    return <CityRoute />;
  }

  return <MovementRoute />;
}
