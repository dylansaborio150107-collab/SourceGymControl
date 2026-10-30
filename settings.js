/* SourceGymControl — Sección de Ajustes
   Preferencias de interfaz, datos del gimnasio, seguridad de la cuenta
   y mantenimiento de los datos locales. Se registra en window.SGC_VIEWS. */
(function () {
  const DB = window.SGC_DB;
  const U = window.SGC_UI;
  const T = window.SGC_THEME;
  const GKEY = "sgc_gym";

  const gymDefaults = {
    nombre: "SourceGym Control",
    lema: "Ecosistema digital de rendimiento",
    telefono: "+505 0000 0000",
    correo: "admin@sourcegym.com",
    direccion: "Managua, Nicaragua",
    moneda: "C$",
    horario: "Lun a Sáb · 5:00 a 22:00",
    diasAvisoVencimiento: 7,
  };

  function gym() {
    try {
      return Object.assign({}, gymDefaults, JSON.parse(localStorage.getItem(GKEY) || "{}"));
    } catch (e) {
      return Object.assign({}, gymDefaults);
    }
  }
  const saveGym = (data) => localStorage.setItem(GKEY, JSON.stringify(Object.assign(gym(), data)));

  window.SGC_GYM = { get: gym, save: saveGym };

  const card = (title, desc, body) => `
    <section class="card p-5">
      <h2 class="text-base font-semibold text-slate-100">${U.esc(title)}</h2>
      <p class="mt-1 text-sm text-slate-400">${U.esc(desc)}</p>
      <div class="mt-5">${body}</div>
    </section>`;

  const row = (label, hint, control) => `
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 py-3 last:border-0">
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-slate-200">${U.esc(label)}</p>
        <p class="text-xs text-slate-500">${U.esc(hint)}</p>
      </div>
      <div class="shrink-0">${control}</div>
    </div>`;

  function ajustes(view) {
    const u = window.SGC_SESSION.usuario;
    const rol = DB.find("Roles", u.RolID);
    const esAdmin = (window.SGC_SESSION.perms || []).includes("usuarios.gestionar");
    const g = gym();
    const p = T.prefs();

    view.innerHTML =
      U.pageHeader("Ajustes", "Personaliza la apariencia, tus datos y el comportamiento del sistema") +
      `<div class="grid gap-5 xl:grid-cols-2">

        ${card(
          "Apariencia",
          "Elige el tema y la densidad de la interfaz. Se guarda en este dispositivo.",
          `
          <div class="grid grid-cols-2 gap-3">
            <button data-theme="dark" class="tab ${T.get() === "dark" ? "tab-on" : ""} flex items-center justify-center gap-2 py-3">Oscuro</button>
            <button data-theme="light" class="tab ${T.get() === "light" ? "tab-on" : ""} flex items-center justify-center gap-2 py-3">Claro</button>
          </div>
          <div class="mt-4">
            ${row("Densidad compacta", "Reduce espacios para ver más información", `<button id="pref-dense" class="switch" role="switch" aria-checked="${p.densidad === "compacta"}"></button>`)}
            ${row("Animaciones", "Transiciones y desplazamiento suave", `<button id="pref-anim" class="switch" role="switch" aria-checked="${p.animaciones}"></button>`)}
            ${row("Menú contraído en escritorio", "Muestra solo los iconos del menú lateral", `<button id="pref-sb" class="switch" role="switch" aria-checked="${p.sidebarColapsado}"></button>`)}
          </div>`
        )}

        ${card(
          "Mi cuenta",
          `Sesión activa como ${u.NombreUsuario} · ${rol ? rol.Nombre : "sin rol"}`,
          `
          <div class="grid gap-4 sm:grid-cols-2">
            <div><label class="lbl">Nombre completo</label><input id="ac-nombre" class="inp" value="${U.esc(u.NombreCompleto)}" /></div>
            <div><label class="lbl">Correo</label><input id="ac-correo" type="email" class="inp" value="${U.esc(u.Correo)}" /></div>
            <div><label class="lbl">Nueva contraseña</label><input id="ac-pass" type="password" class="inp" placeholder="Dejar vacío para no cambiarla" /></div>
            <div><label class="lbl">Confirmar contraseña</label><input id="ac-pass2" type="password" class="inp" placeholder="Repite la nueva contraseña" /></div>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button id="ac-save" class="btn-primary">Guardar cambios</button>
            <span class="text-xs text-slate-500 self-center">Último acceso: ${U.esc(u.UltimoAcceso || "—")}</span>
          </div>`
        )}

        ${card(
          "Datos del gimnasio",
          esAdmin ? "Se usan en reportes, recibos y encabezados." : "Solo el administrador puede modificar estos datos.",
          `
          <div class="grid gap-4 sm:grid-cols-2">
            <div><label class="lbl">Nombre</label><input id="g-nombre" class="inp" value="${U.esc(g.nombre)}" ${esAdmin ? "" : "disabled"} /></div>
            <div><label class="lbl">Lema</label><input id="g-lema" class="inp" value="${U.esc(g.lema)}" ${esAdmin ? "" : "disabled"} /></div>
            <div><label class="lbl">Teléfono</label><input id="g-telefono" class="inp" value="${U.esc(g.telefono)}" ${esAdmin ? "" : "disabled"} /></div>
            <div><label class="lbl">Correo</label><input id="g-correo" class="inp" value="${U.esc(g.correo)}" ${esAdmin ? "" : "disabled"} /></div>
            <div class="sm:col-span-2"><label class="lbl">Dirección</label><input id="g-direccion" class="inp" value="${U.esc(g.direccion)}" ${esAdmin ? "" : "disabled"} /></div>
            <div><label class="lbl">Horario</label><input id="g-horario" class="inp" value="${U.esc(g.horario)}" ${esAdmin ? "" : "disabled"} /></div>
            <div><label class="lbl">Aviso de vencimiento (días)</label><input id="g-dias" type="number" min="1" max="60" class="inp" value="${U.esc(g.diasAvisoVencimiento)}" ${esAdmin ? "" : "disabled"} /></div>
          </div>
          ${esAdmin ? '<div class="mt-4"><button id="g-save" class="btn-primary">Guardar datos</button></div>' : ""}`
        )}

        ${card(
          "Datos y mantenimiento",
          "La información se guarda en este navegador (localStorage). Exporta una copia con frecuencia.",
          `
          <div class="flex flex-wrap gap-2">
            <button id="d-export" class="btn-ghost">Exportar respaldo (JSON)</button>
            <label class="btn-ghost cursor-pointer">Importar respaldo<input id="d-import" type="file" accept="application/json" class="hidden" /></label>
            <button id="d-reset" class="btn-danger">Restablecer datos de ejemplo</button>
          </div>
          <div class="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
            ${["Clientes", "Membresias", "Pagos", "Accesos", "Rutinas", "Usuarios"]
              .map((t) => `<div class="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2"><span>${t}</span><span class="font-semibold text-slate-200">${(DB.all(t) || []).length}</span></div>`)
              .join("")}
          </div>`
        )}
      </div>`;

    /* -------- Apariencia -------- */
    view.querySelectorAll("[data-theme]").forEach((b) => (b.onclick = () => { T.set(b.getAttribute("data-theme")); ajustes(view); }));

    const sw = (id, key, onSet) => {
      const el = view.querySelector(id);
      if (!el) return;
      el.onclick = () => {
        const next = el.getAttribute("aria-checked") !== "true";
        el.setAttribute("aria-checked", String(next));
        onSet(next);
      };
    };
    sw("#pref-dense", "densidad", (v) => T.savePrefs({ densidad: v ? "compacta" : "normal" }));
    sw("#pref-anim", "animaciones", (v) => T.savePrefs({ animaciones: v }));
    sw("#pref-sb", "sidebarColapsado", (v) => {
      T.savePrefs({ sidebarColapsado: v });
      const sb = document.getElementById("sidebar");
      if (sb) sb.classList.toggle("sb-collapsed", v);
      const lbl = document.querySelector("#sb-toggle span");
      if (lbl) lbl.textContent = v ? "Expandir" : "Contraer menú";
    });

    /* -------- Mi cuenta -------- */
    view.querySelector("#ac-save").onclick = () => {
      const nombre = view.querySelector("#ac-nombre").value.trim();
      const correo = view.querySelector("#ac-correo").value.trim();
      const p1 = view.querySelector("#ac-pass").value;
      const p2 = view.querySelector("#ac-pass2").value;
      if (!nombre || !correo) return U.toast("Nombre y correo son obligatorios.", "err");
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(correo)) return U.toast("El correo no tiene un formato válido.", "err");
      if (p1 && p1.length < 6) return U.toast("La contraseña debe tener al menos 6 caracteres.", "err");
      if (p1 !== p2) return U.toast("Las contraseñas no coinciden.", "err");
      const patch = { NombreCompleto: nombre, Correo: correo };
      if (p1) patch.ContrasenaHash = p1;
      DB.update("Usuarios", u.UsuarioID, patch);
      Object.assign(u, patch);
      U.toast("Datos de la cuenta actualizados.");
      location.hash = "#/ajustes";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    };

    /* -------- Gimnasio -------- */
    const gs = view.querySelector("#g-save");
    if (gs)
      gs.onclick = () => {
        saveGym({
          nombre: view.querySelector("#g-nombre").value.trim(),
          lema: view.querySelector("#g-lema").value.trim(),
          telefono: view.querySelector("#g-telefono").value.trim(),
          correo: view.querySelector("#g-correo").value.trim(),
          direccion: view.querySelector("#g-direccion").value.trim(),
          horario: view.querySelector("#g-horario").value.trim(),
          diasAvisoVencimiento: Number(view.querySelector("#g-dias").value) || 7,
        });
        U.toast("Datos del gimnasio guardados.");
      };

    /* -------- Respaldos -------- */
    view.querySelector("#d-export").onclick = () => {
      const payload = { generado: new Date().toISOString(), version: "2.1.0", gimnasio: gym(), datos: DB.data };
      U.download(`sourcegym-respaldo-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), "application/json");
    };

    view.querySelector("#d-import").onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(String(reader.result));
          const datos = json && json.datos ? json.datos : json;
          if (!datos || typeof datos !== "object" || !datos.Usuarios) throw new Error("formato");
          if (json && json.gimnasio) saveGym(json.gimnasio);
          DB.data = datos;
          DB.save();
          U.toast("Respaldo importado correctamente.");
          setTimeout(() => location.reload(), 700);
        } catch (err) {
          U.toast("El archivo no es un respaldo válido.", "err");
        }
      };
      reader.readAsText(file);
    };

    view.querySelector("#d-reset").onclick = () =>
      U.confirmDialog("Se borrarán todos los datos guardados en este navegador y se cargarán los datos de ejemplo. ¿Deseas continuar?", () => {
        DB.reset();
        U.toast("Datos de ejemplo restaurados.");
        setTimeout(() => location.reload(), 700);
      });
  }

  if (window.SGC_VIEWS) window.SGC_VIEWS.ajustes = ajustes;
})();
