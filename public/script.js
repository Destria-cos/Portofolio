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
document.querySelectorAll("section, .project-card, .skill-bar-item, .about-info, .about-text, .service-card").forEach(el => {
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

// Stats counter — reads live from DOM + GitHub API
function animateCount(el, target) {
  let count = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const tick = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count + "+";
    if (count >= target) clearInterval(tick);
  }, 40);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Certificates — from hidden data attribute (update data-count when adding certs)
    const certCount = parseInt(document.getElementById("cert-count")?.dataset.count || "0");
    // Projects — count actual project cards in the DOM
    const projectCount = document.querySelectorAll(".project-card").length;
    // Skills — count actual skill chips in the DOM
    const skillCount = document.querySelectorAll(".skill-chip").length;

    animateCount(document.getElementById("stat-certs"), certCount);
    animateCount(document.getElementById("stat-projects"), projectCount);
    animateCount(document.getElementById("stat-skills"), skillCount);

    // GitHub Repos — live from API
    const repoEl = document.getElementById("stat-repos");
    fetch("https://api.github.com/users/Destria-cos")
      .then(r => r.json())
      .then(data => animateCount(repoEl, data.public_repos || 0))
      .catch(() => { repoEl.textContent = "—"; });

    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector(".stats-bar");
if (statsBar) statsObserver.observe(statsBar);
