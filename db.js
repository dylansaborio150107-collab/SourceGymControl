/* SourceGymControl - Motor de base de datos embebido (simula SQL Server en el navegador) */
(function () {
  const KEY = "sgc_db_v1";
  const S = window.SGC_SCHEMA;
  const TABLES = Object.keys(S.tables);

  const pad = (n) => String(n).padStart(2, "0");
  const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtDT = (d) => `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  const today = () => new Date();

  function seed() {
    const now = today();
    const db = {};
    TABLES.forEach((t) => (db[t] = []));

    db.Roles = [
      { RolID: 1, Nombre: "Administrador", Descripcion: "Acceso total al sistema" },
      { RolID: 2, Nombre: "Recepcionista", Descripcion: "Clientes, accesos, pagos y membresías" },
      { RolID: 3, Nombre: "Entrenador", Descripcion: "Rutinas, ejercicios y progreso" },
      { RolID: 4, Nombre: "Cliente", Descripcion: "Ver su rutina, progreso y membresía" },
    ];

    const permisos = [
      ["dashboard.ver", "Ver dashboard"], ["clientes.gestionar", "Gestionar clientes"],
      ["membresias.gestionar", "Gestionar membresías"], ["accesos.gestionar", "Control de accesos"],
      ["pagos.gestionar", "Gestionar pagos"], ["rutinas.gestionar", "Gestionar rutinas"],
      ["entrenadores.gestionar", "Gestionar entrenadores"], ["progreso.gestionar", "Registrar progreso"],
      ["usuarios.gestionar", "Gestionar usuarios y roles"], ["reportes.ver", "Ver reportes"],
      ["auditoria.ver", "Ver historial"], ["bd.administrar", "Administrar base de datos"],
      ["mirutina.ver", "Ver mi rutina"],
    ];
    db.Permisos = permisos.map((p, i) => ({ PermisoID: i + 1, Codigo: p[0], Descripcion: p[1] }));
    const permId = (c) => db.Permisos.find((p) => p.Codigo === c).PermisoID;
    const rolPerms = {
      1: permisos.map((p) => p[0]),
      2: ["dashboard.ver", "clientes.gestionar", "membresias.gestionar", "accesos.gestionar", "pagos.gestionar", "reportes.ver"],
      3: ["dashboard.ver", "clientes.gestionar", "rutinas.gestionar", "progreso.gestionar", "reportes.ver"],
      4: ["mirutina.ver"],
    };
    let rpId = 1;
    Object.entries(rolPerms).forEach(([rol, codes]) =>
      codes.forEach((c) => db.RolPermisos.push({ RolPermisoID: rpId++, RolID: Number(rol), PermisoID: permId(c) }))
    );

    db.Objetivos = [
      { ObjetivoID: 1, Nombre: "Bajar grasa", Descripcion: "Déficit calórico y trabajo metabólico" },
      { ObjetivoID: 2, Nombre: "Ganar masa muscular", Descripcion: "Hipertrofia progresiva" },
      { ObjetivoID: 3, Nombre: "Aumentar fuerza", Descripcion: "Trabajo de baja repetición y alta carga" },
      { ObjetivoID: 4, Nombre: "Mantenimiento", Descripcion: "Conservar composición corporal" },
      { ObjetivoID: 5, Nombre: "Tonificación", Descripcion: "Definición y resistencia muscular" },
    ];

    db.Entrenadores = [
      { EntrenadorID: 1, Nombres: "Carlos", Apellidos: "Mendoza", Cedula: "001-120390-1001A", Telefono: "8555-1201", Correo: "carlos@sourcegym.com", Especialidad: "Hipertrofia", Horario: "6am - 2pm", FechaContratacion: "2023-03-15", Activo: 1 },
      { EntrenadorID: 2, Nombres: "María", Apellidos: "Torres", Cedula: "001-050592-1002B", Telefono: "8555-1202", Correo: "maria@sourcegym.com", Especialidad: "Pérdida de grasa", Horario: "2pm - 9pm", FechaContratacion: "2023-07-01", Activo: 1 },
      { EntrenadorID: 3, Nombres: "Luis", Apellidos: "Guerrero", Cedula: "001-231188-1003C", Telefono: "8555-1203", Correo: "luis@sourcegym.com", Especialidad: "Fuerza", Horario: "5am - 1pm", FechaContratacion: "2024-01-10", Activo: 1 },
    ];

    const nombres = [
      ["Juan", "Pérez", "Masculino", 28, 178, 82, "Intermedio", 2, "Lunes,Martes,Miércoles,Jueves,Viernes", "Pecho,Espalda,Piernas"],
      ["Ana", "López", "Femenino", 24, 163, 58, "Principiante", 1, "Lunes,Miércoles,Viernes", "Glúteos,Piernas"],
      ["Pedro", "Ramírez", "Masculino", 35, 175, 95, "Intermedio", 1, "Martes,Jueves,Sábado", "Core,Cardio"],
      ["Lucía", "Martínez", "Femenino", 30, 168, 62, "Avanzado", 5, "Lunes,Martes,Jueves,Viernes", "Glúteos,Hombros"],
      ["Diego", "Sánchez", "Masculino", 22, 182, 70, "Principiante", 2, "Lunes,Miércoles,Viernes", "Pecho,Bíceps"],
      ["Karla", "Gómez", "Femenino", 27, 160, 55, "Intermedio", 5, "Lunes,Martes,Miércoles,Viernes", "Glúteos,Core"],
      ["Marcos", "Cruz", "Masculino", 41, 172, 88, "Intermedio", 3, "Lunes,Miércoles,Viernes,Sábado", "Espalda,Piernas"],
      ["Sofía", "Herrera", "Femenino", 19, 165, 52, "Principiante", 4, "Martes,Jueves", "Core,Cardio" ],
      ["Emilio", "Castro", "Masculino", 33, 180, 78, "Avanzado", 3, "Lunes,Martes,Jueves,Viernes,Sábado", "Pecho,Hombros,Tríceps"],
      ["Valeria", "Ortiz", "Femenino", 26, 170, 64, "Intermedio", 1, "Lunes,Miércoles,Viernes", "Piernas,Glúteos"],
      ["Rafael", "Navarro", "Masculino", 45, 174, 92, "Principiante", 1, "Martes,Jueves,Sábado", "Cardio,Core"],
      ["Daniela", "Ruiz", "Femenino", 31, 166, 60, "Avanzado", 2, "Lunes,Martes,Miércoles,Jueves,Viernes", "Espalda,Glúteos"],
    ];
    db.Clientes = nombres.map((n, i) => ({
      ClienteID: i + 1,
      Codigo: "SGC-" + String(1001 + i),
      Nombres: n[0], Apellidos: n[1], Cedula: "001-0101" + (90 + i) + "-100" + i + "X",
      Sexo: n[2], Edad: n[3], Telefono: "8" + (700 + i) + "-45" + (10 + i),
      Correo: (n[0] + "." + n[1]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@correo.com",
      Direccion: "Managua, Nicaragua",
      Altura_cm: n[4], Peso_kg: n[5], NivelExperiencia: n[6], ObjetivoID: n[7],
      DiasDisponibles: n[8], Lesiones: i % 4 === 0 ? "Molestia lumbar leve" : "Ninguna",
      ZonasInteres: n[9], FechaRegistro: fmtDate(addDays(now, -(30 + i * 9))),
      Estado: i === 10 ? "Inactivo" : "Activo",
    }));

    db.Usuarios = [
      { UsuarioID: 1, NombreUsuario: "admin", NombreCompleto: "Administrador General", Correo: "admin@sourcegym.com", ContrasenaHash: "admin123", RolID: 1, EntrenadorID: null, ClienteID: null, Activo: 1, UltimoAcceso: null, FechaCreacion: fmtDT(addDays(now, -200)) },
      { UsuarioID: 2, NombreUsuario: "recepcion", NombreCompleto: "Ana Recepción", Correo: "recepcion@sourcegym.com", ContrasenaHash: "recepcion123", RolID: 2, EntrenadorID: null, ClienteID: null, Activo: 1, UltimoAcceso: null, FechaCreacion: fmtDT(addDays(now, -180)) },
      { UsuarioID: 3, NombreUsuario: "entrenador", NombreCompleto: "Carlos Mendoza", Correo: "carlos@sourcegym.com", ContrasenaHash: "entrenador123", RolID: 3, EntrenadorID: 1, ClienteID: null, Activo: 1, UltimoAcceso: null, FechaCreacion: fmtDT(addDays(now, -160)) },
      { UsuarioID: 4, NombreUsuario: "cliente", NombreCompleto: "Juan Pérez", Correo: "juan.perez@correo.com", ContrasenaHash: "cliente123", RolID: 4, EntrenadorID: null, ClienteID: 1, Activo: 1, UltimoAcceso: null, FechaCreacion: fmtDT(addDays(now, -100)) },
    ];

    db.TiposMembresia = [
      { TipoMembresiaID: 1, Nombre: "Mensual", DuracionDias: 30, Precio: 900, Descripcion: "Acceso ilimitado 1 mes", Activo: 1 },
      { TipoMembresiaID: 2, Nombre: "Trimestral", DuracionDias: 90, Precio: 2400, Descripcion: "3 meses con descuento", Activo: 1 },
      { TipoMembresiaID: 3, Nombre: "Semestral", DuracionDias: 180, Precio: 4500, Descripcion: "6 meses + evaluación", Activo: 1 },
      { TipoMembresiaID: 4, Nombre: "Anual", DuracionDias: 365, Precio: 8000, Descripcion: "12 meses + rutina premium", Activo: 1 },
      { TipoMembresiaID: 5, Nombre: "Diaria", DuracionDias: 1, Precio: 60, Descripcion: "Pase por día", Activo: 1 },
    ];

    let mId = 1, pId = 1;
    db.Clientes.forEach((c, i) => {
      const tipo = db.TiposMembresia[i % 4];
      const offset = [-5, -20, 3, -40, 12, -2, 25, -60, 5, 40, -90, 60][i];
      const fin = addDays(now, offset);
      const ini = addDays(fin, -tipo.DuracionDias);
      const estado = fin < now ? "Vencida" : "Activa";
      db.Membresias.push({ MembresiaID: mId, ClienteID: c.ClienteID, TipoMembresiaID: tipo.TipoMembresiaID, FechaInicio: fmtDate(ini), FechaFin: fmtDate(fin), Estado: estado, Notas: "" });
      db.Pagos.push({ PagoID: pId++, ClienteID: c.ClienteID, MembresiaID: mId, Monto: tipo.Precio, MetodoPago: ["Efectivo", "Tarjeta", "Transferencia", "Móvil"][i % 4], FechaPago: fmtDate(ini), Estado: i % 5 === 0 ? "Pendiente" : "Pagado", Referencia: "REC-" + (5000 + i), UsuarioID: 2 });
      mId++;
    });

    const ejercicios = [
      ["Press banca", "Pecho", "Barra", "Intermedio"], ["Press inclinado mancuernas", "Pecho", "Mancuernas", "Intermedio"],
      ["Aperturas en polea", "Pecho", "Polea", "Principiante"], ["Flexiones", "Pecho", "Peso corporal", "Principiante"],
      ["Dominadas", "Espalda", "Peso corporal", "Avanzado"], ["Remo con barra", "Espalda", "Barra", "Intermedio"],
      ["Jalón al pecho", "Espalda", "Polea", "Principiante"], ["Remo sentado", "Espalda", "Máquina", "Principiante"],
      ["Sentadilla", "Piernas", "Barra", "Intermedio"], ["Prensa de piernas", "Piernas", "Máquina", "Principiante"],
      ["Peso muerto", "Piernas", "Barra", "Avanzado"], ["Extensión de cuádriceps", "Piernas", "Máquina", "Principiante"],
      ["Curl femoral", "Piernas", "Máquina", "Principiante"], ["Búlgaras", "Glúteos", "Mancuernas", "Intermedio"],
      ["Hip Thrust", "Glúteos", "Barra", "Intermedio"], ["Patada de glúteo en polea", "Glúteos", "Polea", "Principiante"],
      ["Aductores en máquina", "Glúteos", "Máquina", "Principiante"], ["Press militar", "Hombros", "Barra", "Intermedio"],
      ["Elevaciones laterales", "Hombros", "Mancuernas", "Principiante"], ["Pájaros", "Hombros", "Mancuernas", "Principiante"],
      ["Curl bíceps barra", "Bíceps", "Barra", "Principiante"], ["Curl martillo", "Bíceps", "Mancuernas", "Principiante"],
      ["Curl predicador", "Bíceps", "Máquina", "Intermedio"], ["Fondos en paralelas", "Tríceps", "Peso corporal", "Intermedio"],
      ["Extensión en polea", "Tríceps", "Polea", "Principiante"], ["Press francés", "Tríceps", "Barra", "Intermedio"],
      ["Plancha abdominal", "Core", "Peso corporal", "Principiante"], ["Crunch en máquina", "Core", "Máquina", "Principiante"],
      ["Elevación de piernas", "Core", "Peso corporal", "Intermedio"], ["Rueda abdominal", "Core", "Ninguno", "Avanzado"],
      ["Caminadora HIIT", "Cardio", "Máquina", "Intermedio"], ["Bicicleta estática", "Cardio", "Máquina", "Principiante"],
      ["Elíptica", "Cardio", "Máquina", "Principiante"], ["Cuerda para saltar", "Cardio", "Ninguno", "Intermedio"],
      ["Kettlebell swing", "Cardio", "Kettlebell", "Intermedio"],
    ];
    db.Ejercicios = ejercicios.map((e, i) => ({ EjercicioID: i + 1, Nombre: e[0], GrupoMuscular: e[1], Equipo: e[2], Dificultad: e[3], Descripcion: `Ejercicio de ${e[1].toLowerCase()} con ${e[2].toLowerCase()}.` }));

    // Rutinas base por objetivo
    const byName = (n) => db.Ejercicios.find((e) => e.Nombre === n).EjercicioID;
    const plantillas = {
      2: { // masa muscular
        Lunes: [["Press banca", 4, "8-10", 60, 90], ["Press inclinado mancuernas", 4, "10", 24, 90], ["Fondos en paralelas", 3, "12", null, 60], ["Extensión en polea", 3, "12", 20, 60]],
        Martes: [["Remo con barra", 4, "8-10", 50, 90], ["Jalón al pecho", 4, "10", 45, 75], ["Curl bíceps barra", 3, "12", 20, 60], ["Curl martillo", 3, "12", 12, 60]],
        Miércoles: [["Sentadilla", 4, "8", 70, 120], ["Prensa de piernas", 4, "12", 120, 90], ["Curl femoral", 3, "12", 30, 60], ["Hip Thrust", 3, "12", 50, 90]],
        Jueves: [["Press militar", 4, "8-10", 35, 90], ["Elevaciones laterales", 4, "15", 8, 45], ["Pájaros", 3, "15", 8, 45], ["Plancha abdominal", 3, "45s", null, 45]],
        Viernes: [["Peso muerto", 4, "6", 90, 120], ["Dominadas", 4, "8", null, 90], ["Remo sentado", 3, "12", 50, 60], ["Rueda abdominal", 3, "12", null, 60]],
      },
      1: { // bajar grasa
        Lunes: [["Caminadora HIIT", 1, "20 min", null, 60], ["Sentadilla", 3, "15", 30, 45], ["Prensa de piernas", 3, "15", 80, 45], ["Plancha abdominal", 3, "40s", null, 30]],
        Miércoles: [["Kettlebell swing", 4, "20", 12, 45], ["Jalón al pecho", 3, "15", 35, 45], ["Press banca", 3, "15", 30, 45], ["Crunch en máquina", 3, "20", 20, 30]],
        Viernes: [["Cuerda para saltar", 4, "2 min", null, 60], ["Búlgaras", 3, "12", 10, 45], ["Remo sentado", 3, "15", 40, 45], ["Elevación de piernas", 3, "15", null, 30]],
      },
      3: { // fuerza
        Lunes: [["Sentadilla", 5, "5", 100, 180], ["Press banca", 5, "5", 80, 180], ["Remo con barra", 4, "6", 60, 120]],
        Miércoles: [["Peso muerto", 5, "3", 120, 180], ["Press militar", 4, "5", 45, 150], ["Dominadas", 4, "6", null, 120]],
        Viernes: [["Sentadilla", 4, "6", 90, 180], ["Press inclinado mancuernas", 4, "6", 32, 120], ["Rueda abdominal", 3, "10", null, 60]],
      },
      5: { // tonificación
        Lunes: [["Hip Thrust", 4, "12", 40, 90], ["Sentadilla", 4, "10", 30, 90], ["Búlgaras", 3, "12", 8, 60], ["Aductores en máquina", 4, "15", 35, 45]],
        Martes: [["Jalón al pecho", 4, "12", 30, 60], ["Remo sentado", 3, "12", 35, 60], ["Elevaciones laterales", 3, "15", 6, 45]],
        Jueves: [["Patada de glúteo en polea", 4, "15", 15, 45], ["Curl femoral", 4, "12", 25, 60], ["Plancha abdominal", 3, "45s", null, 45]],
        Viernes: [["Bicicleta estática", 1, "25 min", null, 0], ["Crunch en máquina", 4, "20", 15, 30]],
      },
      4: { // mantenimiento
        Martes: [["Elíptica", 1, "20 min", null, 0], ["Press banca", 3, "12", 40, 60], ["Remo sentado", 3, "12", 40, 60]],
        Jueves: [["Sentadilla", 3, "12", 40, 60], ["Curl bíceps barra", 3, "12", 15, 45], ["Plancha abdominal", 3, "40s", null, 45]],
      },
    };

    let rId = 1, dId = 1;
    db.Clientes.slice(0, 10).forEach((c, i) => {
      const plan = plantillas[c.ObjetivoID] || plantillas[4];
      const obj = db.Objetivos.find((o) => o.ObjetivoID === c.ObjetivoID);
      db.Rutinas.push({
        RutinaID: rId, ClienteID: c.ClienteID, EntrenadorID: (i % 3) + 1,
        Nombre: `Plan ${obj ? obj.Nombre : "General"} - ${c.Nombres}`,
        ObjetivoID: c.ObjetivoID, Nivel: c.NivelExperiencia,
        FechaInicio: fmtDate(addDays(now, -20)), FechaFin: fmtDate(addDays(now, 40)),
        DiasPorSemana: Object.keys(plan).length, ProgresionSemanal: "+2.5% carga semanal",
        Observaciones: "Mantener técnica estricta. Reevaluar en 4 semanas.",
        Estado: "Activa", Version: 1, FechaCreacion: fmtDT(addDays(now, -20)),
      });
      Object.entries(plan).forEach(([dia, exs]) => {
        exs.forEach((e, k) => {
          db.RutinaDetalle.push({ DetalleID: dId++, RutinaID: rId, DiaSemana: dia, EjercicioID: byName(e[0]), Orden: k + 1, Series: e[1], Repeticiones: e[2], PesoKg: e[3], DescansoSeg: e[4], Notas: "" });
        });
      });
      rId++;
    });

    // Accesos históricos
    let aId = 1;
    for (let d = 29; d >= 0; d--) {
      const day = addDays(now, -d);
      const count = 4 + ((d * 7) % 6);
      for (let k = 0; k < count; k++) {
        const c = db.Clientes[(d + k * 3) % db.Clientes.length];
        const entrada = new Date(day); entrada.setHours(6 + ((k * 3) % 13), (k * 17) % 60, 0, 0);
        const dur = 45 + ((k * 13) % 60);
        const incompleto = d > 0 && (d + k) % 17 === 0;
        db.Accesos.push({
          AccesoID: aId++, ClienteID: c.ClienteID, FechaHoraEntrada: fmtDT(entrada),
          FechaHoraSalida: incompleto ? null : fmtDT(new Date(entrada.getTime() + dur * 60000)),
          MetodoAcceso: ["QR", "Código", "Manual"][k % 3], Estado: incompleto ? "Incompleto" : "Finalizado", UsuarioID: 2,
        });
      }
    }
    // Gente dentro ahora
    [1, 4, 6].forEach((cid, k) => {
      const entrada = new Date(now.getTime() - (30 + k * 25) * 60000);
      db.Accesos.push({ AccesoID: aId++, ClienteID: cid, FechaHoraEntrada: fmtDT(entrada), FechaHoraSalida: null, MetodoAcceso: "QR", Estado: "Dentro", UsuarioID: 2 });
    });

    // Progreso
    let prId = 1;
    db.Clientes.slice(0, 8).forEach((c) => {
      for (let m = 3; m >= 0; m--) {
        const delta = c.ObjetivoID === 1 ? m * 1.5 : -m * 0.8;
        db.Progreso.push({
          ProgresoID: prId++, ClienteID: c.ClienteID, Fecha: fmtDate(addDays(now, -m * 30)),
          Peso_kg: +(c.Peso_kg + delta).toFixed(1), GrasaCorporal: +(20 + m * 0.9).toFixed(1),
          MasaMuscular: +(c.Peso_kg * 0.42 - m * 0.4).toFixed(1),
          Cintura_cm: +(80 + m * 1.2).toFixed(1), Pecho_cm: +(95 - m * 0.5).toFixed(1),
          Brazo_cm: +(33 - m * 0.4).toFixed(1), Pierna_cm: +(56 - m * 0.5).toFixed(1),
          Notas: m === 0 ? "Última evaluación" : "Control mensual",
        });
      }
    });

    db.Auditoria = [
      { AuditoriaID: 1, UsuarioID: 1, Accion: "LOGIN", TablaAfectada: "Usuarios", RegistroID: "1", Detalle: "Inicio de sesión del administrador", FechaHora: fmtDT(addDays(now, -1)) },
      { AuditoriaID: 2, UsuarioID: 2, Accion: "INSERT", TablaAfectada: "Pagos", RegistroID: "5", Detalle: "Registro de pago mensual", FechaHora: fmtDT(addDays(now, -1)) },
    ];

    return db;
  }

  const DB = {
    data: null,
    listeners: [],

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { this.data = JSON.parse(raw); TABLES.forEach((t) => { if (!this.data[t]) this.data[t] = []; }); }
        else { this.data = seed(); this.save(); }
      } catch (e) { this.data = seed(); this.save(); }
      this.refreshAlertas();
      return this.data;
    },
    reset() { this.data = seed(); this.save(); this.refreshAlertas(); this.emit(); },
    save() { localStorage.setItem(KEY, JSON.stringify(this.data)); },
    on(fn) { this.listeners.push(fn); },
    emit() { this.listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); },

    all(t) { return (this.data[t] || []).slice(); },
    find(t, id) { const pk = S.tables[t].pk; return (this.data[t] || []).find((r) => String(r[pk]) === String(id)); },
    where(t, fn) { return (this.data[t] || []).filter(fn); },
    nextId(t) {
      const pk = S.tables[t].pk;
      return (this.data[t] || []).reduce((m, r) => Math.max(m, Number(r[pk]) || 0), 0) + 1;
    },
    insert(t, row, audit = true) {
      const pk = S.tables[t].pk;
      const rec = Object.assign({}, row);
      rec[pk] = this.nextId(t);
      S.tables[t].columns.forEach((c) => { if (!(c.name in rec)) rec[c.name] = null; });
      this.data[t].push(rec);
      if (audit) this.log("INSERT", t, rec[pk], `Nuevo registro en ${t}`);
      this.save(); this.emit();
      return rec;
    },
    update(t, id, patch, audit = true) {
      const rec = this.find(t, id);
      if (!rec) return null;
      Object.assign(rec, patch);
      if (audit) this.log("UPDATE", t, id, `Actualización en ${t}`);
      this.save(); this.emit();
      return rec;
    },
    remove(t, id, audit = true) {
      const pk = S.tables[t].pk;
      const before = this.data[t].length;
      this.data[t] = this.data[t].filter((r) => String(r[pk]) !== String(id));
      if (audit) this.log("DELETE", t, id, `Eliminación en ${t}`);
      this.save(); this.emit();
      return before !== this.data[t].length;
    },
    log(accion, tabla, regId, detalle) {
      const u = window.SGC_SESSION && window.SGC_SESSION.usuario;
      const id = (this.data.Auditoria || []).reduce((m, r) => Math.max(m, r.AuditoriaID || 0), 0) + 1;
      this.data.Auditoria.push({
        AuditoriaID: id, UsuarioID: u ? u.UsuarioID : null, Accion: accion,
        TablaAfectada: tabla, RegistroID: String(regId ?? ""), Detalle: detalle, FechaHora: fmtDT(new Date()),
      });
    },

    /* ---------- Lógica de negocio ---------- */
    clienteNombre(id) { const c = this.find("Clientes", id); return c ? `${c.Nombres} ${c.Apellidos}` : "—"; },
    membresiaActual(clienteId) {
      const ms = this.where("Membresias", (m) => String(m.ClienteID) === String(clienteId));
      ms.sort((a, b) => (a.FechaFin < b.FechaFin ? 1 : -1));
      return ms[0] || null;
    },
    diasRestantes(fechaFin) {
      if (!fechaFin) return null;
      const f = new Date(fechaFin + "T23:59:59");
      return Math.ceil((f - new Date()) / 86400000);
    },
    dentroDelGym() { return this.where("Accesos", (a) => !a.FechaHoraSalida && a.Estado === "Dentro"); },
    asistenciasIncompletas() {
      return this.where("Accesos", (a) => a.Estado === "Incompleto" || (!a.FechaHoraSalida && (new Date() - new Date(a.FechaHoraEntrada.replace(" ", "T"))) > 5 * 3600000));
    },
    registrarEntrada(codigo, metodo = "QR") {
      const c = this.where("Clientes", (x) => x.Codigo.toLowerCase() === String(codigo).toLowerCase() || String(x.ClienteID) === String(codigo))[0];
      if (!c) return { ok: false, msg: "Cliente no encontrado con ese código o QR." };
      if (c.Estado !== "Activo") return { ok: false, msg: "El cliente está " + c.Estado.toLowerCase() + "." };
      const abierto = this.where("Accesos", (a) => String(a.ClienteID) === String(c.ClienteID) && !a.FechaHoraSalida)[0];
      if (abierto) return { ok: false, msg: `${c.Nombres} ya se encuentra dentro del gimnasio.` };
      const m = this.membresiaActual(c.ClienteID);
      const dias = m ? this.diasRestantes(m.FechaFin) : null;
      this.insert("Accesos", { ClienteID: c.ClienteID, FechaHoraEntrada: fmtDT(new Date()), FechaHoraSalida: null, MetodoAcceso: metodo, Estado: "Dentro", UsuarioID: window.SGC_SESSION?.usuario?.UsuarioID || null });
      const aviso = dias === null ? "Sin membresía registrada." : dias < 0 ? `⚠️ Membresía vencida hace ${Math.abs(dias)} días.` : dias <= 7 ? `⚠️ Membresía vence en ${dias} días.` : `Membresía vigente (${dias} días).`;
      return { ok: true, msg: `Entrada registrada: ${c.Nombres} ${c.Apellidos}. ${aviso}`, cliente: c };
    },
    registrarSalida(codigo) {
      const c = this.where("Clientes", (x) => x.Codigo.toLowerCase() === String(codigo).toLowerCase() || String(x.ClienteID) === String(codigo))[0];
      if (!c) return { ok: false, msg: "Cliente no encontrado." };
      const abierto = this.where("Accesos", (a) => String(a.ClienteID) === String(c.ClienteID) && !a.FechaHoraSalida)[0];
      if (!abierto) return { ok: false, msg: `${c.Nombres} no tiene una entrada abierta.` };
      this.update("Accesos", abierto.AccesoID, { FechaHoraSalida: fmtDT(new Date()), Estado: "Finalizado" });
      return { ok: true, msg: `Salida registrada: ${c.Nombres} ${c.Apellidos}.`, cliente: c };
    },
    refreshAlertas() {
      this.data.Alertas = [];
      let id = 1;
      const push = (Tipo, ClienteID, Mensaje, Severidad) =>
        this.data.Alertas.push({ AlertaID: id++, Tipo, ClienteID, Mensaje, Severidad, Fecha: fmtDT(new Date()), Leida: 0 });
      this.all("Clientes").forEach((c) => {
        const m = this.membresiaActual(c.ClienteID);
        if (!m) return;
        const d = this.diasRestantes(m.FechaFin);
        if (d < 0) push("Membresía vencida", c.ClienteID, `${c.Nombres} ${c.Apellidos} tiene la membresía vencida hace ${Math.abs(d)} días.`, "Alta");
        else if (d <= 7) push("Por vencer", c.ClienteID, `${c.Nombres} ${c.Apellidos} vence en ${d} día(s).`, "Media");
      });
      this.asistenciasIncompletas().forEach((a) =>
        push("Asistencia incompleta", a.ClienteID, `${this.clienteNombre(a.ClienteID)} marcó entrada el ${a.FechaHoraEntrada} y no registró salida.`, "Media"));
      this.where("Pagos", (p) => p.Estado === "Pendiente").forEach((p) =>
        push("Pago pendiente", p.ClienteID, `${this.clienteNombre(p.ClienteID)} tiene un pago pendiente de C$${p.Monto}.`, "Alta"));
      this.save();
    },

    /* ---------- Mini motor SQL ---------- */
    exec(sql) {
      const raw = String(sql).trim().replace(/;+\s*$/, "");
      if (!raw) throw new Error("Consulta vacía.");
      const up = raw.toUpperCase();
      if (up.startsWith("SELECT")) return this._select(raw);
      if (up.startsWith("INSERT")) return this._insert(raw);
      if (up.startsWith("UPDATE")) return this._update(raw);
      if (up.startsWith("DELETE")) return this._delete(raw);
      throw new Error("Solo se admiten SELECT, INSERT, UPDATE y DELETE en el editor.");
    },
    _table(name) {
      const clean = String(name).replace(/^dbo\./i, "").replace(/[\[\]]/g, "");
      const t = TABLES.find((x) => x.toLowerCase() === clean.toLowerCase());
      if (!t) throw new Error(`La tabla '${name}' no existe.`);
      return t;
    },
    _val(tok) {
      tok = tok.trim();
      if (/^N?'.*'$/is.test(tok)) return tok.replace(/^N?'/i, "").replace(/'$/, "").replace(/''/g, "'");
      if (/^NULL$/i.test(tok)) return null;
      if (/^-?\d+(\.\d+)?$/.test(tok)) return Number(tok);
      if (/^GETDATE\(\)$/i.test(tok)) return fmtDT(new Date());
      return tok.replace(/^"|"$/g, "");
    },
    _where(rows, clause, table) {
      if (!clause) return rows;
      const parts = clause.split(/\s+AND\s+/i).map((p) => p.trim());
      return rows.filter((r) =>
        parts.every((p) => {
          const m = p.match(/^([\w\.\[\]]+)\s*(>=|<=|<>|!=|=|>|<|LIKE)\s*(.+)$/i);
          if (!m) throw new Error("No se pudo interpretar la condición: " + p);
          const col = m[1].replace(/[\[\]]/g, "").split(".").pop();
          const op = m[2].toUpperCase();
          const val = this._val(m[3]);
          const cur = r[col];
          if (op === "LIKE") {
            const rx = new RegExp("^" + String(val).replace(/[.*+?^${}()|\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
            return rx.test(String(cur ?? ""));
          }
          const a = isNaN(Number(cur)) || cur === null || cur === "" ? cur : Number(cur);
          const b = isNaN(Number(val)) || val === null || val === "" ? val : Number(val);
          switch (op) {
            case "=": return String(a) === String(b);
            case "<>": case "!=": return String(a) !== String(b);
            case ">": return a > b; case "<": return a < b;
            case ">=": return a >= b; case "<=": return a <= b;
          }
          return false;
        })
      );
    },
    _select(sql) {
      const m = sql.match(/^SELECT\s+(?:TOP\s+(\d+)\s+)?([\s\S]+?)\s+FROM\s+([\w\.\[\]]+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+([\s\S]+?))?$/i);
      if (!m) throw new Error("Sintaxis SELECT no válida. Ej: SELECT * FROM Clientes WHERE Estado = 'Activo'");
      const [, top, colsRaw, tableRaw, whereRaw, orderRaw] = m;
      const table = this._table(tableRaw);
      let rows = this._where(this.all(table), whereRaw, table);
      if (orderRaw) {
        const [c, dir] = orderRaw.trim().split(/\s+/);
        const col = c.replace(/[\[\]]/g, "");
        rows.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0));
        if (dir && dir.toUpperCase() === "DESC") rows.reverse();
      }
      if (top) rows = rows.slice(0, Number(top));
      const cols = colsRaw.trim() === "*"
        ? S.tables[table].columns.map((c) => c.name)
        : colsRaw.split(",").map((c) => c.trim().replace(/[\[\]]/g, "").split(".").pop());
      return { type: "select", table, columns: cols, rows: rows.map((r) => { const o = {}; cols.forEach((c) => (o[c] = r[c])); return o; }) };
    },
    _insert(sql) {
      const m = sql.match(/^INSERT\s+INTO\s+([\w\.\[\]]+)\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)$/i);
      if (!m) throw new Error("Sintaxis INSERT no válida. Ej: INSERT INTO Ejercicios (Nombre, GrupoMuscular) VALUES ('Zancadas','Piernas')");
      const table = this._table(m[1]);
      const cols = m[2].split(",").map((c) => c.trim().replace(/[\[\]]/g, ""));
      const vals = m[3].match(/(N?'(?:[^']|'')*'|[^,]+)/g).map((v) => this._val(v));
      const row = {}; cols.forEach((c, i) => (row[c] = vals[i]));
      const rec = this.insert(table, row);
      return { type: "dml", table, affected: 1, message: `1 fila insertada en ${table} (ID ${rec[S.tables[table].pk]}).` };
    },
    _update(sql) {
      const m = sql.match(/^UPDATE\s+([\w\.\[\]]+)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
      if (!m) throw new Error("Sintaxis UPDATE no válida.");
      const table = this._table(m[1]);
      const sets = m[2].split(/,(?![^']*'(?:[^']*'[^']*')*[^']*$)/).map((s) => {
        const p = s.split("=");
        return [p[0].trim().replace(/[\[\]]/g, ""), this._val(p.slice(1).join("="))];
      });
      const rows = this._where(this.all(table), m[3], table);
      const pk = S.tables[table].pk;
      rows.forEach((r) => { const patch = {}; sets.forEach(([c, v]) => (patch[c] = v)); this.update(table, r[pk], patch, false); });
      this.log("UPDATE", table, "-", `${rows.length} fila(s) por consulta SQL`);
      this.save(); this.emit();
      return { type: "dml", table, affected: rows.length, message: `${rows.length} fila(s) actualizada(s) en ${table}.` };
    },
    _delete(sql) {
      const m = sql.match(/^DELETE\s+FROM\s+([\w\.\[\]]+)(?:\s+WHERE\s+([\s\S]+))?$/i);
      if (!m) throw new Error("Sintaxis DELETE no válida.");
      const table = this._table(m[1]);
      const rows = this._where(this.all(table), m[2], table);
      const pk = S.tables[table].pk;
      rows.forEach((r) => this.remove(table, r[pk], false));
      this.log("DELETE", table, "-", `${rows.length} fila(s) por consulta SQL`);
      this.save(); this.emit();
      return { type: "dml", table, affected: rows.length, message: `${rows.length} fila(s) eliminada(s) de ${table}.` };
    },
  };

  window.SGC_DB = DB;
  window.SGC_UTIL = { fmtDate, fmtDT, addDays, pad };
})();
