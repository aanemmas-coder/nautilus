const defaultSettings = {
  phone: "+212 6 66 11 68 17",
  phoneHref: "tel:+212666116817",
  address: "N°3, Rue Ouhoud, Agdal, Rabat",
  hoursShort: "Lun-Jeu 08:00-22:30 · Ven 08:00-23:00 · Sam 12:00-23:00 · Dim 12:00-22:30",
  gameFee: "10 MAD / heure / personne",
  gameFeeLong: "10 MAD / heure / personne, annoncé clairement dès la réservation.",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Le%20Nautilus%20Cafe%20BD%20Ludotheque%20Rue%20Ouhoud%20Rabat",
};

const hoursByDay = [
  "12:00-22:30",
  "08:00-22:30",
  "08:00-22:30",
  "08:00-22:30",
  "08:00-22:30",
  "08:00-23:00",
  "12:00-23:00",
];

const settingsKey = "nautilus-cafe-settings";
const reservationsKey = "nautilus-cafe-reservations";

const getSettings = () => ({
  ...defaultSettings,
  ...JSON.parse(localStorage.getItem(settingsKey) || "{}"),
});

const saveSettings = (settings) => {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
};

const setHeaderState = () => {
  const header = document.querySelector(".site-header");
  header.dataset.elevated = String(window.scrollY > 18);
};

const applySettings = () => {
  const settings = getSettings();

  document.querySelectorAll("[data-setting]").forEach((node) => {
    const key = node.dataset.setting;
    if (settings[key]) node.textContent = settings[key];
  });

  document.querySelectorAll("[data-setting-link]").forEach((node) => {
    const key = node.dataset.settingLink;
    if (settings[key]) node.href = settings[key];
  });

  document.querySelectorAll("[data-setting='gameFeeLong']").forEach((node) => {
    node.textContent = settings.gameFeeLong || `${settings.gameFee}, annoncé clairement dès la réservation.`;
  });

  const today = new Date().getDay();
  const todayNode = document.querySelector("[data-today-hours]");
  if (todayNode) todayNode.textContent = hoursByDay[today];
};

const initNavigation = () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".main-nav a, .header-action");

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
};

const initMenuFilters = () => {
  const buttons = document.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll("[data-category]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      items.forEach((item) => {
        item.hidden = filter !== "all" && item.dataset.category !== filter;
      });
    });
  });
};

const initBooking = () => {
  const form = document.querySelector("[data-booking-form]");
  const summary = document.querySelector("[data-reservation-summary]");
  const dateInput = form.elements.date;

  dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const reservations = JSON.parse(localStorage.getItem(reservationsKey) || "[]");
    const reservation = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    reservations.unshift(reservation);
    localStorage.setItem(reservationsKey, JSON.stringify(reservations.slice(0, 12)));

    summary.hidden = false;
    summary.innerHTML = `
      <strong>Demande enregistrée localement.</strong>
      <span>${reservation.name}, ${reservation.guests} personne(s), ${reservation.visitType}, ${reservation.date} à ${reservation.time}.</span>
    `;
    form.reset();
    dateInput.min = new Date().toISOString().slice(0, 10);
  });
};

const initGallery = () => {
  const dialog = document.querySelector("[data-lightbox-dialog]");
  const image = document.querySelector("[data-lightbox-image]");
  const close = document.querySelector("[data-close-lightbox]");

  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.lightbox;
      image.alt = button.querySelector("img")?.alt || "";
      dialog.showModal();
    });
  });

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
};

const initAccordion = () => {
  document.querySelectorAll("[data-accordion] > button").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.querySelector("strong").textContent = isExpanded ? "+" : "−";
    });
  });
};

const initSettings = () => {
  const dialog = document.querySelector("[data-settings-dialog]");
  const form = document.querySelector("[data-settings-form]");
  const open = document.querySelector("[data-open-settings]");

  open.addEventListener("click", () => {
    const settings = getSettings();
    form.elements.phone.value = settings.phone;
    form.elements.address.value = settings.address;
    form.elements.hoursShort.value = settings.hoursShort;
    form.elements.gameFee.value = settings.gameFee;
    form.elements.mapHref.value = settings.mapHref;
    dialog.showModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const phoneDigits = formData.phone.replace(/[^\d+]/g, "");
    const settings = {
      ...getSettings(),
      ...formData,
      phoneHref: phoneDigits ? `tel:${phoneDigits}` : defaultSettings.phoneHref,
      gameFeeLong: `${formData.gameFee}, annoncé clairement dès la réservation.`,
    };
    saveSettings(settings);
    applySettings();
    dialog.close();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  applySettings();
  initNavigation();
  initMenuFilters();
  initBooking();
  initGallery();
  initAccordion();
  initSettings();
});
