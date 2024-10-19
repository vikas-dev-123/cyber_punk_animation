 import './style.css';
 import * as THREE from 'three';
//  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
 import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
 import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
 import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
 import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
 import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
 import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
 import gsap from 'gsap';
 import LocomotiveScroll from 'locomotive-scroll';

 const locomotiveScroll = new LocomotiveScroll();
 // scene
 const scene = new THREE.Scene();
 
 //camera
 const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
 camera.position.z = 3.5
 
 //renderer
 const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
    alpha: true,
 });
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));  // to get great performance without sacrificing resources.
 renderer.setSize(window.innerWidth, window.innerHeight);
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = 1;
 renderer.outputEncoding = THREE.sRGBEncoding;

 const pmremGenerator = new THREE.PMREMGenerator(renderer);
 pmremGenerator.compileEquirectangularShader();

 // OrbitControls
//  const controls = new OrbitControls(camera, renderer.domElement);

 // Post-processing
 const composer = new EffectComposer(renderer);
 const renderPass = new RenderPass(scene, camera);
 composer.addPass(renderPass);

 const rgbShiftPass = new ShaderPass(RGBShiftShader);
 rgbShiftPass.uniforms['amount'].value = 0.0030;
 composer.addPass(rgbShiftPass);

 // Make sure the canvas is not covering the image
 const canvas = document.querySelector("#canvas");
 

 let model;
 // GLTF Loader
 const rgbeLoader = new RGBELoader();
 rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
     const envMap = pmremGenerator.fromEquirectangular(texture).texture;
     scene.environment = envMap;
     texture.dispose();
     pmremGenerator.dispose();

     const loader = new GLTFLoader();
     loader.load(
         './DamagedHelmet.gltf',
         function (gltf) {
            model = gltf.scene;
             scene.add(model);
         },
         function (xhr) {
             console.log((xhr.loaded / xhr.total * 100) + '% loaded');
         },
         function (error) {
             console.error('An error happened', error);
         }
     );
 });

 window.addEventListener('mousemove', (e)=> {
    if (model){
        const rotationX = (e.clientX / window.innerHeight - .5) * (Math.PI *.12);
        const rotationY = (e.clientY / window.innerWidth - .5) * (Math.PI *.12);
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.5,
            ease: "power2.out"
        });
        
    }
 })

window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

 // render
 function animate() {
    window.requestAnimationFrame(animate);
    
    // Update controls in the animation loop
    // controls.update();

    composer.render();
 }
 animate();

 // Handle window resize
 window.addEventListener('resize', onWindowResize, false);

 function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
 }

 // Check if the image is loaded
 window.addEventListener('load', () => {
    const img = document.querySelector('.main img');
    if (img) {
        console.log('Image is loaded and visible');
    } else {
        console.log('Image is not found or not visible');
    }
 });