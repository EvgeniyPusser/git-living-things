// 3D view of layout3d() with Three.js r147 (vendor/three.min.js, loaded on first use).
// Drag: rotate · wheel: zoom · click a part: select the same node as on the diagram.
import { layout3d } from './house3d.js';

let loading = null;
function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  loading ??= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src: 'vendor/three.min.js' });
    script.onload = () => resolve(window.THREE);
    script.onerror = () => reject(new Error('three'));
    document.head.append(script);
  });
  return loading;
}

const STATUS = { green: 0x1f8a4c, yellow: 0xd99a0b, red: 0xc8322a };
const NETWORK = { water: 0x2f7fd8, power: 0xe0b000, gas: 0xe07a1f, air: 0x9ab7c6, repair: 0x8a4fd1, data: 0x0d7680 };
const TYPE = { sensor: 0x0d9aa6, mobileSensor: 0x18c4cf, chip: 0x5d6866, centre: 0x0b4f56, reserve: 0x6d5a3c,
  material: 0x3aa56b, device: 0x7c8a8f, measure: 0x8b5a2b, robot: 0xe0702a, window: 0x9fd3ea, door: 0x8b6a4a, stair: 0x9aa3a6 };

export async function createView3d(host, { onSelect }) {
  const THREE = await loadThree();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  host.append(renderer.domElement);
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 300);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(12, 20, 14);
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), new THREE.MeshBasicMaterial({ color: 0x8a7a5a, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(26, 26, 0x8a8a8a, 0xb8b8b8);
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);
  const group = new THREE.Group();
  scene.add(group);

  const target = new THREE.Vector3(0, 1, 0);
  const orbit = { theta: 0.7, phi: 1.2, radius: 23 };
  const placeCamera = () => {
    const { theta, phi, radius } = orbit;
    camera.position.set(target.x + radius * Math.sin(phi) * Math.sin(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(target);
  };
  placeCamera();

  const roofGeometry = (w, h, d) => {
    const shape = new THREE.Shape([new THREE.Vector2(-d / 2, -h / 2), new THREE.Vector2(d / 2, -h / 2), new THREE.Vector2(0, h / 2)]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
    g.translate(0, 0, -w / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  function between(a, b, radius, material) {
    const start = new THREE.Vector3(a.x, a.y, a.z), end = new THREE.Vector3(b.x, b.y, b.z);
    const length = start.distanceTo(end);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, Math.max(length, 0.01), 8), material);
    mesh.position.copy(start).lerp(end, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    return mesh;
  }

  let selected = null;
  function build(model) {
    for (const child of [...group.children]) {
      group.remove(child);
      child.geometry?.dispose();
      child.material?.dispose();
    }
    for (const item of layout3d(model)) {
      if (item.shape === 'line') {
        const geometry = new THREE.BufferGeometry().setFromPoints(item.points.map(p => new THREE.Vector3(p.x, p.y, p.z)));
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0x0d9aa6, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.8 }));
        line.computeLineDistances();
        group.add(line);
        continue;
      }
      if (item.shape === 'pipe') {
        const net = model.nodes.find(node => node.id === item.from && node.type === 'network') || model.nodes.find(node => node.id === item.to && node.type === 'network');
        group.add(between(item.points[0], item.points[1], 0.07, new THREE.MeshLambertMaterial({ color: NETWORK[net?.kind] ?? 0x888888 })));
        continue;
      }
      const structural = Boolean(item.color);
      const color = structural ? STATUS[item.color] : item.type === 'network' ? NETWORK[item.kind] : TYPE[item.type] ?? 0xb9c2c0;
      const see = item.type === 'wall' ? 0.5 : item.shape === 'roof' ? 0.45 : structural ? 0.85 : 1;
      const material = new THREE.MeshLambertMaterial({ color, transparent: see < 1, opacity: see, depthWrite: see === 1 });
      const geometry = item.shape === 'roof' ? roofGeometry(item.w, item.h, item.d)
        : item.shape === 'sphere' ? new THREE.SphereGeometry(item.w / 2, 16, 12)
        : item.shape === 'tank' ? new THREE.CylinderGeometry(item.w / 2, item.w / 2, item.h, 16)
        : item.shape === 'post' ? new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8)
        : new THREE.BoxGeometry(item.w, item.h, item.d);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(item.x, item.shape === 'post' ? item.y - 0.6 : item.y, item.z);
      mesh.userData.id = item.id;
      if (item.id === selected) {
        material.emissive = new THREE.Color(0x333333);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x111111 }));
        edges.position.copy(mesh.position);
        group.add(edges);
      }
      group.add(mesh);
    }
  }

  function draw() { renderer.render(scene, camera); }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }

  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    orbit.theta -= dx * 0.006;
    orbit.phi = Math.min(1.75, Math.max(0.2, orbit.phi - dy * 0.005));
    placeCamera();
    draw();
  });
  const ray = new THREE.Raycaster();
  canvas.addEventListener('pointerup', e => {
    const click = drag && drag.moved < 5;
    drag = null;
    if (!click) return;
    const box = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((e.clientX - box.left) / box.width * 2 - 1, -((e.clientY - box.top) / box.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(group.children.filter(child => child.userData.id))[0];
    if (hit) onSelect(hit.object.userData.id);
  });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    orbit.radius = Math.min(70, Math.max(10, orbit.radius * (1 + Math.sign(e.deltaY) * 0.08)));
    placeCamera();
    draw();
  }, { passive: false });
  new ResizeObserver(resize).observe(host);

  return {
    update(model, selectedId) { selected = selectedId; build(model); resize(); draw(); }
  };
}
