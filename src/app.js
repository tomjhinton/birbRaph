
import * as Tone from 'tone'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import './style.scss'
/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug

const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

let titular = document.getElementById('titular')

const sampler = new Tone.Sampler({
	urls: {
		A1: "badger.mp3",
		A2: "danse.mp3",
    A3: "jail.mp3",
    A4: "perlin.mp3",
    A5: "oiseau.mp3",
	},
	onload: () => {

	}
}).toDestination();

let noteArray = ["A1", "A2", "A3", "A4", "A5"]

titular.addEventListener('click', function (e) {
  	sampler.triggerAttackRelease(noteArray[Math.floor(Math.random()* noteArray.length)], 5.5);
});



/**
 * Models
 */
let raphMixer = null

gltfLoader.load(
    'raph.glb',
    (gltf) =>
    {
        // Model
        //gltf.scene.scale.set(0.02, 0.02, 0.02)
        scene.add(gltf.scene)

        // Animation
        raphMixer = new THREE.AnimationMixer(gltf.scene)
        const raphAction = raphMixer.clipAction(gltf.animations[0])
        raphAction.play()

        // Update materials
        updateAllMaterials()
    }
)


const floorGeometry = new THREE.CircleGeometry(25, 64)
const boxGeometry = new THREE.BoxGeometry(50, 50, 50)

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  depthWrite: true,
  clipShadows: true,
  wireframe: false,
  side: THREE.DoubleSide,
  uniforms: {

    u_time: {
      value: 0
    },

    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uValueA: {
      value: {x: 0, y: 0, z: 1}
    }

  }
})


const floor = new THREE.Mesh(floorGeometry, shaderMaterial)
const box = new THREE.Mesh(boxGeometry, shaderMaterial)
floor.rotation.x = - Math.PI * 0.5
floor.position.y -=1
scene.add(floor, box)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(3.5, 2, - 1.25)
scene.add(directionalLight)

// /**

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
 // * Sizes
 // */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(6, 4, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false;
controls.maxPolarAngle = Math.PI / 2 - 0.1

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.75
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#211d20')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()


    // Fox animation
    if(raphMixer)
    {
        raphMixer.update(deltaTime)
    }

    if(shaderMaterial.uniforms.uResolution.value.x === 0 && shaderMaterial.uniforms.uResolution.value.y === 0 ){
    shaderMaterial.uniforms.uResolution.value.x = renderer.domElement.width
    shaderMaterial.uniforms.uResolution.value.y = renderer.domElement.height
  }




  shaderMaterial.uniforms.u_time.value = elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
