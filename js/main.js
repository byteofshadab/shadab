(() => {
  const themeStorageKey = "cv-theme";
  const htmlElement = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const siteNav = document.getElementById("site-nav");
  const brandLink = document.querySelector(".brand-pill");
  const navSectionLinks = document.querySelectorAll('.nav-pill a[href^="#"]');
  const softCursor = document.getElementById("soft-cursor");
  const downloadBrandLogo = document.querySelector(".download-brand-logo");
  const lightCutoutVersion = "3";
  let lightLogoCutoutPromise = null;

  const createLightLogoCutout = (imgSrc) =>
    new Promise((resolve) => {
      const source = new Image();
      source.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = source.naturalWidth || source.width;
        canvas.height = source.naturalHeight || source.height;
        const ctx = canvas.getContext("2d");

        if (!ctx || !canvas.width || !canvas.height) {
          resolve(null);
          return;
        }

        ctx.drawImage(source, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const visited = new Uint8Array(width * height);
        const stack = [];

        const isBackgroundLike = (r, g, b) => {
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          return max <= 14 && max - min <= 5;
        };

        const pushIfBackground = (x, y) => {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const flatIndex = y * width + x;
          if (visited[flatIndex]) return;

          const pixelIndex = flatIndex * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];

          if (!isBackgroundLike(r, g, b)) return;
          visited[flatIndex] = 1;
          stack.push(flatIndex);
        };

        for (let x = 0; x < width; x += 1) {
          pushIfBackground(x, 0);
          pushIfBackground(x, height - 1);
        }

        for (let y = 0; y < height; y += 1) {
          pushIfBackground(0, y);
          pushIfBackground(width - 1, y);
        }

        while (stack.length) {
          const flatIndex = stack.pop();
          const x = flatIndex % width;
          const y = Math.floor(flatIndex / width);
          pushIfBackground(x + 1, y);
          pushIfBackground(x - 1, y);
          pushIfBackground(x, y + 1);
          pushIfBackground(x, y - 1);
        }

        for (let flatIndex = 0; flatIndex < visited.length; flatIndex += 1) {
          if (!visited[flatIndex]) continue;
          data[flatIndex * 4 + 3] = 0;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      source.onerror = () => resolve(null);
      source.src = imgSrc;
    });

  const updateDownloadLogoForTheme = (theme) => {
    if (!downloadBrandLogo) return;

    if (!downloadBrandLogo.dataset.originalSrc) {
      const originalSrc = downloadBrandLogo.getAttribute("src");
      if (originalSrc) {
        downloadBrandLogo.dataset.originalSrc = originalSrc;
      }
    }

    const originalSrc = downloadBrandLogo.dataset.originalSrc;
    if (!originalSrc) return;

    if (theme !== "light") {
      if (downloadBrandLogo.getAttribute("src") !== originalSrc) {
        downloadBrandLogo.setAttribute("src", originalSrc);
      }
      return;
    }

    if (
      downloadBrandLogo.dataset.lightCutoutSrc &&
      downloadBrandLogo.dataset.lightCutoutVersion === lightCutoutVersion
    ) {
      downloadBrandLogo.setAttribute("src", downloadBrandLogo.dataset.lightCutoutSrc);
      return;
    }

    if (!lightLogoCutoutPromise) {
      lightLogoCutoutPromise = createLightLogoCutout(originalSrc);
    }

    lightLogoCutoutPromise.then((cutoutSrc) => {
      if (!cutoutSrc) return;
      downloadBrandLogo.dataset.lightCutoutSrc = cutoutSrc;
      downloadBrandLogo.dataset.lightCutoutVersion = lightCutoutVersion;
      if (htmlElement.getAttribute("data-theme") === "light") {
        downloadBrandLogo.setAttribute("src", cutoutSrc);
      }
    });
  };

  const applyTheme = (theme) => {
    const normalizedTheme = theme === "light" ? "light" : "dark";

    htmlElement.setAttribute("data-theme", normalizedTheme);

    if (themeButton) {
      const nextLabel = normalizedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      themeButton.setAttribute("aria-pressed", String(normalizedTheme === "light"));
      themeButton.setAttribute("aria-label", nextLabel);
      themeButton.setAttribute("title", nextLabel);
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", normalizedTheme === "dark" ? "#07090d" : "#f1f4f8");
    }

    updateDownloadLogoForTheme(normalizedTheme);
  };

  const savedTheme = localStorage.getItem(themeStorageKey);
  applyTheme(savedTheme || "dark");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const activeTheme = htmlElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      localStorage.setItem(themeStorageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }

  const updateNavState = () => {
    if (!siteNav) return;
    siteNav.classList.toggle("scrolled", window.scrollY > 8);
  };

  const updateSectionOffset = () => {
    const navHeight = siteNav ? siteNav.getBoundingClientRect().height : 78;
    const peekGap = 18;
    htmlElement.style.setProperty("--section-scroll-offset", `${Math.round(navHeight + peekGap)}px`);
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = prefersReducedMotion.matches ? "auto" : "smooth";

  navSectionLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: scrollBehavior, block: "start" });

      if (history.pushState) {
        history.pushState(null, "", targetId);
      }
    });
  });

  if (brandLink) {
    brandLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: scrollBehavior });

      if (history.replaceState) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  }

  const initSoftCursor = () => {
    if (!softCursor) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.body.classList.add("soft-cursor-enabled");

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    const smoothing = 0.2;

    const render = () => {
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;
      softCursor.style.left = `${currentX}px`;
      softCursor.style.top = `${currentY}px`;
      requestAnimationFrame(render);
    };

    const interactiveSelector = "a, button, .btn, .tool-node, .contact-chip, .publication-link";
    const interactiveElements = document.querySelectorAll(interactiveSelector);

    const setHoverOn = () => softCursor.classList.add("is-hover");
    const setHoverOff = () => softCursor.classList.remove("is-hover");

    interactiveElements.forEach((element) => {
      element.addEventListener("pointerenter", setHoverOn, { passive: true });
      element.addEventListener("pointerleave", setHoverOff, { passive: true });
    });

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      softCursor.classList.add("is-visible");
    }, { passive: true });

    window.addEventListener("pointerdown", () => {
      softCursor.classList.add("is-active");
    }, { passive: true });

    window.addEventListener("pointerup", () => {
      softCursor.classList.remove("is-active");
    }, { passive: true });

    window.addEventListener("blur", () => {
      softCursor.classList.remove("is-visible", "is-hover", "is-active");
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      softCursor.classList.remove("is-visible", "is-hover", "is-active");
    }, { passive: true });

    render();
  };

  updateSectionOffset();
  updateNavState();
  initSoftCursor();
  window.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", updateSectionOffset, { passive: true });
})();
