import './style.css'
import * as THREE from 'three';
import {MeshLine, MeshLineMaterial} from 'three.meshline';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scrollbar from 'smooth-scrollbar';
import {Text} from '@pmndrs/vanilla';
import * as TWEEN from '@tweenjs/tween.js';
import {LayerMaterial, Gradient} from 'lamina/vanilla';

Scrollbar.init(document.querySelector('#scrollArea'));

let mainContainer = new THREE.Group();
let debug = false;
let init = false;
// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.y = 4;
camera.position.z = 5;
let controls;
if (debug){
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableZoom = false;
}

scene.add(mainContainer);
let sadCTrans = false;
// fog
let fogColor = 0x8AC7DB
scene.fog = new THREE.Fog(fogColor, 10, 100);
let rgbHex = hexToRgb(fogColor);
let targetRGB = hexToRgb(0xD3D3D3);
let fogTween = new TWEEN.Tween({r:rgbHex.r, g:rgbHex.g, b:rgbHex.b})
    .to({r:targetRGB.r, g:targetRGB.g, b:targetRGB.b}, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((color)=>{
      scene.fog = new THREE.Fog(rgbToHex(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b)), 10, 100); //
      // console.log(scene.fog.color)
      // sadCTrans = false;
    })
    .onStart(()=>{
      sadCTrans = true;
      console.log("Fog started - TWEEN");
    });
if (!debug) {
  mainContainer.add(camera);
}
let atmosphereGeo = new THREE.SphereGeometry(10000, 1000, 1000);
let atmosphereMat = new LayerMaterial({
  lighting: 'physical',
  transmission: 1,
  side: THREE.BackSide,
  layers: [
    new Gradient({
      colorA: new THREE.Color(0x87CEEB), 
      colorB: new THREE.Color(0xDCDCDC),
      axes: "y",
      start: 100,
      end: -100
    }),
  ]
});

let atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
scene.add(atmosphere);



let cloud;
let arrow;

const loader = new GLTFLoader();
// loader.load(
//   'models/cloud.glb',
//   (gltf) => {
//     cloud = gltf.scene;
//     scene.add(cloud);
//     cloud.scale.set(0.1, 0.1, 0.1);
//     cloud.position.set(0, 0, 0);
//   }, 
//   (xhr) => {
//     console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//   },
//   (e) => {
//     console.error('An error happened', e);
//   }
// );

loader.load(
  'models/arrowV4.glb',
  (gltf) => {
    arrow = gltf.scene;
    mainContainer.add(arrow);
    arrow.scale.set(0.5, 0.5, 0.5);
    arrow.position.set(0, 1, 0);
    init = true;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (e) => {
    console.error('An error happened', e);
  }
);
// Create spline curve
const splineNbPoints = 1000
const curveDist = 200;
const points = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -curveDist),
  new THREE.Vector3(100, 0, -2*curveDist),
  new THREE.Vector3(0, 0, -3*curveDist),
  new THREE.Vector3(-100, 0, -4*curveDist),
  new THREE.Vector3(-300, 0, -5*curveDist),
  new THREE.Vector3(-150, 0, -6*curveDist),
  new THREE.Vector3(100, 0, -7*curveDist),
];

const spline = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
const lineMat = new MeshLineMaterial({ 
  color: 0xFFFFFF,
  lineWidth: 0.6,
  transparent: true,
  opacity: 0.7,
});

const lineBufferGeo = new THREE.BufferGeometry().setFromPoints(spline.getPoints(splineNbPoints));
const lineGeo = new MeshLine();
lineGeo.setGeometry(lineBufferGeo);
const line = new THREE.Mesh(lineGeo, lineMat);
scene.add(line);

const linePlane = new THREE.Shape();
linePlane.moveTo(0, -0.2);
linePlane.moveTo(0, 0.2);

let lineExtrudeGeo = new THREE.ExtrudeGeometry(linePlane, {
  steps: splineNbPoints,
  bevelEnabled: false,
  extrudePath: spline
});

let lineExtrudeMat = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  transparent: true,
  opacity: 0.7,
});

let lineExtrude = new THREE.Mesh(lineExtrudeGeo, lineExtrudeMat);
scene.add(lineExtrude);
scene.background = new THREE.Color(0xFFFFFF);

// Lights
let ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);

let hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
scene.add(hemiLightHelper);

