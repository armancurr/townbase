import * as THREE from "three";

export const cityMaterials = {
  ground: new THREE.MeshStandardMaterial({
    color: "#4f6649",
    roughness: 0.92,
    metalness: 0,
  }),
  lot: new THREE.MeshStandardMaterial({
    color: "#6c6f61",
    roughness: 0.88,
    metalness: 0,
  }),
  road: new THREE.MeshStandardMaterial({
    color: "#303437",
    roughness: 0.82,
    metalness: 0,
  }),
  sidewalk: new THREE.MeshStandardMaterial({
    color: "#9a9a8f",
    roughness: 0.86,
    metalness: 0,
  }),
  lane: new THREE.MeshStandardMaterial({
    color: "#d8c979",
    roughness: 0.72,
    metalness: 0,
  }),
  lotStripe: new THREE.MeshStandardMaterial({
    color: "#c0c0af",
    roughness: 0.7,
    metalness: 0,
  }),
  highlight: new THREE.MeshStandardMaterial({
    color: "#95b8b2",
    transparent: true,
    opacity: 0.22,
    roughness: 0.7,
  }),
};
