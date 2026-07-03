import * as THREE from "three";
import { CityAssetLoader } from "./asset-loader";
import { cityLayout, cityObjectCount, type RoadDefinition } from "./city-layout";
import { cityMaterials } from "./city-materials";

type CitySceneStats = {
  loadedAssets: number;
  totalObjects: number;
  cameraMode: string;
};

type CitySceneOptions = {
  onStatsChange?: (stats: CitySceneStats) => void;
};

const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
const DEFAULT_ZOOM = 11;
const CAMERA_DIRECTION = new THREE.Vector3(1, 1.05, 1).normalize();
const CAMERA_DISTANCE = 150;

export class CityScene {
  private readonly scene = new THREE.Scene();
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 600);
  private readonly assetLoader = new CityAssetLoader();
  private readonly target = DEFAULT_TARGET.clone();
  private readonly pointer = new THREE.Vector2();
  private readonly lastPointer = new THREE.Vector2();
  private readonly panPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly raycaster = new THREE.Raycaster();
  private readonly options: CitySceneOptions;

  private animationFrame = 0;
  private width = 1;
  private height = 1;
  private zoom = DEFAULT_ZOOM;
  private isDragging = false;
  private disposed = false;
  private visibleObjectCount = 0;

  constructor(
    private readonly container: HTMLElement,
    options: CitySceneOptions = {},
  ) {
    this.options = options;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor("#a9bdc1");
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = "city-canvas";
    this.renderer.domElement.setAttribute("aria-label", "Industrial isometric city map");

    container.appendChild(this.renderer.domElement);

    this.setupScene();
    this.resize();
    this.resetCamera();
    this.attachEvents();
    void this.populateAssets();
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
    this.scene.background = new THREE.Color("#a9bdc1");
    this.scene.fog = new THREE.Fog("#a9bdc1", 145, 300);

    const hemi = new THREE.HemisphereLight("#f7fff0", "#5e6f78", 1.65);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight("#fff2d4", 3.2);
    sun.position.set(-80, 130, 45);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 260;
    this.scene.add(sun);

    this.scene.add(new THREE.AmbientLight("#ffffff", 0.35));

    this.addGround();
    this.addLots();
    this.addRoads();
  }

  private addGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(190, 170), cityMaterials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private addLots() {
    for (const lot of cityLayout.lots) {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(lot.width, 0.22, lot.depth),
        cityMaterials.lot,
      );
      base.position.set(lot.x, 0.08, lot.z);
      base.receiveShadow = true;
      this.scene.add(base);

      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(lot.width - 3, 0.05, lot.depth - 3),
        cityMaterials.highlight,
      );
      pad.position.set(lot.x, 0.24, lot.z);
      pad.receiveShadow = true;
      this.scene.add(pad);
    }
  }

  private addRoads() {
    for (const road of cityLayout.roads) {
      this.addRoadSegment(road);
    }

    for (const x of [-38, 0, 38]) {
      for (const z of [-34, 0, 34]) {
        const marker = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.08, 8.4), cityMaterials.road);
        marker.position.set(x, 0.28, z);
        marker.receiveShadow = true;
        this.scene.add(marker);
      }
    }
  }

  private addRoadSegment(road: RoadDefinition) {
    const roadWidth = road.orientation === "horizontal" ? road.length : road.width;
    const roadDepth = road.orientation === "horizontal" ? road.width : road.length;

    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth + 5, 0.18, roadDepth + 5),
      cityMaterials.sidewalk,
    );
    sidewalk.position.set(road.x, 0.12, road.z);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);

    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.22, roadDepth),
      cityMaterials.road,
    );
    asphalt.position.set(road.x, 0.26, road.z);
    asphalt.receiveShadow = true;
    this.scene.add(asphalt);

    const laneLength = road.orientation === "horizontal" ? road.length - 10 : 0.35;
    const laneDepth = road.orientation === "horizontal" ? 0.35 : road.length - 10;
    const lane = new THREE.Mesh(new THREE.BoxGeometry(laneLength, 0.05, laneDepth), cityMaterials.lane);
    lane.position.set(road.x, 0.4, road.z);
    this.scene.add(lane);
  }

  private async populateAssets() {
    const definitions = [...cityLayout.buildings, ...cityLayout.props];
    const loadedObjects = await Promise.all(
      definitions.map(async (definition) => this.assetLoader.createObject(definition)),
    );

    if (this.disposed) {
      return;
    }

    for (const object of loadedObjects) {
      this.scene.add(object);
      this.visibleObjectCount += 1;
    }

    this.emitStats();
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
    this.zoom = THREE.MathUtils.clamp(this.zoom * zoomDelta, 6, 22);
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
      loadedAssets: this.visibleObjectCount,
      totalObjects: cityObjectCount,
      cameraMode: `Orthographic ${this.zoom.toFixed(1)}x`,
    });
  }
}
