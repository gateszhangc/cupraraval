const revealElements = document.querySelectorAll("[data-reveal]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const siteConfig = {
  siteUrl: (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, ""),
  ga4MeasurementId: (import.meta.env.VITE_GA4_MEASUREMENT_ID || "").trim(),
  clarityProjectId: (import.meta.env.VITE_CLARITY_PROJECT_ID || "").trim()
};

window.__cupraRaval = siteConfig;

const appendScript = ({ id, src, text, async = true }) => {
  if (id && document.getElementById(id)) return;

  const script = document.createElement("script");
  if (id) script.id = id;
  if (src) script.src = src;
  if (text) script.text = text;
  script.async = async;
  document.head.append(script);
};

const loadGoogleAnalytics = (measurementId) => {
  if (!measurementId || window.__cupraRavalGaLoaded) return;

  window.__cupraRavalGaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  appendScript({
    id: "ga4-script",
    src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    transport_type: "beacon"
  });
};

const loadClarity = (projectId) => {
  if (!projectId || window.__cupraRavalClarityLoaded) return;

  window.__cupraRavalClarityLoaded = true;
  (function injectClarity(c, l, a, r, i, m, t) {
    c[a] =
      c[a] ||
      function clarityQueue() {
        (c[a].q = c[a].q || []).push(arguments);
      };
    m = l.createElement(r);
    m.async = true;
    m.id = "clarity-script";
    m.src = `https://www.clarity.ms/tag/${i}`;
    t = l.getElementsByTagName(r)[0];
    t.parentNode.insertBefore(m, t);
  })(window, document, "clarity", "script", projectId);
};

const setActiveLink = (targetId) => {
  navLinks.forEach((link) => {
    const isTarget = link.getAttribute("href") === `#${targetId}`;
    link.classList.toggle("is-active", isTarget);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const revealElementsInInitialViewport = () => {
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
      revealObserver.unobserve(element);
    }
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(entry.target.id);
    });
  },
  {
    rootMargin: "-30% 0px -55% 0px",
    threshold: 0.15
  }
);

trackedSections.forEach((section) => navObserver.observe(section));
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (targetId) setActiveLink(targetId);
  });
});

const syncActiveLinkWithHash = () => {
  if (!window.location.hash) return;
  const targetId = window.location.hash.replace("#", "");
  setActiveLink(targetId);
};

window.addEventListener("hashchange", syncActiveLinkWithHash);
syncActiveLinkWithHash();
loadGoogleAnalytics(siteConfig.ga4MeasurementId);
loadClarity(siteConfig.clarityProjectId);
window.addEventListener("load", revealElementsInInitialViewport, { once: true });
requestAnimationFrame(revealElementsInInitialViewport);
