import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

// Crear escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Crear cámara
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 7;

// Crear renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(4, 5, 6);
scene.add(directionalLight);

// Geometría compartida por los tres cubos
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Configuración individual de cada cubo
const cubeSettings = [
    {
        color: 0x00ff00,
        x: -2,
        speedX: 0.012,
        speedY: 0.018
    },
    {
        color: 0x0000ff,
        x: 0,
        speedX: 0.020,
        speedY: 0.009
    },
    {
        color: 0xff0000,
        x: 2,
        speedX: 0.007,
        speedY: 0.025
    }
];

// Crear los tres cubos
const cubes = cubeSettings.map((settings) => {
    const material = new THREE.MeshStandardMaterial({
        color: settings.color,
        roughness: 0.65,
        metalness: 0
    });

    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(settings.x, 0, 0);
    cube.rotation.set(0.35, 0.45, 0);

    scene.add(cube);

    return {
        mesh: cube,
        speedX: settings.speedX,
        speedY: settings.speedY
    };
});

// Animación continua
function animate() {
    requestAnimationFrame(animate);

    cubes.forEach((cube) => {
        cube.mesh.rotation.x += cube.speedX;
        cube.mesh.rotation.y += cube.speedY;
    });

    renderer.render(scene, camera);
}

animate();

// Adaptar el renderizado al tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

