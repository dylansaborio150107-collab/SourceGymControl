/* SourceGymControl - Vistas del sistema */
(function () {
  const S = window.SGC_SCHEMA;
  const DB = window.SGC_DB;
  const U = window.SGC_UI;
  const { esc, money, badge, pageHeader, toast, dataTable, recordForm, confirmDialog, modal, download, toCSV } = U;
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const hoyNombre = () => DIAS[(new Date().getDay() + 6) % 7];
  const fmt = window.SGC_UTIL;

  const estadoMembresiaBadge = (m) => {
    if (!m) return badge("Sin membresía", "slate");
    const d = DB.diasRestantes(m.FechaFin);
    if (d < 0) return badge(`Vencida (${Math.abs(d)}d)`, "red");
    if (d <= 7) return badge(`Vence en ${d}d`, "amber");
    return badge(`Vigente (${d}d)`, "green");
  };

  const card = (inner, cls = "") => `<div class="card p-5 ${cls}">${inner}</div>`;
  const stat = (label, value, sub, tone = "blue", ico = "dashboard") => `
    <div class="card relative overflow-hidden p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-xs font-medium uppercase tracking-wider text-slate-400">${esc(label)}</p>
          <p class="mt-2 text-3xl font-bold text-slate-50">${esc(value)}</p>
          <p class="mt-1 text-xs text-slate-500">${esc(sub)}</p>
        </div>
        <div class="rounded-xl bg-brand-500/15 p-2.5 text-brand-400">${U.icon(ico, "h-6 w-6")}</div>
      </div>
    </div>`;

  /* ============ DASHBOARD ============ */
  function dashboard(el) {
    const clientes = DB.all("Clientes");
    const activos = clientes.filter((c) => c.Estado === "Activo");
    const dentro = DB.dentroDelGym();
    const pagos = DB.all("Pagos");
    const now = new Date();
    const mesIngresos = pagos.filter((p) => p.Estado === "Pagado" && new Date(p.FechaPago).getMonth() === now.getMonth() && new Date(p.FechaPago).getFullYear() === now.getFullYear()).reduce((s, p) => s + Number(p.Monto), 0);
    const pendientes = pagos.filter((p) => p.Estado === "Pendiente");
    const alertas = DB.all("Alertas");
    const vencidas = alertas.filter((a) => a.Tipo === "Membresía vencida");
    const porVencer = alertas.filter((a) => a.Tipo === "Por vencer");
    const incompletas = DB.asistenciasIncompletas();

    const asistencia7 = [...Array(7)].map((_, i) => {
      const d = fmt.addDays(now, -(6 - i));
      const key = fmt.fmtDate(d);
      return { label: key, short: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"][d.getDay()], value: DB.all("Accesos").filter((a) => a.FechaHoraEntrada.startsWith(key)).length };
    });
    const ingresos6 = [...Array(6)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const v = pagos.filter((p) => p.Estado === "Pagado" && new Date(p.FechaPago).getMonth() === d.getMonth() && new Date(p.FechaPago).getFullYear() === d.getFullYear()).reduce((s, p) => s + Number(p.Monto), 0);
      return { label: d.toLocaleDateString("es-NI", { month: "long" }), short: d.toLocaleDateString("es-NI", { month: "short" }), value: Math.round(v) };
    });

    el.innerHTML = `
      ${pageHeader("Dashboard", `Resumen operativo — ${new Date().toLocaleDateString("es-NI", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
        `<button class="btn-ghost" data-go="#/accesos">Control de accesos</button><button class="btn-primary" data-go="#/clientes">+ Nuevo cliente</button>`)}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        ${stat("Clientes activos", activos.length, `${clientes.length} registrados en total`, "blue", "clientes")}
        ${stat("Dentro del gimnasio", dentro.length, "Personas actualmente adentro", "green", "accesos")}
        ${stat("Ingresos del mes", money(mesIngresos), `${pendientes.length} pago(s) pendiente(s)`, "violet", "pagos")}
        ${stat("Alertas activas", alertas.length, `${vencidas.length} vencidas · ${porVencer.length} por vencer`, "amber", "alertas")}
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <div class="mb-3 flex items-center justify-between"><h3 class="font-semibold text-slate-100">Asistencia últimos 7 días</h3><span class="text-xs text-slate-500">${asistencia7.reduce((s, d) => s + d.value, 0)} visitas</span></div>
          ${U.barChart(asistencia7)}
        </div>
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Dentro del gimnasio</h3>
          <div class="space-y-2">
            ${dentro.length ? dentro.map((a) => `<div class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-2">
                <div class="min-w-0"><p class="truncate text-sm font-medium text-slate-200">${esc(DB.clienteNombre(a.ClienteID))}</p><p class="text-xs text-slate-500">Entró ${esc(a.FechaHoraEntrada.slice(11, 16))}</p></div>
                ${badge("Dentro", "green")}
              </div>`).join("") : '<p class="py-6 text-center text-sm text-slate-500">Nadie dentro en este momento.</p>'}
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-2">
          <h3 class="mb-3 font-semibold text-slate-100">Ingresos últimos 6 meses</h3>
          ${U.lineChart(ingresos6, { color: "#22c55e" })}
        </div>
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Alertas recientes</h3>
          <div class="space-y-2">
            ${alertas.slice(0, 6).map((a) => `<div class="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
              <div class="flex items-center gap-2">${badge(a.Tipo, a.Severidad === "Alta" ? "red" : "amber")}</div>
              <p class="mt-1.5 text-xs text-slate-400">${esc(a.Mensaje)}</p></div>`).join("") || '<p class="py-6 text-center text-sm text-slate-500">Sin alertas 🎉</p>'}
          </div>
          ${incompletas.length ? `<p class="mt-3 text-xs text-amber-400">⚠️ ${incompletas.length} asistencia(s) sin salida registrada.</p>` : ""}
        </div>
      </div>`;
    el.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => (location.hash = b.getAttribute("data-go"))));
  }

  /* ============ CLIENTES ============ */
  function clientes(el) {
    el.innerHTML = pageHeader("Clientes", "Registro, perfil físico, objetivos y membresía", "") + '<div id="tbl"></div>';
    const refresh = dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all("Clientes"),
      pageSize: 8,
      sort: "ClienteID",
      filters: [
        { key: "Estado", label: "Estado", options: ["Activo", "Inactivo", "Suspendido"] },
        { key: "NivelExperiencia", label: "Nivel", options: ["Principiante", "Intermedio", "Avanzado"] },
        { key: "Sexo", label: "Sexo", options: ["Masculino", "Femenino"] },
      ],
      actions: [
        { label: "+ Nuevo cliente", onClick: (r) => recordForm("Clientes", null, { defaults: { Codigo: "SGC-" + (1000 + DB.nextId("Clientes")), FechaRegistro: fmt.fmtDate(new Date()), Estado: "Activo" }, onSaved: r }) },
        { label: "Exportar CSV", cls: "btn-ghost", onClick: () => { const cols = S.tables.Clientes.columns.map((c) => c.name); download("clientes.csv", toCSV(cols, DB.all("Clientes")), "text/csv"); toast("Archivo CSV descargado."); } },
      ],
      columns: [
        { key: "Codigo", label: "Código", html: (r) => `<span class="font-mono text-brand-300">${esc(r.Codigo)}</span>` },
        { key: "Nombres", label: "Cliente", value: (r) => `${r.Nombres} ${r.Apellidos}`, html: (r) => `<div class="min-w-0"><p class="font-medium text-slate-100">${esc(r.Nombres)} ${esc(r.Apellidos)}</p><p class="text-xs text-slate-500">${esc(r.Correo || "")}</p></div>` },
        { key: "Edad", label: "Edad" },
        { key: "NivelExperiencia", label: "Nivel", html: (r) => badge(r.NivelExperiencia || "—", "violet") },
        { key: "ObjetivoID", label: "Objetivo", value: (r) => (DB.find("Objetivos", r.ObjetivoID) || {}).Nombre || "—" },
        { key: "membresia", label: "Membresía", value: (r) => { const m = DB.membresiaActual(r.ClienteID); return m ? m.FechaFin : ""; }, html: (r) => estadoMembresiaBadge(DB.membresiaActual(r.ClienteID)) },
        { key: "Estado", label: "Estado", html: (r) => badge(r.Estado, r.Estado === "Activo" ? "green" : "slate") },
      ],
      rowActions: (row) => [
        { label: "Ver", cls: "btn-mini", onClick: () => (location.hash = "#/clientes/" + row.ClienteID) },
        { label: "Editar", cls: "btn-mini", onClick: (r, re) => recordForm("Clientes", row.ClienteID, { onSaved: re }) },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog(`¿Eliminar a ${row.Nombres} ${row.Apellidos}? También se quitarán sus membresías, pagos, rutinas y accesos.`, () => {
            ["Membresias", "Pagos", "Accesos", "Progreso"].forEach((t) => DB.where(t, (x) => String(x.ClienteID) === String(row.ClienteID)).forEach((x) => DB.remove(t, x[S.tables[t].pk], false)));
            DB.where("Rutinas", (x) => String(x.ClienteID) === String(row.ClienteID)).forEach((ru) => {
              DB.where("RutinaDetalle", (d) => d.RutinaID === ru.RutinaID).forEach((d) => DB.remove("RutinaDetalle", d.DetalleID, false));
              DB.remove("Rutinas", ru.RutinaID, false);
            });
            DB.remove("Clientes", row.ClienteID);
            DB.refreshAlertas(); toast("Cliente eliminado.", "warn"); re();
          }) },
      ],
    });
    DB.on(() => {});
    return refresh;
  }

  function clienteDetalle(el, id) {
    const c = DB.find("Clientes", id);
    if (!c) { el.innerHTML = `<p class="text-slate-400">Cliente no encontrado.</p>`; return; }
    const m = DB.membresiaActual(c.ClienteID);
    const pagos = DB.where("Pagos", (p) => String(p.ClienteID) === String(id));
    const accesos = DB.where("Accesos", (a) => String(a.ClienteID) === String(id)).sort((a, b) => (a.FechaHoraEntrada < b.FechaHoraEntrada ? 1 : -1));
    const rutinas = DB.where("Rutinas", (r) => String(r.ClienteID) === String(id));
    const prog = DB.where("Progreso", (p) => String(p.ClienteID) === String(id)).sort((a, b) => (a.Fecha > b.Fecha ? 1 : -1));
    const imc = c.Altura_cm && c.Peso_kg ? (c.Peso_kg / Math.pow(c.Altura_cm / 100, 2)).toFixed(1) : "—";
    const obj = DB.find("Objetivos", c.ObjetivoID);

    el.innerHTML = `
      ${pageHeader(`${c.Nombres} ${c.Apellidos}`, `Código ${c.Codigo} · Registrado el ${c.FechaRegistro}`,
        `<button class="btn-ghost" data-back>← Volver</button><button class="btn-ghost" data-qr>Ver QR</button><button class="btn-primary" data-edit>Editar cliente</button>`)}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Perfil físico</h3>
          <dl class="grid grid-cols-2 gap-3 text-sm">
            ${[["Edad", c.Edad + " años"], ["Sexo", c.Sexo], ["Altura", c.Altura_cm + " cm"], ["Peso", c.Peso_kg + " kg"], ["IMC", imc], ["Nivel", c.NivelExperiencia], ["Objetivo", obj ? obj.Nombre : "—"], ["Días disp.", c.DiasDisponibles]]
              .map(([k, v]) => `<div><dt class="text-xs uppercase tracking-wide text-slate-500">${esc(k)}</dt><dd class="text-slate-200">${esc(v || "—")}</dd></div>`).join("")}
          </dl>
          <div class="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200">⚕️ Lesiones/limitaciones: ${esc(c.Lesiones || "Ninguna")}</div>
          <div class="mt-2 rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-300">🎯 Zonas a trabajar: ${esc(c.ZonasInteres || "—")}</div>
        </div>
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Membresía y pagos</h3>
          ${m ? `<p class="text-sm text-slate-300">${esc((DB.find("TiposMembresia", m.TipoMembresiaID) || {}).Nombre || "")} · ${esc(m.FechaInicio)} → ${esc(m.FechaFin)}</p><div class="mt-2">${estadoMembresiaBadge(m)}</div>` : '<p class="text-sm text-slate-500">Sin membresía registrada.</p>'}
          <div class="mt-4 space-y-2">
            ${pagos.slice(-4).reverse().map((p) => `<div class="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm"><span class="text-slate-300">${esc(p.FechaPago)} · ${esc(p.MetodoPago)}</span><span class="flex items-center gap-2 text-slate-100">${money(p.Monto)} ${badge(p.Estado, p.Estado === "Pagado" ? "green" : "amber")}</span></div>`).join("") || '<p class="text-sm text-slate-500">Sin pagos.</p>'}
          </div>
          <button class="btn-ghost mt-4 w-full" data-pago>+ Registrar pago</button>
        </div>
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Progreso físico</h3>
          ${prog.length ? U.lineChart(prog.map((p) => ({ label: p.Fecha, short: p.Fecha.slice(5), value: Number(p.Peso_kg) })), { color: "#22c55e" }) : '<p class="py-6 text-center text-sm text-slate-500">Sin mediciones.</p>'}
          <button class="btn-ghost mt-3 w-full" data-prog>+ Nueva medición</button>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="card p-5">
          <div class="mb-3 flex items-center justify-between"><h3 class="font-semibold text-slate-100">Rutinas asignadas</h3><button class="btn-mini" data-rutina>Programador</button></div>
          ${rutinas.map((r) => `<div class="mb-2 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
              <div class="flex flex-wrap items-center justify-between gap-2"><p class="font-medium text-slate-100">${esc(r.Nombre)}</p>${badge(r.Estado, r.Estado === "Activa" ? "green" : "slate")}</div>
              <p class="mt-1 text-xs text-slate-500">v${r.Version} · ${esc(r.FechaInicio)} → ${esc(r.FechaFin || "—")} · ${r.DiasPorSemana} días/semana · ${esc((DB.find("Entrenadores", r.EntrenadorID) || {}).Nombres || "Sin entrenador")}</p>
              <p class="mt-1 text-xs text-slate-400">${DB.where("RutinaDetalle", (d) => d.RutinaID === r.RutinaID).length} ejercicios programados</p>
            </div>`).join("") || '<p class="text-sm text-slate-500">Sin rutinas asignadas.</p>'}
        </div>
        <div class="card p-5">
          <h3 class="mb-3 font-semibold text-slate-100">Últimos accesos</h3>
          <div class="max-h-72 space-y-2 overflow-y-auto">
            ${accesos.slice(0, 12).map((a) => `<div class="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm">
              <span class="text-slate-300">${esc(a.FechaHoraEntrada)}</span>
              <span>${a.FechaHoraSalida ? `<span class="text-slate-400">→ ${esc(a.FechaHoraSalida.slice(11, 16))}</span>` : badge(a.Estado === "Incompleto" ? "Sin salida" : "Dentro", a.Estado === "Incompleto" ? "amber" : "green")}</span></div>`).join("") || '<p class="text-sm text-slate-500">Sin accesos.</p>'}
          </div>
        </div>
      </div>`;

    el.querySelector("[data-back]").onclick = () => (location.hash = "#/clientes");
    el.querySelector("[data-edit]").onclick = () => recordForm("Clientes", id, { onSaved: () => clienteDetalle(el, id) });
    el.querySelector("[data-pago]").onclick = () => recordForm("Pagos", null, { defaults: { ClienteID: Number(id), MembresiaID: m ? m.MembresiaID : null, FechaPago: fmt.fmtDate(new Date()), Estado: "Pagado" }, onSaved: () => clienteDetalle(el, id) });
    el.querySelector("[data-prog]").onclick = () => recordForm("Progreso", null, { defaults: { ClienteID: Number(id), Fecha: fmt.fmtDate(new Date()) }, onSaved: () => clienteDetalle(el, id) });
    el.querySelector("[data-rutina]").onclick = () => (location.hash = "#/programador/" + id);
    el.querySelector("[data-qr]").onclick = () => modal({
      title: "Credencial de acceso", size: "max-w-sm",
      body: `<div class="flex flex-col items-center gap-3 py-2">${U.qrSvg(c.Codigo, 180)}<p class="font-mono text-lg text-brand-300">${esc(c.Codigo)}</p><p class="text-center text-sm text-slate-400">${esc(c.Nombres)} ${esc(c.Apellidos)}</p></div>`,
      footer: `<button data-print class="btn-primary">Imprimir</button>`,
      onMount: (h) => (h.querySelector("[data-print]").onclick = () => window.print()),
    });
  }

  /* ============ MEMBRESÍAS ============ */
  function membresias(el) {
    el.innerHTML = pageHeader("Membresías", "Planes, vigencias y renovaciones", "") +
      `<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">${DB.all("TiposMembresia").map((t) => `<div class="card p-4"><p class="text-sm font-semibold text-slate-100">${esc(t.Nombre)}</p><p class="mt-1 text-2xl font-bold text-brand-400">${money(t.Precio)}</p><p class="text-xs text-slate-500">${t.DuracionDias} días</p></div>`).join("")}</div>
      <div id="tbl"></div>`;
    dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all("Membresias"),
      filters: [{ key: "Estado", label: "Estado", options: ["Activa", "Vencida", "Cancelada"] }],
      actions: [
        { label: "+ Nueva membresía", onClick: (r) => recordForm("Membresias", null, { defaults: { FechaInicio: fmt.fmtDate(new Date()), FechaFin: fmt.fmtDate(fmt.addDays(new Date(), 30)), Estado: "Activa" }, onSaved: () => { DB.refreshAlertas(); r(); } }) },
        { label: "Tipos de plan", cls: "btn-ghost", onClick: () => (location.hash = "#/tipos-membresia") },
      ],
      columns: [
        { key: "MembresiaID", label: "ID" },
        { key: "ClienteID", label: "Cliente", value: (r) => DB.clienteNombre(r.ClienteID) },
        { key: "TipoMembresiaID", label: "Plan", value: (r) => (DB.find("TiposMembresia", r.TipoMembresiaID) || {}).Nombre || "—" },
        { key: "FechaInicio", label: "Inicio" },
        { key: "FechaFin", label: "Vence" },
        { key: "dias", label: "Restante", value: (r) => DB.diasRestantes(r.FechaFin), html: (r) => estadoMembresiaBadge(r) },
        { key: "Estado", label: "Estado", html: (r) => badge(r.Estado, r.Estado === "Activa" ? "green" : r.Estado === "Vencida" ? "red" : "slate") },
      ],
      rowActions: (row) => [
        { label: "Renovar", cls: "btn-mini", onClick: (r, re) => {
            const tipo = DB.find("TiposMembresia", row.TipoMembresiaID);
            const ini = new Date(); const fin = fmt.addDays(ini, tipo ? tipo.DuracionDias : 30);
            DB.update("Membresias", row.MembresiaID, { FechaInicio: fmt.fmtDate(ini), FechaFin: fmt.fmtDate(fin), Estado: "Activa" });
            DB.insert("Pagos", { ClienteID: row.ClienteID, MembresiaID: row.MembresiaID, Monto: tipo ? tipo.Precio : 0, MetodoPago: "Efectivo", FechaPago: fmt.fmtDate(ini), Estado: "Pagado", Referencia: "REN-" + Date.now().toString().slice(-6), UsuarioID: window.SGC_SESSION?.usuario?.UsuarioID || null });
            DB.refreshAlertas(); toast("Membresía renovada y pago registrado."); re();
          } },
        { label: "Editar", cls: "btn-mini", onClick: (r, re) => recordForm("Membresias", row.MembresiaID, { onSaved: () => { DB.refreshAlertas(); re(); } }) },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog("¿Eliminar esta membresía?", () => { DB.remove("Membresias", row.MembresiaID); DB.refreshAlertas(); toast("Membresía eliminada.", "warn"); re(); }) },
      ],
    });
  }

  /* ============ ACCESOS ============ */
  function accesos(el) {
    const dentro = DB.dentroDelGym();
    el.innerHTML = `
      ${pageHeader("Control de accesos", "Entrada y salida por QR o código de cliente", "")}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="card p-5 lg:col-span-1">
          <h3 class="mb-3 font-semibold text-slate-100">🔐 Lector QR / Código</h3>
          <input id="codigo" placeholder="Escanea o escribe el código (ej. SGC-1001)" class="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-3 text-center font-mono text-lg text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30">
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button id="btn-in" class="btn-primary">→ Entrada</button>
            <button id="btn-out" class="btn-ghost">Salida ←</button>
          </div>
          <div id="scan-result" class="mt-3"></div>
          <p class="mt-3 text-xs text-slate-500">Sugerencia: prueba con ${DB.all("Clientes").slice(0, 3).map((c) => `<button class="quick font-mono text-brand-400 hover:underline" data-code="${esc(c.Codigo)}">${esc(c.Codigo)}</button>`).join(", ")}</p>
        </div>
        <div class="card p-5 lg:col-span-2">
          <h3 class="mb-3 font-semibold text-slate-100">Personas dentro del gimnasio (${dentro.length})</h3>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            ${dentro.map((a) => `<div class="flex items-center justify-between rounded-xl border border-emerald-600/25 bg-emerald-500/5 px-3 py-2">
              <div class="min-w-0"><p class="truncate text-sm font-medium text-slate-100">${esc(DB.clienteNombre(a.ClienteID))}</p><p class="text-xs text-slate-500">Desde ${esc(a.FechaHoraEntrada.slice(11, 16))}</p></div>
              <button class="btn-mini" data-out="${a.AccesoID}">Marcar salida</button></div>`).join("") || '<p class="text-sm text-slate-500">Nadie dentro en este momento.</p>'}
          </div>
        </div>
      </div>
      <div class="mt-4" id="tbl"></div>`;

    const doScan = (tipo) => {
      const code = el.querySelector("#codigo").value.trim();
      if (!code) return toast("Ingresa un código o QR.", "warn");
      const res = tipo === "in" ? DB.registrarEntrada(code) : DB.registrarSalida(code);
      el.querySelector("#scan-result").innerHTML = `<div class="rounded-xl border ${res.ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"} p-3 text-sm">${esc(res.msg)}</div>`;
      toast(res.msg, res.ok ? "ok" : "err");
      if (res.ok) { DB.refreshAlertas(); setTimeout(() => accesos(el), 700); }
    };
    el.querySelector("#btn-in").onclick = () => doScan("in");
    el.querySelector("#btn-out").onclick = () => doScan("out");
    el.querySelector("#codigo").addEventListener("keydown", (e) => { if (e.key === "Enter") doScan("in"); });
    el.querySelectorAll(".quick").forEach((b) => (b.onclick = () => (el.querySelector("#codigo").value = b.getAttribute("data-code"))));
    el.querySelectorAll("[data-out]").forEach((b) => (b.onclick = () => {
      DB.update("Accesos", b.getAttribute("data-out"), { FechaHoraSalida: fmt.fmtDT(new Date()), Estado: "Finalizado" });
      toast("Salida registrada."); accesos(el);
    }));

    dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all("Accesos").slice().sort((a, b) => (a.FechaHoraEntrada < b.FechaHoraEntrada ? 1 : -1)),
      filters: [{ key: "Estado", label: "Estado", options: ["Dentro", "Finalizado", "Incompleto"] }, { key: "MetodoAcceso", label: "Método", options: ["QR", "Código", "Manual"] }],
      actions: [
        { label: "+ Registro manual", onClick: (r) => recordForm("Accesos", null, { defaults: { FechaHoraEntrada: fmt.fmtDT(new Date()), MetodoAcceso: "Manual", Estado: "Dentro" }, onSaved: () => accesos(el) }) },
        { label: "Exportar CSV", cls: "btn-ghost", onClick: () => { download("accesos.csv", toCSV(S.tables.Accesos.columns.map((c) => c.name), DB.all("Accesos")), "text/csv"); toast("CSV descargado."); } },
      ],
      columns: [
        { key: "AccesoID", label: "ID" },
        { key: "ClienteID", label: "Cliente", value: (r) => DB.clienteNombre(r.ClienteID) },
        { key: "FechaHoraEntrada", label: "Entrada" },
        { key: "FechaHoraSalida", label: "Salida", value: (r) => r.FechaHoraSalida || "—" },
        { key: "dur", label: "Duración", value: (r) => r.FechaHoraSalida ? Math.round((new Date(r.FechaHoraSalida.replace(" ", "T")) - new Date(r.FechaHoraEntrada.replace(" ", "T"))) / 60000) + " min" : "—" },
        { key: "MetodoAcceso", label: "Método", html: (r) => badge(r.MetodoAcceso, "blue") },
        { key: "Estado", label: "Estado", html: (r) => badge(r.Estado, r.Estado === "Finalizado" ? "green" : r.Estado === "Dentro" ? "blue" : "amber") },
      ],
      rowActions: (row) => [
        { label: "Editar", cls: "btn-mini", onClick: (r, re) => recordForm("Accesos", row.AccesoID, { onSaved: re }) },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog("¿Eliminar este registro de acceso?", () => { DB.remove("Accesos", row.AccesoID); toast("Registro eliminado.", "warn"); re(); }) },
      ],
    });
  }

  /* ============ PAGOS ============ */
  function pagos(el) {
    const all = DB.all("Pagos");
    const totalPagado = all.filter((p) => p.Estado === "Pagado").reduce((s, p) => s + Number(p.Monto), 0);
    const totalPend = all.filter((p) => p.Estado === "Pendiente").reduce((s, p) => s + Number(p.Monto), 0);
    el.innerHTML = pageHeader("Pagos", "Ingresos, métodos de pago y cobros pendientes", "") +
      `<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        ${stat("Total cobrado", money(totalPagado), all.filter((p) => p.Estado === "Pagado").length + " pagos", "green", "pagos")}
        ${stat("Pendiente por cobrar", money(totalPend), all.filter((p) => p.Estado === "Pendiente").length + " pagos", "amber", "alertas")}
        ${stat("Ticket promedio", money(all.length ? totalPagado / Math.max(1, all.filter((p) => p.Estado === "Pagado").length) : 0), "por transacción", "blue", "reportes")}
      </div><div id="tbl"></div>`;
    dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all("Pagos").slice().reverse(),
      filters: [{ key: "Estado", label: "Estado", options: ["Pagado", "Pendiente", "Anulado"] }, { key: "MetodoPago", label: "Método", options: ["Efectivo", "Tarjeta", "Transferencia", "Móvil"] }],
      actions: [
        { label: "+ Registrar pago", onClick: (r) => recordForm("Pagos", null, { defaults: { FechaPago: fmt.fmtDate(new Date()), Estado: "Pagado", MetodoPago: "Efectivo" }, onSaved: () => { DB.refreshAlertas(); pagos(el); } }) },
        { label: "Exportar CSV", cls: "btn-ghost", onClick: () => { download("pagos.csv", toCSV(S.tables.Pagos.columns.map((c) => c.name), DB.all("Pagos")), "text/csv"); toast("CSV descargado."); } },
      ],
      columns: [
        { key: "PagoID", label: "ID" },
        { key: "ClienteID", label: "Cliente", value: (r) => DB.clienteNombre(r.ClienteID) },
        { key: "Monto", label: "Monto", html: (r) => `<span class="font-semibold text-slate-100">${money(r.Monto)}</span>` },
        { key: "MetodoPago", label: "Método" },
        { key: "FechaPago", label: "Fecha" },
        { key: "Referencia", label: "Referencia" },
        { key: "Estado", label: "Estado", html: (r) => badge(r.Estado, r.Estado === "Pagado" ? "green" : r.Estado === "Pendiente" ? "amber" : "slate") },
      ],
      rowActions: (row) => [
        ...(row.Estado === "Pendiente" ? [{ label: "Cobrar", cls: "btn-mini", onClick: (r, re) => { DB.update("Pagos", row.PagoID, { Estado: "Pagado", FechaPago: fmt.fmtDate(new Date()) }); DB.refreshAlertas(); toast("Pago marcado como cobrado."); pagos(el); } }] : []),
        { label: "Editar", cls: "btn-mini", onClick: (r, re) => recordForm("Pagos", row.PagoID, { onSaved: () => { DB.refreshAlertas(); re(); } }) },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog("¿Eliminar este pago?", () => { DB.remove("Pagos", row.PagoID); DB.refreshAlertas(); toast("Pago eliminado.", "warn"); re(); }) },
      ],
    });
  }

  /* ============ TABLA GENÉRICA ============ */
  function genericTable(el, table, title, subtitle, cols) {
    const def = S.tables[table];
    el.innerHTML = pageHeader(title, subtitle, "") + '<div id="tbl"></div>';
    dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all(table),
      actions: [
        { label: "+ Nuevo", onClick: (r) => recordForm(table, null, { onSaved: r }) },
        { label: "Exportar CSV", cls: "btn-ghost", onClick: () => { download(table.toLowerCase() + ".csv", toCSV(def.columns.map((c) => c.name), DB.all(table)), "text/csv"); toast("CSV descargado."); } },
      ],
      columns: cols || def.columns.slice(0, 7).map((c) => ({ key: c.name, label: c.label, value: (r) => (c.ui === "fk" ? refLabel(c, r[c.name]) : c.ui === "bool" ? (r[c.name] ? "Sí" : "No") : r[c.name]) })),
      rowActions: (row) => [
        { label: "Editar", cls: "btn-mini", onClick: (r, re) => recordForm(table, row[def.pk], { onSaved: re }) },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog("¿Eliminar este registro?", () => { DB.remove(table, row[def.pk]); toast("Registro eliminado.", "warn"); re(); }) },
      ],
    });
  }
  function refLabel(col, val) {
    if (val == null) return "—";
    const r = DB.find(col.ref, val);
    if (!r) return "—";
    return r.Nombres ? `${r.Nombres} ${r.Apellidos || ""}`.trim() : r.Nombre || r.NombreCompleto || "#" + val;
  }

  /* ============ RUTINAS ============ */
  function rutinas(el) {
    el.innerHTML = pageHeader("Rutinas de entrenamiento", "Planes personalizados por objetivo, nivel y disponibilidad",
      `<button class="btn-primary" data-new>+ Programar rutina</button>`) + '<div id="tbl"></div>';
    el.querySelector("[data-new]").onclick = () => (location.hash = "#/programador");
    dataTable(el.querySelector("#tbl"), {
      rows: () => DB.all("Rutinas").slice().reverse(),
      filters: [{ key: "Estado", label: "Estado", options: ["Activa", "Finalizada", "Archivada"] }, { key: "Nivel", label: "Nivel", options: ["Principiante", "Intermedio", "Avanzado"] }],
      actions: [{ label: "+ Programador de rutinas", onClick: () => (location.hash = "#/programador") }],
      columns: [
        { key: "RutinaID", label: "ID" },
        { key: "Nombre", label: "Rutina", html: (r) => `<div><p class="font-medium text-slate-100">${esc(r.Nombre)}</p><p class="text-xs text-slate-500">v${r.Version} · ${DB.where("RutinaDetalle", (d) => d.RutinaID === r.RutinaID).length} ejercicios</p></div>` },
        { key: "ClienteID", label: "Cliente", value: (r) => DB.clienteNombre(r.ClienteID) },
        { key: "EntrenadorID", label: "Entrenador", value: (r) => { const e = DB.find("Entrenadores", r.EntrenadorID); return e ? `${e.Nombres} ${e.Apellidos}` : "—"; } },
        { key: "ObjetivoID", label: "Objetivo", value: (r) => (DB.find("Objetivos", r.ObjetivoID) || {}).Nombre || "—" },
        { key: "DiasPorSemana", label: "Días/sem" },
        { key: "Estado", label: "Estado", html: (r) => badge(r.Estado, r.Estado === "Activa" ? "green" : "slate") },
      ],
      rowActions: (row) => [
        { label: "Editar plan", cls: "btn-mini", onClick: () => (location.hash = "#/programador/" + row.ClienteID + "/" + row.RutinaID) },
        { label: "Ver", cls: "btn-mini", onClick: () => verRutina(row.RutinaID) },
        { label: "Nueva versión", cls: "btn-mini", onClick: (r, re) => {
            const nueva = DB.insert("Rutinas", Object.assign({}, row, { RutinaID: undefined, Version: (row.Version || 1) + 1, FechaCreacion: fmt.fmtDT(new Date()), Estado: "Activa" }));
            DB.where("RutinaDetalle", (d) => d.RutinaID === row.RutinaID).forEach((d) => DB.insert("RutinaDetalle", Object.assign({}, d, { DetalleID: undefined, RutinaID: nueva.RutinaID }), false));
            DB.update("Rutinas", row.RutinaID, { Estado: "Archivada" }, false);
            toast("Nueva versión creada. La anterior quedó en el historial."); re();
          } },
        { label: "Eliminar", cls: "btn-mini-danger", onClick: (r, re) => confirmDialog("¿Eliminar la rutina y su detalle?", () => {
            DB.where("RutinaDetalle", (d) => d.RutinaID === row.RutinaID).forEach((d) => DB.remove("RutinaDetalle", d.DetalleID, false));
            DB.remove("Rutinas", row.RutinaID); toast("Rutina eliminada.", "warn"); re();
          }) },
      ],
    });
  }

  function verRutina(rutinaId) {
    const r = DB.find("Rutinas", rutinaId);
    const det = DB.where("RutinaDetalle", (d) => d.RutinaID === Number(rutinaId));
    const porDia = DIAS.filter((d) => det.some((x) => x.DiaSemana === d));
    modal({
      title: r.Nombre, size: "max-w-3xl",
      body: `<p class="mb-4 text-sm text-slate-400">${esc(DB.clienteNombre(r.ClienteID))} · ${esc((DB.find("Objetivos", r.ObjetivoID) || {}).Nombre || "")} · ${esc(r.Nivel || "")} · Progresión: ${esc(r.ProgresionSemanal || "—")}</p>
        <div class="space-y-4">${porDia.map((dia) => `
          <div class="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
            <h4 class="mb-2 font-semibold text-brand-300">${esc(dia)}</h4>
            <div class="space-y-1.5">${det.filter((x) => x.DiaSemana === dia).sort((a, b) => a.Orden - b.Orden).map((x) => {
              const e = DB.find("Ejercicios", x.EjercicioID) || {};
              return `<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-900/60 px-3 py-2 text-sm">
                <span class="text-slate-200">${esc(e.Nombre || "")} <span class="text-xs text-slate-500">(${esc(e.GrupoMuscular || "")})</span></span>
                <span class="text-slate-400">${x.Series} × ${esc(x.Repeticiones)}${x.PesoKg ? " — " + x.PesoKg + " kg" : ""} · ⏱ ${x.DescansoSeg}s</span></div>`;
            }).join("")}</div>
          </div>`).join("")}</div>
        <div class="mt-4 rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">📝 ${esc(r.Observaciones || "Sin observaciones")}</div>`,
      footer: `<button data-print class="btn-primary">Imprimir rutina</button>`,
      onMount: (h) => (h.querySelector("[data-print]").onclick = () => window.print()),
    });
  }

  /* ============ PROGRAMADOR DE RUTINAS (drag & drop) ============ */
  function programador(el, clienteId, rutinaId) {
    let rutina = rutinaId ? DB.find("Rutinas", rutinaId) : null;
    let cliente = rutina ? DB.find("Clientes", rutina.ClienteID) : clienteId ? DB.find("Clientes", clienteId) : DB.all("Clientes")[0];
    let plan = {};
    DIAS.forEach((d) => (plan[d] = []));
    if (rutina) DB.where("RutinaDetalle", (d) => d.RutinaID === rutina.RutinaID).sort((a, b) => a.Orden - b.Orden)
      .forEach((d) => plan[d.DiaSemana].push({ EjercicioID: d.EjercicioID, Series: d.Series, Repeticiones: d.Repeticiones, PesoKg: d.PesoKg, DescansoSeg: d.DescansoSeg, Notas: d.Notas || "" }));

    const grupos = [...new Set(DB.all("Ejercicios").map((e) => e.GrupoMuscular))];

    function render() {
      const objetivo = DB.find("Objetivos", cliente?.ObjetivoID);
      el.innerHTML = `
        ${pageHeader("Programador de rutinas", "Arrastra ejercicios a cada día, ajusta series, repeticiones, peso y descanso",
          `<button class="btn-ghost" data-sug>⚡ Sugerir rutina automática</button><button class="btn-primary" data-save>💾 Guardar y asignar</button>`)}
        <div class="mb-4 card p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><label class="lbl">Cliente</label><select id="cli" class="inp">${DB.all("Clientes").map((c) => `<option value="${c.ClienteID}" ${cliente && c.ClienteID === cliente.ClienteID ? "selected" : ""}>${esc(c.Nombres)} ${esc(c.Apellidos)} — ${esc(c.Codigo)}</option>`).join("")}</select></div>
            <div><label class="lbl">Entrenador</label><select id="ent" class="inp">${DB.all("Entrenadores").map((e) => `<option value="${e.EntrenadorID}" ${rutina && rutina.EntrenadorID === e.EntrenadorID ? "selected" : ""}>${esc(e.Nombres)} ${esc(e.Apellidos)}</option>`).join("")}</select></div>
            <div><label class="lbl">Nombre de la rutina</label><input id="nom" class="inp" value="${esc(rutina ? rutina.Nombre : `Plan ${objetivo ? objetivo.Nombre : "personalizado"} - ${cliente ? cliente.Nombres : ""}`)}"></div>
            <div><label class="lbl">Objetivo</label><select id="obj" class="inp">${DB.all("Objetivos").map((o) => `<option value="${o.ObjetivoID}" ${(rutina ? rutina.ObjetivoID : cliente?.ObjetivoID) === o.ObjetivoID ? "selected" : ""}>${esc(o.Nombre)}</option>`).join("")}</select></div>
            <div><label class="lbl">Fecha inicio</label><input id="fi" type="date" class="inp" value="${esc(rutina ? rutina.FechaInicio : fmt.fmtDate(new Date()))}"></div>
            <div><label class="lbl">Fecha fin</label><input id="ff" type="date" class="inp" value="${esc(rutina ? rutina.FechaFin : fmt.fmtDate(fmt.addDays(new Date(), 60)))}"></div>
            <div><label class="lbl">Progresión semanal</label><input id="prog" class="inp" value="${esc(rutina ? rutina.ProgresionSemanal : "+2.5% carga semanal")}"></div>
            <div><label class="lbl">Nivel</label><select id="niv" class="inp">${["Principiante", "Intermedio", "Avanzado"].map((n) => `<option ${((rutina && rutina.Nivel) || cliente?.NivelExperiencia) === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
            <div class="sm:col-span-2 lg:col-span-4"><label class="lbl">Observaciones del entrenador</label><textarea id="obs" rows="2" class="inp">${esc(rutina ? rutina.Observaciones || "" : "")}</textarea></div>
          </div>
          ${cliente ? `<div class="mt-3 flex flex-wrap gap-2 text-xs">
            ${badge("Nivel: " + (cliente.NivelExperiencia || "—"), "violet")}${badge("Objetivo: " + (objetivo ? objetivo.Nombre : "—"), "blue")}
            ${badge("Días disp.: " + (cliente.DiasDisponibles || "—"), "slate")}${badge("Zonas: " + (cliente.ZonasInteres || "—"), "slate")}
            ${cliente.Lesiones && cliente.Lesiones !== "Ninguna" ? badge("⚕️ " + cliente.Lesiones, "amber") : ""}
          </div>` : ""}
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div class="card p-4 lg:col-span-1">
            <h3 class="mb-2 font-semibold text-slate-100">Catálogo de ejercicios</h3>
            <input id="busca" placeholder="Buscar ejercicio..." class="inp mb-2">
            <select id="grp" class="inp mb-3"><option value="">Todos los grupos</option>${grupos.map((g) => `<option>${esc(g)}</option>`).join("")}</select>
            <div id="cat" class="max-h-[520px] space-y-1.5 overflow-y-auto pr-1"></div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 xl:grid-cols-3">
            ${DIAS.map((d) => `
              <div class="card flex flex-col p-3" data-day="${d}">
                <div class="mb-2 flex items-center justify-between"><h4 class="font-semibold text-brand-300">${d}</h4><span class="text-xs text-slate-500">${plan[d].length} ej.</span></div>
                <div class="dropzone min-h-[120px] flex-1 space-y-2 rounded-xl border-2 border-dashed border-slate-700 p-2 transition" data-drop="${d}">
                  ${plan[d].map((x, i) => {
                    const e = DB.find("Ejercicios", x.EjercicioID) || {};
                    return `<div class="rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-xs" draggable="true" data-move="${d}|${i}">
                      <div class="flex items-start justify-between gap-2"><p class="font-medium text-slate-100">${esc(e.Nombre || "")}</p><button data-del="${d}|${i}" class="text-rose-400 hover:text-rose-300">✕</button></div>
                      <p class="text-[10px] text-slate-500">${esc(e.GrupoMuscular || "")}</p>
                      <div class="mt-1.5 grid grid-cols-4 gap-1">
                        <input data-f="${d}|${i}|Series" value="${esc(x.Series)}" title="Series" class="minp"><input data-f="${d}|${i}|Repeticiones" value="${esc(x.Repeticiones)}" title="Reps" class="minp">
                        <input data-f="${d}|${i}|PesoKg" value="${esc(x.PesoKg ?? "")}" title="Peso kg" class="minp"><input data-f="${d}|${i}|DescansoSeg" value="${esc(x.DescansoSeg)}" title="Descanso s" class="minp">
                      </div>
                      <p class="mt-1 text-[10px] text-slate-500">series × reps × kg × descanso(s)</p>
                    </div>`;
                  }).join("") || '<p class="py-6 text-center text-[11px] text-slate-600">Arrastra ejercicios aquí</p>'}
                </div>
              </div>`).join("")}
          </div>
        </div>`;

      renderCatalogo();
      bind();
    }

    function renderCatalogo() {
      const q = (el.querySelector("#busca")?.value || "").toLowerCase();
      const g = el.querySelector("#grp")?.value || "";
      const list = DB.all("Ejercicios").filter((e) => (!g || e.GrupoMuscular === g) && (!q || e.Nombre.toLowerCase().includes(q)));
      el.querySelector("#cat").innerHTML = list.map((e) => `
        <div class="cursor-grab rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs transition hover:border-brand-500 hover:bg-slate-800" draggable="true" data-ex="${e.EjercicioID}">
          <p class="font-medium text-slate-100">${esc(e.Nombre)}</p>
          <p class="text-[10px] text-slate-500">${esc(e.GrupoMuscular)} · ${esc(e.Equipo || "")}</p>
          <div class="mt-1 flex flex-wrap gap-1">${DIAS.slice(0, 5).map((d) => `<button data-add="${e.EjercicioID}|${d}" class="rounded bg-slate-700/70 px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-brand-600 hover:text-white">${d.slice(0, 3)}</button>`).join("")}</div>
        </div>`).join("") || '<p class="py-4 text-center text-xs text-slate-500">Sin resultados</p>';
      el.querySelectorAll("[data-ex]").forEach((n) => (n.ondragstart = (ev) => ev.dataTransfer.setData("text/plain", "new:" + n.getAttribute("data-ex"))));
      el.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => { const [id, d] = b.getAttribute("data-add").split("|"); addEx(Number(id), d); }));
    }

    function addEx(exId, dia) {
      const e = DB.find("Ejercicios", exId);
      const preset = { Principiante: { s: 3, r: "12", desc: 60 }, Intermedio: { s: 4, r: "10", desc: 75 }, Avanzado: { s: 4, r: "8", desc: 90 } }[el.querySelector("#niv")?.value || "Intermedio"];
      plan[dia].push({ EjercicioID: exId, Series: preset.s, Repeticiones: preset.r, PesoKg: null, DescansoSeg: preset.desc, Notas: "" });
      toast(`${e.Nombre} agregado a ${dia}.`);
      render();
    }

    function bind() {
      el.querySelector("#busca").oninput = renderCatalogo;
      el.querySelector("#grp").onchange = renderCatalogo;
      el.querySelector("#cli").onchange = (ev) => { cliente = DB.find("Clientes", ev.target.value); render(); };
      el.querySelectorAll("[data-drop]").forEach((z) => {
        z.ondragover = (ev) => { ev.preventDefault(); z.classList.add("border-brand-500", "bg-brand-500/5"); };
        z.ondragleave = () => z.classList.remove("border-brand-500", "bg-brand-500/5");
        z.ondrop = (ev) => {
          ev.preventDefault(); z.classList.remove("border-brand-500", "bg-brand-500/5");
          const data = ev.dataTransfer.getData("text/plain");
          const dia = z.getAttribute("data-drop");
          if (data.startsWith("new:")) addEx(Number(data.slice(4)), dia);
          else { const [d, i] = data.split("|"); const item = plan[d].splice(Number(i), 1)[0]; plan[dia].push(item); render(); }
        };
      });
      el.querySelectorAll("[data-move]").forEach((n) => (n.ondragstart = (ev) => ev.dataTransfer.setData("text/plain", n.getAttribute("data-move"))));
      el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { const [d, i] = b.getAttribute("data-del").split("|"); plan[d].splice(Number(i), 1); render(); }));
      el.querySelectorAll("[data-f]").forEach((inp) => (inp.onchange = () => {
        const [d, i, f] = inp.getAttribute("data-f").split("|");
        plan[d][Number(i)][f] = f === "Repeticiones" ? inp.value : inp.value === "" ? null : Number(inp.value);
      }));
      el.querySelector("[data-sug]").onclick = sugerir;
      el.querySelector("[data-save]").onclick = guardar;
    }

    function sugerir() {
      if (!cliente) return;
      const objId = Number(el.querySelector("#obj").value);
      const nivel = el.querySelector("#niv").value;
      const dias = (cliente.DiasDisponibles || "Lunes,Miércoles,Viernes").split(",").map((d) => d.trim()).filter((d) => DIAS.includes(d));
      const splitPorObjetivo = {
        1: [["Cardio", "Piernas"], ["Espalda", "Core"], ["Pecho", "Cardio"], ["Glúteos", "Core"], ["Cardio", "Hombros"]],
        2: [["Pecho", "Tríceps"], ["Espalda", "Bíceps"], ["Piernas", "Glúteos"], ["Hombros", "Core"], ["Espalda", "Pecho"]],
        3: [["Piernas", "Core"], ["Pecho", "Hombros"], ["Espalda", "Bíceps"], ["Piernas", "Glúteos"], ["Hombros", "Tríceps"]],
        4: [["Cardio", "Core"], ["Pecho", "Espalda"], ["Piernas", "Hombros"], ["Core", "Cardio"], ["Bíceps", "Tríceps"]],
        5: [["Glúteos", "Piernas"], ["Espalda", "Hombros"], ["Glúteos", "Core"], ["Cardio", "Piernas"], ["Core", "Bíceps"]],
      }[objId] || [["Pecho", "Espalda"], ["Piernas", "Core"], ["Hombros", "Bíceps"]];
      const cfg = { Principiante: { s: 3, r: "12", desc: 60, n: 4 }, Intermedio: { s: 4, r: "10", desc: 75, n: 5 }, Avanzado: { s: 4, r: "8", desc: 90, n: 6 } }[nivel];
      const lesion = (cliente.Lesiones || "").toLowerCase();
      DIAS.forEach((d) => (plan[d] = []));
      dias.forEach((dia, idx) => {
        const grupos = splitPorObjetivo[idx % splitPorObjetivo.length];
        let pool = DB.all("Ejercicios").filter((e) => grupos.includes(e.GrupoMuscular));
        if (lesion.includes("lumbar")) pool = pool.filter((e) => !["Peso muerto", "Remo con barra", "Sentadilla"].includes(e.Nombre));
        if (nivel === "Principiante") pool = pool.filter((e) => e.Dificultad !== "Avanzado");
        pool.slice(0, cfg.n).forEach((e) => plan[dia].push({ EjercicioID: e.EjercicioID, Series: cfg.s, Repeticiones: cfg.r, PesoKg: null, DescansoSeg: cfg.desc, Notas: "" }));
      });
      toast("Rutina sugerida según objetivo, nivel, días y lesiones.");
      render();
    }

    function guardar() {
      const total = DIAS.reduce((s, d) => s + plan[d].length, 0);
      if (!total) return toast("Agrega al menos un ejercicio a la rutina.", "warn");
      const payload = {
        ClienteID: Number(el.querySelector("#cli").value),
        EntrenadorID: Number(el.querySelector("#ent").value),
        Nombre: el.querySelector("#nom").value || "Rutina personalizada",
        ObjetivoID: Number(el.querySelector("#obj").value),
        Nivel: el.querySelector("#niv").value,
        FechaInicio: el.querySelector("#fi").value,
        FechaFin: el.querySelector("#ff").value,
        DiasPorSemana: DIAS.filter((d) => plan[d].length).length,
        ProgresionSemanal: el.querySelector("#prog").value,
        Observaciones: el.querySelector("#obs").value,
        Estado: "Activa",
      };
      let rid;
      if (rutina) {
        DB.update("Rutinas", rutina.RutinaID, payload);
        DB.where("RutinaDetalle", (d) => d.RutinaID === rutina.RutinaID).forEach((d) => DB.remove("RutinaDetalle", d.DetalleID, false));
        rid = rutina.RutinaID;
      } else {
        const rec = DB.insert("Rutinas", Object.assign({ Version: 1, FechaCreacion: fmt.fmtDT(new Date()) }, payload));
        rid = rec.RutinaID;
      }
      DIAS.forEach((d) => plan[d].forEach((x, i) => DB.insert("RutinaDetalle", { RutinaID: rid, DiaSemana: d, EjercicioID: x.EjercicioID, Orden: i + 1, Series: x.Series, Repeticiones: x.Repeticiones, PesoKg: x.PesoKg, DescansoSeg: x.DescansoSeg, Notas: x.Notas }, false)));
      DB.save(); DB.emit();
      toast("Rutina guardada y asignada al cliente ✅");
      location.hash = "#/rutinas";
    }

    render();
  }

  /* ============ MI RUTINA (cliente) ============ */
  function miRutina(el) {
    const u = window.SGC_SESSION.usuario;
    const clienteId = u.ClienteID || DB.all("Clientes")[0].ClienteID;
    const c = DB.find("Clientes", clienteId);
    const rutina = DB.where("Rutinas", (r) => String(r.ClienteID) === String(clienteId) && r.Estado === "Activa").slice(-1)[0];
    const hoy = hoyNombre();
    const m = DB.membresiaActual(clienteId);
    if (!rutina) { el.innerHTML = pageHeader("Mi rutina", "Aún no tienes una rutina asignada", "") + card('<p class="text-slate-400">Solicita a tu entrenador que te programe una rutina.</p>'); return; }
    const det = DB.where("RutinaDetalle", (d) => d.RutinaID === rutina.RutinaID);
    const delDia = det.filter((d) => d.DiaSemana === hoy).sort((a, b) => a.Orden - b.Orden);
    const grupos = [...new Set(delDia.map((d) => (DB.find("Ejercicios", d.EjercicioID) || {}).GrupoMuscular))].join(" + ");

    el.innerHTML = `
      ${pageHeader(`Hola, ${c.Nombres} 👋`, `${rutina.Nombre} · ${(DB.find("Objetivos", rutina.ObjetivoID) || {}).Nombre || ""}`, "")}
      <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        ${stat("Membresía", m ? DB.diasRestantes(m.FechaFin) + " días" : "—", m ? "Vence " + m.FechaFin : "Sin membresía", "blue", "membresias")}
        ${stat("Días de entrenamiento", rutina.DiasPorSemana, "por semana", "violet", "rutinas")}
        ${stat("Progresión", rutina.ProgresionSemanal || "—", "plan de carga", "green", "progreso")}
      </div>
      <div class="card p-5">
        <h3 class="text-lg font-bold text-slate-50">Rutina de hoy — ${esc(hoy)}</h3>
        <p class="mt-1 text-sm text-brand-300">${esc(grupos || "Día de descanso")}</p>
        <div class="mt-4 space-y-2">
          ${delDia.length ? delDia.map((d) => {
            const e = DB.find("Ejercicios", d.EjercicioID) || {};
            return `<div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
              <div class="min-w-0"><p class="font-medium text-slate-100">${esc(e.Nombre)}</p><p class="text-xs text-slate-500">${esc(e.GrupoMuscular)} · ${esc(e.Equipo || "")}</p></div>
              <p class="text-sm text-slate-300">${d.Series} × ${esc(d.Repeticiones)}${d.PesoKg ? " — " + d.PesoKg + " kg" : ""}</p></div>`;
          }).join("") : '<p class="py-8 text-center text-slate-500">Hoy toca descansar 😴</p>'}
        </div>
        ${delDia.length ? `<p class="mt-4 text-sm text-slate-400">⏱️ Descanso: ${delDia[0].DescansoSeg} segundos entre series</p>` : ""}
        <div class="mt-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-sm text-slate-300">📝 ${esc(rutina.Observaciones || "Sin observaciones")}</div>
      </div>
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        ${DIAS.filter((d) => det.some((x) => x.DiaSemana === d)).map((dia) => `
          <div class="card p-4 ${dia === hoy ? "ring-2 ring-brand-500/50" : ""}">
            <h4 class="mb-2 font-semibold text-slate-100">${esc(dia)}</h4>
            ${det.filter((x) => x.DiaSemana === dia).sort((a, b) => a.Orden - b.Orden).map((x) => {
              const e = DB.find("Ejercicios", x.EjercicioID) || {};
              return `<p class="text-xs text-slate-400">• ${esc(e.Nombre)} — ${x.Series}×${esc(x.Repeticiones)}${x.PesoKg ? " — " + x.PesoKg + "kg" : ""}</p>`;
            }).join("")}
          </div>`).join("")}
      </div>`;
  }

  /* ============ ALERTAS ============ */
  function alertas(el) {
    DB.refreshAlertas();
    const all = DB.all("Alertas");
    el.innerHTML = pageHeader("Alertas del sistema", "Membresías vencidas, próximas a vencer, asistencias incompletas y pagos pendientes",
      `<button class="btn-ghost" data-ref>Actualizar</button>`) +
      `<div class="grid grid-cols-1 gap-3 md:grid-cols-2">${all.map((a) => `
        <div class="card border-l-4 ${a.Severidad === "Alta" ? "border-l-rose-500" : "border-l-amber-500"} p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">${badge(a.Tipo, a.Severidad === "Alta" ? "red" : "amber")}<span class="text-xs text-slate-500">${esc(a.Fecha)}</span></div>
          <p class="mt-2 text-sm text-slate-300">${esc(a.Mensaje)}</p>
          ${a.ClienteID ? `<button class="btn-mini mt-3" data-cli="${a.ClienteID}">Ver cliente</button>` : ""}
        </div>`).join("") || card('<p class="text-slate-400">No hay alertas activas. Todo en orden ✅</p>')}</div>`;
    el.querySelector("[data-ref]").onclick = () => { DB.refreshAlertas(); alertas(el); toast("Alertas actualizadas."); };
    el.querySelectorAll("[data-cli]").forEach((b) => (b.onclick = () => (location.hash = "#/clientes/" + b.getAttribute("data-cli"))));
  }

  /* ============ REPORTES ============ */
  function reportes(el) {
    const clientes = DB.all("Clientes"), pagos = DB.all("Pagos"), accesos = DB.all("Accesos");
    const porObjetivo = DB.all("Objetivos").map((o) => ({ label: o.Nombre, short: o.Nombre.split(" ")[0], value: clientes.filter((c) => c.ObjetivoID === o.ObjetivoID).length }));
    const porNivel = ["Principiante", "Intermedio", "Avanzado"].map((n) => ({ label: n, short: n.slice(0, 4), value: clientes.filter((c) => c.NivelExperiencia === n).length }));
    const porMetodo = ["Efectivo", "Tarjeta", "Transferencia", "Móvil"].map((m) => ({ label: m, short: m.slice(0, 4), value: Math.round(pagos.filter((p) => p.MetodoPago === m && p.Estado === "Pagado").reduce((s, p) => s + Number(p.Monto), 0)) }));
    const horas = [...Array(16)].map((_, i) => ({ label: `${i + 6}:00`, short: String(i + 6), value: accesos.filter((a) => Number(a.FechaHoraEntrada.slice(11, 13)) === i + 6).length }));
    const topClientes = clientes.map((c) => ({ c, n: accesos.filter((a) => a.ClienteID === c.ClienteID).length })).sort((a, b) => b.n - a.n).slice(0, 8);

    el.innerHTML = `
      ${pageHeader("Reportes", "Análisis de clientes, asistencia, ingresos y membresías",
        `<button class="btn-ghost" data-csv>Exportar todo (CSV)</button><button class="btn-primary" data-print>Imprimir reporte</button>`)}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Clientes por objetivo</h3>' + U.barChart(porObjetivo))}
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Clientes por nivel</h3>' + U.barChart(porNivel, { color: "#a855f7" }))}
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Ingresos por método de pago</h3>' + U.barChart(porMetodo, { color: "#22c55e" }))}
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Horas pico de asistencia</h3>' + U.barChart(horas, { color: "#f59e0b" }))}
      </div>
      <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Top clientes por asistencia</h3>' + topClientes.map((t, i) => `<div class="flex items-center justify-between border-b border-slate-800 py-2 text-sm last:border-0"><span class="text-slate-300">${i + 1}. ${esc(t.c.Nombres)} ${esc(t.c.Apellidos)}</span><span class="text-brand-300">${t.n} visitas</span></div>`).join(""))}
        ${card('<h3 class="mb-3 font-semibold text-slate-100">Resumen de membresías</h3>' + DB.all("TiposMembresia").map((t) => {
          const n = DB.all("Membresias").filter((m) => m.TipoMembresiaID === t.TipoMembresiaID).length;
          return `<div class="flex items-center justify-between border-b border-slate-800 py-2 text-sm last:border-0"><span class="text-slate-300">${esc(t.Nombre)}</span><span class="text-slate-400">${n} cliente(s) · ${money(n * t.Precio)}</span></div>`;
        }).join(""))}
      </div>`;
    el.querySelector("[data-print]").onclick = () => window.print();
    el.querySelector("[data-csv]").onclick = () => {
      ["Clientes", "Membresias", "Pagos", "Accesos"].forEach((t) => download(t.toLowerCase() + ".csv", toCSV(S.tables[t].columns.map((c) => c.name), DB.all(t)), "text/csv"));
      toast("Reportes exportados en CSV.");
    };
  }

  /* ============ BASE DE DATOS ============ */
  function baseDatos(el) {
    const tablas = Object.keys(S.tables);
    el.innerHTML = `
      ${pageHeader("Base de datos SQL Server", "Diagrama, script T-SQL, consultas CRUD y exportación",
        `<button class="btn-ghost" data-reset>Restaurar datos demo</button><button class="btn-primary" data-dl>⬇ Descargar script .sql</button>`)}
      <div class="mb-4 flex flex-wrap gap-2">
        ${["Consultas SQL", "Diagrama E-R", "Script T-SQL", "Tablas"].map((t, i) => `<button data-tab="${i}" class="tab ${i === 0 ? "tab-on" : ""}">${t}</button>`).join("")}
      </div>
      <div id="tabc"></div>`;

    const tabc = el.querySelector("#tabc");
    const tabs = [tabConsultas, tabDiagrama, tabScript, tabTablas];
    el.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => {
      el.querySelectorAll("[data-tab]").forEach((x) => x.classList.remove("tab-on"));
      b.classList.add("tab-on");
      tabs[Number(b.getAttribute("data-tab"))](tabc);
    }));
    el.querySelector("[data-dl]").onclick = () => { download("SourceGymControl.sql", window.SGC_buildSqlScript(DB.data), "application/sql"); toast("Script SQL Server descargado."); };
    el.querySelector("[data-reset]").onclick = () => confirmDialog("Se restaurarán los datos de demostración y se perderán los cambios. ¿Continuar?", () => { DB.reset(); toast("Base de datos restaurada."); baseDatos(el); });

    function tabConsultas(c) {
      c.innerHTML = `
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div class="card p-4">
            <h4 class="mb-2 text-sm font-semibold text-slate-100">Consultas de ejemplo</h4>
            <div class="space-y-1.5 text-xs">
              ${[
                "SELECT * FROM Clientes WHERE Estado = 'Activo'",
                "SELECT TOP 5 * FROM Pagos ORDER BY Monto DESC",
                "SELECT * FROM Accesos WHERE Estado = 'Dentro'",
                "SELECT * FROM Membresias WHERE Estado = 'Vencida'",
                "INSERT INTO Ejercicios (Nombre, GrupoMuscular, Equipo, Dificultad) VALUES ('Zancadas caminando','Piernas','Mancuernas','Intermedio')",
                "UPDATE Clientes SET Estado = 'Activo' WHERE ClienteID = 11",
                "DELETE FROM Alertas WHERE Severidad = 'Baja'",
              ].map((q) => `<button class="ex block w-full rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-left font-mono text-[11px] text-slate-300 hover:border-brand-500">${esc(q)}</button>`).join("")}
            </div>
            <h4 class="mb-1 mt-4 text-sm font-semibold text-slate-100">Tablas</h4>
            <div class="flex flex-wrap gap-1">${tablas.map((t) => `<span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-brand-300">${t}</span>`).join("")}</div>
          </div>
          <div class="lg:col-span-3">
            <div class="card p-4">
              <textarea id="sql" rows="6" class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-emerald-300 outline-none focus:border-brand-500">SELECT * FROM Clientes WHERE Estado = 'Activo'</textarea>
              <div class="mt-3 flex flex-wrap gap-2">
                <button id="run" class="btn-primary">▶ Ejecutar consulta</button>
                <button id="clear" class="btn-ghost">Limpiar</button>
                <button id="csv" class="btn-ghost">Exportar resultado CSV</button>
              </div>
            </div>
            <div id="out" class="mt-4"></div>
          </div>
        </div>`;
      let last = null;
      const out = c.querySelector("#out");
      const run = () => {
        const sql = c.querySelector("#sql").value;
        try {
          const res = DB.exec(sql);
          DB.refreshAlertas();
          if (res.type === "select") {
            last = res;
            out.innerHTML = `<div class="card"><div class="border-b border-slate-800 px-4 py-3 text-sm text-emerald-300">✔ ${res.rows.length} fila(s) devuelta(s) de ${res.table}</div>
              <div class="max-h-[420px] overflow-auto"><table class="w-full text-left text-xs"><thead class="sticky top-0 bg-slate-800 text-slate-400"><tr>${res.columns.map((x) => `<th class="whitespace-nowrap px-3 py-2">${esc(x)}</th>`).join("")}</tr></thead>
              <tbody class="divide-y divide-slate-800">${res.rows.map((r) => `<tr class="hover:bg-slate-800/40">${res.columns.map((x) => `<td class="whitespace-nowrap px-3 py-2 text-slate-300">${esc(r[x])}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
          } else {
            last = null;
            out.innerHTML = `<div class="card p-4 text-sm text-emerald-300">✔ ${esc(res.message)}</div>`;
          }
          toast("Consulta ejecutada correctamente.");
        } catch (err) {
          out.innerHTML = `<div class="card border border-rose-500/40 p-4 text-sm text-rose-300">✖ ${esc(err.message)}</div>`;
          toast(err.message, "err");
        }
      };
      c.querySelector("#run").onclick = run;
      c.querySelector("#clear").onclick = () => { c.querySelector("#sql").value = ""; out.innerHTML = ""; };
      c.querySelector("#csv").onclick = () => { if (!last) return toast("Ejecuta primero un SELECT.", "warn"); download("consulta.csv", toCSV(last.columns, last.rows), "text/csv"); toast("Resultado exportado."); };
      c.querySelectorAll(".ex").forEach((b) => (b.onclick = () => { c.querySelector("#sql").value = b.textContent; run(); }));
      c.querySelector("#sql").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(); });
    }

    function tabDiagrama(c) {
      const rels = [];
      tablas.forEach((t) => S.tables[t].columns.filter((x) => x.ui === "fk" && x.ref).forEach((x) => rels.push({ from: t, to: x.ref, col: x.name })));
      c.innerHTML = `
        <div class="card p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 class="font-semibold text-slate-100">Diagrama Entidad-Relación — ${tablas.length} tablas · ${rels.length} relaciones</h3>
            <div class="flex gap-2"><button id="dl-svg" class="btn-ghost">⬇ Descargar diagrama (SVG)</button><button id="dl-md" class="btn-ghost">⬇ Descargar diagrama (Mermaid)</button></div>
          </div>
          <div id="diag" class="overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4"></div>
        </div>`;
      const cols = 4, boxW = 230, boxH0 = 34, rowH = 15, gapX = 60, gapY = 50;
      const pos = {};
      let x = 0, y = 0, rowMax = 0;
      const boxes = tablas.map((t, i) => {
        const def = S.tables[t];
        const h = boxH0 + def.columns.length * rowH + 8;
        const cx = (i % cols) * (boxW + gapX), cyIdx = Math.floor(i / cols);
        return { t, def, h, i, cx, cyIdx };
      });
      const rowHeights = [];
      boxes.forEach((b) => { rowHeights[b.cyIdx] = Math.max(rowHeights[b.cyIdx] || 0, b.h); });
      const rowY = []; let acc = 20;
      rowHeights.forEach((h, i) => { rowY[i] = acc; acc += h + gapY; });
      boxes.forEach((b) => (pos[b.t] = { x: b.cx + 20, y: rowY[b.cyIdx], w: boxW, h: b.h }));
      const totalW = cols * (boxW + gapX) + 40, totalH = acc + 20;
      const svg = `<svg id="er" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg" style="font-family:ui-sans-serif,system-ui">
        <rect width="${totalW}" height="${totalH}" fill="#020617"/>
        ${rels.map((r) => {
          const a = pos[r.from], b = pos[r.to];
          if (!a || !b) return "";
          const x1 = a.x + a.w / 2, y1 = a.y, x2 = b.x + b.w / 2, y2 = b.y + b.h;
          return `<path d="M${x1},${y1} C${x1},${y1 - 40} ${x2},${y2 + 40} ${x2},${y2}" stroke="#3b6ef6" stroke-width="1.2" fill="none" opacity="0.5"/>`;
        }).join("")}
        ${tablas.map((t) => {
          const p = pos[t], def = S.tables[t];
          return `<g>
            <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="#0f172a" stroke="#1e293b"/>
            <rect x="${p.x}" y="${p.y}" width="${p.w}" height="26" rx="8" fill="#1d4ed8"/>
            <text x="${p.x + 10}" y="${p.y + 18}" fill="#ffffff" font-size="12" font-weight="700">${t}</text>
            ${def.columns.map((col, i) => `<text x="${p.x + 10}" y="${p.y + 42 + i * rowH}" fill="${col.name === def.pk ? "#fbbf24" : col.ui === "fk" ? "#7dd3fc" : "#cbd5e1"}" font-size="10">${col.name === def.pk ? "🔑 " : col.ui === "fk" ? "🔗 " : ""}${col.name} : ${col.type.split(" ")[0]}</text>`).join("")}
          </g>`;
        }).join("")}
      </svg>`;
      c.querySelector("#diag").innerHTML = svg;
      c.querySelector("#dl-svg").onclick = () => { download("Diagrama_SourceGymControl.svg", svg, "image/svg+xml"); toast("Diagrama descargado."); };
      c.querySelector("#dl-md").onclick = () => {
        const md = ["erDiagram", ...rels.map((r) => `    ${r.to} ||--o{ ${r.from} : "${r.col}"`),
          ...tablas.map((t) => `    ${t} {\n${S.tables[t].columns.map((cc) => `        ${cc.type.split(" ")[0].replace(/\(.*\)/, "")} ${cc.name}`).join("\n")}\n    }`)].join("\n");
        download("Diagrama_SourceGymControl.mmd", md, "text/plain"); toast("Diagrama Mermaid descargado.");
      };
    }

    function tabScript(c) {
      const sql = window.SGC_buildSqlScript(DB.data);
      c.innerHTML = `<div class="card p-4">
        <div class="mb-3 flex flex-wrap gap-2">
          <button id="copy" class="btn-ghost">📋 Copiar script</button>
          <button id="dl2" class="btn-primary">⬇ Descargar .sql</button>
          <button id="dljson" class="btn-ghost">⬇ Respaldo JSON</button>
          <span class="self-center text-xs text-slate-500">${sql.split("\n").length} líneas · listo para ejecutar en SQL Server Management Studio</span>
        </div>
        <pre class="max-h-[560px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] leading-relaxed text-emerald-300">${esc(sql)}</pre></div>`;
      c.querySelector("#copy").onclick = () => { navigator.clipboard.writeText(sql).then(() => toast("Script copiado al portapapeles.")); };
      c.querySelector("#dl2").onclick = () => { download("SourceGymControl.sql", sql, "application/sql"); toast("Script descargado."); };
      c.querySelector("#dljson").onclick = () => { download("SourceGymControl_backup.json", JSON.stringify(DB.data, null, 2), "application/json"); toast("Respaldo JSON descargado."); };
    }

    function tabTablas(c) {
      c.innerHTML = `<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">${tablas.map((t) => `
        <div class="card p-4">
          <div class="flex items-center justify-between"><h4 class="font-semibold text-brand-300">${t}</h4><span class="text-xs text-slate-500">${DB.all(t).length} filas</span></div>
          <p class="mt-0.5 text-xs text-slate-500">${esc(S.tables[t].label)}</p>
          <div class="mt-2 max-h-40 overflow-y-auto text-[11px] text-slate-400">${S.tables[t].columns.map((col) => `<p>${col.name === S.tables[t].pk ? "🔑" : col.ui === "fk" ? "🔗" : "•"} ${esc(col.name)} <span class="text-slate-600">${esc(col.type)}</span></p>`).join("")}</div>
          <button class="btn-mini mt-3" data-open="${t}">Abrir datos</button>
        </div>`).join("")}</div><div id="tsel" class="mt-4"></div>`;
      c.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => {
        const t = b.getAttribute("data-open");
        const host = c.querySelector("#tsel");
        host.innerHTML = `<h3 class="mb-2 text-lg font-semibold text-slate-100">Tabla ${t}</h3><div id="g"></div>`;
        genericTable(host.querySelector("#g"), t, "", "", null);
        host.querySelector("#g").scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    }

    tabConsultas(tabc);
  }

  window.SGC_VIEWS = {
    dashboard, clientes, clienteDetalle, membresias, accesos, pagos, rutinas, programador, miRutina, alertas, reportes, baseDatos, genericTable, verRutina,
  };
})();
