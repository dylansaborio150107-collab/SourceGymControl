/* SourceGymControl - Núcleo de la aplicación: sesión, permisos y enrutamiento */
(function () {
  const DB = window.SGC_DB;
  const U = window.SGC_UI;
  const V = window.SGC_VIEWS;
  const S = window.SGC_SCHEMA;
  const SKEY = "sgc_session";

  window.SGC_SESSION = { usuario: null };

  const NAV = [
    { hash: "#/dashboard", label: "Dashboard", icon: "dashboard", perm: "dashboard.ver" },
    { hash: "#/clientes", label: "Clientes", icon: "clientes", perm: "clientes.gestionar" },
    { hash: "#/membresias", label: "Membresías", icon: "membresias", perm: "membresias.gestionar" },
    { hash: "#/accesos", label: "Control de accesos", icon: "accesos", perm: "accesos.gestionar" },
    { hash: "#/pagos", label: "Pagos", icon: "pagos", perm: "pagos.gestionar" },
    { hash: "#/rutinas", label: "Rutinas", icon: "rutinas", perm: "rutinas.gestionar" },
    { hash: "#/programador", label: "Programador", icon: "rutinas", perm: "rutinas.gestionar" },
    { hash: "#/ejercicios", label: "Ejercicios", icon: "ejercicios", perm: "rutinas.gestionar" },
    { hash: "#/entrenadores", label: "Entrenadores", icon: "entrenadores", perm: "entrenadores.gestionar" },
    { hash: "#/progreso", label: "Progreso físico", icon: "progreso", perm: "progreso.gestionar" },
    { hash: "#/alertas", label: "Alertas", icon: "alertas", perm: "dashboard.ver" },
    { hash: "#/reportes", label: "Reportes", icon: "reportes", perm: "reportes.ver" },
    { hash: "#/usuarios", label: "Usuarios y roles", icon: "usuarios", perm: "usuarios.gestionar" },
    { hash: "#/auditoria", label: "Historial", icon: "auditoria", perm: "auditoria.ver" },
    { hash: "#/base-datos", label: "Base de datos", icon: "bd", perm: "bd.administrar" },
    { hash: "#/mi-rutina", label: "Mi rutina", icon: "mirutina", perm: "mirutina.ver" },
    { hash: "#/ajustes", label: "Ajustes", icon: "usuarios", perm: null },
  ];


  function permisos(rolId) {
    const ids = DB.where("RolPermisos", (r) => r.RolID === rolId).map((r) => r.PermisoID);
    return DB.all("Permisos").filter((p) => ids.includes(p.PermisoID)).map((p) => p.Codigo);
  }
  const can = (code) => !code || (window.SGC_SESSION.perms || []).includes(code);

  /* ---------- LOGIN ---------- */
  function initLogin() {
    const form = document.getElementById("login-form");
    const err = document.getElementById("login-error");
    const toggle = document.getElementById("toggle-pass");
    const pass = document.getElementById("password");
    toggle.onclick = () => { pass.type = pass.type === "password" ? "text" : "password"; toggle.classList.toggle("text-brand-400"); };



    /* Botón de tema en la pantalla de login */
    window.SGC_THEME.bind(document.getElementById("login-theme"));

    /* Recuerda el último usuario para agilizar el acceso */
    const lastUser = localStorage.getItem("sgc_last_user");
    if (lastUser) document.getElementById("usuario").value = lastUser;

    document.querySelectorAll("[data-social]").forEach((b) => (b.onclick = (e) => {
      e.preventDefault();
      U.toast("El inicio con " + b.getAttribute("data-social") + " se habilita al publicar el sitio.", "info");
    }));
    document.getElementById("forgot").onclick = (e) => {
      e.preventDefault();
      U.toast("Solicita el restablecimiento de tu contraseña al administrador del gimnasio.", "info");
    };


    form.onsubmit = (e) => {
      e.preventDefault();
      const id = document.getElementById("usuario").value.trim().toLowerCase();
      const pw = pass.value;
      const u = DB.all("Usuarios").find((x) => (x.NombreUsuario.toLowerCase() === id || x.Correo.toLowerCase() === id) && x.ContrasenaHash === pw);
      if (!u) { err.textContent = "Usuario o contraseña incorrectos. Verifica tus credenciales."; err.classList.remove("hidden"); return; }
      if (!u.Activo) { err.textContent = "Tu cuenta está desactivada. Contacta al administrador."; err.classList.remove("hidden"); return; }
      err.classList.add("hidden");
      DB.update("Usuarios", u.UsuarioID, { UltimoAcceso: window.SGC_UTIL.fmtDT(new Date()) }, false);
      DB.log("LOGIN", "Usuarios", u.UsuarioID, `Inicio de sesión de ${u.NombreUsuario}`);
      DB.save();
      localStorage.setItem("sgc_last_user", u.NombreUsuario);
      if (document.getElementById("recordar").checked) localStorage.setItem(SKEY, String(u.UsuarioID));

      else sessionStorage.setItem(SKEY, String(u.UsuarioID));
      startApp(u);
    };
  }

  function restoreSession() {
    const id = sessionStorage.getItem(SKEY) || localStorage.getItem(SKEY);
    if (!id) return null;
    const u = DB.find("Usuarios", id);
    return u && u.Activo ? u : null;
  }

  function logout() {
    DB.log("LOGOUT", "Usuarios", window.SGC_SESSION.usuario?.UsuarioID, "Cierre de sesión");
    DB.save();
    sessionStorage.removeItem(SKEY); localStorage.removeItem(SKEY);
    window.SGC_SESSION = { usuario: null };
    document.getElementById("app").style.display = "none";
    document.getElementById("login").style.display = "";
    location.hash = "";
    U.toast("Sesión cerrada correctamente.");
  }

  /* ---------- APP SHELL ---------- */
  function startApp(u) {
    window.SGC_SESSION = { usuario: u, perms: permisos(u.RolID) };
    DB.refreshAlertas();
    document.getElementById("login").style.display = "none";
    const app = document.getElementById("app");
    app.style.display = "block";
    renderShell();
    const first = NAV.find((n) => can(n.perm));
    if (!location.hash || location.hash === "#/" ) location.hash = first ? first.hash : "#/dashboard";
    else route();
  }

  function renderShell() {
    const u = window.SGC_SESSION.usuario;
    const rol = DB.find("Roles", u.RolID);
    const items = NAV.filter((n) => can(n.perm));
    const collapsed = window.SGC_THEME.prefs().sidebarColapsado;
    document.getElementById("app").innerHTML = `
      <div class="flex min-h-screen bg-slate-950">
        <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-800 bg-slate-900 transition-[transform,width] duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${collapsed ? "sb-collapsed" : ""}">
          <div class="flex items-center gap-3 border-b border-slate-800 px-4 py-4">
            <img src="assets/logo.jpg" alt="Logo SourceGymControl" class="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-700">
            <div class="sb-label min-w-0 flex-1">
              <p class="truncate text-sm font-bold tracking-wide text-slate-50">SOURCE<span class="text-brand-400">GYM</span>CONTROL</p>
              <p class="truncate text-[10px] uppercase tracking-widest text-slate-500">Gestión predictiva</p>
            </div>
            <button id="sb-close" class="icon-btn shrink-0 lg:hidden" aria-label="Cerrar menú" title="Cerrar menú">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3Z"/></svg>
            </button>
          </div>
          <nav class="flex-1 space-y-1 overflow-y-auto p-3">
            ${items.map((n) => `<a href="${n.hash}" data-nav="${n.hash}" class="nav-item" title="${U.esc(n.label)}">${U.icon(n.icon)}<span class="sb-label truncate">${n.label}</span></a>`).join("")}
          </nav>
          <div class="space-y-1 border-t border-slate-800 p-3">
            <button id="sb-toggle" class="nav-item hidden w-full lg:flex" title="Expandir o contraer el menú">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M3 5h18v2H3Zm0 6h12v2H3Zm0 6h18v2H3Z"/></svg>
              <span class="sb-label">Contraer menú</span>
            </button>
            <button id="logout" class="nav-item w-full text-rose-400 hover:bg-rose-500/10">${U.icon("salir")}<span class="sb-label">Cerrar sesión</span></button>
          </div>
        </aside>
        <div class="flex min-w-0 flex-1 flex-col">
          <header class="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-800 bg-slate-900/85 px-3 py-3 backdrop-blur sm:px-4">
            <button id="menu" class="icon-btn lg:hidden" aria-label="Abrir menú" aria-expanded="false" title="Abrir menú">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M3 5h18v2H3Zm0 6h18v2H3Zm0 6h18v2H3Z"/></svg>
            </button>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-100">${U.esc(u.NombreCompleto)}</p>
              <p class="truncate text-xs text-slate-500">${U.esc(rol ? rol.Nombre : "")}</p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <button id="theme-btn" class="icon-btn"></button>
              <a href="#/ajustes" class="icon-btn hidden sm:inline-grid" title="Ajustes" aria-label="Ajustes">${U.icon("usuarios")}</a>
              <button id="bell" class="icon-btn relative" aria-label="Alertas" title="Alertas">${U.icon("alertas")}<span id="bell-count" class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"></span></button>
              <div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white" title="${U.esc(u.NombreCompleto)}">${U.esc(u.NombreCompleto.charAt(0))}</div>
            </div>
          </header>
          <main id="view" class="min-w-0 flex-1 p-4 sm:p-6"></main>
          <footer class="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
            SourceGym Control · Versión 2.1.0 · &copy; <span id="year">${new Date().getFullYear()}</span>
          </footer>
        </div>
      </div>
      <div id="backdrop" class="fixed inset-0 z-40 hidden bg-black/60 backdrop-blur-sm lg:hidden"></div>`;

    const sb = document.getElementById("sidebar"), bd = document.getElementById("backdrop");
    const menuBtn = document.getElementById("menu");
    const isOpen = () => !sb.classList.contains("-translate-x-full");
    const closeSb = () => {
      sb.classList.add("-translate-x-full");
      bd.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const openSb = () => {
      sb.classList.remove("-translate-x-full");
      bd.classList.remove("hidden");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    menuBtn.onclick = () => (isOpen() ? closeSb() : openSb());
    document.getElementById("sb-close").onclick = closeSb;
    bd.onclick = closeSb;

    /* Escape cierra el menú y al pasar a escritorio se restablece el scroll */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && window.innerWidth < 1024 && isOpen()) closeSb();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) { bd.classList.add("hidden"); document.body.style.overflow = ""; }
    });

    /* Contraer/expandir en escritorio (preferencia persistente) */
    const tgl = document.getElementById("sb-toggle");
    const paintToggle = () => {
      const c = sb.classList.contains("sb-collapsed");
      tgl.querySelector("span").textContent = c ? "Expandir" : "Contraer menú";
    };
    paintToggle();
    tgl.onclick = () => {
      sb.classList.toggle("sb-collapsed");
      window.SGC_THEME.savePrefs({ sidebarColapsado: sb.classList.contains("sb-collapsed") });
      paintToggle();
    };

    window.SGC_THEME.bind(document.getElementById("theme-btn"));
    document.getElementById("logout").onclick = logout;
    document.getElementById("bell").onclick = () => (location.hash = "#/alertas");
    document.querySelectorAll("[data-nav]").forEach((a) => (a.onclick = () => { if (window.innerWidth < 1024) setTimeout(closeSb, 120); }));
    updateBell();
  }


  function updateBell() {
    const el = document.getElementById("bell-count");
    if (!el) return;
    const n = DB.all("Alertas").length;
    el.textContent = n > 99 ? "99+" : n;
    el.classList.toggle("hidden", n === 0);
  }

  function setActive(hash) {
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("nav-on", a.getAttribute("data-nav") === hash));
  }

  /* ---------- ROUTER ---------- */
  function route() {
    if (!window.SGC_SESSION.usuario) return;
    const view = document.getElementById("view");
    if (!view) return;
    const parts = (location.hash || "#/dashboard").replace(/^#\//, "").split("/");
    const root = "#/" + (parts[0] || "dashboard");
    setActive(root);
    updateBell();
    window.scrollTo({ top: 0 });
    const guard = (perm, fn) => (can(perm) ? fn() : (view.innerHTML = U.pageHeader("Acceso restringido", "Tu rol no tiene permisos para esta sección", "")));

    switch (parts[0]) {
      case "": case "dashboard": return guard("dashboard.ver", () => V.dashboard(view));
      case "clientes": return guard("clientes.gestionar", () => (parts[1] ? V.clienteDetalle(view, parts[1]) : V.clientes(view)));
      case "membresias": return guard("membresias.gestionar", () => V.membresias(view));
      case "tipos-membresia": return guard("membresias.gestionar", () => V.genericTable(view, "TiposMembresia", "Tipos de membresía", "Planes disponibles y precios"));
      case "accesos": return guard("accesos.gestionar", () => V.accesos(view));
      case "pagos": return guard("pagos.gestionar", () => V.pagos(view));
      case "rutinas": return guard("rutinas.gestionar", () => V.rutinas(view));
      case "programador": return guard("rutinas.gestionar", () => V.programador(view, parts[1], parts[2]));
      case "ejercicios": return guard("rutinas.gestionar", () => V.genericTable(view, "Ejercicios", "Catálogo de ejercicios", "Biblioteca por grupo muscular, equipo y dificultad"));
      case "entrenadores": return guard("entrenadores.gestionar", () => V.genericTable(view, "Entrenadores", "Entrenadores", "Personal técnico del gimnasio"));
      case "objetivos": return guard("rutinas.gestionar", () => V.genericTable(view, "Objetivos", "Objetivos", "Metas de entrenamiento"));
      case "progreso": return guard("progreso.gestionar", () => V.genericTable(view, "Progreso", "Progreso físico", "Mediciones y evolución de cada cliente", [
          { key: "ProgresoID", label: "ID" },
          { key: "ClienteID", label: "Cliente", value: (r) => DB.clienteNombre(r.ClienteID) },
          { key: "Fecha", label: "Fecha" }, { key: "Peso_kg", label: "Peso (kg)" },
          { key: "GrasaCorporal", label: "% Grasa" }, { key: "MasaMuscular", label: "Músculo (kg)" },
          { key: "Cintura_cm", label: "Cintura" },
        ]));
      case "alertas": return guard("dashboard.ver", () => V.alertas(view));
      case "reportes": return guard("reportes.ver", () => V.reportes(view));
      case "usuarios": return guard("usuarios.gestionar", () => V.genericTable(view, "Usuarios", "Usuarios y roles", "Cuentas de administrador, recepción, entrenador y cliente", [
          { key: "UsuarioID", label: "ID" }, { key: "NombreUsuario", label: "Usuario" },
          { key: "NombreCompleto", label: "Nombre" }, { key: "Correo", label: "Correo" },
          { key: "RolID", label: "Rol", value: (r) => (DB.find("Roles", r.RolID) || {}).Nombre || "—" },
          { key: "Activo", label: "Activo", html: (r) => U.badge(r.Activo ? "Sí" : "No", r.Activo ? "green" : "slate") },
          { key: "UltimoAcceso", label: "Último acceso", value: (r) => r.UltimoAcceso || "—" },
        ]));
      case "roles": return guard("usuarios.gestionar", () => V.genericTable(view, "Roles", "Roles", "Perfiles de acceso"));
      case "auditoria": return guard("auditoria.ver", () => V.genericTable(view, "Auditoria", "Historial de actividades", "Quién hizo qué y cuándo", [
          { key: "AuditoriaID", label: "ID" },
          { key: "UsuarioID", label: "Usuario", value: (r) => (DB.find("Usuarios", r.UsuarioID) || {}).NombreCompleto || "Sistema" },
          { key: "Accion", label: "Acción", html: (r) => U.badge(r.Accion, r.Accion === "DELETE" ? "red" : r.Accion === "INSERT" ? "green" : "blue") },
          { key: "TablaAfectada", label: "Tabla" }, { key: "RegistroID", label: "Registro" },
          { key: "Detalle", label: "Detalle" }, { key: "FechaHora", label: "Fecha/Hora" },
        ]));
      case "base-datos": return guard("bd.administrar", () => V.baseDatos(view));
      case "mi-rutina": return guard("mirutina.ver", () => V.miRutina(view));
      case "ajustes": return V.ajustes(view);
      default: return guard("dashboard.ver", () => V.dashboard(view));
    }
  }

  /* ---------- BOOT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    DB.load();
    initLogin();
    window.addEventListener("hashchange", route);
    DB.on(() => updateBell());
    const u = restoreSession();
    if (u) startApp(u);
    document.getElementById("year").textContent = new Date().getFullYear();
  });
})();
