(() => {
  const themeStorageKey = "cv-theme";
  const htmlElement = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const themeToggleLabel = document.getElementById("theme-toggle-label");
  const siteNav = document.getElementById("site-nav");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileActionsMenu = document.getElementById("mobile-actions-menu");
  const brandLink = document.querySelector(".brand-pill");
  const navSectionLinks = document.querySelectorAll('.nav-pill a[href^="#"]');
  const softCursor = document.getElementById("soft-cursor");

  const applyTheme = (theme) => {
    const normalizedTheme = theme === "light" ? "light" : "dark";

    htmlElement.setAttribute("data-theme", normalizedTheme);

    if (themeButton) {
      const nextLabel = normalizedTheme === "dark" ? "Switch to Day" : "Switch to Night";
      themeButton.setAttribute("aria-pressed", String(normalizedTheme === "light"));
      themeButton.setAttribute("aria-label", nextLabel);
      themeButton.setAttribute("title", nextLabel);
    }

    if (themeToggleLabel) {
      themeToggleLabel.textContent = normalizedTheme === "dark" ? "Switch to Day" : "Switch to Night";
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", normalizedTheme === "dark" ? "#07090d" : "#f1f4f8");
    }

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
  const mobileNavBreakpoint = 760;

  const setMobileMenuOpen = (open) => {
    if (!siteNav || !mobileMenuToggle) return;
    siteNav.classList.toggle("menu-open", open);
    mobileMenuToggle.setAttribute("aria-expanded", String(open));
  };

  const isMobileViewport = () => window.matchMedia(`(max-width: ${mobileNavBreakpoint}px)`).matches;

  if (mobileMenuToggle && siteNav && mobileActionsMenu) {
    mobileMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const nextOpen = !siteNav.classList.contains("menu-open");
      setMobileMenuOpen(nextOpen);
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.classList.contains("menu-open")) return;
      if (!siteNav.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteNav.classList.contains("menu-open")) {
        setMobileMenuOpen(false);
      }
    });
  }

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

      if (isMobileViewport()) {
        setMobileMenuOpen(false);
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

      if (isMobileViewport()) {
        setMobileMenuOpen(false);
      }
    });
  }

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      if (isMobileViewport()) {
        setMobileMenuOpen(false);
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
  setMobileMenuOpen(false);
  initSoftCursor();
  window.addEventListener("scroll", updateNavState, { passive: true });
  window.addEventListener("resize", () => {
    updateSectionOffset();
    if (!isMobileViewport()) {
      setMobileMenuOpen(false);
    }
  }, { passive: true });
})();
