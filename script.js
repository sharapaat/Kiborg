/* ============================================================
   1) NAVBAR SCROLL EFFECT
============================================================ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ============================================================
   2) MOBILE MENU AUTO-CLOSE
============================================================ */
document.querySelectorAll('#navMenu a').forEach(a => {
  a.addEventListener('click', () => {
    const menu = document.getElementById('navMenu');
    if (menu) menu.classList.remove('open');
  });
});

/* ============================================================
   3) REVEAL ON SCROLL
============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('active');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   4) STATS COUNTER
============================================================ */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      let count = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const timer = setInterval(() => {
        count += step;
        if (count >= target) { count = target; clearInterval(timer); }
        el.textContent = count;
      }, 25);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

/* ============================================================
   5) SURVEY LOGIC
============================================================ */
function submitSurvey() {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');

  if (!q1 || !q2 || !q3) {
    alert('Барлық сұрақтарға жауап беріңіз!');
    return;
  }

  const result = document.getElementById('surveyResult');
  const text = document.getElementById('resultText');

  let feedback = '';
  if (q1.value === 'yes') feedback = 'Сіз киборг технологияларын болашақтың маңызды бөлігі деп санайсыз. 🚀';
  else if (q1.value === 'maybe') feedback = 'Сіз технологияны қабылдайсыз, бірақ қауіпсіздік мәселелеріне мән бересіз. ⚖️';
  else feedback = 'Сіз табиғи жолды ұстануды жөн көресіз, бұл да негізді ұстаным. 🌿';

  text.textContent = feedback + ' Қатысқаныңызға рахмет! Нәтижелер жалпы статистикаға қосылады.';
  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   6) 3D BRAIN MODEL (Three.js)
============================================================ */
(function init3DBrain() {
  const container = document.getElementById('brainModel');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f9);

  // CAMERA
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(0, 0, 6);

  // RENDERER
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // LIGHTS
  const light1 = new THREE.PointLight(0x2563eb, 2, 50);
  light1.position.set(5, 5, 5);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x8b5cf6, 1.5, 50);
  light2.position.set(-5, -3, 4);
  scene.add(light2);

  const light3 = new THREE.PointLight(0x06b6d4, 1.5, 50);
  light3.position.set(0, 5, -5);
  scene.add(light3);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // BRAIN GROUP
  const brainGroup = new THREE.Group();

  // Ми денесі
  const brainGeo = new THREE.IcosahedronGeometry(1.6, 4);
  const positions = brainGeo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i);
    const noise = Math.sin(v.x * 4) * Math.cos(v.y * 4) * Math.sin(v.z * 4) * 0.12;
    v.multiplyScalar(1 + noise);
    positions.setXYZ(i, v.x, v.y, v.z);
  }
  brainGeo.computeVertexNormals();

  const brainMat = new THREE.MeshPhongMaterial({
    color: 0x3b82f6,
    emissive: 0x1e40af,
    emissiveIntensity: 0.15,
    shininess: 80,
    flatShading: true,
    transparent: true,
    opacity: 0.92
  });

  const brain = new THREE.Mesh(brainGeo, brainMat);
  brainGroup.add(brain);

  // Wireframe
  const wireGeo = new THREE.IcosahedronGeometry(1.65, 3);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const wireframe = new THREE.Mesh(wireGeo, wireMat);
  brainGroup.add(wireframe);

  // Нейрондық нүктелер
  const pointsGeo = new THREE.BufferGeometry();
  const pointsCount = 200;
  const pointPositions = new Float32Array(pointsCount * 3);

  for (let i = 0; i < pointsCount; i++) {
    const r = 1.7 + Math.random() * 0.3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pointPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pointPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pointPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));

  const pointsMat = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.06,
    transparent: true,
    opacity: 0.85
  });
  const points = new THREE.Points(pointsGeo, pointsMat);
  brainGroup.add(points);

  // Сақиналар
  const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.35
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2.5;
  brainGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.rotation.y = Math.PI / 3;
  ring2.rotation.x = Math.PI / 4;
  ring2.scale.setScalar(1.15);
  brainGroup.add(ring2);

  // Электрондар
  const electrons = [];
  for (let i = 0; i < 6; i++) {
    const eGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const eMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const e = new THREE.Mesh(eGeo, eMat);
    e.userData = {
      radius: 2.4,
      speed: 0.5 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      axis: Math.random() * Math.PI,
      tilt: Math.random() * Math.PI
    };
    electrons.push(e);
    brainGroup.add(e);
  }

  scene.add(brainGroup);

  // INTERACTION
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let targetRotY = 0, targetRotX = 0;
  let currentRotY = 0, currentRotX = 0;

  container.addEventListener('mousedown', e => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('mouseup', () => isDragging = false);

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    targetRotY += dx * 0.008;
    targetRotX += dy * 0.008;
    targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
    prevX = e.clientX;
    prevY = e.clientY;
  });

  // Touch
  container.addEventListener('touchstart', e => {
    isDragging = true;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', () => isDragging = false);

  container.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    targetRotY += dx * 0.008;
    targetRotX += dy * 0.008;
    targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }, { passive: true });

  // ANIMATION
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!isDragging) targetRotY += 0.003;

    currentRotY += (targetRotY - currentRotY) * 0.08;
    currentRotX += (targetRotX - currentRotX) * 0.08;

    brainGroup.rotation.y = currentRotY;
    brainGroup.rotation.x = currentRotX;

    const pulse = 1 + Math.sin(t * 1.5) * 0.02;
    brain.scale.setScalar(pulse);
    wireframe.scale.setScalar(pulse);

    ring1.rotation.z += 0.005;
    ring2.rotation.z -= 0.007;

    points.material.opacity = 0.6 + Math.sin(t * 2) * 0.25;

    electrons.forEach(e => {
      e.userData.angle += e.userData.speed * 0.02;
      const a = e.userData.angle;
      const r = e.userData.radius;
      const ax = e.userData.axis;
      const tl = e.userData.tilt;
      e.position.x = r * Math.cos(a) * Math.cos(ax);
      e.position.y = r * Math.sin(a) * Math.sin(tl) + Math.sin(a * 2) * 0.3;
      e.position.z = r * Math.sin(a) * Math.cos(ax);
    });

    light1.position.x = Math.sin(t * 0.5) * 5;
    light1.position.z = Math.cos(t * 0.5) * 5;
    light2.position.x = Math.cos(t * 0.4) * 5;
    light2.position.y = Math.sin(t * 0.6) * 5;

    renderer.render(scene, camera);
  }

  animate();

  // RESIZE
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

/* ============================================================
   7) BACKGROUND CANVAS — PARTICLE NETWORK
============================================================ */
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();

  const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 60;

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => { p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - dist / 140)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', resize);
})();