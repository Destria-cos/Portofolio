// ===== LOADER =====
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loaderProgress');
const loaderPercent = document.getElementById('loaderPercent');
let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.random() * 18;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);
    setTimeout(() => {
      loader.classList.add('hidden');
      initAnimations();
    }, 400);
  }
  loaderProgress.style.width = progress + '%';
  loaderPercent.textContent = Math.floor(progress) + '%';
}, 100);

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});
(function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
})();
document.querySelectorAll('a, button, .skill-card, .project-card, .social-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursor.style.opacity = '0.5';
    follower.style.transform = 'translate(-50%,-50%) scale(1.6)';
    follower.style.borderColor = 'rgba(108,99,255,0.9)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.opacity = '1';
    follower.style.transform = 'translate(-50%,-50%) scale(1)';
    follower.style.borderColor = 'rgba(108,99,255,0.5)';
  });
});

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
  handleBackToTop();
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector('.nav-link[href="#' + id + '"]');
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

// ===== MOBILE MENU =====
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.color = Math.random() > 0.5 ? '108,99,255' : '255,101,132';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + this.color + ',' + this.opacity + ')';
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < 90; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = 'rgba(108,99,255,' + (0.08 * (1 - dist / 130)) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

(function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
})();

// ===== TYPEWRITER =====
const roles = ['Full Stack Developer', 'UI/UX Designer', 'Problem Solver', 'Open Source Contributor', 'Creative Coder'];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const roleText = document.getElementById('roleText');

function typeWriter() {
  const current = roles[roleIndex];
  if (isDeleting) {
    roleText.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    roleText.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }
  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    setTimeout(typeWriter, 1800);
    return;
  }
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }
  setTimeout(typeWriter, isDeleting ? 60 : 100);
}
typeWriter();

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  let count = 0;
  const step = Math.ceil(target / 50);
  const timer = setInterval(() => {
    count += step;
    if (count >= target) { count = target; clearInterval(timer); }
    el.textContent = count;
  }, 40);
}

// ===== SCROLL REVEAL =====
function initAnimations() {
  const revealEls = document.querySelectorAll('.section-header, .about-left, .about-right, .skill-card, .project-card, .contact-left, .contact-right, .timeline-item, .testimonial-card, .stat');
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
          // trigger skill bars
          const fills = entry.target.querySelectorAll('.skill-fill');
          fills.forEach(fill => {
            fill.style.width = fill.getAttribute('data-width') + '%';
          });
          // trigger counters
          const counters = entry.target.querySelectorAll('.stat-num');
          counters.forEach(animateCounter);
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));

  // Also observe skill fills in active tab
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.getAttribute('data-width') + '%';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skills-grid').forEach(g => skillObserver.observe(g));
}

// ===== SKILLS TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.getAttribute('data-tab'));
    panel.classList.add('active');
    // animate bars in newly shown tab
    setTimeout(() => {
      panel.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = fill.getAttribute('data-width') + '%'; }, 50);
      });
    }, 10);
  });
});

// ===== PROJECT FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      const cat = card.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        card.style.display = '';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
  btn.style.background = 'linear-gradient(135deg, #43e97b, #38f9d7)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.background = '';
    btn.disabled = false;
    this.reset();
  }, 3000);
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
function handleBackToTop() {
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
}
if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== TESTIMONIALS SLIDER =====
let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.slider-dot');

function goToSlide(n) {
  if (!slides.length) return;
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

if (slides.length) {
  goToSlide(0);
  setInterval(() => goToSlide(currentSlide + 1), 4500);
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== TILT EFFECT ON AVATAR =====
const avatarWrap = document.querySelector('.hero-avatar-wrap');
if (avatarWrap) {
  document.addEventListener('mousemove', e => {
    const rect = avatarWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    avatarWrap.style.transform = 'perspective(600px) rotateY(' + (dx * 15) + 'deg) rotateX(' + (-dy * 15) + 'deg)';
  });
}

// ===== GLITCH EFFECT ON HERO NAME =====
const heroName = document.getElementById('heroName');
if (heroName) {
  setInterval(() => {
    heroName.classList.add('glitch');
    setTimeout(() => heroName.classList.remove('glitch'), 200);
  }, 5000);
}