hemiLight.position.set(0, 10, 0);


// Wop
let scrollDelta = 0;
let scrollPos = 0;
let scrollArea = document.getElementById('scrollArea');
let splineLength = spline.getLength();
// scrollArea.style.height = splineLength * window.innerHeight + 'px';
console.log(splineLength);
const linePoints = spline.getPoints(splineNbPoints);

window.addEventListener('scroll', () => {
  scrollPos = window.scrollY || window.scrollTop || 0;
  scrollPos = scrollPos / scrollArea.offsetHeight;
  scrollDelta = scrollPos - scrollDelta;
  console.log(scrollPos);
});

let timeDelta = 0;
let lastTime = 0;
// Render loop
const animate = function () {
  let time = performance.now();
  timeDelta = time - lastTime;
  lastTime = time;  
  updateCameraPosition(timeDelta);
  requestAnimationFrame(animate);
  if (debug){
    controls.update();
  }
  if (scrollPos >= 0.36 && !sadCTrans){
    console.log("Fog started");
    fogTween.start();
    sadCTrans = true;
  }
  renderer.render(scene, camera);
  TWEEN.update();
};
animate();


function updateCameraPosition(delta){
  if (!init){
    return;
  }

  const paramDamp = 5;
  const curPoint = spline.getPoint(scrollPos);
  mainContainer.position.lerp(curPoint, (delta/1000)*paramDamp);

  const lookAtPoint = spline.getPoint(
    Math.min(scrollPos+0.000001, 1)
  );

  const currentLookAt = mainContainer.getWorldDirection(
    new THREE.Vector3()
  );

  const targetLookAt = new THREE.Vector3()
  .subVectors(curPoint, lookAtPoint)
  .normalize();

  const lookAt = currentLookAt.lerp(targetLookAt, (delta/1000)*paramDamp);
  mainContainer.lookAt(
    mainContainer.position.clone().add(lookAt)
  );
  
  // cursor rotation
  const tan = spline.getTangent(scrollPos + 0.02);

  const nonLerpLookAt = new THREE.Group();
  nonLerpLookAt.position.copy(curPoint);
  nonLerpLookAt.lookAt(
    nonLerpLookAt.position.clone().add(targetLookAt)
  );

  tan.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    -nonLerpLookAt.rotation.y
  )

  let angle = Math.atan2(-tan.z, tan.x);
  angle = -Math.PI/2 + angle;

  let angleDeg = (angle*180)/Math.PI;
  angleDeg *= 2.4;
  // WOMP
  if (angleDeg < 0 ){
    angleDeg = Math.max(angleDeg, -35);
  }
  if (angleDeg > 0){
    angleDeg = Math.min(angleDeg, 35);
  }

  angle = (angleDeg*Math.PI)/180;

  const targetArrowQuaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      arrow.rotation.x,
      arrow.rotation.y,
      angle
  ))
  arrow.quaternion.slerp(targetArrowQuaternion, (delta/1000)*2);
}
const welcomeText= Text({
  text: "Gamin des rues",
  fontSize: 4,
  color: 0xFFFFFF,
  maxWidth: 20,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});
welcomeText.mesh.position.set(-10, 3.5, -20);
scene.add(welcomeText.mesh);

let mainPaintingGeo = new THREE.PlaneGeometry(4.61*4, 5.57*4);
let mainPaintingTexture = new THREE.TextureLoader().load('textures/GDR-MAIN.jpg');
const mainPaintingMat = new THREE.MeshBasicMaterial({map: mainPaintingTexture});
let mainPainting = new THREE.Mesh(mainPaintingGeo, mainPaintingMat);
mainPainting.position.set(-3, 2, -60);
scene.add(mainPainting);

