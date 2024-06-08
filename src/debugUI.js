import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import gsap from 'gsap'
import GUI from 'lil-gui' // In further lessons, the same:
// import * as dat from 'lil-gui' <- const gui = dat.GUI()

// Debug UI:

/**
 * dat.GUI
 * lil-gui <- we are gonna use this (*)
 * control-panel
 * ControlKit
 * Uil
 * Teakpane
 * Guify
 * Oui
 * ...
 */
// (*) Popular, well-maintained, easy to use.
// GUI: Graphical User Interface.

// Instantiating lil-gui:
// First things first: npm install lil-gui
// const gui = new GUI() SETUP
const gui = new GUI({
    width: 250,
    title: 'Debug UI',
    closeFolders: true, // by default
})
// autoPlace?: boolean;
// container?: HTMLElement;
// width?: number;
// title?: string;
// closeFolders?: boolean;
// injectStyles?: boolean;
// touchStyles?: number;
// parent?: GUI;
gui.close() // by default (for users to enjoy the experience)
gui.hide() // <- in the DOM but hidden. How can we get it back?
window.addEventListener('keydown', function(event){
    if (event.key == 'h'){
        gui.show( gui._hidden ) // toggling
    }
})
// For more: https://lil-gui.georgealways.com

const debugObject = {} // global, parameters, guiObject, guiHolder, debugHolder, ... to set properties.
// FOLDERS:
const cubeTweaksFolder = gui.addFolder('Flabbergasting cube')
// Creates a panel that holds controllers.
// @example
// new GUI(); new GUI( { container: document.getElementById( 'custom' ) } );

// Different types of tweaks:
/**
 * Range - for numbers with min and max value.
 * Color - for colors with various formats.
 * Text - for simple texts.
 * Checkbox - for booleans (true or false).
 * Select - for a choice from a list of values.
 * Button - to trigger functions.
 */
// gui.add(...) <- Parameters: the object and the property of that object we want to change.

// ---------------------------------------

// Event handlers
window.addEventListener('resize', () => {
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
window.addEventListener('dblclick', () =>{
    if (!document.fullscreenElement){
        canvas.requestFullscreen();
    }
    else{
        document.exitFullscreen();
    }
});

// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color({ color: 'slategrey'})

const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

// Object
debugObject.color = 'black'
debugObject.wireframe = true
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ color: debugObject.color, wireframe: debugObject.wireframe })
const box = new THREE.Mesh(geometry, material)
scene.add(box)

cubeTweaksFolder.add(box.position, 'y', -1, 1, .01).name('Elevation (y)')
// gui.add(box.position, 'y', -1, 1, .01).name('Elevation (y)') // or
// gui.add(box.position, 'y').min(-1).max(1).step(.01)
// Name of the property to control.
// Adds a controller to the GUI, inferring controller type using the typeof operator.

// @example
// gui.add( object, 'property' );
// gui.add( object, 'number', 0, 100, 1 );
// gui.add( object, 'options', [ 1, 2, 3 ] );

// let myVariable = 1337
// gui.add(myVariable, '???')
// const myObject = {
//     myVariable: 1337
// }
// gui.add(myObject, myVariable)

// visible
cubeTweaksFolder.add(box, 'visible')

// wireframe
cubeTweaksFolder.add(material, 'wireframe') // material === box.material

// Color
// gui.addColor(box.material, 'color').onChange((value) => {
//     //console.log(material.color) === console.log(value)
//     console.log(value.getHexString())
// })
cubeTweaksFolder.addColor(debugObject, 'color').onChange((value) => {
    // console.log(value.getHexString())
    material.color.set(debugObject.color) // value.getHexString()
})

// Function / Button:
// const myFunction = () => {
//     console.log('Hello!')
// }
// gui.add(myFunction, '???')
debugObject.spin = () => {
    gsap.to(box.rotation, {y: box.rotation.y + 2*Math.PI, duration: 2, delay: 0});
    gsap.to(box.rotation, {y: box.rotation.y - 2*Math.PI, delay: 2, duration: 1});
}
cubeTweaksFolder.add(debugObject, 'spin').name('My super spinning object')

// gui.add(geometry, 'widthSegments') <- ERROR | widthSegments will be used to generate the whole geometry only once.
debugObject.subdivision = 2
cubeTweaksFolder.add(debugObject, 'subdivision', 1, 20, 1).name('BoxGeometry').onFinishChange(() => { // onFinishChange (the function will be
    // triggered when we stop tweaking the value).
    box.geometry.dispose() // in order to upgrade performance, removing the previous geometry before adding the
    // new one.
    box.geometry = new THREE.BoxGeometry(1, 1, 1,
        debugObject.subdivision,
        debugObject.subdivision,
        debugObject.subdivision
    ) 
})

// -------------------------------

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
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

    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)
    // Call FRAME again on the next frame:
    window.requestAnimationFrame(frame)
}
frame()