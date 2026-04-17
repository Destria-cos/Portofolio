const nav = document.getElementById("nav");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 10);
  toTop.classList.toggle("show", window.scrollY > 400);
}, { passive: true });

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
menuBtn.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuBtn.innerHTML = open ? "<i class=\"fas fa-times\"></i>" : "<i class=\"fas fa-bars\"></i>";
});
mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mobileNav.classList.remove("open");
  menuBtn.innerHTML = "<i class=\"fas fa-bars\"></i>";
}));

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll("section, .project-card, .skill-chip, .about-info, .about-text, .service-card").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

// Typing animation
const roles = ["Full Stack Developer", "Front-End Engineer", "Back-End Developer", "UI/UX Enthusiast"];
let roleIndex = 0, charIndex = 0, deleting = false;
const typedEl = document.getElementById("typed");

function type() {
  const current = roles[roleIndex];
  typedEl.textContent = deleting
    ? current.substring(0, charIndex--)
    : current.substring(0, charIndex++);

  let delay = deleting ? 60 : 100;
  if (!deleting && charIndex === current.length + 1) {
    delay = 1800;
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 400;
  }
  setTimeout(type, delay);
}
type();

// Stats counter
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll(".stat-num").forEach(el => {
      const target = +el.dataset.target;
      let count = 0;
      const step = Math.ceil(target / 40);
      const tick = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count + "+";
        if (count >= target) clearInterval(tick);
      }, 40);
    });
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector(".stats-bar");
if (statsBar) statsObserver.observe(statsBar);
