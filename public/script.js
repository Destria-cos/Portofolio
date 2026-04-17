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
document.querySelectorAll("section, .project-card, .skill-chip, .about-info, .about-text").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

// PDF Modal
const modal = document.getElementById("pdfModal");
const pdfFrame = document.getElementById("pdfFrame");
const pdfTitle = document.getElementById("pdfTitle");
const pdfDownload = document.getElementById("pdfDownload");
const pdfClose = document.getElementById("pdfClose");

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const row = btn.closest(".explorer-row");
    const pdf = row.dataset.pdf;
    const name = row.querySelector(".col-name").textContent.trim();
    pdfTitle.textContent = name;
    pdfFrame.src = pdf;
    pdfDownload.href = pdf;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

pdfClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function closeModal() {
  modal.classList.remove("open");
  pdfFrame.src = "";
  document.body.style.overflow = "";
}
