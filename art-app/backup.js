import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// camera.position.z = 5;

// let  oCtrl = new OrbitControls(camera, renderer.domElement);

// Loader 

let cloud;

const loader = new GLTFLoader();
loader.load(
  'models/cloud.glb',
  (gltf) => {
    cloud = gltf.scene;
    scene.add(cloud);
    cloud.scale.set(0.1, 0.1, 0.1);
    cloud.position.set(0, 0, 0);
  }, 
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (e) => {
    console.error('An error happened', e);
  }
);
// Create spline curve
const points = [
  new THREE.Vector3(-10, 0, 0),
  new THREE.Vector3(0, 10, 0),
  new THREE.Vector3(10, 0, 0)
];
const spline = new THREE.CatmullRomCurve3(points);

// Create tube geometry from spline and add to scene
const geometry = new THREE.TubeGeometry(spline, 64, 1, 8, false);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

scene.background = new THREE.Color(0x87CEEB);

// Lights
let ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Function to update camera position
const updateCameraPosition = (progress) => {
  const point = spline.getPoint(progress);
  camera.position.set(point.x, point.y, point.z);
  camera.lookAt(spline.getPointAt((progress + 0.01) % 1));
};

// Use GSAP ScrollTrigger to update camera position on scroll
gsap.registerPlugin(ScrollTrigger);
gsap.to({}, {
  scrollTrigger: {
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      updateCameraPosition(self.progress);
    }
  }
});

addEventListener("resize", ()=>{
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

// Render loop
const animate = function () {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // oCtrl.update();
};
animate();

// let t = scrollPos /scrollArea.offsetHeight;
// let point = spline.getPoint(t);
// targetCameraPosition.set(point.x, point.y + 4, point.z);
// camera.position.set(point.x, point.y + 4, point.z);
// let lookAtPoint = spline.getPoint(Math.min(t + 0.04, 1));
// lookAtPoint.y += 4;
// camera.lookAt(lookAtPoint);

// let arrowPoint = spline.getPoint(Math.min(t + 0.05, 1));
// let arrowLookAtPoint = spline.getPoint(Math.min(t + 0.055, 1));
// targetArrowPosition.set(arrowPoint.x, arrowPoint.y+3, arrowPoint.z)
// arrow.position.set(arrowPoint.x, arrowPoint.y+3, arrowPoint.z);
// arrowLookAtPoint.y += 3;
// arrow.lookAt(arrowLookAtPoint);