const authorHeader = Text({
  text: "Par:",
  fontSize: 3,
  color: 0xFFFFFF,
  maxWidth: 10,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusBOLD.ttf',
});
const authorText = Text({
  text: "Fernando Pelez\n(1843-1913) Paris, France",
  fontSize: 2,
  color: 0xFFFFFF,
  maxWidth: 20,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'left',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

authorHeader.mesh.position.set(-3, 5.5, -100);
scene.add(authorHeader.mesh);

authorText.mesh.position.set(-3, 0.5, -100);

let mainPelezGeo = new THREE.PlaneGeometry(3.3*3, 3.81*3);
let mainPelezTexture = new THREE.TextureLoader().load('textures/pelez.jpg');
const mainPelezMat = new THREE.MeshBasicMaterial({map: mainPelezTexture});
let mainPelez = new THREE.Mesh(mainPelezGeo, mainPelezMat);
mainPelez.position.set(-15, 2, -100);
scene.add(mainPelez);
scene.add(authorText.mesh);

let detailPaintingGeo = new THREE.PlaneGeometry(4.61*2, 5.57*2);
let detailPainting = new THREE.Mesh(detailPaintingGeo, mainPaintingMat);
detailPainting.position.set(7, 3.5, -140);
scene.add(detailPainting);

const detailHeader = Text({
  text: "Détails:",
  fontSize: 3,
  color: 0xFFFFFF,
  maxWidth: 10,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusBOLD.ttf',
});

detailHeader.mesh.position.set(-30, 9, -140);
scene.add(detailHeader.mesh);
const detailBody = Text({
  text: "Matériaux: huile sur toile\nDimensions: 95.3 x 79.1cm\nDate: 1880\nMouvement: peinture\nsociale",
  fontSize: 1.8,
  color: 0xFFFFFF,
  maxWidth: 30,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'left',
  anchorX: 'left',
  anchorY: 'top',
  font: './fonts/mplusREGULAR.ttf',
});
detailBody.mesh.position.set(-30, 7, -140);
scene.add(detailBody.mesh);
// SUB GALLERY
// Wuh why this not work
let GMS_texture = new THREE.TextureLoader().load('textures/Grimaces_Miseres_Saltibanques.jpg');
let GMS = new THREE.Mesh(new THREE.PlaneGeometry(12.8*2.5, 5.04*2.5), new THREE.MeshBasicMaterial({map:GMS_texture}));

let LVDC_texture = new THREE.TextureLoader().load('textures/Levendeurdescitrons.jpg');
let LVDC = new THREE.Mesh(new THREE.PlaneGeometry(7.34*1.5, 12.89*1.5), new THREE.MeshBasicMaterial({map:LVDC_texture}));

let MV_texture = new THREE.TextureLoader().load('textures/Marchand_violettes.jpg');
let MV = new THREE.Mesh(new THREE.PlaneGeometry(10.52*1.3, 9*1.3), new THREE.MeshBasicMaterial({map:MV_texture}));

let PM_texture = new THREE.TextureLoader().load('textures/Petit_Misere.jpg');
let PM = new THREE.Mesh(new THREE.PlaneGeometry(3.19*3.3, 6.6*3.3), new THREE.MeshBasicMaterial({map:PM_texture}));

let SA_texture = new THREE.TextureLoader().load('textures/Sans_Asile.jpg');
let SA = new THREE.Mesh(new THREE.PlaneGeometry(12*1.7, 6.88*1.7), new THREE.MeshBasicMaterial({map:SA_texture}));

let NM_texture = new THREE.TextureLoader().load('textures/Nid_Misere.jpg');
let NM = new THREE.Mesh(new THREE.PlaneGeometry(8*3.7, 3.44*3.7), new THREE.MeshBasicMaterial({map:NM_texture}));
GMS.position.set(22, 18, -200);
GMS.rotation.y = degToRad(-13);
GMS.rotation.x = degToRad(4);
LVDC.position.set(-31.5, 10, -200)
MV.position.set(-30.3, -7.5, -200);

PM.position.set(-17, 3.5, -200);
SA.position.set(30, 4, -200);
SA.rotation.y = degToRad(-13); 
NM.position.set(22, -10, -200);
NM.rotation.y = degToRad(-13);
NM.rotation.x = degToRad(-4);

scene.add(GMS, LVDC, MV, PM, SA, NM);

let subGaleryHeader = Text({
  text: "Autres arts du même artiste",
  fontSize: 3,
  color: 0xFFFFFF,
  maxWidth: 20,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusBOLD.ttf',
});

subGaleryHeader.mesh.position.set(-10, 6, -200);
subGaleryHeader.mesh.rotation.y = degToRad(-10);
scene.add(subGaleryHeader.mesh);

let subGaleryText = Text({
  text: "Comme vous pouvez constater, Fernand Pelez fait souvent des art sur des scènes misérables.",
  fontSize: 2.5,
  color: 0xFFFFFF,
  maxWidth: 40,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

let subSubGaleryText = Text({
  text: "Et bien, ses arts ont faisaient partis d'un mouvement artistique qui traite des sujets sociaux (peintures socialistes).",
  fontSize: 3,
  color: 0xFFFFFF,
  maxWidth: 40,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

subGaleryText.mesh.position.set(17, 8, -280);
subGaleryText.mesh.rotation.y = degToRad(-35);
subSubGaleryText.mesh.position.set(53, 10, -330);
subSubGaleryText.mesh.rotation.y = degToRad(-34);
scene.add(subGaleryText.mesh, subSubGaleryText.mesh);

let socialArtText = Text({
    text: "Les arts sociaux, pour Pelez, dénoncent la condition misérable des personnes pauvres, sensibilisent la population et proposent une reflexion sur la condition humaine.",
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'left',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

socialArtText.mesh.position.set(75, 11, -380);
socialArtText.mesh.rotation.y = degToRad(-28);
scene.add(socialArtText.mesh);

let emotionHeader = Text({
    text: "Émotions",
    fontSize: 5,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'left',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
});

emotionHeader.mesh.position.set(82, 4, -430);

let emotionWaveText = Text({
  text: "Les émotions, pour moi, viennent en vagues, donc voici les émotions que j’ai ressenties en ordre. ",
  fontSize: 2.5,
  color: 0xFFFFFF,
  maxWidth: 40,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});
let scrollSadnessPercentage = 0.3;
let sadnessHeader = Text({
  text: "Tristesse",
  fontSize: 3,
  color: 0xFFFFFF,
  maxWidth: 20,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusBOLD.ttf',
});

emotionWaveText.mesh.position.set(63, 7, -460);
emotionWaveText.mesh.rotation.y = degToRad(27);

sadnessHeader.mesh.position.set(52, 4, -500);
sadnessHeader.mesh.rotation.y = degToRad(25);
emotionHeader.mesh.rotation.y = degToRad(12);
scene.add(emotionHeader.mesh, emotionWaveText.mesh, sadnessHeader.mesh);

// <---- SADNESS PARAGRAPH ---->
let sadnessText = Text({
  text: 'La première émotion ressentie après avoir vu l\'œuvre "Gamin des rues" de Fernand Pelez est celle d\'une profonde tristesse. Le fait de voir un enfant dans une condition misérable, avec ses vêtements déchirés, encore dans les tendres années de la jeunesse, me remplit de chagrin.',
  fontSize: 2,
  color: 0xFFFFFF,
  maxWidth: 50,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

sadnessText.mesh.position.set(-5, 8, -560);
sadnessText.mesh.rotation.y = degToRad(33);
scene.add(sadnessText.mesh);

let extraSadnessText = Text({
  text: 'De plus, sa condition négligée dans un environnement désolé et sale ainsi que le geste résigné de l\'enfant, en train de fumer des cigarettes, intensifient mes émotions. ',
  fontSize: 2,
  color: 0xFFFFFF,
  maxWidth: 45,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'left',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

extraSadnessText.mesh.position.set(-35, 6.5, -620);
extraSadnessText.mesh.rotation.y = degToRad(25);
scene.add(extraSadnessText.mesh);

let rememberanceText = Text({
    text: 'Cela ravive les souvenirs de mon enfance en Chine, où je voyais souvent des enfants comme lui dans les rues, ce qui m\'attristait profondément en me remémorant ces souvenirs.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 50,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'left',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});
rememberanceText.mesh.position.set(-62, 7, -680);
rememberanceText.mesh.rotation.y = degToRad(23);
scene.add(rememberanceText.mesh);

if (debug){
  controls.addEventListener( "change", () => {  
      console.log( "POS", controls.object.position ); 
      let target = new THREE.Vector3();
      controls.object.getWorldDirection(target);
      target.set(target.x*100, target.y*100, target.z*100);
      console.log( "OR", target );
  });
}

addEventListener("resize", ()=>{
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

function degToRad(deg){
  return (deg*Math.PI)/180;
}

function hexToRgb(hex) {
  let r = (hex >> 16) & 255;
  let g = (hex >> 8) & 255;
  let b = hex & 255;
  return {r:r, g:g, b:b};
}

function rgbToHex(r, g, b){
  return (r << 16) | (g << 8) | b;
}