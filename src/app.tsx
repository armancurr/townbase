import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { CityScene } from "./city/city-scene";
import { createMovementGameConfig } from "./game/movement-game-config";

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const game = new Phaser.Game(createMovementGameConfig(container));
    gameRef.current = game;

    return () => {
      gameRef.current = null;
      game.destroy(true);
    };
  }, []);

  return (
    <main className="movement-shell">
      <div ref={containerRef} className="movement-viewport" />
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
