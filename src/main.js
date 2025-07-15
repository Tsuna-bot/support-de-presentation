import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Enregistrer les plugins GSAP
gsap.registerPlugin(ScrollTrigger);

// Configuration Lenis pour le scroll fluide
const lenis = new Lenis({
  duration: 0.8,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  lerp: 0.05,
  touchMultiplier: 3,
  wheelMultiplier: 2,
  infinite: false,
});

// Fonction de rafraîchissement pour Lenis
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Variables globales
const slides = document.querySelectorAll(".slide");
const navPrev = document.getElementById("navPrev");
const navNext = document.getElementById("navNext");
const sectionIndicator = document.getElementById("sectionIndicator");

let currentSlideIndex = 0;
let isScrolling = false; // Flag pour éviter les conflits pendant le scroll

// Logique de changement de thème
const trekksThemeStartSlideId = "slide-6-4";
const slidesArray = Array.from(slides);
const trekksThemeStartIndex = slidesArray.findIndex(
  (slide) => slide.id === trekksThemeStartSlideId
);

// --- Sommaire flottant ---
const summaryToggle = document.getElementById("summaryToggle");
const summaryMenu = document.getElementById("summaryMenu");
const summaryLinks = document.querySelectorAll(".summary-link");
let isSummaryOpen = false;

if (summaryToggle && summaryMenu) {
  summaryToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isSummaryOpen = !isSummaryOpen;
    summaryMenu.classList.toggle("open", isSummaryOpen);
    summaryToggle.classList.toggle("open", isSummaryOpen);
    summaryToggle.setAttribute(
      "aria-expanded",
      isSummaryOpen ? "true" : "false"
    );
  });

  // Fermer le menu si clic en dehors
  document.addEventListener("click", (e) => {
    const targetNode = e.target instanceof Node ? e.target : null;
    if (
      isSummaryOpen &&
      targetNode &&
      !summaryMenu.contains(targetNode) &&
      targetNode !== summaryToggle
    ) {
      isSummaryOpen = false;
      summaryMenu.classList.remove("open");
      summaryToggle.classList.remove("open");
      summaryToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Navigation vers section + fermeture
  summaryLinks.forEach((link, idx) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");
      if (href) {
        const target = document.querySelector(href);
        if (target && target instanceof HTMLElement) {
          // Mettre à jour l'index actuel selon le lien cliqué
          currentSlideIndex = idx;
          updateNavigationButtons(); // MAJ instantanée de l'actif
          isScrolling = true;
          lenis.scrollTo(target, { duration: 1.2 });
          setTimeout(() => {
            isScrolling = false;
            // Mettre à jour les boutons après l'animation
            updateNavigationButtons();
          }, 1200);
        }
      }
    });
  });
}
// --- Fin Sommaire flottant ---

// Debug: Vérifier que les éléments sont trouvés
console.log("Éléments DOM trouvés:", {
  slides: slides.length,
  navPrev: !!navPrev,
  navNext: !!navNext,
});

// Initialisation
const handleInit = () => {
  console.log("Initialisation de la présentation...");
  setupNavigation();
  setupAnimations();
  updateNavigationButtons();
  console.log("Initialisation terminée");
};

