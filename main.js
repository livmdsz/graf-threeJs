(() => {
  const mount = document.getElementById('scene');
  const errorBox = document.getElementById('scene-error');
  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');
  const toggleButton = document.getElementById('toggleButton');
  const resetButton = document.getElementById('resetButton');

  // Fecha local actualizada cada vez que se abre o recarga la página.
  const now = new Date();
  document.getElementById('currentDate').textContent = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(now);
  document.getElementById('currentYear').textContent = now.getFullYear();

  try {
    if (!window.THREE) throw new Error('Three.js no se cargó. Revisa la conexión a internet.');
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.35, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050811, 1);
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    }
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 7);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x8999ff, 1.2);
    fillLight.position.set(-5, 1, 3);
    scene.add(fillLight);

    const geometry = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    const configs = [
      { color: 0x00ff25, x: -2.05, rx: .4, ry: .7, vx: .65, vy: .9 },
      { color: 0x183cff, x: 0, rx: .7, ry: .35, vx: 1.05, vy: .5 },
      { color: 0xff202e, x: 2.05, rx: .3, ry: 1.1, vx: .4, vy: 1.2 }
    ];
    const cubes = configs.map(c => {
      const material = new THREE.MeshLambertMaterial({ color: c.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(c.x, 0, 0);
      mesh.rotation.set(c.rx, c.ry, .08);
      scene.add(mesh);
      return { mesh, x: c.x, rx: c.rx, ry: c.ry, vx: c.vx, vy: c.vy };
    });

    let paused = false;
    let speed = Number(speedRange.value);
    let dragging = false, px = 0, py = 0;
    let viewX = 0, viewY = 0;
    renderer.domElement.style.touchAction = 'none';

    renderer.domElement.addEventListener('pointerdown', e => {
      dragging = true; px = e.clientX; py = e.clientY;
      if (renderer.domElement.setPointerCapture) renderer.domElement.setPointerCapture(e.pointerId);
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (!dragging) return;
      viewY += (e.clientX - px) * .004;
      viewX += (e.clientY - py) * .003;
      viewX = Math.max(-.55, Math.min(.55, viewX));
      px = e.clientX; py = e.clientY;
    });
    const stopDrag = () => { dragging = false; };
    renderer.domElement.addEventListener('pointerup', stopDrag);
    renderer.domElement.addEventListener('pointercancel', stopDrag);

    function resize() {
      const w = Math.max(mount.clientWidth, 1);
      const h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    window.addEventListener('resize', resize);

    let last = performance.now();
    function animate(nowTime) {
      requestAnimationFrame(animate);
      const dt = Math.min((nowTime - last) / 1000, .05);
      last = nowTime;
      if (!paused) {
        cubes.forEach(c => {
          c.mesh.rotation.x += c.vx * speed * dt;
          c.mesh.rotation.y += c.vy * speed * dt;
        });
      }
      // Aplicar la orientación arrastrada a la escena sin ocultar los cubos.
      scene.rotation.x += (viewX - scene.rotation.x) * .08;
      scene.rotation.y += (viewY - scene.rotation.y) * .08;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    speedRange.addEventListener('input', () => {
      speed = Number(speedRange.value);
      speedValue.textContent = speed.toFixed(1) + '×';
    });
    toggleButton.addEventListener('click', () => {
      paused = !paused;
      toggleButton.innerHTML = paused
        ? '<i class="bi bi-play-fill"></i><span>Reanudar</span>'
        : '<i class="bi bi-pause-fill"></i><span>Pausar</span>';
    });
    resetButton.addEventListener('click', () => {
      cubes.forEach(c => {
        c.mesh.position.x = c.x;
        c.mesh.rotation.set(c.rx, c.ry, .08);
      });
      viewX = 0; viewY = 0;
      speed = 1; speedRange.value = '1'; speedValue.textContent = '1.0×';
      paused = false;
      toggleButton.innerHTML = '<i class="bi bi-pause-fill"></i><span>Pausar</span>';
    });
  } catch (err) {
    console.error(err);
    errorBox.classList.remove('d-none');
    errorBox.innerHTML = '<i class="bi bi-exclamation-triangle"></i><span>No se pudo iniciar la escena 3D. Abre el proyecto con Live Server y comprueba que tengas conexión a internet.</span>';
  }
})();
