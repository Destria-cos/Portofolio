// NAV scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 10);
  document.getElementById("toTop").classList.toggle("show", window.scrollY > 400);
}, { passive: true });

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

// Back to top
document.getElementById("toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Skill bars + reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    entry.target.querySelectorAll(".fill").forEach(f => {
      f.style.width = f.dataset.w + "%";
    });
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll("section, .project-card, .skill-item, .about-info, .about-text").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

// Contact form
document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const btn = this.querySelector("button");
  btn.innerHTML = "<i class=\"fas fa-check\"></i> Sent!";
  btn.style.background = "#16a34a";
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = "<i class=\"fas fa-paper-plane\"></i> Send Message";
    btn.style.background = "";
    btn.disabled = false;
    this.reset();
  }, 3000);
});
