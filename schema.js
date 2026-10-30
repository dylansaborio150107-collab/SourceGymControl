/* SourceGymControl - Definición del esquema (SQL Server) */
window.SGC_SCHEMA = {
  database: "SourceGymControl",
  tables: {
    Roles: {
      label: "Roles",
      pk: "RolID",
      columns: [
        { name: "RolID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Nombre", type: "NVARCHAR(50) NOT NULL UNIQUE", ui: "text", label: "Nombre", required: true },
        { name: "Descripcion", type: "NVARCHAR(200)", ui: "text", label: "Descripción" },
      ],
    },
    Permisos: {
      label: "Permisos",
      pk: "PermisoID",
      columns: [
        { name: "PermisoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Codigo", type: "NVARCHAR(60) NOT NULL UNIQUE", ui: "text", label: "Código", required: true },
        { name: "Descripcion", type: "NVARCHAR(200)", ui: "text", label: "Descripción" },
      ],
    },
    RolPermisos: {
      label: "Permisos por rol",
      pk: "RolPermisoID",
      columns: [
        { name: "RolPermisoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "RolID", type: "INT NOT NULL", ui: "fk", ref: "Roles", label: "Rol", required: true },
        { name: "PermisoID", type: "INT NOT NULL", ui: "fk", ref: "Permisos", label: "Permiso", required: true },
      ],
    },
    Usuarios: {
      label: "Usuarios",
      pk: "UsuarioID",
      columns: [
        { name: "UsuarioID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "NombreUsuario", type: "NVARCHAR(50) NOT NULL UNIQUE", ui: "text", label: "Usuario", required: true },
        { name: "NombreCompleto", type: "NVARCHAR(120) NOT NULL", ui: "text", label: "Nombre completo", required: true },
        { name: "Correo", type: "NVARCHAR(120) NOT NULL UNIQUE", ui: "email", label: "Correo", required: true },
        { name: "ContrasenaHash", type: "NVARCHAR(200) NOT NULL", ui: "password", label: "Contraseña", required: true },
        { name: "RolID", type: "INT NOT NULL", ui: "fk", ref: "Roles", label: "Rol", required: true },
        { name: "EntrenadorID", type: "INT NULL", ui: "fk", ref: "Entrenadores", label: "Entrenador vinculado" },
        { name: "ClienteID", type: "INT NULL", ui: "fk", ref: "Clientes", label: "Cliente vinculado" },
        { name: "Activo", type: "BIT NOT NULL DEFAULT 1", ui: "bool", label: "Activo" },
        { name: "UltimoAcceso", type: "DATETIME NULL", ui: "datetime", label: "Último acceso", readonly: true },
        { name: "FechaCreacion", type: "DATETIME NOT NULL DEFAULT GETDATE()", ui: "datetime", label: "Creado", readonly: true },
      ],
    },
    Entrenadores: {
      label: "Entrenadores",
      pk: "EntrenadorID",
      columns: [
        { name: "EntrenadorID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Nombres", type: "NVARCHAR(80) NOT NULL", ui: "text", label: "Nombres", required: true },
        { name: "Apellidos", type: "NVARCHAR(80) NOT NULL", ui: "text", label: "Apellidos", required: true },
        { name: "Cedula", type: "NVARCHAR(30) UNIQUE", ui: "text", label: "Cédula" },
        { name: "Telefono", type: "NVARCHAR(30)", ui: "text", label: "Teléfono" },
        { name: "Correo", type: "NVARCHAR(120)", ui: "email", label: "Correo" },
        { name: "Especialidad", type: "NVARCHAR(80)", ui: "select", options: ["Hipertrofia", "Pérdida de grasa", "Fuerza", "Funcional", "Rehabilitación", "Acondicionamiento"], label: "Especialidad" },
        { name: "Horario", type: "NVARCHAR(60)", ui: "text", label: "Horario" },
        { name: "FechaContratacion", type: "DATE NOT NULL DEFAULT GETDATE()", ui: "date", label: "Contratación" },
        { name: "Activo", type: "BIT NOT NULL DEFAULT 1", ui: "bool", label: "Activo" },
      ],
    },
    Objetivos: {
      label: "Objetivos",
      pk: "ObjetivoID",
      columns: [
        { name: "ObjetivoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Nombre", type: "NVARCHAR(60) NOT NULL UNIQUE", ui: "text", label: "Nombre", required: true },
        { name: "Descripcion", type: "NVARCHAR(200)", ui: "text", label: "Descripción" },
      ],
    },
    Clientes: {
      label: "Clientes",
      pk: "ClienteID",
      columns: [
        { name: "ClienteID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Codigo", type: "NVARCHAR(20) NOT NULL UNIQUE", ui: "text", label: "Código / QR", required: true },
        { name: "Nombres", type: "NVARCHAR(80) NOT NULL", ui: "text", label: "Nombres", required: true },
        { name: "Apellidos", type: "NVARCHAR(80) NOT NULL", ui: "text", label: "Apellidos", required: true },
        { name: "Cedula", type: "NVARCHAR(30)", ui: "text", label: "Cédula" },
        { name: "Sexo", type: "NVARCHAR(10)", ui: "select", options: ["Masculino", "Femenino"], label: "Sexo" },
        { name: "Edad", type: "INT", ui: "number", label: "Edad" },
        { name: "Telefono", type: "NVARCHAR(30)", ui: "text", label: "Teléfono" },
        { name: "Correo", type: "NVARCHAR(120)", ui: "email", label: "Correo" },
        { name: "Direccion", type: "NVARCHAR(200)", ui: "text", label: "Dirección" },
        { name: "Altura_cm", type: "DECIMAL(5,1)", ui: "number", label: "Altura (cm)" },
        { name: "Peso_kg", type: "DECIMAL(5,1)", ui: "number", label: "Peso (kg)" },
        { name: "NivelExperiencia", type: "NVARCHAR(20)", ui: "select", options: ["Principiante", "Intermedio", "Avanzado"], label: "Nivel" },
        { name: "ObjetivoID", type: "INT NULL", ui: "fk", ref: "Objetivos", label: "Objetivo" },
        { name: "DiasDisponibles", type: "NVARCHAR(60)", ui: "text", label: "Días disponibles" },
        { name: "Lesiones", type: "NVARCHAR(300)", ui: "textarea", label: "Lesiones / limitaciones" },
        { name: "ZonasInteres", type: "NVARCHAR(200)", ui: "text", label: "Zonas a trabajar" },
        { name: "FechaRegistro", type: "DATE NOT NULL DEFAULT GETDATE()", ui: "date", label: "Registro" },
        { name: "Estado", type: "NVARCHAR(20) NOT NULL DEFAULT 'Activo'", ui: "select", options: ["Activo", "Inactivo", "Suspendido"], label: "Estado" },
      ],
    },
    TiposMembresia: {
      label: "Tipos de membresía",
      pk: "TipoMembresiaID",
      columns: [
        { name: "TipoMembresiaID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Nombre", type: "NVARCHAR(60) NOT NULL UNIQUE", ui: "text", label: "Nombre", required: true },
        { name: "DuracionDias", type: "INT NOT NULL", ui: "number", label: "Duración (días)", required: true },
        { name: "Precio", type: "DECIMAL(10,2) NOT NULL", ui: "number", label: "Precio", required: true },
        { name: "Descripcion", type: "NVARCHAR(200)", ui: "text", label: "Descripción" },
        { name: "Activo", type: "BIT NOT NULL DEFAULT 1", ui: "bool", label: "Activo" },
      ],
    },
    Membresias: {
      label: "Membresías",
      pk: "MembresiaID",
      columns: [
        { name: "MembresiaID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "ClienteID", type: "INT NOT NULL", ui: "fk", ref: "Clientes", label: "Cliente", required: true },
        { name: "TipoMembresiaID", type: "INT NOT NULL", ui: "fk", ref: "TiposMembresia", label: "Tipo", required: true },
        { name: "FechaInicio", type: "DATE NOT NULL", ui: "date", label: "Inicio", required: true },
        { name: "FechaFin", type: "DATE NOT NULL", ui: "date", label: "Vencimiento", required: true },
        { name: "Estado", type: "NVARCHAR(20) NOT NULL DEFAULT 'Activa'", ui: "select", options: ["Activa", "Vencida", "Cancelada"], label: "Estado" },
        { name: "Notas", type: "NVARCHAR(200)", ui: "text", label: "Notas" },
      ],
    },
    Pagos: {
      label: "Pagos",
      pk: "PagoID",
      columns: [
        { name: "PagoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "ClienteID", type: "INT NOT NULL", ui: "fk", ref: "Clientes", label: "Cliente", required: true },
        { name: "MembresiaID", type: "INT NULL", ui: "fk", ref: "Membresias", label: "Membresía" },
        { name: "Monto", type: "DECIMAL(10,2) NOT NULL", ui: "number", label: "Monto", required: true },
        { name: "MetodoPago", type: "NVARCHAR(30) NOT NULL DEFAULT 'Efectivo'", ui: "select", options: ["Efectivo", "Tarjeta", "Transferencia", "Móvil"], label: "Método" },
        { name: "FechaPago", type: "DATE NOT NULL DEFAULT GETDATE()", ui: "date", label: "Fecha" },
        { name: "Estado", type: "NVARCHAR(20) NOT NULL DEFAULT 'Pagado'", ui: "select", options: ["Pagado", "Pendiente", "Anulado"], label: "Estado" },
        { name: "Referencia", type: "NVARCHAR(60)", ui: "text", label: "Referencia" },
        { name: "UsuarioID", type: "INT NULL", ui: "fk", ref: "Usuarios", label: "Registrado por" },
      ],
    },
    Accesos: {
      label: "Accesos",
      pk: "AccesoID",
      columns: [
        { name: "AccesoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "ClienteID", type: "INT NOT NULL", ui: "fk", ref: "Clientes", label: "Cliente", required: true },
        { name: "FechaHoraEntrada", type: "DATETIME NOT NULL DEFAULT GETDATE()", ui: "datetime", label: "Entrada", required: true },
        { name: "FechaHoraSalida", type: "DATETIME NULL", ui: "datetime", label: "Salida" },
        { name: "MetodoAcceso", type: "NVARCHAR(20) NOT NULL DEFAULT 'QR'", ui: "select", options: ["QR", "Código", "Manual"], label: "Método" },
        { name: "Estado", type: "NVARCHAR(20) NOT NULL DEFAULT 'Dentro'", ui: "select", options: ["Dentro", "Finalizado", "Incompleto"], label: "Estado" },
        { name: "UsuarioID", type: "INT NULL", ui: "fk", ref: "Usuarios", label: "Registrado por" },
      ],
    },
    Ejercicios: {
      label: "Ejercicios",
      pk: "EjercicioID",
      columns: [
        { name: "EjercicioID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Nombre", type: "NVARCHAR(80) NOT NULL UNIQUE", ui: "text", label: "Nombre", required: true },
        { name: "GrupoMuscular", type: "NVARCHAR(40) NOT NULL", ui: "select", options: ["Pecho", "Espalda", "Piernas", "Glúteos", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio"], label: "Grupo muscular", required: true },
        { name: "Equipo", type: "NVARCHAR(40)", ui: "select", options: ["Barra", "Mancuernas", "Máquina", "Peso corporal", "Polea", "Kettlebell", "Ninguno"], label: "Equipo" },
        { name: "Dificultad", type: "NVARCHAR(20)", ui: "select", options: ["Principiante", "Intermedio", "Avanzado"], label: "Dificultad" },
        { name: "Descripcion", type: "NVARCHAR(300)", ui: "textarea", label: "Descripción" },
      ],
    },
    Rutinas: {
      label: "Rutinas",
      pk: "RutinaID",
      columns: [
        { name: "RutinaID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "ClienteID", type: "INT NOT NULL", ui: "fk", ref: "Clientes", label: "Cliente", required: true },
        { name: "EntrenadorID", type: "INT NULL", ui: "fk", ref: "Entrenadores", label: "Entrenador" },
        { name: "Nombre", type: "NVARCHAR(100) NOT NULL", ui: "text", label: "Nombre", required: true },
        { name: "ObjetivoID", type: "INT NULL", ui: "fk", ref: "Objetivos", label: "Objetivo" },
        { name: "Nivel", type: "NVARCHAR(20)", ui: "select", options: ["Principiante", "Intermedio", "Avanzado"], label: "Nivel" },
        { name: "FechaInicio", type: "DATE NOT NULL", ui: "date", label: "Inicio", required: true },
        { name: "FechaFin", type: "DATE NULL", ui: "date", label: "Fin" },
        { name: "DiasPorSemana", type: "INT NOT NULL DEFAULT 3", ui: "number", label: "Días/semana" },
        { name: "ProgresionSemanal", type: "NVARCHAR(60)", ui: "text", label: "Progresión semanal" },
        { name: "Observaciones", type: "NVARCHAR(400)", ui: "textarea", label: "Observaciones" },
        { name: "Estado", type: "NVARCHAR(20) NOT NULL DEFAULT 'Activa'", ui: "select", options: ["Activa", "Finalizada", "Archivada"], label: "Estado" },
        { name: "Version", type: "INT NOT NULL DEFAULT 1", ui: "number", label: "Versión" },
        { name: "FechaCreacion", type: "DATETIME NOT NULL DEFAULT GETDATE()", ui: "datetime", label: "Creada", readonly: true },
      ],
    },
    RutinaDetalle: {
      label: "Detalle de rutina",
      pk: "DetalleID",
      columns: [
        { name: "DetalleID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "RutinaID", type: "INT NOT NULL", ui: "fk", ref: "Rutinas", label: "Rutina", required: true },
        { name: "DiaSemana", type: "NVARCHAR(15) NOT NULL", ui: "select", options: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"], label: "Día", required: true },
        { name: "EjercicioID", type: "INT NOT NULL", ui: "fk", ref: "Ejercicios", label: "Ejercicio", required: true },
        { name: "Orden", type: "INT NOT NULL DEFAULT 1", ui: "number", label: "Orden" },
        { name: "Series", type: "INT NOT NULL DEFAULT 3", ui: "number", label: "Series" },
        { name: "Repeticiones", type: "NVARCHAR(20) NOT NULL DEFAULT '12'", ui: "text", label: "Reps" },
        { name: "PesoKg", type: "DECIMAL(6,2) NULL", ui: "number", label: "Peso (kg)" },
        { name: "DescansoSeg", type: "INT NOT NULL DEFAULT 60", ui: "number", label: "Descanso (s)" },
        { name: "Notas", type: "NVARCHAR(200)", ui: "text", label: "Notas" },
      ],
    },
    Progreso: {
      label: "Progreso físico",
      pk: "ProgresoID",
      columns: [
        { name: "ProgresoID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "ClienteID", type: "INT NOT NULL", ui: "fk", ref: "Clientes", label: "Cliente", required: true },
        { name: "Fecha", type: "DATE NOT NULL DEFAULT GETDATE()", ui: "date", label: "Fecha", required: true },
        { name: "Peso_kg", type: "DECIMAL(5,1)", ui: "number", label: "Peso (kg)" },
        { name: "GrasaCorporal", type: "DECIMAL(4,1)", ui: "number", label: "% Grasa" },
        { name: "MasaMuscular", type: "DECIMAL(5,1)", ui: "number", label: "Masa muscular (kg)" },
        { name: "Cintura_cm", type: "DECIMAL(5,1)", ui: "number", label: "Cintura (cm)" },
        { name: "Pecho_cm", type: "DECIMAL(5,1)", ui: "number", label: "Pecho (cm)" },
        { name: "Brazo_cm", type: "DECIMAL(5,1)", ui: "number", label: "Brazo (cm)" },
        { name: "Pierna_cm", type: "DECIMAL(5,1)", ui: "number", label: "Pierna (cm)" },
        { name: "Notas", type: "NVARCHAR(300)", ui: "textarea", label: "Notas" },
      ],
    },
    Alertas: {
      label: "Alertas",
      pk: "AlertaID",
      columns: [
        { name: "AlertaID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "Tipo", type: "NVARCHAR(40) NOT NULL", ui: "select", options: ["Membresía vencida", "Por vencer", "Asistencia incompleta", "Pago pendiente"], label: "Tipo", required: true },
        { name: "ClienteID", type: "INT NULL", ui: "fk", ref: "Clientes", label: "Cliente" },
        { name: "Mensaje", type: "NVARCHAR(300) NOT NULL", ui: "text", label: "Mensaje", required: true },
        { name: "Severidad", type: "NVARCHAR(20) NOT NULL DEFAULT 'Media'", ui: "select", options: ["Alta", "Media", "Baja"], label: "Severidad" },
        { name: "Fecha", type: "DATETIME NOT NULL DEFAULT GETDATE()", ui: "datetime", label: "Fecha" },
        { name: "Leida", type: "BIT NOT NULL DEFAULT 0", ui: "bool", label: "Leída" },
      ],
    },
    Auditoria: {
      label: "Historial de actividades",
      pk: "AuditoriaID",
      columns: [
        { name: "AuditoriaID", type: "INT IDENTITY(1,1)", ui: "id", label: "ID" },
        { name: "UsuarioID", type: "INT NULL", ui: "fk", ref: "Usuarios", label: "Usuario" },
        { name: "Accion", type: "NVARCHAR(20) NOT NULL", ui: "text", label: "Acción" },
        { name: "TablaAfectada", type: "NVARCHAR(60) NOT NULL", ui: "text", label: "Tabla" },
        { name: "RegistroID", type: "NVARCHAR(20)", ui: "text", label: "Registro" },
        { name: "Detalle", type: "NVARCHAR(500)", ui: "textarea", label: "Detalle" },
        { name: "FechaHora", type: "DATETIME NOT NULL DEFAULT GETDATE()", ui: "datetime", label: "Fecha/Hora" },
      ],
    },
  },
};

/* Generador del script T-SQL completo */
window.SGC_buildSqlScript = function (data) {
  const S = window.SGC_SCHEMA;
  const L = [];
  const q = (v) => (v === null || v === undefined || v === "" ? "NULL" : `N'${String(v).replace(/'/g, "''")}'`);
  const num = (v) => (v === null || v === undefined || v === "" ? "NULL" : Number(v));
  const bit = (v) => (v ? 1 : 0);

  L.push("/* =====================================================");
  L.push("   SourceGymControl - Base de datos SQL Server");
  L.push("   Ecosistema digital de rendimiento biométrico");
  L.push("   Generado: " + new Date().toLocaleString("es-NI"));
  L.push("   ===================================================== */");
  L.push("");
  L.push("IF DB_ID('SourceGymControl') IS NOT NULL");
  L.push("BEGIN");
  L.push("    ALTER DATABASE SourceGymControl SET SINGLE_USER WITH ROLLBACK IMMEDIATE;");
  L.push("    DROP DATABASE SourceGymControl;");
  L.push("END");
  L.push("GO");
  L.push("CREATE DATABASE SourceGymControl;");
  L.push("GO");
  L.push("USE SourceGymControl;");
  L.push("GO");
  L.push("");

  const order = ["Roles", "Permisos", "RolPermisos", "Objetivos", "Entrenadores", "Clientes", "Usuarios", "TiposMembresia", "Membresias", "Pagos", "Accesos", "Ejercicios", "Rutinas", "RutinaDetalle", "Progreso", "Alertas", "Auditoria"];

  // Tablas
  order.forEach((t) => {
    const def = S.tables[t];
    L.push(`/* ---------- Tabla: ${t} (${def.label}) ---------- */`);
    L.push(`CREATE TABLE dbo.${t} (`);
    const lines = def.columns.map((c) => {
      let line = `    ${c.name} ${c.type}`;
      if (c.name === def.pk) line += " PRIMARY KEY";
      return line;
    });
    def.columns.filter((c) => c.ui === "fk" && c.ref).forEach((c) => {
      const refPk = S.tables[c.ref].pk;
      lines.push(`    CONSTRAINT FK_${t}_${c.name} FOREIGN KEY (${c.name}) REFERENCES dbo.${c.ref}(${refPk})`);
    });
    L.push(lines.join(",\n"));
    L.push(");");
    L.push("GO");
    L.push("");
  });

  // Índices
  L.push("/* ---------- Índices ---------- */");
  L.push("CREATE INDEX IX_Clientes_Codigo ON dbo.Clientes(Codigo);");
  L.push("CREATE INDEX IX_Membresias_Cliente ON dbo.Membresias(ClienteID, Estado);");
  L.push("CREATE INDEX IX_Accesos_Cliente_Fecha ON dbo.Accesos(ClienteID, FechaHoraEntrada);");
  L.push("CREATE INDEX IX_Pagos_Cliente_Fecha ON dbo.Pagos(ClienteID, FechaPago);");
  L.push("CREATE INDEX IX_RutinaDetalle_Rutina ON dbo.RutinaDetalle(RutinaID, DiaSemana, Orden);");
  L.push("GO");
  L.push("");

  // Datos
  if (data) {
    L.push("/* =============== DATOS =============== */");
    order.forEach((t) => {
      const def = S.tables[t];
      const rows = data[t] || [];
      if (!rows.length) return;
      L.push(`/* ${t} */`);
      L.push(`SET IDENTITY_INSERT dbo.${t} ON;`);
      const cols = def.columns.map((c) => c.name);
      rows.forEach((r) => {
        const vals = def.columns.map((c) => {
          const v = r[c.name];
          if (/INT|DECIMAL/.test(c.type) && c.ui !== "bool") return num(v);
          if (c.ui === "bool" || /BIT/.test(c.type)) return bit(v);
          return q(v);
        });
        L.push(`INSERT INTO dbo.${t} (${cols.join(", ")}) VALUES (${vals.join(", ")});`);
      });
      L.push(`SET IDENTITY_INSERT dbo.${t} OFF;`);
      L.push("GO");
      L.push("");
    });
  }

  // Vistas y procedimientos
  L.push("/* =============== VISTAS =============== */");
  L.push(`CREATE VIEW dbo.vw_ClientesActivos AS
SELECT c.ClienteID, c.Codigo, c.Nombres + ' ' + c.Apellidos AS NombreCompleto,
       c.NivelExperiencia, o.Nombre AS Objetivo, m.FechaFin AS VenceMembresia, m.Estado AS EstadoMembresia
FROM dbo.Clientes c
LEFT JOIN dbo.Objetivos o ON o.ObjetivoID = c.ObjetivoID
OUTER APPLY (SELECT TOP 1 * FROM dbo.Membresias mm WHERE mm.ClienteID = c.ClienteID ORDER BY mm.FechaFin DESC) m
WHERE c.Estado = 'Activo';`);
  L.push("GO");
  L.push(`CREATE VIEW dbo.vw_DentroDelGym AS
SELECT a.AccesoID, a.ClienteID, c.Nombres + ' ' + c.Apellidos AS Cliente, a.FechaHoraEntrada
FROM dbo.Accesos a INNER JOIN dbo.Clientes c ON c.ClienteID = a.ClienteID
WHERE a.FechaHoraSalida IS NULL;`);
  L.push("GO");
  L.push(`CREATE VIEW dbo.vw_MembresiasPorVencer AS
SELECT m.MembresiaID, c.Nombres + ' ' + c.Apellidos AS Cliente, m.FechaFin,
       DATEDIFF(DAY, GETDATE(), m.FechaFin) AS DiasRestantes
FROM dbo.Membresias m INNER JOIN dbo.Clientes c ON c.ClienteID = m.ClienteID
WHERE m.Estado = 'Activa' AND DATEDIFF(DAY, GETDATE(), m.FechaFin) BETWEEN 0 AND 7;`);
  L.push("GO");
  L.push("");
  L.push("/* =============== PROCEDIMIENTOS =============== */");
  L.push(`CREATE PROCEDURE dbo.sp_RegistrarEntrada @Codigo NVARCHAR(20), @Metodo NVARCHAR(20) = 'QR'
AS
BEGIN
    DECLARE @ClienteID INT = (SELECT ClienteID FROM dbo.Clientes WHERE Codigo = @Codigo);
    IF @ClienteID IS NULL BEGIN RAISERROR('Cliente no encontrado', 16, 1); RETURN; END
    IF EXISTS (SELECT 1 FROM dbo.Accesos WHERE ClienteID = @ClienteID AND FechaHoraSalida IS NULL)
        BEGIN RAISERROR('El cliente ya se encuentra dentro', 16, 1); RETURN; END
    INSERT INTO dbo.Accesos (ClienteID, FechaHoraEntrada, MetodoAcceso, Estado)
    VALUES (@ClienteID, GETDATE(), @Metodo, 'Dentro');
END;`);
  L.push("GO");
  L.push(`CREATE PROCEDURE dbo.sp_RegistrarSalida @Codigo NVARCHAR(20)
AS
BEGIN
    DECLARE @ClienteID INT = (SELECT ClienteID FROM dbo.Clientes WHERE Codigo = @Codigo);
    UPDATE dbo.Accesos SET FechaHoraSalida = GETDATE(), Estado = 'Finalizado'
    WHERE ClienteID = @ClienteID AND FechaHoraSalida IS NULL;
END;`);
  L.push("GO");
  L.push(`CREATE PROCEDURE dbo.sp_MarcarAsistenciasIncompletas
AS
BEGIN
    UPDATE dbo.Accesos SET Estado = 'Incompleto'
    WHERE FechaHoraSalida IS NULL AND DATEDIFF(HOUR, FechaHoraEntrada, GETDATE()) > 5;
END;`);
  L.push("GO");
  L.push(`CREATE TRIGGER trg_Membresias_Auditoria ON dbo.Membresias AFTER INSERT, UPDATE
AS
BEGIN
    INSERT INTO dbo.Auditoria (Accion, TablaAfectada, Detalle, FechaHora)
    SELECT 'CAMBIO', 'Membresias', CONCAT('MembresiaID: ', CAST(i.MembresiaID AS NVARCHAR(10))), GETDATE()
    FROM inserted i;
END;`);
  L.push("GO");
  return L.join("\n");
};
