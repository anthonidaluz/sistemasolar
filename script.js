// Variáveis globais
let scene, camera, renderer, controls;
let raycaster, mouse;
let planets = [];
let asteroids = [];
let clickableObjects = [];
let infoPanel;
let asteroidBelt;
let zoomTargetCamera = null;
let zoomTargetControl = null;

init();
animate();

function init() {
  // Cria a cena, câmera e renderizador
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controles de órbita
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 20, 40);
  controls.update();

  // Skybox – substitua os caminhos das imagens pelas suas texturas
  const cubeLoader = new THREE.CubeTextureLoader();
  cubeLoader.load([
    './imgs/mercurio.jpg',
    './imgs/venus.jpg',
    './imgs/terra.jpg',
    './imgs/marte.jpg',
    './imgs/jupiter.jpg',
    './imgs/saturno.jpg',
    './imgs/urano.jpg',
    './imgs/netuno.jpg'
  ], (skyboxTexture) => {
    scene.background = skyboxTexture;

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
    Array(600).fill().forEach(estrelas);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    // Ativando o sombreamento
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Fazer com que a luz do Sol seja um ponto de luz
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    // sunLight.shadow.mapSize.width = 512;
    // sunLight.shadow.mapSize.height = 512;
    scene.add(sunLight);

    // Carrega a textura do Sol
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load('./imgs/sol.jpg');


    // Cria o Sol
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Dados didáticos dos planetas (tamanho, distância e período orbital em dias)
    const planetsData = [
      {
        name: 'Mercúrio',
        distance: 5,
        size: 0.5,
        color: 0xaaaaaa,
        texture: textureLoader.load('./imgs/mercurio.jpg'),
        orbitalPeriod: 88,
        info: "Mercúrio é o menor e mais rápido planeta do Sistema Solar. Um dia lá dura 176 dias terrestres!"
      },
      {
        name: 'Vênus',
        distance: 7,
        size: 0.6,
        color: 0xffcc00,
        texture: textureLoader.load('./imgs/venus.jpg'),
        orbitalPeriod: 225,
        info: "Vênus é o planeta mais quente do Sistema Solar, com temperaturas de até 475°C, devido ao efeito estufa descontrolado."
      },
      {
        name: 'Terra',
        distance: 9,
        size: 0.65,
        color: 0x2233ff,
        texture: textureLoader.load('./imgs/terra.jpg'),
        orbitalPeriod: 365,
        info: "Nosso planeta azul é o único conhecido por abrigar vida. Sua atmosfera protege contra meteoros e radiação solar."
      },
      {
        name: 'Marte',
        distance: 11,
        size: 0.55,
        color: 0xff3300,
        texture: textureLoader.load('./imgs/marte.jpg'),
        orbitalPeriod: 687,
        info: "Chamado de Planeta Vermelho, Marte tem vulcões gigantes e o maior cânion do Sistema Solar: Valles Marineris."
      },
      {
        name: 'Júpiter',
        distance: 15,
        size: 1.2,
        color: 0xff8800,
        texture: textureLoader.load('./imgs/jupiter.jpg'),
        orbitalPeriod: 4331,
        info: "Júpiter é o maior planeta do Sistema Solar e tem uma tempestade chamada Grande Mancha Vermelha ativa há séculos."
      },
      {
        name: 'Saturno',
        distance: 19,
        size: 1.0,
        color: 0xffeeaa,
        texture: textureLoader.load('./imgs/saturno.jpg'),
        orbitalPeriod: 10747,
        info: "Saturno é famoso por seus anéis gigantes compostos de gelo e poeira, podendo ser vistos da Terra com telescópios simples."
      },
      {
        name: 'Urano',
        distance: 23,
        size: 0.8,
        color: 0x66ccff,
        texture: textureLoader.load('./imgs/urano.jpg'),
        orbitalPeriod: 30589,
        info: "Urano gira de lado! Seu eixo de rotação é inclinado em cerca de 98°, possivelmente devido a uma colisão gigantesca no passado."
      },
      {
        name: 'Netuno',
        distance: 27,
        size: 0.8,
        color: 0x3366ff,
        texture: textureLoader.load('./imgs/netuno.jpg'),
        orbitalPeriod: 59800,
        info: "Netuno é o planeta mais distante do Sol e tem os ventos mais rápidos do Sistema Solar, chegando a 2.100 km/h."
      }
    ];

    // Usaremos a velocidade angular de Mercúrio como base (0.02) e escalaremos:
    const baseAngularSpeed = 0.02; // para Mercúrio (período de 88 dias)

    // Cria os planetas e seus pivôs (para facilitar a rotação orbital)
    planetsData.forEach(data => {
      const pivot = new THREE.Object3D();
      scene.add(pivot);
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ map: data.texture });
      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.position.x = data.distance;
      // A velocidade é inversamente proporcional ao período orbital
      // Dentro do forEach dos planetas, modifique o userData:
      planetMesh.userData = {
        name: data.name,
        size: data.size,
        orbitalSpeed: baseAngularSpeed * (88 / data.orbitalPeriod),
        orbitalPeriod: data.orbitalPeriod,
        info: data.info
      };
      pivot.add(planetMesh);
      planets.push({ name: data.name, pivot: pivot, mesh: planetMesh, size: data.size });
      clickableObjects.push(planetMesh);

      // Adiciona a Lua para a Terra
      if (data.name === 'Terra') {
        planetMesh.receiveShadow = true;
        const moonPivot = new THREE.Object3D();
        planetMesh.add(moonPivot);
        const moonGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        moonMesh.castShadow = true;
        // Posiciona a Lua a uma distância didática da Terra
        moonMesh.position.x = data.size + 0.5;
        moonMesh.userData = {
          name: 'Lua',
          size: 0.2,
          orbitalSpeed: 0.05  // Velocidade de rotação da Lua
        };
        moonPivot.add(moonMesh);
        // Adiciona o pivô da lua ao array de planetas para animação
        planets.push({
          name: 'Lua',
          pivot: moonPivot,
          mesh: moonMesh,
          size: 0.2
        });
      }
    });

    // Cria o cinturão de asteroides entre Marte e Júpiter
    asteroidBelt = new THREE.Group();
    const numAsteroids = 100;
    for (let i = 0; i < numAsteroids; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = THREE.MathUtils.randFloat(12, 14);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = THREE.MathUtils.randFloat(-0.5, 0.5);
      const asteroidSize = THREE.MathUtils.randFloat(0.05, 0.15);
      const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 8, 8);
      const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroid.position.set(x, y, z);
      asteroid.userData = { radius: asteroidSize };
      asteroidBelt.add(asteroid);
      asteroids.push(asteroid);
    }
    scene.add(asteroidBelt);

    // Cria um painel de informações
    infoPanel = document.createElement('div');
    infoPanel.style.position = 'absolute';
    infoPanel.style.top = '10px';
    infoPanel.style.left = '10px';
    infoPanel.style.color = 'black';
    infoPanel.style.backgroundColor = 'lightblue';
    infoPanel.style.padding = '10px';
    document.body.appendChild(infoPanel);

    // Configura o raycaster e o vetor do mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(clickableObjects);
  if (intersects.length > 0) {
    const selected = intersects[0].object;
    infoPanel.innerHTML = `<strong>${selected.userData.name}</strong><br>
                           Tamanho: ${selected.userData.size}<br>
                           Período Orbital: ${selected.userData.orbitalPeriod} dias<br>
                           <em>${selected.userData.info}</em>`;  // Exibe a informação curiosa!
    zoomToPlanet(selected);
  } else {
    // Return to initial camera position when clicking on empty space
    zoomTargetCamera = new THREE.Vector3(0, 10, 25);
    zoomTargetControl = new THREE.Vector3(0, 0, 0);
    infoPanel.innerHTML = ''; // Clear the info panel
  }
}

