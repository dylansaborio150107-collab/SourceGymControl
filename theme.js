/* SourceGymControl — Gestor de tema claro/oscuro y preferencias de interfaz */
(function () {
  const TKEY = "sgc_theme";
  const PKEY = "sgc_prefs";

  const defaults = {
    densidad: "normal", // normal | compacta
    sidebarColapsado: false,
    animaciones: true,
  };

  function readPrefs() {
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem(PKEY) || "{}"));
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }
  let prefs = readPrefs();

  function savePrefs(patch) {
    prefs = Object.assign({}, prefs, patch || {});
    localStorage.setItem(PKEY, JSON.stringify(prefs));
    applyPrefs();
    listeners.forEach((fn) => fn(get(), prefs));
    return prefs;
  }

  function applyPrefs() {
    document.documentElement.classList.toggle("dense", prefs.densidad === "compacta");
    document.documentElement.style.setProperty("scroll-behavior", prefs.animaciones ? "smooth" : "auto");
  }

  const listeners = [];
  const onChange = (fn) => listeners.push(fn);

  function get() {
    return document.documentElement.classList.contains("light") ? "light" : "dark";
  }

  function apply(theme) {
    const light = theme === "light";
    document.documentElement.classList.toggle("light", light);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#f3f6fb" : "#020617");
  }

  function set(theme) {
    apply(theme);
    localStorage.setItem(TKEY, theme);
    document.querySelectorAll("[data-theme-btn]").forEach(paint);
    listeners.forEach((fn) => fn(theme, prefs));
    return theme;
  }

  const toggle = () => set(get() === "light" ? "dark" : "light");

  const sun =
    '<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M12 17a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2v3h0v-3Zm0-17v3M4.2 4.2 6.3 6.3M17.7 17.7l2.1 2.1M2 12h3m14 0h3M4.2 19.8 6.3 17.7M17.7 6.3l2.1-2.1M11 19h2v3h-2Z"/></svg>';
  const moon =
    '<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M12.7 2a9 9 0 1 0 9.3 11.4A7.5 7.5 0 0 1 12.7 2Z"/></svg>';

  function paint(btn) {
    const light = get() === "light";
    btn.innerHTML = light ? moon : sun;
    btn.setAttribute("title", light ? "Activar tema oscuro" : "Activar tema claro");
    btn.setAttribute("aria-label", btn.getAttribute("title"));
  }

  /* Conecta cualquier botón con el atributo data-theme-btn */
  function bind(btn) {
    if (!btn) return;
    btn.setAttribute("data-theme-btn", "1");
    paint(btn);
    btn.onclick = (e) => {
      e.preventDefault();
      toggle();
    };
  }

  applyPrefs();

  window.SGC_THEME = { get, set, toggle, bind, paint, prefs: () => prefs, savePrefs, onChange };
})();
