import * as THREE from "three";

export interface UniLogoModelOptions {
  color?: THREE.ColorRepresentation;
  rimColor?: THREE.ColorRepresentation;
}

const createStroke = (
  name: string,
  points: THREE.Vector3[],
  material: THREE.MeshPhysicalMaterial,
  rimMaterial: THREE.LineBasicMaterial,
  closed = false,
) => {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  const geometry = new THREE.TubeGeometry(curve, closed ? 160 : 120, 0.135, 12, closed);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const rim = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(closed ? 160 : 120)),
    rimMaterial,
  );
  rim.name = `${name}-rim`;
  rim.position.z = 0.143;

  const pivot = new THREE.Group();
  pivot.name = `${name}-pivot`;
  pivot.add(mesh, rim);

  return { pivot, mesh };
};

/**
 * Procedural reconstruction of the Unitec "uni" emblem.
 *
 * The raster reference is a sparse, thin outline, so its identity is carried by
 * its continuous strokes rather than a filled silhouette. TubeGeometry gives each
 * traced stroke a real bevelled volume while keeping the mark deliberately light.
 */
export function createUniLogoModel({
  color = "#0A1550",
  rimColor = "#1E6FE0",
}: UniLogoModelOptions = {}) {
  const root = new THREE.Group();
  root.name = "unitec-uni-logo";

  const metal = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.86,
    roughness: 0.26,
    clearcoat: 0.28,
    clearcoatRoughness: 0.2,
    emissive: new THREE.Color(rimColor),
    emissiveIntensity: 0.34,
  });
  const rim = new THREE.LineBasicMaterial({
    color: rimColor,
    transparent: true,
    opacity: 0.82,
  });

  // Coordinates are traced from the reference's visible centreline: the rounded
  // "u", the connected arch of the "n", and the floating circular dot.
  const u = createStroke(
    "u-stroke",
    [
      new THREE.Vector3(-2.05, 1.45, 0),
      new THREE.Vector3(-2.05, -0.72, 0),
      new THREE.Vector3(-1.92, -1.28, 0),
      new THREE.Vector3(-1.58, -1.66, 0),
      new THREE.Vector3(-1.1, -1.78, 0),
      new THREE.Vector3(-0.65, -1.64, 0),
      new THREE.Vector3(-0.37, -1.22, 0),
      new THREE.Vector3(-0.37, 1.45, 0),
    ],
    metal,
    rim,
  );

  const n = createStroke(
    "n-stroke",
    [
      new THREE.Vector3(-0.37, -1.78, 0),
      new THREE.Vector3(-0.37, 1.45, 0),
      new THREE.Vector3(0.18, 1.72, 0),
      new THREE.Vector3(0.78, 1.76, 0),
      new THREE.Vector3(1.32, 1.52, 0),
      new THREE.Vector3(1.66, 1.1, 0),
      new THREE.Vector3(1.82, 0.54, 0),
      new THREE.Vector3(1.82, -1.78, 0),
    ],
    metal,
    rim,
  );

  const dotPoints = Array.from({ length: 25 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2;
    return new THREE.Vector3(1.34 + Math.cos(angle) * 0.43, 2.34 + Math.sin(angle) * 0.43, 0.19);
  });
  const dot = createStroke("i-dot", dotPoints, metal, rim, true);

  root.add(u.pivot, n.pivot, dot.pivot);
  root.position.y = -0.34;
  root.rotation.x = -0.1;
  root.rotation.y = -0.2;

  const centerSocket = new THREE.Object3D();
  centerSocket.name = "interaction-center";
  root.add(centerSocket);

  root.userData.sculptRuntime = {
    pivot: root,
    nodes: { root, u: u.pivot, n: n.pivot, dot: dot.pivot },
    meshes: { u: u.mesh, n: n.mesh, dot: dot.mesh },
    sockets: { interactionCenter: centerSocket },
    colliders: [{ type: "box", center: [0, 0.2, 0], size: [4.2, 4.6, 0.42] }],
    destructionGroups: { emblem: [u.mesh.name, n.mesh.name, dot.mesh.name] },
  };
  root.userData.rimMaterial = metal;

  return root;
}