// Configuration de la navigation
const setupNavigation = () => {
  console.log("Configuration de la navigation...");

  if (!navPrev || !navNext) {
    console.error("Boutons de navigation non trouvés");
    return;
  }

  // Gestionnaire pour le bouton précédent
  navPrev.addEventListener("click", () => {
    console.log("Bouton précédent cliqué");
    if (currentSlideIndex > 0 && !isScrolling) {
      currentSlideIndex--;
      updateNavigationButtons(); // MAJ instantanée
      scrollToSlide(currentSlideIndex);
    }
  });

  // Gestionnaire pour le bouton suivant
  navNext.addEventListener("click", () => {
    console.log("Bouton suivant cliqué");
    if (currentSlideIndex < slides.length - 1 && !isScrolling) {
      currentSlideIndex++;
      updateNavigationButtons(); // MAJ instantanée
      scrollToSlide(currentSlideIndex);
    }
  });

  // Navigation par clavier (flèches haut/bas)
  document.addEventListener("keydown", (e) => {
    if (isScrolling) return; // Ignorer pendant l'animation

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (currentSlideIndex > 0) {
          currentSlideIndex--;
          updateNavigationButtons(); // MAJ instantanée
          scrollToSlide(currentSlideIndex);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          currentSlideIndex++;
          updateNavigationButtons(); // MAJ instantanée
          scrollToSlide(currentSlideIndex);
        }
        break;
    }
  });

  // Écouter le scroll Lenis pour mettre à jour l'index actuel
  lenis.on("scroll", (e) => {
    if (isScrolling) return; // Ignorer pendant l'animation programmatique

    const scrollTop = e.scroll;
    const windowHeight = window.innerHeight;

    // Calculer quelle slide est actuellement visible avec une marge plus petite
    const currentIndex = Math.round(scrollTop / windowHeight);

    if (
      currentIndex !== currentSlideIndex &&
      currentIndex >= 0 &&
      currentIndex < slides.length
    ) {
      currentSlideIndex = currentIndex;
      updateNavigationButtons();
      console.log(`Slide active: ${currentIndex + 1}/${slides.length}`);
    }
  });

  console.log("Navigation configurée");
};

