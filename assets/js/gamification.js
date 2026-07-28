/* ==========================================================================
   gamification.js — SIGNOVA
   Motor central de gamificación: racha, días conectado, XP/nivel, logros
   y actividad reciente. Se incluye en TODAS las páginas.

   Reglas de negocio (2ª versión):
   - "Racha" solo sube cuando la persona TERMINA un quiz o un juego
     (no por visitar cualquier página). Ver registrarPractica().
   - "Días en SIGNOVA" cuenta días reales de conexión (no tiempo
     transcurrido desde el registro). Ver registrarDiaConexion().
   - "Actividad reciente" se guarda siempre que: termina un quiz/juego,
     visita una categoría, o usa el buscador con éxito.
   - Todo sigue viviendo en localStorage (funciona para invitados sin
     cuenta). Si cloud-sync.js detecta sesión de Firebase, esos mismos
     datos también se reflejan y se guardan en Firestore.
   ========================================================================== */

(function () {
  'use strict';

  /* ---- Catálogo de logros -------------------------------------------- */
  const LOGROS = [
    { id: 'perfil',       icon: '👤', nombre: 'Perfil creado',      desc: 'Creaste tu cuenta en SIGNOVA',                check: s => s.tieneSesion },
    { id: 'primer-quiz',  icon: '🧠', nombre: 'Primer quiz',        desc: 'Completaste tu primer quiz',                  check: s => s.quizJugados > 0 },
    { id: 'puntaje-10',   icon: '⭐', nombre: 'Puntaje 10+',        desc: 'Sacaste 10 puntos o más en un quiz',          check: s => s.quizMejor >= 10 },
    { id: 'buscador',     icon: '🔍', nombre: 'Usaste el buscador', desc: 'Buscaste una seña en Buscar',           check: s => s.usoBuscador },
    { id: '5-partidas',   icon: '🎮', nombre: '5 partidas',         desc: 'Jugaste 5 partidas en total',                 check: s => s.partidasTotales >= 5 },
    { id: 'explorador',   icon: '🗺️', nombre: 'Explorador',         desc: 'Visitaste 5 categorías de lecciones',         check: s => s.categoriasVisitadas >= 5 },
    { id: 'velocista',    icon: '⏱️', nombre: 'Velocista',          desc: 'Jugaste una ronda de Contrarreloj',           check: s => s.contrarrelojJugado },
    { id: 'combo-x3',     icon: '💥', nombre: 'Combo x3',           desc: 'Encadenaste un combo x3 en Contrarreloj',     check: s => s.comboMax >= 3 },
    { id: 'deletreo',     icon: '🔤', nombre: 'Deletreo LSC',       desc: 'Completaste el reto de deletreo',             check: s => s.deletreoJugado },
    { id: 'constante',    icon: '🔥', nombre: 'Constante',          desc: 'Racha de 3 días seguidos practicando',        check: s => s.racha >= 3 },
    { id: 'racha-7',      icon: '📅', nombre: 'Racha de 7 días',    desc: '7 días seguidos practicando en SIGNOVA',      check: s => s.racha >= 7 },
    { id: 'maestro',      icon: '🏆', nombre: 'Maestro de señas',   desc: '20 partidas jugadas en total',                check: s => s.partidasTotales >= 20 },
  ];

  const XP_POR_NIVEL = 150;

  /* ---- Lectura de estado ------------------------------------------------ */
  function num(key) { return parseInt(localStorage.getItem(key) || '0', 10) || 0; }
  function arr(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }

  function obtenerStats() {
    const gamesPlayed = num('games_played');
    const quizPlayed  = num('quiz_played');
    const deletreoJug = num('deletreo_jugadas');
    return {
      tieneSesion:        !!localStorage.getItem('signova_sesion'),
      quizJugados:        quizPlayed,
      quizMejor:          num('quiz_best'),
      partidasJugadas:    gamesPlayed + deletreoJug,       // Juego + Contrarreloj + Deletreo
      partidasTotales:    quizPlayed + gamesPlayed + deletreoJug,
      categoriasVisitadas: arr('signova_categorias_visitadas').length,
      usoBuscador:        localStorage.getItem('signova_uso_buscador') === '1',
      racha:              num('signova_racha_count'),
      diasConectado:      arr('signova_dias_conectado').length || 1,
      contrarrelojJugado: !!localStorage.getItem('contrarreloj_best'),
      comboMax:           num('contrarreloj_combo_max'),
      deletreoJugado:     !!localStorage.getItem('deletreo_best'),
      gamesPlayed, deletreoJug,
    };
  }

  function calcularXP(stats) {
    return stats.quizJugados * 15
      + stats.gamesPlayed * 20
      + stats.deletreoJug * 15
      + stats.categoriasVisitadas * 10
      + stats.racha * 5
      + (stats.usoBuscador ? 10 : 0);
  }

  function obtenerNivel(xp) {
    const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
    const progreso = xp % XP_POR_NIVEL;
    return { nivel, progreso, porcentaje: Math.round((progreso / XP_POR_NIVEL) * 100) };
  }

  /* ---- Fechas ---------------------------------------------------------- */
  function hoyISO(offsetDias) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetDias || 0));
    return d.toISOString().slice(0, 10);
  }

  /* ---- Racha: SOLO sube cuando se llama desde registrarPractica() ------ */
  function bumpRacha() {
    const hoy = hoyISO(0);
    const ultima = localStorage.getItem('signova_racha_fecha');
    let count = num('signova_racha_count');
    if (ultima !== hoy) {
      const ayer = hoyISO(-1);
      count = (ultima === ayer) ? count + 1 : 1;
      localStorage.setItem('signova_racha_fecha', hoy);
      localStorage.setItem('signova_racha_count', String(count));
    }
    return count;
  }

  /* ---- Días en SIGNOVA: cuenta días reales de conexión, no tiempo
     transcurrido. Se llama en cada carga de página. ----------------------- */
  function registrarDiaConexion() {
    const hoy = hoyISO(0);
    const dias = arr('signova_dias_conectado');
    if (dias.indexOf(hoy) === -1) {
      dias.push(hoy);
      localStorage.setItem('signova_dias_conectado', JSON.stringify(dias));
      return true; // fue un día nuevo
    }
    return false;
  }

  /* ---- Categorías visitadas / uso del buscador ------------------------ */
  function registrarVisitaCategoria(nombre) {
    const arreglo = arr('signova_categorias_visitadas');
    if (arreglo.indexOf(nombre) === -1) {
      arreglo.push(nombre);
      localStorage.setItem('signova_categorias_visitadas', JSON.stringify(arreglo));
    }
  }

  const NOMBRES_CATEGORIA = {
    colores: 'Colores', animales: 'Animales', comida: 'Comida', cuerpo: 'Cuerpo humano',
    emociones: 'Emociones', escuela: 'Escuela', familia: 'Familia', profesiones: 'Profesiones',
    saludos: 'Saludos', vidadiaria: 'Vida diaria', abecedario: 'Abecedario',
  };

  function detectarPagina() {
    const path = location.pathname;
    if (path.indexOf('/lecciones/') !== -1 && path.indexOf('categorias.html') === -1) {
      const clave = path.split('/').pop().replace('.html', '');
      if (clave) {
        registrarVisitaCategoria(clave);
        registrarHistorial('📖', `Visitaste la categoría ${NOMBRES_CATEGORIA[clave] || clave}`, '');
      }
    }
  }

  /* Se llama desde buscar.html cuando SÍ se encuentra una seña. */
  function registrarBusqueda(palabra) {
    const yaUsado = localStorage.getItem('signova_uso_buscador') === '1';
    localStorage.setItem('signova_uso_buscador', '1');
    if (!yaUsado) {
      const { nuevos } = evaluarLogros();
      nuevos.forEach(mostrarToastLogro);
    }
    registrarHistorial('🔍', palabra ? `Buscaste la seña "${palabra}"` : 'Usaste el buscador de señas', '');
    sincronizarNube();
  }

  /* ---- Historial unificado (Actividad reciente) ------------------------ */
  function registrarHistorial(icon, texto, valor) {
    const h = arr('signova_historial');
    h.push({ icon, texto, valor, fechaISO: hoyISO(0) });
    if (h.length > 25) h.shift();
    localStorage.setItem('signova_historial', JSON.stringify(h));
  }

  /* Punto de entrada único para "terminar un quiz o un juego": sube la
     racha, guarda la actividad, revisa logros y sincroniza con la nube.
     Los 4 juegos (Quiz, Juego de memoria, Contrarreloj, Deletreo) llaman
     esta función al terminar la partida, en vez de tocar racha a mano. */
  function registrarPractica(icon, texto, valor) {
    registrarHistorial(icon, texto, valor);
    const racha = bumpRacha();
    const { nuevos } = evaluarLogros();
    renderTodo();
    nuevos.forEach(mostrarToastLogro);
    sincronizarNube();
    return racha;
  }

  /* ---- Evaluación de logros + detección de "nuevos" -------------------- */
  function evaluarLogros() {
    const stats = obtenerStats();
    const previos = arr('signova_logros_desbloqueados');
    const resultado = LOGROS.map(l => ({ ...l, desbloqueado: !!l.check(stats) }));
    const desbloqueadosAhora = resultado.filter(l => l.desbloqueado).map(l => l.id);
    const nuevos = resultado.filter(l => l.desbloqueado && previos.indexOf(l.id) === -1);
    localStorage.setItem('signova_logros_desbloqueados', JSON.stringify(desbloqueadosAhora));
    return { resultado, nuevos, stats };
  }

  /* ---- Sincronización con Firestore (si hay sesión) --------------------- */
  function sincronizarNube() {
    if (window.SIGNOVA_CLOUD && window.SIGNOVA_CLOUD.listo) {
      window.SIGNOVA_CLOUD.subir();
    }
  }

  /* ---- Render: navbar (racha), tarjetas de Cuenta y actividad reciente -- */
  function renderNavbarRacha(count) {
    const slot = document.getElementById('navbar-racha-slot');
    if (!slot) return;
    slot.innerHTML = count > 0
      ? `<span class="racha-badge navbar-racha" title="Racha de días practicando en SIGNOVA">🔥 ${count} ${count === 1 ? 'día' : 'días'}</span>`
      : '';
  }

  function etiquetaFecha(fechaISO) {
    if (!fechaISO) return '';
    const hoy = hoyISO(0);
    const ayer = hoyISO(-1);
    if (fechaISO === hoy) return 'Hoy';
    if (fechaISO === ayer) return 'Ayer';
    const dias = Math.round((new Date(hoy) - new Date(fechaISO)) / 86400000);
    return dias > 0 ? `Hace ${dias} días` : fechaISO;
  }

  function renderActividadReciente() {
    const lista = document.getElementById('actividad-lista');
    if (!lista) return;
    const historial = arr('signova_historial').slice(-6).reverse();
    if (historial.length === 0) {
      lista.innerHTML = `
        <div class="actividad-item">
          <span class="actividad-icon">✨</span>
          <span class="actividad-texto">Todavía no tienes actividad. Juega un quiz, visita una categoría o usa el buscador.</span>
          <span class="actividad-tiempo"></span>
        </div>`;
      return;
    }
    lista.innerHTML = historial.map(item => `
      <div class="actividad-item">
        <span class="actividad-icon">${item.icon || '⭐'}</span>
        <span class="actividad-texto">${item.texto}</span>
        <span class="actividad-tiempo">${etiquetaFecha(item.fechaISO)}</span>
      </div>`).join('');
  }

  function renderStatsCuenta(stats) {
    const mapa = {
      'stat-racha': stats.racha,
      'stat-quiz':  stats.quizMejor,
      'stat-juego': stats.partidasJugadas,
      'stat-dias':  stats.diasConectado,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = valor;
    });
  }

  function renderTodo() {
    const stats = obtenerStats();
    renderNavbarRacha(stats.racha);
    renderStatsCuenta(stats);
    renderActividadReciente();
    return stats;
  }

  /* ---- Modo oscuro (persistente en todo el sitio) ----------------------- */
  function modoOscuroActivo() {
    return localStorage.getItem('signova_modo_oscuro') === '1';
  }

  function aplicarModoOscuro(activo) {
    document.body.classList.toggle('modo-oscuro', !!activo);
  }

  function alternarModoOscuro() {
    const activo = !modoOscuroActivo();
    localStorage.setItem('signova_modo_oscuro', activo ? '1' : '0');
    aplicarModoOscuro(activo);
    return activo;
  }

  /* ---- Toast de logro desbloqueado -------------------------------------- */
  function mostrarToastLogro(logro) {
    const toast = document.createElement('div');
    toast.className = 'logro-toast';
    toast.innerHTML = `
      <span class="logro-toast-icon">${logro.icon}</span>
      <div>
        <div class="logro-toast-titulo">¡Logro desbloqueado!</div>
        <div class="logro-toast-nombre">${logro.nombre}</div>
      </div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  /* ---- Etiqueta de nombre de usuario en el navbar ----------------------- */
  function actualizarEtiquetaCuenta() {
    const sesion = JSON.parse(localStorage.getItem('signova_sesion') || 'null');
    const label = document.getElementById('nav-cuenta-label');
    if (sesion && label) label.textContent = sesion.nombre.split(' ')[0];
  }

  /* ---- Inicialización ---------------------------------------------- */
  function init() {
    detectarPagina();
    aplicarModoOscuro(modoOscuroActivo());
    const esDiaNuevo = registrarDiaConexion();
    evaluarLogros();
    renderTodo();
    actualizarEtiquetaCuenta();
    if (esDiaNuevo) sincronizarNube();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Cuando cloud-sync.js termina de leer/fusionar Firestore (o detecta que
     no hay sesión), volvemos a pintar todo con los datos ya al día.
     También reintentamos "hoy me conecté" por si el día de hoy se había
     registrado localmente ANTES de que llegaran los datos de la nube
     (la fusión pudo haber traído un arreglo de días sin el de hoy). */
  document.addEventListener('signova:cloud-listo', function () {
    const esDiaNuevo = registrarDiaConexion();
    evaluarLogros();
    renderTodo();
    actualizarEtiquetaCuenta();
    if (esDiaNuevo) sincronizarNube();
  });

  /* ---- API pública ---------------------------------------------------- */
  window.SIGNOVA = {
    LOGROS,
    obtenerStats,
    calcularXP,
    obtenerNivel,
    registrarVisitaCategoria,
    registrarHistorial,
    registrarPractica,
    registrarBusqueda,
    evaluarLogros,
    mostrarToastLogro,
    modoOscuroActivo,
    alternarModoOscuro,
    renderTodo,
    sincronizarNube,
  };
})();
