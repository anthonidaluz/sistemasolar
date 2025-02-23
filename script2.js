// Configuração básica da cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Fundo preto

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Atualiza o tamanho do renderizador quando a janela é redimensionada
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Função para adicionar estrelas
function estrelas() {
  const geometry = new THREE.SphereGeometry(0.1, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(300));
  star.position.set(x, y, z);
  scene.add(star);
}

// Adiciona múltiplas estrelas à cena
Array(300).fill().forEach(estrelas);

// Carrega a textura do Sol
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('./imgs/sol.jpg');

// Cria o Sol com a textura
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Adiciona uma fonte de luz
const pointLight = new THREE.PointLight(0xffffff, 15, 1000);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Adiciona luz ambiente
const ambientLight = new THREE.AmbientLight(0x404040); // Luz suave
scene.add(ambientLight);

// Função para criar um planeta
function createPlanet(texturePath, size, distanceFromSun, rotationSpeed) {
  const planetTexture = textureLoader.load(texturePath);
  const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);

  return {
    mesh: planet,
    angle: 0,
    distanceFromSun: distanceFromSun,
    rotationSpeed: rotationSpeed
  };
}

// Cria os planetas
const planets = [
  createPlanet('./imgs/mercurio.jpg', 1, 10, 0.02),
  createPlanet('./imgs/venus.jpg', 1.5, 15, 0.015),
  createPlanet('./imgs/terra.jpg', 2, 20, 0.01),
  createPlanet('./imgs/marte.jpg', 1.2, 25, 0.008),
  createPlanet('./imgs/jupiter.jpg', 3, 35, 0.006),
  createPlanet('./imgs/saturno.jpg', 2.8, 45, 0.005),
  createPlanet('./imgs/urano.jpg', 2.2, 55, 0.004),
  createPlanet('./imgs/netuno.jpg', 2, 65, 0.003),
];

// Configuração da posição da câmera
camera.position.z = 100;

// Função de animação
function animate() {
  requestAnimationFrame(animate);

  // Rotaciona a cena para dar movimento
  scene.rotation.y += 0.002;

  // Atualiza a posição dos planetas para orbitar o Sol
  planets.forEach(planet => {
    planet.angle += planet.rotationSpeed;
    planet.mesh.position.x = planet.distanceFromSun * Math.cos(planet.angle);
    planet.mesh.position.z = planet.distanceFromSun * Math.sin(planet.angle);
  });

  renderer.render(scene, camera);
}

animate();
