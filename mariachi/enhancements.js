(() => {
  const phone = "573332333815";
  const audioSource = "/framerusercontent.com/assets/sxAylBadedJaZEaRh44ug5ydXy0.m4a";
  const videoSource = "/mariachi/mariachi-en-vivo.mp4";
  const intro = new Audio(audioSource);
  intro.preload = "auto";
  intro.volume = 0.65;
  let introStarted = false;

  const messageUrl = (message) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const startIntro = () => {
    if (introStarted) return;
    introStarted = true;
    intro.play().catch(() => {
      // Browsers may require a gesture. The vinyl click starts the same sample.
      introStarted = false;
    });
  };

  const stopIntro = () => {
    intro.pause();
    intro.currentTime = 0;
    introStarted = true;
  };

  // Try on entry, then use the existing vinyl interaction if autoplay is blocked.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startIntro, { once: true });
  } else {
    startIntro();
  }

  function contactForm() {
    const form = document.querySelector('form[data-framer-name="Newsletter Form"]');
    if (!form) return;
    if (form.getAttribute("action") !== "#contact") form.setAttribute("action", "#contact");
    const input = form.querySelector('input:not([aria-hidden="true"])');
    if (!input) return;
    if (input.type !== "text") input.type = "text";
    if (input.name !== "Ocasión") input.name = "Ocasión";
    if (input.placeholder !== "¿Qué vas a celebrar?") input.placeholder = "¿Qué vas a celebrar?";
  }

  function serviceLinks() {
    for (const row of document.querySelectorAll('#shows [data-framer-name="Show"]')) {
      const service = row.querySelector("h3")?.textContent?.trim() || "un evento";
      const url = messageUrl(`Hola Carlos, quiero cotizar Mariachi Contemporáneo para ${service.toLowerCase()}.`);
      const link = row.querySelector('a[data-framer-name="Button"]');
      if (link && link.href !== url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      const status = row.querySelector('[data-framer-name="Sold Out"]');
      if (status) {
        status.setAttribute("role", "link");
        status.setAttribute("tabindex", "0");
        status.setAttribute("aria-label", `Cotizar ${service} por WhatsApp`);
        status.style.cursor = "pointer";
        status.dataset.mariachiUrl = url;
      }
    }
  }

  function sync() {
    contactForm();
    serviceLinks();
    mountGallery();
    setupAboutCarousel();
    setupHeroRotation();
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function slideIndex(track, cards) {
    const origin = cards[0].offsetLeft;
    return cards.reduce((best, card, current) =>
      Math.abs(card.offsetLeft - origin - track.scrollLeft) <
      Math.abs(cards[best].offsetLeft - origin - track.scrollLeft)
        ? current : best, 0);
  }

  function scrollToSlide(track, cards, index) {
    track.scrollTo({
      left: cards[index].offsetLeft - cards[0].offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  function enableAutoScroll(track, cardSelector, mobileOnly = false) {
    if (track.dataset.mariachiAutoScroll) return;
    track.dataset.mariachiAutoScroll = "true";
    let visible = false;
    const pause = () => { track.dataset.mariachiPauseUntil = String(Date.now() + 8000); };
    const inView = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0.25 });
    inView.observe(track);
    track.addEventListener("pointerdown", pause);
    track.addEventListener("focusin", pause);
    const timer = window.setInterval(() => {
      if (!track.isConnected) {
        window.clearInterval(timer);
        inView.disconnect();
        return;
      }
      if (!visible || document.hidden || Date.now() < Number(track.dataset.mariachiPauseUntil || 0)) return;
      if (mobileOnly && !window.matchMedia("(max-width: 809px)").matches) return;
      const cards = [...track.querySelectorAll(cardSelector)];
      if (cards.length < 2) return;
      scrollToSlide(track, cards, (slideIndex(track, cards) + 1) % cards.length);
    }, 5000);
  }

  function setupAboutCarousel() {
    const track = document.querySelector('#about [data-framer-name="Contact Sheet"]');
    if (!track || track.dataset.mariachiAboutCarousel) return;
    track.dataset.mariachiAboutCarousel = "true";
    track.setAttribute("aria-label", "Fotos de Mariachi Contemporáneo");
    const cards = [...track.querySelectorAll(':scope > [data-framer-name^="Frame"]')];
    if (cards.length < 2) return;
    const pagination = document.createElement("div");
    pagination.className = "mariachi-about-pagination";
    pagination.setAttribute("aria-label", "Seleccionar foto");
    cards.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Ver foto ${index + 1} de ${cards.length}`);
      dot.addEventListener("click", () => {
        track.dataset.mariachiPauseUntil = String(Date.now() + 8000);
        scrollToSlide(track, cards, index);
      });
      pagination.appendChild(dot);
    });
    track.insertAdjacentElement("afterend", pagination);
    const dots = [...pagination.children];
    const updateDots = () => {
      const active = slideIndex(track, cards);
      dots.forEach((dot, index) => dot.setAttribute("aria-current", index === active ? "true" : "false"));
    };
    track.addEventListener("scroll", updateDots, { passive: true });
    updateDots();
    enableAutoScroll(track, ':scope > [data-framer-name^="Frame"]', true);
  }

  function setupHeroRotation() {
    const image = document.querySelector('img[alt="Mariachi Contemporáneo en la playa de Santa Marta"]');
    if (!image || image.dataset.mariachiHeroRotation) return;
    image.dataset.mariachiHeroRotation = "true";
    image.classList.add("mariachi-hero-rotating");
    const slides = [
      ["/mariachi/playa.jpeg", "Mariachi Contemporáneo junto al mar en Santa Marta"],
      ["/mariachi/celebracion.jpeg", "Mariachi Contemporáneo en una celebración especial"],
      ["/mariachi/cumpleanos.jpeg", "Mariachi Contemporáneo en una fiesta de cumpleaños"],
    ];
    slides.slice(1).forEach(([src]) => { const preload = new Image(); preload.src = src; });
    let index = 0;
    const timer = window.setInterval(() => {
      if (!image.isConnected) { window.clearInterval(timer); return; }
      if (document.hidden) return;
      image.style.opacity = "0";
      window.setTimeout(() => {
        if (!image.isConnected) return;
        index = (index + 1) % slides.length;
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.src = slides[index][0];
        image.alt = slides[index][1];
        image.style.opacity = "1";
      }, reducedMotion.matches ? 0 : 420);
    }, 5000);
  }

  function mountGallery() {
    if (document.getElementById("mariachi-gallery")) return;
    const ticker = document.querySelector('[data-framer-name="Photo Ticker"]');
    if (!ticker) return;

    const photos = [
      ["playa.jpeg", "Junto al mar", "Mariachi Contemporáneo en Santa Marta"],
      ["cantante.jpeg", "La voz en vivo", "Carlos Sosa cantando en una serenata"],
      ["celebracion.jpeg", "Celebraciones", "Mariachi Contemporáneo en una celebración"],
      ["grupo-noche-2.jpeg", "Momentos especiales", "El grupo en una celebración nocturna"],
      ["serenata.jpeg", "Tradición viva", "El grupo en una serenata"],
      ["carlos-sosa.jpeg", "Carlos Sosa", "Carlos Sosa durante una presentación"],
    ];

    const section = document.createElement("section");
    section.id = "mariachi-gallery";
    section.setAttribute("aria-labelledby", "mariachi-gallery-title");
    section.innerHTML = `
      <div class="mariachi-gallery-head">
        <div>
          <p class="mariachi-gallery-kicker">EN IMÁGENES · SANTA MARTA</p>
          <h2 id="mariachi-gallery-title">Momentos que se quedan</h2>
        </div>
        <div class="mariachi-gallery-controls">
          <span class="mariachi-gallery-count" aria-live="polite">01 / 06</span>
          <button type="button" data-gallery-direction="-1" aria-label="Foto anterior">←</button>
          <button type="button" data-gallery-direction="1" aria-label="Foto siguiente">→</button>
        </div>
      </div>
      <div class="mariachi-gallery-track" tabindex="0" aria-label="Galería de Mariachi Contemporáneo">
        ${photos.map(([file, caption, alt], index) => `
          <figure class="mariachi-gallery-card">
            <div class="mariachi-gallery-image"><img src="/mariachi/${file}" alt="${alt}" loading="lazy" decoding="async"></div>
            <figcaption><span>${String(index + 1).padStart(2, "0")}</span>${caption}</figcaption>
          </figure>
        `).join("")}
      </div>
      <p class="mariachi-gallery-hint">Avanza cada cinco segundos · también puedes deslizar <span aria-hidden="true">↗</span></p>
    `;
    ticker.parentElement.insertAdjacentElement("afterend", section);

    const track = section.querySelector(".mariachi-gallery-track");
    const count = section.querySelector(".mariachi-gallery-count");
    const cards = [...section.querySelectorAll(".mariachi-gallery-card")];
    const updateCount = () => {
      const index = slideIndex(track, cards);
      count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    };
    track.addEventListener("scroll", updateCount, { passive: true });
    section.querySelectorAll("[data-gallery-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        track.dataset.mariachiPauseUntil = String(Date.now() + 8000);
        const step = cards[0].getBoundingClientRect().width + 20;
        track.scrollBy({ left: Number(button.dataset.galleryDirection) * step, behavior: "smooth" });
      });
    });
    updateCount();
    enableAutoScroll(track, ".mariachi-gallery-card");
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sync();
    });
  });
  const startEnhancements = () => {
    window.setTimeout(() => {
      observer.observe(document.documentElement, { childList: true, subtree: true });
      sync();
    }, 500);
  };
  if (document.readyState === "complete") startEnhancements();
  else window.addEventListener("load", startEnhancements, { once: true });

  function showVideo(player) {
    if (player.querySelector("video[data-mariachi-video]")) return;
    stopIntro();
    const video = document.createElement("video");
    video.dataset.mariachiVideo = "";
    video.src = videoSource;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", "Mariachi Contemporáneo en vivo");
    Object.assign(video.style, {
      position: "absolute",
      inset: "0",
      zIndex: "10",
      width: "100%",
      height: "100%",
      background: "#05070c",
      objectFit: "contain",
    });
    player.appendChild(video);
    video.play().catch(() => {});
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-framer-name="Vinyl Intro"]')) {
      startIntro();
    }
    if (target.closest(".gc-btn")) stopIntro();

    const videoButton = target.closest('[data-framer-name="Play Button"]');
    const player = videoButton?.closest('[data-framer-name="Video Player"]');
    if (player) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showVideo(player);
      return;
    }

    const status = target.closest('[data-mariachi-url]');
    if (status) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.open(status.dataset.mariachiUrl, "_blank", "noopener,noreferrer");
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('[data-framer-name="Play Button"]');
    const player = button?.closest('[data-framer-name="Video Player"]');
    if (player) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showVideo(player);
      return;
    }
    const status = target.closest('[data-mariachi-url]');
    if (status) {
      event.preventDefault();
      window.open(status.dataset.mariachiUrl, "_blank", "noopener,noreferrer");
    }
  }, true);

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.getAttribute("data-framer-name") !== "Newsletter Form") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const occasion = form.querySelector('input:not([aria-hidden="true"])')?.value?.trim();
    const message = occasion
      ? `Hola Carlos, quiero cotizar Mariachi Contemporáneo. Mi ocasión: ${occasion}.`
      : "Hola Carlos, quiero cotizar Mariachi Contemporáneo para una celebración.";
    window.open(messageUrl(message), "_blank", "noopener,noreferrer");
  }, true);
})();
