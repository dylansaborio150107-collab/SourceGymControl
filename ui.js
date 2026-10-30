/* SourceGymControl - Utilidades de interfaz */
(function () {
  const S = window.SGC_SCHEMA;
  const DB = window.SGC_DB;

  const esc = (v) =>
    v === null || v === undefined ? "" : String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const money = (n) => "C$ " + Number(n || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const icons = {
    dashboard: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
    clientes: '<path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.7 0-6 1.3-6 4v2h7v-2c0-1.2.5-2.3 1.4-3.2A10 10 0 0 0 8 14Zm8 0c-3 0-8 1.5-8 4.5V21h16v-2.5c0-3-5-4.5-8-4.5Z"/>',
    membresias: '<path d="M20 4H4a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2Zm-9 3h2v2h-2Zm0 4h2v2h-2Zm0 4h2v2h-2Z"/>',
    accesos: '<path d="M10 17v-2H4V9h6V7l5 5-5 5Zm2-14h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7v-2h7V5h-7Z"/>',
    pagos: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15v1h-2v-1a3.5 3.5 0 0 1-3-2l1.7-1a2 2 0 0 0 1.8 1.1c.9 0 1.5-.4 1.5-1s-.5-.9-1.8-1.3C9.6 12.3 8.4 11.6 8.4 10a2.9 2.9 0 0 1 2.6-2.8V6h2v1.2A3.2 3.2 0 0 1 15.6 9l-1.7 1a1.8 1.8 0 0 0-1.6-1c-.8 0-1.3.4-1.3.9s.6.9 1.9 1.3c1.7.5 2.7 1.2 2.7 2.8A3 3 0 0 1 13 17Z"/>',
    rutinas: '<path d="M20.6 6.7l-1.4-1.4-1.5 1.5-1.4-1.5-1.4 1.4 1.4 1.4L8.2 15 6.8 13.6 5.4 15l1.4 1.4-1.4 1.5 1.4 1.4 1.5-1.5 1.4 1.5 1.4-1.4-1.4-1.4L15.8 9l1.4 1.4 1.4-1.4-1.4-1.4Z"/>',
    ejercicios: '<path d="M4 9H2v6h2v-2h2v-2H4Zm16 0v2h-2v2h2v2h2V9ZM7 6h3v12H7Zm7 0h3v12h-3Zm-4 5h4v2h-4Z"/>',
    entrenadores: '<path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5Z"/>',
    progreso: '<path d="M3 17h2v4H3Zm4-6h2v10H7Zm4-4h2v14h-2Zm4 8h2v6h-2Zm4-12h2v18h-2Z"/>',
    alertas: '<path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm7-6v-5a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 1 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1Z"/>',
    reportes: '<path d="M6 2h8l6 6v14H6Zm7 1.5V9h5.5ZM8 12h8v2H8Zm0 4h8v2H8Z"/>',
    usuarios: '<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm7 2-1-2-2 .5a5 5 0 0 0-1-.6L14.5 10h-2l-.5 2a5 5 0 0 0-1 .6L9 12l-1 2 1.6 1.3a5 5 0 0 0 0 1.2L8 18l1 2 2-.5a5 5 0 0 0 1 .6l.5 1.9h2l.5-2a5 5 0 0 0 1-.5l2 .5 1-2-1.6-1.4a5 5 0 0 0 0-1.2Zm-5.5 4.5a1.9 1.9 0 1 1 1.9-1.9 1.9 1.9 0 0 1-1.9 1.9Z"/>',
    auditoria: '<path d="M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 7 7 6.9 6.9 0 0 1-4.6-1.8l-1.4 1.5A9 9 0 1 0 13 3Zm-1 5v5l4 2 .8-1.3-3.3-1.9V8Z"/>',
    bd: '<path d="M12 2C7.6 2 4 3.3 4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5c0-1.7-3.6-3-8-3Zm0 2c3.9 0 6 1 6 1s-2.1 1-6 1-6-1-6-1 2.1-1 6-1Zm6 15c0 .3-2 1.5-6 1.5S6 19.3 6 19v-2.6A16 16 0 0 0 12 17a16 16 0 0 0 6-.6Zm0-5c0 .3-2 1.5-6 1.5S6 14.3 6 14v-2.6A16 16 0 0 0 12 12a16 16 0 0 0 6-.6Zm0-5c0 .3-2 1.5-6 1.5S6 9.3 6 9V6.4A16 16 0 0 0 12 7a16 16 0 0 0 6-.6Z"/>',
    mirutina: '<path d="M19 3h-4.2a3 3 0 0 0-5.6 0H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 0a1 1 0 1 1-1 1 1 1 0 0 1 1-1Zm-1 15-3.5-3.5 1.4-1.4L11 15.2l5.1-5.1 1.4 1.4Z"/>',
    salir: '<path d="M16 13v-2H7V8l-5 4 5 4v-3ZM20 3h-9v2h9v14h-9v2h9a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/>',
  };
  const icon = (n, cls = "h-5 w-5") => `<svg viewBox="0 0 24 24" fill="currentColor" class="${cls}">${icons[n] || icons.dashboard}</svg>`;

  /* --------- Toast --------- */
  function toast(msg, type = "ok") {
    const wrap = document.getElementById("toasts");
    const colors = { ok: "border-emerald-500/50 text-emerald-300", err: "border-rose-500/50 text-rose-300", info: "border-sky-500/50 text-sky-300", warn: "border-amber-500/50 text-amber-300" };
    const el = document.createElement("div");
    el.className = `pointer-events-auto rounded-xl border ${colors[type] || colors.ok} bg-slate-900/95 px-4 py-3 text-sm shadow-2xl backdrop-blur animate-[slideIn_.25s_ease]`;
    el.innerHTML = esc(msg);
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(20px)"; el.style.transition = "all .3s"; setTimeout(() => el.remove(), 320); }, 3600);
  }

  /* --------- Modal --------- */
  function modal({ title, body, footer, size = "max-w-2xl", onMount }) {
    const host = document.getElementById("modal-root");
    host.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" data-overlay>
        <div class="mt-10 w-full ${size} rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-100">${esc(title)}</h3>
            <button data-close class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100">✕</button>
          </div>
          <div class="max-h-[70vh] overflow-y-auto px-5 py-4">${body}</div>
          ${footer ? `<div class="flex flex-wrap justify-end gap-2 border-t border-slate-700/60 px-5 py-4">${footer}</div>` : ""}
        </div>
      </div>`;
    const close = () => (host.innerHTML = "");
    host.querySelector("[data-close]").onclick = close;
    host.querySelector("[data-overlay]").onclick = (e) => { if (e.target.hasAttribute("data-overlay")) close(); };
    if (onMount) onMount(host, close);
    return close;
  }

  function confirmDialog(msg, onYes) {
    modal({
      title: "Confirmar acción", size: "max-w-md",
      body: `<p class="text-sm text-slate-300">${esc(msg)}</p>`,
      footer: `<button data-no class="btn-ghost">Cancelar</button><button data-yes class="btn-danger">Sí, continuar</button>`,
      onMount: (host, close) => {
        host.querySelector("[data-no]").onclick = close;
        host.querySelector("[data-yes]").onclick = () => { close(); onYes(); };
      },
    });
  }

  /* --------- Campos de formulario --------- */
  function fieldHtml(col, value) {
    const id = "f_" + col.name;
    const req = col.required ? "required" : "";
    const base = "w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";
    let input = "";
    if (col.ui === "select") {
      input = `<select id="${id}" name="${col.name}" ${req} class="${base}"><option value="">— Seleccionar —</option>${(col.options || []).map((o) => `<option value="${esc(o)}" ${String(value) === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    } else if (col.ui === "fk") {
      const ref = S.tables[col.ref];
      const rows = DB.all(col.ref);
      const label = (r) => {
        if (r.Nombres) return `${r.Nombres} ${r.Apellidos || ""}`.trim();
        if (r.Nombre) return r.Nombre;
        if (r.NombreCompleto) return r.NombreCompleto;
        return `#${r[ref.pk]}`;
      };
      input = `<select id="${id}" name="${col.name}" ${req} class="${base}"><option value="">— Seleccionar —</option>${rows.map((r) => `<option value="${r[ref.pk]}" ${String(value) === String(r[ref.pk]) ? "selected" : ""}>${esc(label(r))} (#${r[ref.pk]})</option>`).join("")}</select>`;
    } else if (col.ui === "bool") {
      input = `<label class="flex items-center gap-2 pt-1.5"><input id="${id}" name="${col.name}" type="checkbox" ${value ? "checked" : ""} class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500"><span class="text-sm text-slate-300">Sí</span></label>`;
    } else if (col.ui === "textarea") {
      input = `<textarea id="${id}" name="${col.name}" rows="3" ${req} class="${base}">${esc(value)}</textarea>`;
    } else {
      const t = col.ui === "number" ? "number" : col.ui === "date" ? "date" : col.ui === "datetime" ? "datetime-local" : col.ui === "email" ? "email" : col.ui === "password" ? "text" : "text";
      let v = value ?? "";
      if (col.ui === "datetime" && v) v = String(v).replace(" ", "T").slice(0, 16);
      input = `<input id="${id}" name="${col.name}" type="${t}" step="any" value="${esc(v)}" ${req} ${col.readonly ? "readonly" : ""} class="${base} ${col.readonly ? "opacity-60" : ""}">`;
    }
    return `<div><label for="${id}" class="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">${esc(col.label)}${col.required ? ' <span class="text-rose-400">*</span>' : ""}</label>${input}</div>`;
  }

  function readForm(form, table) {
    const def = S.tables[table];
    const out = {};
    def.columns.forEach((c) => {
      if (c.ui === "id") return;
      const el = form.elements[c.name];
      if (!el) return;
      if (c.ui === "bool") out[c.name] = el.checked ? 1 : 0;
      else if (c.ui === "number" || c.ui === "fk") out[c.name] = el.value === "" ? null : Number(el.value);
      else if (c.ui === "datetime") out[c.name] = el.value ? el.value.replace("T", " ") + ":00" : null;
      else out[c.name] = el.value === "" ? null : el.value;
    });
    return out;
  }

  /* --------- Formulario CRUD genérico --------- */
  function recordForm(table, id, opts = {}) {
    const def = S.tables[table];
    const rec = id ? DB.find(table, id) : null;
    const cols = def.columns.filter((c) => c.ui !== "id" && !(opts.hide || []).includes(c.name));
    const body = `<form id="crud-form" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      ${cols.map((c) => `<div class="${c.ui === "textarea" ? "sm:col-span-2" : ""}">${fieldHtml(c, rec ? rec[c.name] : opts.defaults?.[c.name] ?? "")}</div>`).join("")}
    </form>`;
    modal({
      title: (rec ? "Editar " : "Nuevo registro — ") + def.label,
      body,
      footer: `<button data-cancel class="btn-ghost">Cancelar</button><button data-save class="btn-primary">${rec ? "Guardar cambios" : "Registrar"}</button>`,
      onMount: (host, close) => {
        const form = host.querySelector("#crud-form");
        host.querySelector("[data-cancel]").onclick = close;
        host.querySelector("[data-save]").onclick = () => {
          if (!form.reportValidity()) return;
          const data = readForm(form, table);
          if (rec) { DB.update(table, id, data); toast("Registro actualizado correctamente."); }
          else { DB.insert(table, data); toast("Registro creado correctamente."); }
          DB.refreshAlertas();
          close();
          if (opts.onSaved) opts.onSaved();
        };
      },
    });
  }

  /* --------- Tabla de datos con búsqueda, orden y paginación --------- */
  function dataTable(container, cfg) {
    const state = { q: "", page: 1, size: cfg.pageSize || 10, sort: cfg.sort || null, dir: "asc", filters: {} };
    function render() {
      let rows = cfg.rows();
      if (state.q) {
        const q = state.q.toLowerCase();
        rows = rows.filter((r) => cfg.columns.some((c) => String(c.value ? c.value(r) : r[c.key] ?? "").toLowerCase().includes(q)));
      }
      Object.entries(state.filters).forEach(([k, v]) => { if (v) rows = rows.filter((r) => String(r[k]) === String(v)); });
      if (state.sort) {
        const c = cfg.columns.find((x) => x.key === state.sort);
        rows.sort((a, b) => {
          const va = c && c.value ? c.value(a) : a[state.sort], vb = c && c.value ? c.value(b) : b[state.sort];
          const na = Number(va), nb = Number(vb);
          if (!isNaN(na) && !isNaN(nb) && va !== null && vb !== null && va !== "" && vb !== "") return na - nb;
          return String(va ?? "").localeCompare(String(vb ?? ""));
        });
        if (state.dir === "desc") rows.reverse();
      }
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / state.size));
      if (state.page > pages) state.page = pages;
      const slice = rows.slice((state.page - 1) * state.size, state.page * state.size);

      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-1 flex-wrap items-center gap-2">
              <div class="relative min-w-0 flex-1 sm:max-w-xs">
                <input data-q value="${esc(state.q)}" placeholder="Buscar..." class="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
                <span class="absolute left-3 top-2.5 text-slate-500">🔎</span>
              </div>
              ${(cfg.filters || []).map((f) => `<select data-filter="${f.key}" class="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"><option value="">${esc(f.label)}: todos</option>${f.options.map((o) => `<option value="${esc(o)}" ${state.filters[f.key] === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`).join("")}
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">${(cfg.actions || []).map((a, i) => `<button data-act="${i}" class="${a.cls || "btn-primary"}">${a.label}</button>`).join("")}</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-left text-sm">
              <thead class="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>${cfg.columns.map((c) => `<th data-sort="${c.key}" class="cursor-pointer whitespace-nowrap px-4 py-3 font-semibold hover:text-brand-400">${esc(c.label)}${state.sort === c.key ? (state.dir === "asc" ? " ▲" : " ▼") : ""}</th>`).join("")}${cfg.rowActions ? '<th class="px-4 py-3 text-right">Acciones</th>' : ""}</tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${slice.length ? slice.map((r, ri) => `<tr class="transition hover:bg-slate-800/40">
                  ${cfg.columns.map((c) => `<td class="px-4 py-3 ${c.cls || "text-slate-300"}">${c.html ? c.html(r) : esc(c.value ? c.value(r) : r[c.key])}</td>`).join("")}
                  ${cfg.rowActions ? `<td class="whitespace-nowrap px-4 py-3 text-right">${cfg.rowActions(r).map((a, ai) => `<button data-row="${ri}" data-ra="${ai}" class="${a.cls || "btn-mini"}" title="${esc(a.title || a.label)}">${a.label}</button>`).join(" ")}</td>` : ""}
                </tr>`).join("") : `<tr><td colspan="99" class="px-4 py-10 text-center text-slate-500">No hay registros que coincidan.</td></tr>`}
              </tbody>
            </table>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
            <span>${total} registro(s) — página ${state.page} de ${pages}</span>
            <div class="flex gap-2">
              <button data-prev class="btn-mini" ${state.page <= 1 ? "disabled" : ""}>← Anterior</button>
              <button data-next class="btn-mini" ${state.page >= pages ? "disabled" : ""}>Siguiente →</button>
            </div>
          </div>
        </div>`;

      const qEl = container.querySelector("[data-q]");
      qEl.oninput = (e) => { state.q = e.target.value; state.page = 1; render(); qEl.focus(); };
      container.querySelectorAll("[data-filter]").forEach((s) => (s.onchange = (e) => { state.filters[s.getAttribute("data-filter")] = e.target.value; state.page = 1; render(); }));
      container.querySelectorAll("[data-sort]").forEach((th) => (th.onclick = () => { const k = th.getAttribute("data-sort"); state.dir = state.sort === k && state.dir === "asc" ? "desc" : "asc"; state.sort = k; render(); }));
      container.querySelector("[data-prev]").onclick = () => { if (state.page > 1) { state.page--; render(); } };
      container.querySelector("[data-next]").onclick = () => { if (state.page < pages) { state.page++; render(); } };
      container.querySelectorAll("[data-act]").forEach((b) => (b.onclick = () => cfg.actions[Number(b.getAttribute("data-act"))].onClick(render)));
      container.querySelectorAll("[data-ra]").forEach((b) =>
        (b.onclick = () => { const r = slice[Number(b.getAttribute("data-row"))]; cfg.rowActions(r)[Number(b.getAttribute("data-ra"))].onClick(r, render); }));
    }
    render();
    return render;
  }

  const badge = (text, tone = "slate") => {
    const tones = {
      slate: "bg-slate-700/50 text-slate-300 ring-slate-600/50",
      green: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
      red: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
      amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
      blue: "bg-brand-500/15 text-brand-300 ring-brand-500/30",
      violet: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
    };
    return `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tones[tone] || tones.slate}">${esc(text)}</span>`;
  };

  const pageHeader = (title, subtitle, actions = "") => `
    <div class="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div class="min-w-0">
        <h1 class="truncate text-2xl font-bold text-slate-50 sm:text-3xl">${esc(title)}</h1>
        <p class="mt-1 text-sm text-slate-400">${esc(subtitle)}</p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">${actions}</div>
    </div>`;

  function download(filename, content, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  function toCSV(columns, rows) {
    const head = columns.join(",");
    const body = rows.map((r) => columns.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    return "\uFEFF" + head + "\n" + body;
  }

  /* Sparkline / barras simples en SVG */
  function barChart(data, { height = 160, color = "#3b6ef6" } = {}) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const w = 100 / Math.max(1, data.length);
    return `<svg viewBox="0 0 100 ${height / 2}" preserveAspectRatio="none" class="h-40 w-full">
      ${data.map((d, i) => {
        const h = (d.value / max) * (height / 2 - 6);
        return `<rect x="${i * w + w * 0.18}" y="${height / 2 - h}" width="${w * 0.64}" height="${h}" rx="1" fill="${color}" opacity="${0.55 + 0.45 * (d.value / max)}"><title>${esc(d.label)}: ${d.value}</title></rect>`;
      }).join("")}
    </svg>
    <div class="mt-2 flex justify-between text-[10px] text-slate-500">${data.map((d) => `<span class="flex-1 truncate text-center">${esc(d.short || d.label)}</span>`).join("")}</div>`;
  }

  function lineChart(points, { color = "#3b6ef6" } = {}) {
    if (!points.length) return '<p class="py-8 text-center text-sm text-slate-500">Sin datos</p>';
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const coords = points.map((p, i) => [(i / Math.max(1, points.length - 1)) * 100, 50 - ((p.value - min) / range) * 44 - 3]);
    const path = coords.map((c, i) => `${i ? "L" : "M"}${c[0].toFixed(2)},${c[1].toFixed(2)}`).join(" ");
    return `<svg viewBox="0 0 100 50" preserveAspectRatio="none" class="h-40 w-full">
      <path d="${path} L100,50 L0,50 Z" fill="${color}" opacity="0.12"/>
      <path d="${path}" fill="none" stroke="${color}" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      ${coords.map((c, i) => `<circle cx="${c[0]}" cy="${c[1]}" r="1.1" fill="${color}"><title>${esc(points[i].label)}: ${points[i].value}</title></circle>`).join("")}
    </svg>
    <div class="mt-2 flex justify-between text-[10px] text-slate-500">${points.map((p) => `<span class="flex-1 truncate text-center">${esc(p.short || p.label)}</span>`).join("")}</div>`;
  }

  /* QR simple (matriz determinista visual) */
  function qrSvg(text, size = 140) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    const n = 21, cells = [];
    let seed = h || 1;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      let on;
      if (finder) {
        const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else on = rnd() > 0.52;
      if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    return `<svg viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" class="rounded-lg bg-white p-1"><g fill="#0b1120">${cells.join("")}</g></svg>`;
  }

  window.SGC_UI = { esc, money, icon, toast, modal, confirmDialog, recordForm, dataTable, badge, pageHeader, download, toCSV, barChart, lineChart, qrSvg, fieldHtml, readForm };
})();