// Fonction pour scroller vers une slide spécifique
const scrollToSlide = (index) => {
  console.log(`Scrolling vers slide ${index + 1}`);
  if (index >= 0 && index < slides.length) {
    isScrolling = true; // Désactiver la détection de scroll

    const targetTop = index * window.innerHeight;

    // Utiliser Lenis pour le scroll fluide au lieu de window.scrollTo
    lenis.scrollTo(targetTop, {
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Mettre à jour l'index mais pas les boutons immédiatement
    currentSlideIndex = index;

    // Réactiver la détection de scroll après l'animation
    setTimeout(() => {
      isScrolling = false;
      // Mettre à jour les boutons seulement après la fin de l'animation
      updateNavigationButtons();
    }, 800); // Délai correspondant à la durée de Lenis
  }
};

// Mise à jour de l'état des boutons de navigation
const updateNavigationButtons = () => {
  if (!navPrev || !navNext) return;

  // Désactiver temporairement les événements pour éviter les clics multiples
  navPrev.style.pointerEvents = "none";
  navNext.style.pointerEvents = "none";

  // Mise à jour l'état visuel des boutons de navigation
  if (currentSlideIndex === 0) {
    navPrev.style.opacity = "0.3";
  } else {
    navPrev.style.opacity = "1";
  }

  if (currentSlideIndex === slides.length - 1) {
    navNext.style.opacity = "0.3";
  } else {
    navNext.style.opacity = "1";
  }

  // Réactiver les événements après un court délai
  setTimeout(() => {
    if (currentSlideIndex > 0) {
      navPrev.style.pointerEvents = "auto";
    }
    if (currentSlideIndex < slides.length - 1) {
      navNext.style.pointerEvents = "auto";
    }
  }, 50);

  // Appliquer le thème Trekks si nécessaire
  if (trekksThemeStartIndex !== -1) {
    if (currentSlideIndex >= trekksThemeStartIndex) {
      document.body.classList.add("trekks-theme");
    } else {
      document.body.classList.remove("trekks-theme");
    }
  }

  // Mise à jour de l'état actif dans le sommaire flottant
  if (summaryLinks && summaryLinks.length > 0) {
    summaryLinks.forEach((link, idx) => {
      if (idx === currentSlideIndex) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  console.log(`Slide actuelle: ${currentSlideIndex + 1}/${slides.length}`);
};

// Configuration des animations GSAP
const setupAnimations = () => {
  console.log("Configuration des animations...");

  // Animation d'entrée des cartes au scroll
  slides.forEach((slide, index) => {
    const cards = slide.querySelectorAll(".content-card");
    const presentationSections = slide.querySelectorAll(
      ".presentation-section"
    );

    // Si c'est la section présentation avec des sections full screen
    if (presentationSections.length > 0) {
      presentationSections.forEach((section, sectionIndex) => {
        const card = section.querySelector(".content-card");
        if (card) {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 100,
              scale: 0.9,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    } else {
      // Animation normale pour les autres sections
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: slide,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Animation du titre de la section
    const title = slide.querySelector(".slide-title");
    if (title) {
      gsap.fromTo(
        title,
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: slide,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Animation de la ligne sous le titre
    const titleLine = slide.querySelector(".title-line");
    if (titleLine) {
      gsap.fromTo(
        titleLine,
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
          duration: 3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: slide,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  });

  console.log("Animations configurées");
};

// Gestion des onglets de concurrence
const setupCompetitionTabs = () => {
  const tabButtons = document.querySelectorAll(".competition-tab");
  const tabContents = document.querySelectorAll(".competition-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Réinitialiser toutes les barres à zéro d'abord
      const allBarFills = document.querySelectorAll(".bar-fill, .usage-fill");
      allBarFills.forEach((bar) => {
        if (bar instanceof HTMLElement) {
          bar.style.transition = "none";
          bar.style.width = "0%";
        }
      });

      // Retirer la classe active de tous les boutons
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      // Retirer la classe active de tous les contenus
      tabContents.forEach((content) => content.classList.remove("active"));

      // Ajouter la classe active au bouton cliqué
      button.classList.add("active");

      // Trouver et afficher le contenu correspondant
      const targetId = button.getAttribute("data-target");
      if (targetId) {
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add("active");
          // Animer les graphiques après un court délai
          setTimeout(() => {
            animateCharts(targetContent);
          }, 100);
        }
      }
    });
  });

  // Activer le premier onglet par défaut
  if (tabButtons.length > 0) {
    tabButtons[0].dispatchEvent(new Event("click"));
  }
};

// Fonction pour animer les graphiques
const animateCharts = (container) => {
  const barFills = container.querySelectorAll(".bar-fill");
  barFills.forEach((bar) => {
    const value = bar.getAttribute("data-value");
    if (value && bar instanceof HTMLElement) {
      bar.style.transition = "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
      bar.style.width = `${value}%`;
    }
  });

  const usageFills = container.querySelectorAll(".usage-fill");
  usageFills.forEach((fill) => {
    const usageBar = fill.closest(".usage-bar");
    if (usageBar instanceof HTMLElement) {
      const value = usageBar.dataset.value;
      if (value && fill instanceof HTMLElement) {
        fill.style.transition = "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
        fill.style.width = `${value}%`;
      }
    }
  });
};

// --- FIN de la section Concurrence ---

// Gestion des popups moodboard
const setupMoodboardPopups = () => {
  const moodboardButtons = document.querySelectorAll(".moodboard-btn");
  const moodboardPopup = document.getElementById("moodboardPopup");
  const moodboardImage = document.getElementById("moodboardImage");
  const moodboardClose = document.getElementById("moodboardClose");
  const moodboardTitle = document.getElementById("moodboardTitle");
  const moodboardText = document.getElementById("moodboardText");

  if (
    !moodboardPopup ||
    !moodboardImage ||
    !moodboardClose ||
    !moodboardTitle ||
    !moodboardText
  )
    return;

  const moodboardData = {
    1: {
      title: "Aventure Immersive",
      description:
        "• Paysages puissants et nature brute\n• Émotions fortes et émerveillement\n• Expériences sensorielles immersives\n• Montagnes majestueuses et forêts mystérieuses",
    },
    2: {
      title: "Gamification",
      description:
        "• HUD et interfaces futuristes\n• Codes du jeu vidéo et symbolique RPG\n• Systèmes de progression et badges\n• Aventure ludique et récompenses",
    },
    3: {
      title: "Écoresponsabilité",
      description:
        "• Textures et matières naturelles\n• Authenticité et durabilité\n• Connexion avec la nature\n• Respect environnement et communautés",
    },
  };

  moodboardButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const moodboardNumber =
        button instanceof HTMLElement ? button.dataset.moodboard : null;
      if (!moodboardNumber) return;
      const imageSrc = `assets/moodboard-${moodboardNumber}.png`;
      const data = moodboardData[moodboardNumber];

      if (moodboardImage instanceof HTMLImageElement)
        moodboardImage.src = imageSrc;
      if (data) {
        moodboardTitle.textContent = data.title;
        moodboardText.textContent = data.description;
      }
      moodboardPopup.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  const closePopup = () => {
    moodboardPopup.classList.remove("open");
    document.body.style.overflow = "";
  };

  moodboardClose.addEventListener("click", closePopup);
  moodboardPopup.addEventListener("click", (e) => {
    if (e.target === moodboardPopup) closePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && moodboardPopup.classList.contains("open"))
      closePopup();
  });
};

const setupLogoPopup = () => {
  const logoItems = document.querySelectorAll(".logo-variation-item");
  const logoPopup = document.getElementById("logoPopup");
  const logoPopupClose = document.getElementById("logoPopupClose");
  const logoPopupImage = document.getElementById("logoPopupImage");

  if (
    !logoPopup ||
    !logoPopupClose ||
    !logoPopupImage ||
    logoItems.length === 0
  )
    return;

  logoItems.forEach((item) => {
    item.addEventListener("click", () => {
      const imageSrc = item.querySelector("img")?.src;
      const bgContainer = item.querySelector(".logo-variation-bg");
      let bgColor = "rgba(0, 0, 0, 0.95)";
      if (bgContainer instanceof HTMLElement) {
        bgColor = bgContainer.style.backgroundColor;
      }

      if (imageSrc && logoPopupImage instanceof HTMLImageElement) {
        logoPopupImage.src = imageSrc;
        logoPopup.style.backgroundColor = bgColor;
        logoPopup.classList.add("open");
      }
    });
  });

  const closePopup = () => {
    logoPopup.classList.remove("open");
  };

  logoPopupClose.addEventListener("click", closePopup);
  logoPopup.addEventListener("click", (e) => {
    if (e.target === logoPopup) closePopup();
  });
};

const setupMockupPopup = () => {
  const mockupItems = document.querySelectorAll(".mockup-item");
  const mockupPopup = document.getElementById("mockupPopup");
  const mockupPopupClose = document.getElementById("mockupPopupClose");
  const mockupPopupImage = document.getElementById("mockupPopupImage");

  if (
    !mockupPopup ||
    !mockupPopupClose ||
    !mockupPopupImage ||
    mockupItems.length === 0
  )
    return;

  mockupItems.forEach((item) => {
    if (item instanceof HTMLElement) {
      item.style.cursor = "pointer";
    }

    item.addEventListener("click", () => {
      const imageSrc = item.querySelector("img")?.src;

      if (imageSrc && mockupPopupImage instanceof HTMLImageElement) {
        mockupPopupImage.src = imageSrc;
        mockupPopup.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    });
  });

  const closePopup = () => {
    mockupPopup.classList.remove("open");
    document.body.style.overflow = "";
  };

  mockupPopupClose.addEventListener("click", closePopup);
  mockupPopup.addEventListener("click", (e) => {
    if (e.target === mockupPopup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mockupPopup.classList.contains("open")) {
      closePopup();
    }
  });
};

const setupWireframePopup = () => {
  const wireframeItems = document.querySelectorAll(".wireframe-item");
  const wireframePopup = document.getElementById("wireframePopup");
  const wireframePopupClose = document.getElementById("wireframePopupClose");
  const wireframePopupImage = document.getElementById("wireframePopupImage");

  if (
    !wireframePopup ||
    !wireframePopupClose ||
    !wireframePopupImage ||
    wireframeItems.length === 0
  )
    return;

  wireframeItems.forEach((item) => {
    if (item instanceof HTMLElement) {
      item.style.cursor = "pointer";
    }

    item.addEventListener("click", () => {
      const imageSrc = item.querySelector("img")?.src;

      if (imageSrc && wireframePopupImage instanceof HTMLImageElement) {
        wireframePopupImage.src = imageSrc;
        wireframePopup.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    });
  });

  const closePopup = () => {
    wireframePopup.classList.remove("open");
    document.body.style.overflow = "";
  };

  wireframePopupClose.addEventListener("click", closePopup);
  wireframePopup.addEventListener("click", (e) => {
    if (e.target === wireframePopup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && wireframePopup.classList.contains("open")) {
      closePopup();
    }
  });
};

const setupMaquettePopup = () => {
  const maquetteItems = document.querySelectorAll(".maquette-item");
  const maquettePopup = document.getElementById("maquettePopup");
  const maquettePopupClose = document.getElementById("maquettePopupClose");
  const maquettePopupImage = document.getElementById("maquettePopupImage");

  if (
    !maquettePopup ||
    !maquettePopupClose ||
    !maquettePopupImage ||
    maquetteItems.length === 0
  )
    return;

  maquetteItems.forEach((item) => {
    if (item instanceof HTMLElement) {
      item.style.cursor = "pointer";
    }

    item.addEventListener("click", () => {
      const imageSrc = item.querySelector("img")?.src;

      if (imageSrc && maquettePopupImage instanceof HTMLImageElement) {
        maquettePopupImage.src = imageSrc;
        maquettePopup.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    });
  });

  const closePopup = () => {
    maquettePopup.classList.remove("open");
    document.body.style.overflow = "";
  };

  maquettePopupClose.addEventListener("click", closePopup);
  maquettePopup.addEventListener("click", (e) => {
    if (e.target === maquettePopup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && maquettePopup.classList.contains("open")) {
      closePopup();
    }
  });
};

// --- Arborescence Interactive ---
const setupSitemap = () => {
  const triggers = document.querySelectorAll(".sitemap-trigger");
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const childrenContainer = trigger.nextElementSibling;
      if (
        childrenContainer &&
        childrenContainer.classList.contains("collapsible")
      ) {
        childrenContainer.classList.toggle("collapsed");
        trigger.classList.toggle("active");
      }
    });
  });
};

// --- FIN Arborescence ---

function setupTab(tabContainerSelector, tabSelector, contentSelector) {
  const tabContainer = document.querySelector(tabContainerSelector);
  if (!tabContainer) return;

  const tabs = tabContainer.querySelectorAll(tabSelector);
  const contents = document.querySelectorAll(contentSelector);

  tabContainer.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) {
      return;
    }
    const targetTab = e.target.closest(tabSelector);
    if (!targetTab) {
      return;
    }

    tabs.forEach((tab) => tab.classList.remove("active"));
    targetTab.classList.add("active");

    const targetId = targetTab.getAttribute("data-target");
    if (!targetId) {
      return;
    }

    contents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === targetId) {
        content.classList.add("active");
      }
    });
  });
}

// --- Initialisation de toutes les fonctionnalités ---
const handleDomReady = () => {
  console.log("DOM est prêt, initialisation de tous les modules.");
  handleInit();
  setupCompetitionTabs();
  setupMoodboardPopups();
  setupLogoPopup();
  setupMockupPopup();
  setupWireframePopup();
  setupMaquettePopup();
  setupSitemap();

  // Initialisation des systèmes d'onglets génériques
  setupTab(".logotype-tabs", ".logotype-tab", ".logotype-content");
  setupTab(".optimisation-tabs", ".optimisation-tab", ".optimisation-content");
  setupTab(".calendar-tabs", ".calendar-tab", ".calendar-content");

  // Activer les premiers onglets par défaut pour les systèmes génériques
  document
    .querySelector('.logotype-tab[data-target="aventure-immersive"]')
    ?.classList.add("active");
  document.querySelector("#aventure-immersive")?.classList.add("active");

  document
    .querySelector('.optimisation-tab[data-target="opti-securite"]')
    ?.classList.add("active");
  document.querySelector("#opti-securite")?.classList.add("active");

  document
    .querySelector('.calendar-tab[data-target="september"]')
    ?.classList.add("active");
  document.querySelector("#september")?.classList.add("active");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handleDomReady);
} else {
  handleDomReady();
}

// Nettoyage au déchargement
window.addEventListener("beforeunload", () => {
  if (lenis) {
    lenis.destroy();
  }
});
