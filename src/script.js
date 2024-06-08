// ---
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import gsap from 'gsap'

import * as dat from 'lil-gui'
// ---


// Event Handlers
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

window.addEventListener('keydown', function(event){
    if (event.key == 'h'){
        gui.show( gui._hidden ) // toggling
    }
})

// Debug UI
const gui = new dat.GUI({
    width: 250,
    title: 'Debug UI',
    closeFolders: false,
})
const debugObject = {}
debugObject.color = 'indigo'
debugObject.wireframe = false
debugObject.axesHelperVisibility = true
debugObject.spin = () => {
    gsap.to(torus.rotation, {y: torus.rotation.y + 2*Math.PI, duration: 2, delay: 0});
    gsap.to(torus.rotation, {y: torus.rotation.y - 2*Math.PI, delay: 2, duration: 1});
}

const guiSphereFolder = gui.addFolder('Sphere')
const guiPlaneFolder = gui.addFolder('Plane')
const guiTorusFolder = gui.addFolder('Torus')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)
// guiTorusFolder.add(scene, 'axesHelper') // ERROR
guiTorusFolder.add(debugObject, 'axesHelperVisibility').onChange((value) => {
    axesHelper.visible = value
})
guiTorusFolder.add(debugObject, 'spin').name('Spin animation')


// ------

// Textures:
// const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader() // loadingManager

const doorColorTexture = textureLoader.load("/textures/door/color.jpg")
doorColorTexture.colorSpace = THREE.SRGBColorSpace
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg")
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg")
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg")
const doorAmbientOcclusionTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg")
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg")
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg")
const matcapTexture = textureLoader.load("/textures/matcaps/2.png")
matcapTexture.colorSpace = THREE.SRGBColorSpace
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg")

// Objects (sphere, plane, torus)

// ------------------------------------------------

// MATERIAL:
// const material = new THREE.MeshBasicMaterial({ color: 'sienna', wireframe: true })
const basicMaterial = new THREE.MeshBasicMaterial(
    {
        map: doorColorTexture,
        wireframe: true
    }
) // Some properties of MeshBasicMaterial
// material.map = doorColorTexture // equivalent
// material.color = new THREE.Color('salmon')
// material.transparent = true
// material.opacity = .05
// material.side = THREE.DoubleSide // BacksSide, FrontSide

// MeshNormalMaterial
const normalMaterial = new THREE.MeshNormalMaterial()
// material.flatShading = true
// material.wireframe = true
// material.transparent = true
// material.opacity = .75
// material.side = THREE.DoubleSide

// MeshMatcapMaterial
const matcapMaterial = new THREE.MeshMatcapMaterial() // matcapMaterial
matcapMaterial.wireframe = true
matcapMaterial.matcap = matcapTexture // the mesh appear illuminated, but it's an illusion created by the texture.
// The problem is that the result is the same regardless of the camera orientation and we cannot update the lights.
// Resources - vast list of matcaps: https://github.com/nidorx/matcaps

// MeshDepthMaterial.
// MeshLambertMaterial <- first material that requires LIGHTS.
// Supports the same properties as the MeshBasicMaterial but also some properties related to lights.
// Is the most performant material that uses lights, but the parameters aren't convenient, and we can see strange patterns in the geometry.
const lambertMaterial = new THREE.MeshLambertMaterial()
// const ambientLight = new THREE.AmbientLight('black', 1) // Ambient Light
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 15) // Point Light
// // Set at the center of the scene by default.
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight) (***)

// MeshPhongMaterial
const phongMaterial = new THREE.MeshPhongMaterial()
// phongMaterial.shininess = 100
// phongMaterial.specular = new THREE.Color(13, 56, 156)

// MeshToonMaterial (cell shading (like Zelda, cartoonish style))
const tooMaterial = new THREE.MeshToonMaterial() // we need to add this two sentences of code because of the characteristics of the gradient textures (3 pixels...) (see mipmapping in previous lessons).
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// tooMaterial.gradientMap = gradientTexture

// MeshStandardMaterial (PBR)
const material = new THREE.MeshStandardMaterial()
material.metalness = 1
material.roughness = 1 // the lesser the more smoothness

material.map = doorColorTexture
material.aoMap = doorAmbientOcclusionTexture
material.aoMapIntensity = 1
material.displacementMap = doorHeightTexture
material.displacementScale = .2
material.normalMap = doorNormalTexture
material.normalScale.set(.5, .5)
material.metalnessMap = doorMetalnessTexture
material.roughnessMap = doorRoughnessTexture

material.transparent = true
material.alphaMap = doorAlphaTexture

material.side = THREE.DoubleSide
// We need to import the RGBELoader from addons/loaders (**)
// material.envMap =
guiTorusFolder.add(material, 'metalness').min(0).max(1).step(.0001)
guiTorusFolder.add(material, 'roughness').min(0).max(1).step(.0001)

// Environment map - is like an image of what's surrounding the scene (2k.hdr)
// (**)
const rgbeLoader = new RGBELoader()
rgbeLoader.load("./textures/environmentMap/christmas_photo_studio_04_2k.hdr", (environmentMap) => {
    // onLoad, onProgress, onError
    environmentMap.mapping = THREE.EquirectangularReflectionMapping // 303

    scene.background = environmentMap // it's now in the background, but not contributing to the lighting of the objects.
    scene.environment = environmentMap
}) // (***) now we can get rid of the AmbientLight and the PointLight because the contribution of the environmentMap.

// ------------------------------------------------

// Mesh:
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(.75, 32, 32),
    material
)
sphere.position.x = -2
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material
)
plane.position.x = 0
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(.5, .25, 25, 50),
    material
)
torus.position.x = 2

scene.add(sphere, plane, torus)

// Adding some debug ui controls:
guiSphereFolder.add(sphere.material, 'wireframe')
guiPlaneFolder.add(plane.material, 'wireframe')
guiTorusFolder.add(torus.material, 'wireframe')

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()
const frame = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects:
    sphere.rotation.y = .25 * (elapsedTime * 2*Math.PI)
    plane.rotation.y = .25 * (elapsedTime * 2*Math.PI)
    torus.rotation.y = .25 * (elapsedTime * 2*Math.PI)

    sphere.rotation.x = -.15 * (elapsedTime * 2*Math.PI)
    plane.rotation.x = -.15 * (elapsedTime * 2*Math.PI)
    torus.rotation.x = -.15 * (elapsedTime * 2*Math.PI)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call frame again on the next frame
    window.requestAnimationFrame(frame)
}
frame()