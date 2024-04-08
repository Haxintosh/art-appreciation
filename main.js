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
let angCTrans = false;
let gratitudeCTrans = false;
let originalCTrans = false;
// fog
let fogColor = 0x8AC7DB
scene.fog = new THREE.Fog(fogColor, 15, 200); // 10
let rgbHex = hexToRgb(fogColor);
let targetRGB = hexToRgb(0x3B3B3B);
let fogTween = new TWEEN.Tween({r:rgbHex.r, g:rgbHex.g, b:rgbHex.b})
    .to({r:targetRGB.r, g:targetRGB.g, b:targetRGB.b}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((color)=>{
      scene.fog = new THREE.Fog(rgbToHex(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b)), 15, 100); //
      // console.log(scene.fog.color)
      // sadCTrans = false;
    })
    .onStart(()=>{
      sadCTrans = true;
      console.log("Fog started - TWEEN");
    });
let targetAngerColor = hexToRgb(0x8B0000);
let angerTween = new TWEEN.Tween({r:targetRGB.r, g:targetRGB.g, b:targetRGB.b})
    .to({r:targetAngerColor.r, g:targetAngerColor.g, b:targetAngerColor.b}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((color)=>{
        scene.fog = new THREE.Fog(rgbToHex(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b)), 15, 100); //
        // console.log(scene.fog.color)
         angCTrans = true;
    })
    .onStart(()=>{
        console.log("Fog started - TWEEN");
        angCTrans = true;
    });

let targetGratitudeColor = hexToRgb(0xFFD300);
let gratitudeTween = new TWEEN.Tween({r:targetAngerColor.r, g:targetAngerColor.g, b:targetAngerColor.b})
    .to({r:targetGratitudeColor.r, g:targetGratitudeColor.g, b:targetGratitudeColor.b}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((color)=>{
        scene.fog = new THREE.Fog(rgbToHex(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b)), 15, 100); //
        // console.log(scene.fog.color) CAUSES MEM LEAK!!!!!!!!!!!!!!!!!!!!!
    })
    .onStart(()=>{
        console.log("Fog started - TWEEN");
        gratitudeCTrans = true;
    });

