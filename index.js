import * as THREE from "three";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";
import { ImprovedNoise } from "https://threejs.org/examples/jsm/math/ImprovedNoise.js";

import { EffectComposer } from "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://threejs.org/examples/jsm/postprocessing/RenderPass.js";
import { FilmPass } from "https://threejs.org/examples/jsm/postprocessing/FilmPass.js";
import { GlitchPass } from "https://threejs.org/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "https://threejs.org/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "https://threejs.org/examples/jsm/shaders/VignetteShader.js";

let scene,
  renderer,
  camera,
  cube,
  ground,
  controls,
  tvs,
  videoTexture,
  vid1Text;
let vid2Text;
let camStat;

let composer1;

const noise = new ImprovedNoise();

window.onload = function () {
  camStat = document.getElementById("camStatText");
  camStat.innerHTML = "Found you";
};

function setup() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(3.12, 5.05, 12.011);
  camera.rotation.set(0, 0.2, 0);

  renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //controls = new OrbitControls(camera, renderer.domElement);
  //controls.update();
  //-----------------------lights--------------------------
  const spotLight = new THREE.SpotLight(0x8d56d1, 25);
  spotLight.angle = Math.PI / 3;
  spotLight.penumbra = 0.9;
  spotLight.position.set(0, 16, 3);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 3;
  spotLight.shadow.camera.far = 10;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  scene.add(spotLight);

  const counterSpotLight = new THREE.SpotLight(0x56d193, 12);
  counterSpotLight.angle = Math.PI / 3;
  counterSpotLight.penumbra = 0.9;
  counterSpotLight.position.set(-2, 8, -3);
  counterSpotLight.castShadow = true;
  counterSpotLight.shadow.camera.near = 3;
  counterSpotLight.shadow.camera.far = 10;
  counterSpotLight.shadow.mapSize.width = 1024;
  counterSpotLight.shadow.mapSize.height = 1024;
  scene.add(counterSpotLight);

  const topLight = new THREE.PointLight(0xad21c4, 6, 18);
  topLight.position.set(0, 6, 0);
  scene.add(topLight);
  const leftLight = new THREE.PointLight(0xcf2b1f, 6, 18);
  leftLight.position.set(-2, 3, 0);
  scene.add(leftLight);
  const rightLight = new THREE.PointLight(0xffffff, 6, 18);
  rightLight.position.set(2, 3, 0);
  scene.add(rightLight);
  renderer.setPixelRatio(window.devicePixelRatio);

  scene.add(new THREE.AmbientLight(0xffffff, 4));

  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    reflectivity: 0.2,
  });
  cube = new THREE.Mesh(geometry, material);
  //------------------------add ground-----------------------
  const groundGeometry = new THREE.PlaneGeometry(60, 60, 1, 1);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.7,
    metalness: 0.5,
  });
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.scale.multiplyScalar(9);
  ground.receiveShadow = true;
  scene.add(ground);

  //-----------------------TV's Mesh-------------------
  const tvloader = new GLTFLoader();
  let video = document.getElementById("testVideo");
  video.play();

  let video2 = document.getElementById("vid1");
  video2.play();

  let video3 = document.getElementById("vid2");
  video3.play();

  videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  vid1Text = new THREE.VideoTexture(video2);
  vid1Text.minFilter = THREE.LinearFilter;
  vid1Text.magFilter = THREE.LinearFilter;

  vid2Text = new THREE.VideoTexture(video3);
  vid2Text.minFilter = THREE.LinearFilter;
  vid2Text.magFilter = THREE.LinearFilter;

  document.addEventListener("click", (e) => {
    console.log("clicked");
    video.play();
    video2.play();
    video3.play();
  });
  window.addEventListener("resize", onWindowResize, false);

  const renderPass = new RenderPass(scene, camera);

  const effectFilmBW = new FilmPass(0.35, 0.5, 2048, true);
  const glitchEffect = new GlitchPass();

  const vignette = VignetteShader;
  const vignetteEffect = new ShaderPass(vignette);
  vignetteEffect.uniforms["offset"].value = 0.95;
  vignetteEffect.uniforms["darkness"].value = 1.6;
  composer1 = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      stencilBuffer: true,
    })
  );
  composer1.addPass(renderPass);
  composer1.addPass(effectFilmBW);
  //composer1.addPass(glitchEffect);
  composer1.addPass(vignetteEffect);

  tvloader.load("tvs.gltf", (gltf) => {
    tvs = gltf.scene;
    const tvMat = new THREE.MeshStandardMaterial({
      color: 0x049ef4,
      roughness: 0.3,
      metalness: 1,
    });
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.FrontSide,
      toneMapped: false,
    });
    screenMaterial.map.flipY = false;
    const screen1Material = new THREE.MeshBasicMaterial({
      map: vid1Text,
      side: THREE.FrontSide,
      toneMapped: false,
    });
    screen1Material.map.flipY = false;
    const screen2Material = new THREE.MeshBasicMaterial({
      map: vid2Text,
      side: THREE.FrontSide,
      toneMapped: false,
    });
    screen2Material.map.flipY = false;
    //tvs.material = screenMaterial;
    tvs.traverse((e) => {
      if (e.isMesh && e.material.name == "ScreenTop") {
        e.material = screen1Material;
      } else if (e.isMesh && e.material.name == "ScreenB") {
        e.material = screenMaterial;
      } else if (e.isMesh && e.material.name == "ScreenG") {
        e.material = screen2Material;
      }
    });
    scene.add(tvs);
  });
}

function draw() {
  const time = performance.now() / 3000;
  videoTexture.needsUpdate = true;
  camera.position.z = 12.06 + 16 * noise.noise(time / 6, 1, 0);
  //spotLight.position.x = Math.cos(time) * 25;
  //spotLight.position.z = Math.sin(time) * 25;
}

function animate() {
  requestAnimationFrame(animate);
  //controls.update();
  //renderer.render(scene, camera);
  composer1.render();
  draw();
  //console.log(controls.object.position);
  //var [x, y, z] = controls.object.position;
  if (camStat) {
    // camStat.innerHTML = "x: " + x + " y: " + y + " z: " + z;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  composer1.setSize(window.innerWidth, window.innerHeight);
}

setup();
animate();