// Função para definir o zoom automático ao clicar em um planeta
function zoomToPlanet(planetMesh) {
  const targetPos = new THREE.Vector3();
  planetMesh.getWorldPosition(targetPos);
  zoomTargetControl = targetPos.clone();
  // Calcula um deslocamento para a câmera com base no tamanho do planeta
  zoomTargetCamera = targetPos.clone().add(new THREE.Vector3(0, 5, planetMesh.geometry.parameters.radius * 10));
}

function animate() {
  requestAnimationFrame(animate);

  // Atualiza a rotação dos pivôs dos planetas para simular a órbita
  planets.forEach(planet => {
    const speed = planet.mesh.userData.orbitalSpeed;
    planet.pivot.rotation.y += speed;
  });

  // Rotaciona lentamente o cinturão de asteroides para dar vida à cena
  if (asteroidBelt) {
    asteroidBelt.rotation.y += 0.001;
  }

  // Detecta colisões entre planetas e asteroides
  planets.forEach(planet => {
    const planetWorldPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(planetWorldPos);
    asteroids.forEach(asteroid => {
      const asteroidWorldPos = new THREE.Vector3();
      asteroid.getWorldPosition(asteroidWorldPos);
      const distance = planetWorldPos.distanceTo(asteroidWorldPos);
      if (distance < planet.size + asteroid.userData.radius) {
        console.log(`Colisão detectada: ${planet.name} e um asteroide`);
      }
    });
  });

  // Executa a animação suave de zoom, se houver destino definido
  if (zoomTargetCamera && zoomTargetControl) {
    camera.position.lerp(zoomTargetCamera, 0.05);
    controls.target.lerp(zoomTargetControl, 0.05);
    controls.update();
  }

  // Rotaciona a cena para dar movimento
  scene.rotation.y += 0.002;
  
  renderer.render(scene, camera);
}
