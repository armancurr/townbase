import * as THREE from "three";
import { forestLayout, forestStats } from "./forest-layout";
import { NatureAssetLoader } from "./nature-asset-loader";

type ForestSceneStats = {
  terrainTiles: number;
  trees: number;
  undergrowth: number;
  shelters: number;
  cameraMode: string;
};

type ForestSceneOptions = {
  onStatsChange?: (stats: ForestSceneStats) => void;
};

const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const DEFAULT_ZOOM = 8.2;
const CAMERA_DIRECTION = new THREE.Vector3(1, 1.12, 1).normalize();
const CAMERA_DISTANCE = 210;

export class ForestScene {
  private readonly scene = new THREE.Scene();
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  private readonly natureAssetLoader = new NatureAssetLoader();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 600);
  private readonly target = DEFAULT_TARGET.clone();
  private readonly pointer = new THREE.Vector2();
  private readonly lastPointer = new THREE.Vector2();
  private readonly panPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly raycaster = new THREE.Raycaster();
  private readonly options: ForestSceneOptions;

  private animationFrame = 0;
  private width = 1;
  private height = 1;
  private zoom = DEFAULT_ZOOM;
  private isDragging = false;
  private disposed = false;

  constructor(
    private readonly container: HTMLElement,
    options: ForestSceneOptions = {},
  ) {
    this.options = options;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor("#9db6aa");
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = "city-canvas";
    this.renderer.domElement.setAttribute("aria-label", "Forest camp map");

    container.appendChild(this.renderer.domElement);

    this.setupScene();
    this.resize();
    this.resetCamera();
    this.attachEvents();
    this.animate();
    this.emitStats();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.resize);
    this.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.removeEventListener("pointermove", this.handlePointerMove);
    this.renderer.domElement.removeEventListener("pointerup", this.handlePointerUp);
    this.renderer.domElement.removeEventListener("pointercancel", this.handlePointerUp);
    this.renderer.domElement.removeEventListener("wheel", this.handleWheel);
    this.renderer.dispose();
    this.container.replaceChildren();
  }

  resetCamera = () => {
    this.target.copy(DEFAULT_TARGET);
    this.zoom = DEFAULT_ZOOM;
    this.updateCamera();
  };

  private setupScene() {
    this.scene.background = new THREE.Color("#9db6aa");

    const hemi = new THREE.HemisphereLight("#f3ffe2", "#3f5746", 1.75);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight("#fff1c8", 3.4);
    sun.position.set(-70, 130, 48);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 260;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight("#ffffff", 0.26));

    void this.populateTerrain();
    void this.populateForest();
  }

  private async populateTerrain() {
    const tiles = await Promise.all(
      forestLayout.terrain.map((definition) => this.natureAssetLoader.createObject(definition)),
    );

    if (this.disposed) {
      return;
    }

    for (const tile of tiles) {
      this.scene.add(tile);
    }
  }

  private async populateForest() {
    const objects = await Promise.all(
      [
        ...forestLayout.trees,
        ...forestLayout.undergrowth,
        ...forestLayout.camp,
      ].map((definition) => this.natureAssetLoader.createObject(definition)),
    );

    if (this.disposed) {
      return;
    }

    for (const object of objects) {
      this.scene.add(object);
    }
  }

  private attachEvents() {
    window.addEventListener("resize", this.resize);
    this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.addEventListener("pointermove", this.handlePointerMove);
    this.renderer.domElement.addEventListener("pointerup", this.handlePointerUp);
    this.renderer.domElement.addEventListener("pointercancel", this.handlePointerUp);
    this.renderer.domElement.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  private resize = () => {
    const bounds = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(bounds.width));
    this.height = Math.max(1, Math.floor(bounds.height));
    this.renderer.setSize(this.width, this.height, false);
    this.updateCamera();
  };

  private handlePointerDown = (event: PointerEvent) => {
    this.isDragging = true;
    this.lastPointer.set(event.clientX, event.clientY);
    this.renderer.domElement.setPointerCapture(event.pointerId);
  };

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.isDragging) {
      return;
    }

    this.pointer.set(event.clientX, event.clientY);
    const before = this.screenToGround(this.lastPointer.x, this.lastPointer.y);
    const after = this.screenToGround(this.pointer.x, this.pointer.y);

    if (before && after) {
      this.target.add(before.sub(after));
      this.updateCamera();
    }

    this.lastPointer.copy(this.pointer);
  };

  private handlePointerUp = (event: PointerEvent) => {
    this.isDragging = false;
    if (this.renderer.domElement.hasPointerCapture(event.pointerId)) {
      this.renderer.domElement.releasePointerCapture(event.pointerId);
    }
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = THREE.MathUtils.clamp(this.zoom * zoomDelta, 5.2, 22);
    this.updateCamera();
  };

  private screenToGround(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    );
    this.raycaster.setFromCamera(ndc, this.camera);

    const point = new THREE.Vector3();
    return this.raycaster.ray.intersectPlane(this.panPlane, point) ? point : null;
  }

  private updateCamera() {
    const aspect = this.width / this.height;
    const verticalSpan = 1200 / this.zoom;
    const horizontalSpan = verticalSpan * aspect;

    this.camera.left = -horizontalSpan / 2;
    this.camera.right = horizontalSpan / 2;
    this.camera.top = verticalSpan / 2;
    this.camera.bottom = -verticalSpan / 2;
    this.camera.position.copy(this.target).addScaledVector(CAMERA_DIRECTION, CAMERA_DISTANCE);
    this.camera.lookAt(this.target);
    this.camera.updateProjectionMatrix();
    this.emitStats();
  }

  private animate = () => {
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private emitStats() {
    this.options.onStatsChange?.({
      terrainTiles: forestStats.terrainTiles,
      trees: forestStats.trees,
      undergrowth: forestStats.undergrowth,
      shelters: forestStats.shelters,
      cameraMode: `Orthographic ${this.zoom.toFixed(1)}x`,
    });
  }
}