let targetOriginalColor = hexToRgb(fogColor);
let originalTween = new TWEEN.Tween({r:targetGratitudeColor.r, g:targetGratitudeColor.g, b:targetGratitudeColor.b})
    .to({r:targetOriginalColor.r, g:targetOriginalColor.g, b:targetOriginalColor.b}, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((color)=>{
        scene.fog = new THREE.Fog(rgbToHex(Math.floor(color.r), Math.floor(color.g), Math.floor(color.b)), 15, 100); //
        originalCTrans = true;
        // console.log(scene.fog.color)
    })
    .onStart(()=>{
        console.log("Fog started - TWEEN");
        originalCTrans = true;
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

let finalArt;
let arrow;

const loader = new GLTFLoader();

loader.load(
  'models/arrowV4.glb',
  (gltf) => {
    arrow = gltf.scene;
    mainContainer.add(arrow);
    arrow.scale.set(0.5, 0.5, 0.5);
    arrow.position.set(0, 1, 0);
    // init = true;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  (e) => {
    console.error('An error happened', e);
  }
);

loader.load(
    'models/SCFB3D.glb',
    (gltf) => {
      finalArt = gltf.scene;
      scene.add(finalArt);
      finalArt.scale.set(7, 7, 7);
      finalArt.position.set(-31.27, 1, -2726.98);
      init = true;
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (e) => {
      console.error('An error happened', e);
    }
)

// let finalArtDirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
// finalArtDirLight.position.set(-31.72, 10, -2707.47);
// scene.add(finalArtDirLight);
let finalAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
scene.add(finalAmbientLight);


// Create spline curve
const splineNbPoints = 5000
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
    new THREE.Vector3(50, 0, -8*curveDist),
    new THREE.Vector3(0, 0, -9*curveDist),
    new THREE.Vector3(0, 0, -10*curveDist),
    new THREE.Vector3(20, 0, -11*curveDist),
    new THREE.Vector3(0, 0, -12*curveDist),
    new THREE.Vector3(-30, 0, -13*curveDist),
    new THREE.Vector3(-30, 0, -14*curveDist),
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
  if (scrollPos >= 0.179 && !sadCTrans){
    console.log("Fog started");
    fogTween.start();
    sadCTrans = true;
  }
  if (scrollPos >= 0.264 && !angCTrans){
    angerTween.start();
    angCTrans = true;
  }
  if (scrollPos >= 0.42768 && !gratitudeCTrans){
    gratitudeTween.start();
    gratitudeCTrans = true;
  }
  if (scrollPos >= 0.54 && !originalCTrans){
    originalTween.start();
    originalCTrans = true;
  }

  if (scrollPos >= 0.97) {
    // controls = new OrbitControls(camera, renderer.domElement);
    // // controls.enableDamping = true;
    // // controls.dampingFactor = 0.25;
    scene.fog = null;
    // debug = true;
    // mainContainer.remove(camera);
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
  console.log("CURPOINT", curPoint);
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

  if (!debug) {
    const lookAt = currentLookAt.lerp(targetLookAt, (delta / 1000) * paramDamp);
    mainContainer.lookAt(
        mainContainer.position.clone().add(lookAt)
    );
  }
  
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
  if (!debug) {
    arrow.quaternion.slerp(targetArrowQuaternion, (delta / 1000) * 2);
  }
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

const welcomeTextSCROLL= Text({
    text: "(Défilez)",
    fontSize: 1,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});
welcomeTextSCROLL.mesh.position.set(0, 10, -20);
scene.add(welcomeTextSCROLL.mesh);

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
  text: "Et bien, ses arts ont faisaient partis d'un mouvement artistique qui traite des sujets sociaux (peintures sociales).",
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
  text: 'De plus, sa condition négligée dans un environnement désolé et sale ainsi que le geste résigné de l\'enfant, en train de fumer des cigarettes, intensifient mes émotions. Aussi, le fait qu\'il y a des milliers d\'enfants dans le monde qui vivent dans des conditions similaires me rend encore plus triste.',
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

extraSadnessText.mesh.position.set(-35, 9, -620);
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

let angerHeader = Text({
    text: "Colère",
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

angerHeader.mesh.position.set(-68, 4, -740);
angerHeader.mesh.rotation.y = degToRad(33);
scene.add(angerHeader.mesh);

let angerText = Text({
    text: 'Ensuite, après avoir ressenti la tristesse, la vue de l\'œuvre a aussi suscité en moi une colère profonde et une frustration croissante',
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
angerText.mesh.position.set(-114, 6, -780);
angerText.mesh.rotation.y = degToRad(33);
scene.add(angerText.mesh);

let angerQuestion = Text({
    text: 'Comment avons-nous permis en tant qu\'êtres humains que de telles injustices et une telle pauvreté continuent d\'exister?',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'left',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
});
angerQuestion.mesh.position.set(-160, 6, -830);
angerQuestion.mesh.rotation.y = degToRad(46);
scene.add(angerQuestion.mesh);

let angerSubText = Text({
    text: 'Ma colère est dirigée non seulement contre les conditions de vie de l\'enfant, mais aussi contre la société qui a permis qu\'il se retrouve dans une telle situation.',
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

angerSubText.mesh.position.set(-227, 5, -880);
angerSubText.mesh.rotation.y = degToRad(50);
scene.add(angerSubText.mesh);

let angerSubSubText = Text({
    text: 'L\'innocence de l\'enfant, contrasté par la dure réalité de notre monde démontré par l\'arrière plan de l\'œuvre, m\'a bouleversé.',
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

angerSubSubText.mesh.position.set(-283, 5, -930);
angerSubSubText.mesh.rotation.y = degToRad(46);
scene.add(angerSubSubText.mesh);

let frustrationText = Text({
    text: 'Savoir que, en tant qu\'élève, je suis largement impuissant à lui venir en aide ne fait qu\'accroître ma frustration et ma colère.',
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

frustrationText.mesh.position.set(-322, 5, -990);
frustrationText.mesh.rotation.y = degToRad(20);
scene.add(frustrationText.mesh);

let catalystText = Text({
    text: 'Cependant, cette frustration et cette colère sont aussi un catalyseur pour moi, me poussant à sortir et à essayer, du mieux que je peux, de changer le monde dans lequel nous vivons.',
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

catalystText.mesh.position.set(-282, 6, -1100);
catalystText.mesh.rotation.y = degToRad(-37);
scene.add(catalystText.mesh);

let finalAngerText = Text({
    text: 'Cette œuvre m\'a invité à réfléchir et à entreprendre une introspection profonde sur notre société et sur ce que je peux faire pour contribuer à son amélioration.\n',
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

finalAngerText.mesh.position.set(-230, 6, -1155);
finalAngerText.mesh.rotation.y = degToRad(-48);
scene.add(finalAngerText.mesh);

let gratitudeHeader = Text({
    text: "Gratitude",
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

gratitudeHeader.mesh.position.set(-150, 4, -1212);
gratitudeHeader.mesh.rotation.y = degToRad(-48);
scene.add(gratitudeHeader.mesh);

let gratitudeText = Text({
    text: 'Après d\'avoir ressenti la tristesse et la colère, j\'ai ressenti une profonde gratitude envers l\'artiste pour avoir créé une œuvre aussi puissante et émouvante.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

gratitudeText.mesh.position.set(-105, 6, -1235);
gratitudeText.mesh.rotation.y = degToRad(-55);
scene.add(gratitudeText.mesh);

let subGratitudeText = Text({
    text: 'J\'ai grandi dans un environnement où la crainte de la faim ou du manque d\'argent n\'était jamais une situation qui s\'est passée pour ma famille.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

subGratitudeText.mesh.position.set(-60, 6, -1268);
subGratitudeText.mesh.rotation.y = degToRad(-55);
scene.add(subGratitudeText.mesh);

let subSubGratitudeText = Text({
    text: 'L\'œuvre m\'a rappelé la chance que j\'ai d\'avoir un toit sur ma tête, de la nourriture sur ma table et une famille aimante.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

subSubGratitudeText.mesh.position.set(33, 6, -1332);
subSubGratitudeText.mesh.rotation.y = degToRad(-55);
scene.add(subSubGratitudeText.mesh);

let finalGratitudeText = Text({
    text: 'Je suis reconnaissant pour tout ce que j\'ai et je suis inspiré à aider ceux qui n\'ont pas la même chance que moi.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

finalGratitudeText.mesh.position.set(105, 6, -1470);
finalGratitudeText.mesh.rotation.y = degToRad(15);
scene.add(finalGratitudeText.mesh);

let appreciationHeader = Text({
    text: "Appréciation",
    fontSize: 4,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
  });

appreciationHeader.mesh.position.set(83, 4, -1522);
appreciationHeader.mesh.rotation.y = degToRad(20);
scene.add(appreciationHeader.mesh);

let compositionHeader = Text({
    text: "Composition",
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
  });

compositionHeader.mesh.position.set(62, 4, -1564);
compositionHeader.mesh.rotation.y = degToRad(25);
scene.add(compositionHeader.mesh);

let compositionText = Text({
    text: 'La simplicité de la composition de l\'œuvre, ainsi que l\'angle de vue simple, mettent en valeur le garçon.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

compositionText.mesh.position.set(48, 6, -1606);
compositionText.mesh.rotation.y = degToRad(20);
scene.add(compositionText.mesh);

let compositionSubText = Text({
    text: 'Cette simplicité permet aux gens de se concentrer sur l\'enfant et de renforcer l\'effet émotionnel ainsi que le message de l\'œuvre.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

compositionSubText.mesh.position.set(36.6, 6, -1648.8);
compositionSubText.mesh.rotation.y = degToRad(15);
scene.add(compositionSubText.mesh);

let compositionFinalText = Text({
    text: 'Donc, pour moi, l\'auteur utilise de façon efficace la composition pour transmettre son message.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

compositionFinalText.mesh.position.set(21.42, 6, -1701.6);
compositionFinalText.mesh.rotation.y = degToRad(15);
scene.add(compositionFinalText.mesh);

let colorHeader = Text({
    text: "Couleur",
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
  });

colorHeader.mesh.position.set(5.78, 4, -1765);
colorHeader.mesh.rotation.y = degToRad(15);
scene.add(colorHeader.mesh);

let colorText = Text({
    text: 'La palette de couleurs de l\'œuvre est monotone et sourde, et elle est dominée par des teintes telles que le brun et le gris.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

colorText.mesh.position.set(-0.8, 6, -1807.2);
colorText.mesh.rotation.y = degToRad(7);
scene.add(colorText.mesh);

let colorSubText = Text({
    text: 'Ces nuances évoquent la morosité et la dureté de la vie dans les rues, ainsi que la pauvreté, car elles se confondent avec les couleurs de la terre.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

colorSubText.mesh.position.set(-3.5, 6, -1849.43);
colorSubText.mesh.rotation.y = degToRad(0);
scene.add(colorSubText.mesh);

let colorEmoText = Text({
  text: 'Cette palette sombre contribue à renforcer l\'atmosphère précaire et souligne la misère de la pauvreté',
  fontSize: 2,
  color: 0xFFFFFF,
  maxWidth: 45,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'center',
  anchorY: 'middle',
  font: './fonts/mplusREGULAR.ttf',
});

colorEmoText.mesh.position.set(-3, 6, -1902);
colorEmoText.mesh.rotation.y = degToRad(-5);
scene.add(colorEmoText.mesh);

let colorFinalText = Text({
    text: 'Aussi, le contraste de couleur des vêtements et la peau du personnage principal le fait ressortir davantage, attirant le regard et ajoutant une dimension supplémentaire à la composition.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

colorFinalText.mesh.position.set(-2.51, 7, -1951.23);
colorFinalText.mesh.rotation.y = degToRad(-8);
scene.add(colorFinalText.mesh);

let realismHeader = Text({
    text: "Réalisme",
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
  });

realismHeader.mesh.position.set(1.36, 4, -2019.875);
realismHeader.mesh.rotation.y = degToRad(-7);
scene.add(realismHeader.mesh);

let realismText = Text({
    text: 'Malgré la composition simple, Pelez parvient à capturer les détails de manière extraordinaire. Les textures rugueuses de ses vêtements et de l\'arrière-plan, constitué du mur et de la terre, sont reproduites avec une précision remarquable. ',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

realismText.mesh.position.set(11.56, 8, -2102.243);
realismText.mesh.rotation.y = degToRad(-7);
scene.add(realismText.mesh);

let realismSubText = Text({
    text: 'Cela donne vie à l\'authenticité de la pauvreté et de la souffrance vécues par les personnes dans des situations similaires. ',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

realismSubText.mesh.position.set(19.29, 6, -2175.26);
realismSubText.mesh.rotation.y = degToRad(-8);
scene.add(realismSubText.mesh);

let socialCritiqueHeader = Text({
    text: "Commentaire sociale",
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 20,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
});

socialCritiqueHeader.mesh.position.set(19.25, 4, -2230.18);
socialCritiqueHeader.mesh.rotation.y = degToRad(-4);
scene.add(socialCritiqueHeader.mesh);

let socialCritiqueText = Text({
    text: 'L\'œuvre de Pelez est un aussi un commentaire social sur la pauvreté et la misère des enfants des rues. ',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

socialCritiqueText.mesh.position.set(14.82, 6, -2285.09);
socialCritiqueText.mesh.rotation.y = degToRad(7);
scene.add(socialCritiqueText.mesh);

let socialCritiqueSubText = Text({
    text: 'Elle critique la société de la Belle Époque, où le nombre d\'enfants itinérants a atteint un niveau significatif en raison de l\'industrialisation et de l\'urbanisation.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

socialCritiqueSubText.mesh.position.set(6.13, 6, -2353.73);
socialCritiqueSubText.mesh.rotation.y = degToRad(10);
scene.add(socialCritiqueSubText.mesh);

let socialCritiqueSubSubText = Text({
    text: 'Les enfants sous 18 ans n\'avaient pas le droit de travailler, donc plusieurs enfants, comme celui dans l\'art, ont été laissés à eux-mêmes. ', // Elle souligne les conditions de vie difficiles des enfants des rues et la nécessité d'une réforme sociale pour améliorer leur sort.
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

socialCritiqueSubSubText.mesh.position.set(-1.1, 6, -2408.64);
socialCritiqueSubSubText.mesh.rotation.y = degToRad(11);
scene.add(socialCritiqueSubSubText.mesh);

let socialCritiqueFinalText = Text({
    text: 'Cette œuvre est un appel à l\'action pour la réforme sociale et l\'amélioration des conditions de vie des enfants des rues.',
    fontSize: 2,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusREGULAR.ttf',
});

socialCritiqueFinalText.mesh.position.set(-8.8, 6, -2463.55);
socialCritiqueFinalText.mesh.rotation.y = degToRad(15);
scene.add(socialCritiqueFinalText.mesh);

let proofText = Text({
  text: 'Preuves',
  fontSize: 4,
  color: 0xFFFFFF,
  maxWidth: 45,
  lineHeight: 1,
  letterSpacing: 0.1,
  textAlign: 'center',
  anchorX: 'center',
  anchorY: 'middle',
  font: './fonts/mplusBOLD.ttf',
});

proofText.mesh.position.set(-21.33, 4, -2530.066);
proofText.mesh.rotation.y = degToRad(15);
scene.add(proofText.mesh);

let proofImageGeo = new THREE.PlaneGeometry(4.08*4, 3.072*4);
let proofImageTexture = new THREE.TextureLoader().load('textures/proof.jpg');
let proofImage = new THREE.Mesh(proofImageGeo, new THREE.MeshBasicMaterial({map:proofImageTexture}));
proofImage.position.set(-45, 6, -2595);
proofImage.rotation.y = degToRad(15);

let proofImage2Geo = new THREE.PlaneGeometry(2.576*4.5, 1.932*4.5);
let proofImage2Texture = new THREE.TextureLoader().load('textures/proof2.jpg');
let proofImage2 = new THREE.Mesh(proofImage2Geo, new THREE.MeshBasicMaterial({map:proofImage2Texture}));
proofImage2.position.set(-15, 6, -2595);
proofImage2.rotation.y = degToRad(-15);

let freeCamText = Text({
    text: 'Caméra libre, utilisez la souris pour regarder autour de vous et défilez afin de vous déplacer.',
    fontSize: 3,
    color: 0xFFFFFF,
    maxWidth: 45,
    lineHeight: 1,
    letterSpacing: 0.1,
    textAlign: 'center',
    anchorX: 'center',
    anchorY: 'middle',
    font: './fonts/mplusBOLD.ttf',
});

freeCamText.mesh.position.set(-32.01, 6, -2644.50);
freeCamText.mesh.rotation.y = degToRad(7);
scene.add(freeCamText.mesh);

scene.add(proofImage, proofImage2);
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
