import { useEffect, useRef, useState } from "react";
import { CityScene } from "./city/city-scene";

type CityStats = {
  roadTiles: number;
  blocks: number;
  homes: number;
  cameraMode: string;
};

export function App() {
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
          <p className="city-kicker">Industrial District</p>
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
