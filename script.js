const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  const revealItems = document.querySelectorAll('.animate-fade-up');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('.animate-fade-up').forEach((item) => item.classList.add('visible'));
}

const canvas = document.getElementById('background-canvas');
const ctx = canvas && canvas.getContext('2d');
const points = [];
const pointCount = 55;
const mouse = { x: -9999, y: -9999 };
let animationFrame = 0;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  if (ctx) ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function createPoints() {
  points.length = 0;
  for (let i = 0; i < pointCount; i += 1) {
    const baseAlpha = 0.12 + Math.random() * 0.24;
    points.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: 1.4 + Math.random() * 2.8,
      baseAlpha,
      twinkleSpeed: 0.8 + Math.random() * 0.6,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
}

function drawStar(x, y, radius) {
  if (!ctx) return;
  const outerRadius = radius;
  const innerRadius = radius * 0.45;
  const pointsCount = 5;
  const step = Math.PI / pointsCount;
  ctx.beginPath();

  for (let i = 0; i < pointsCount * 2; i += 1) {
    const dist = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + i * step;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
}

function drawPoint(point) {
  if (!ctx) return;
  const alpha = Math.min(1, point.baseAlpha + 0.22 + Math.sin(animationFrame * point.twinkleSpeed + point.twinklePhase) * 0.2);
  ctx.fillStyle = `rgba(248,250,252,${alpha})`;
  drawStar(point.x, point.y, point.radius);
  ctx.fill();
}

function drawConnection(pointA, pointB, alpha) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(pointA.x, pointA.y);
  ctx.lineTo(pointB.x, pointB.y);
  ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

function animateBackground() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const dx = mouse.x - point.x;
    const dy = mouse.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repel = Math.max(0, 120 - dist) * 0.0012;

    if (dist < 160) {
      point.vx -= (dx / dist) * repel;
      point.vy -= (dy / dist) * repel;
    }

    point.vx += (Math.random() - 0.5) * 0.02;
    point.vy += (Math.random() - 0.5) * 0.02;
    point.vx *= 0.95;
    point.vy *= 0.95;
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0) point.x = window.innerWidth;
    if (point.x > window.innerWidth) point.x = 0;
    if (point.y < 0) point.y = window.innerHeight;
    if (point.y > window.innerHeight) point.y = 0;

    drawPoint(point);

    for (let j = i + 1; j < points.length; j += 1) {
      const other = points[j];
      const dx2 = other.x - point.x;
      const dy2 = other.y - point.y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (dist2 < 90) {
        drawConnection(point, other, 0.04 + (90 - dist2) * 0.0008);
      }
    }
  }

  animationFrame += 0.02;
  requestAnimationFrame(animateBackground);
}

window.addEventListener('pointermove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
window.addEventListener('pointerleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});
window.addEventListener('resize', () => {
  resizeCanvas();
  createPoints();
});
resizeCanvas();
createPoints();
animateBackground();
