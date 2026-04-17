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
const pdfCanvas = document.getElementById("pdfCanvas");
const pdfTitle = document.getElementById("pdfTitle");
const pdfDownload = document.getElementById("pdfDownload");
const pdfClose = document.getElementById("pdfClose");

let currentPdfUrl = "";

// Load PDF.js from CDN
const pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function renderPdf(url) {
  pdfCanvas.innerHTML = '<div class="pdf-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  try {
    const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false });
    const pdf = await loadingTask.promise;
    pdfCanvas.innerHTML = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pdfCanvas.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    }
  } catch (e) {
    pdfCanvas.innerHTML = '<div class="pdf-loading">Failed to load PDF.</div>';
  }
}

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const row = btn.closest(".explorer-row");
    const pdf = row.dataset.pdf;
    const name = row.querySelector(".col-name").textContent.trim();
    currentPdfUrl = pdf;
    pdfTitle.textContent = name;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    renderPdf(pdf);
  });
});

pdfDownload.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!currentPdfUrl) return;
  try {
    const res = await fetch(currentPdfUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = pdfTitle.textContent.trim() + ".pdf";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(currentPdfUrl, "_blank");
  }
});

pdfClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function closeModal() {
  modal.classList.remove("open");
  pdfCanvas.innerHTML = "";
  currentPdfUrl = "";
  document.body.style.overflow = "";
}
