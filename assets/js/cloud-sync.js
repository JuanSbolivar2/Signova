/* ==========================================================================
   cloud-sync.js — SIGNOVA
   Puente entre Firebase (Auth + Firestore) y el resto del sitio.

   Por qué existe como archivo aparte:
   Este archivo es un módulo ES (type="module") porque Firebase se importa
   así. gamification.js, en cambio, es un script clásico que se incluye
   en las 22 páginas tal cual, sin tocar cada HTML por dentro. Mantenerlos
   separados evita reescribir todas las páginas para convertirlas a módulos.

   Qué hace:
   1. Escucha el estado de sesión de Firebase (onAuthStateChanged).
   2. Si hay sesión: carga (o crea la primera vez) el documento
      usuarios/{uid} en Firestore, y con eso "actualiza" el localStorage
      de ESTE dispositivo para que coincida con lo guardado en la nube
      (así, si jugó desde el celular, acá en el PC también lo ve).
   3. Expone window.SIGNOVA_CLOUD.subir() para que gamification.js pueda
      empujar cambios hacia Firestore cada vez que algo cambia localmente.
   4. Dispara el evento "signova:cloud-listo" para que gamification.js
      vuelva a pintar la pantalla con los datos ya sincronizados.

   Si Firestore todavía no está activado en la consola de Firebase, los
   errores se atrapan y el sitio sigue funcionando en modo local (invitado),
   sin romper nada.
   ========================================================================== */

import {
  auth, db, onAuthStateChanged, doc, getDoc, setDoc
} from '../firebase/firebase.js';

/* Mapa entre los campos del documento en Firestore y las llaves que
   gamification.js ya usa en localStorage. Un solo lugar para no
   duplicar nombres por todo el código. */
const CAMPOS = {
  quiz_best:               'quiz_best',
  quiz_played:              'quiz_played',
  games_played:             'games_played',
  deletreo_jugadas:         'deletreo_jugadas',
  deletreo_best:            'deletreo_best',
  contrarreloj_best:        'contrarreloj_best',
  contrarreloj_combo_max:   'contrarreloj_combo_max',
  racha_count:              'signova_racha_count',
  racha_fecha:              'signova_racha_fecha',
  categorias_visitadas:     'signova_categorias_visitadas',   // JSON array
  dias_conectado:           'signova_dias_conectado',         // JSON array
  uso_buscador:             'signova_uso_buscador',           // '1' / ausente
  logros_desbloqueados:     'signova_logros_desbloqueados',   // JSON array
  historial:                'signova_historial',              // JSON array
};

function docPorDefecto() {
  return {
    quiz_best: 0, quiz_played: 0, games_played: 0,
    deletreo_jugadas: 0, deletreo_best: 0,
    contrarreloj_best: 0, contrarreloj_combo_max: 0,
    racha_count: 0, racha_fecha: null,
    categorias_visitadas: [], dias_conectado: [],
    uso_buscador: false, logros_desbloqueados: [], historial: [],
  };
}

/* Lee el valor actual en localStorage para un campo dado (respetando si
   es número, JSON o booleano-como-string). */
function leerLocal(campoCloud, llaveLocal) {
  const crudo = localStorage.getItem(llaveLocal);
  if (campoCloud === 'uso_buscador') return crudo === '1';
  if (campoCloud === 'racha_fecha') return crudo || null;
  if (['categorias_visitadas', 'dias_conectado', 'logros_desbloqueados', 'historial'].includes(campoCloud)) {
    try { return JSON.parse(crudo || '[]'); } catch (e) { return []; }
  }
  return parseInt(crudo || '0', 10) || 0;
}

/* Escribe un valor de la nube hacia localStorage, en el mismo formato
   que gamification.js espera encontrar ahí. */
function escribirLocal(campoCloud, llaveLocal, valor) {
  if (campoCloud === 'uso_buscador') {
    if (valor) localStorage.setItem(llaveLocal, '1'); else localStorage.removeItem(llaveLocal);
    return;
  }
  if (campoCloud === 'racha_fecha') {
    if (valor) localStorage.setItem(llaveLocal, valor); else localStorage.removeItem(llaveLocal);
    return;
  }
  if (['categorias_visitadas', 'dias_conectado', 'logros_desbloqueados', 'historial'].includes(campoCloud)) {
    localStorage.setItem(llaveLocal, JSON.stringify(valor || []));
    return;
  }
  localStorage.setItem(llaveLocal, String(valor || 0));
}

function statsLocalesActuales() {
  const obj = {};
  Object.entries(CAMPOS).forEach(([campoCloud, llaveLocal]) => {
    obj[campoCloud] = leerLocal(campoCloud, llaveLocal);
  });
  return obj;
}

function aplicarStatsAlLocal(datosCloud) {
  Object.entries(CAMPOS).forEach(([campoCloud, llaveLocal]) => {
    if (datosCloud[campoCloud] !== undefined) {
      escribirLocal(campoCloud, llaveLocal, datosCloud[campoCloud]);
    }
  });
}

let uidActual = null;

async function cargarYFusionar(uid, nombre, correo) {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Ya existía progreso guardado en la nube: este dispositivo se pone al día.
    aplicarStatsAlLocal(snap.data());
  } else {
    // Primera vez que este usuario inicia sesión: sube lo que ya tenía
    // localmente (por si venía usando la plataforma sin cuenta) como base.
    const base = { ...docPorDefecto(), ...statsLocalesActuales(), nombre, correo, creado: Date.now() };
    await setDoc(ref, base);
  }
}

async function subirANube() {
  if (!uidActual) return; // sin sesión, no hay nada que subir
  try {
    await setDoc(doc(db, 'usuarios', uidActual), statsLocalesActuales(), { merge: true });
  } catch (err) {
    console.warn('SIGNOVA: no se pudo sincronizar con Firestore todavía.', err.message);
  }
}

window.SIGNOVA_CLOUD = {
  listo: false,
  usuario: null,
  subir: subirANube,
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Si el progreso guardado en este navegador pertenece a OTRA cuenta
    // (alguien cerró sesión sin limpiar, o cambió de usuario), lo borramos
    // antes de fusionar para que la cuenta nueva no "herede" datos ajenos.
    const uidLocalPrevio = localStorage.getItem('signova_uid_local');
    if (uidLocalPrevio && uidLocalPrevio !== user.uid && window.SIGNOVA) {
      window.SIGNOVA.limpiarProgresoLocal();
    }
    try {
      await cargarYFusionar(user.uid, user.displayName || 'Usuario', user.email);
      uidActual = user.uid;
      window.SIGNOVA_CLOUD.listo = true;
      window.SIGNOVA_CLOUD.usuario = { uid: user.uid, nombre: user.displayName || 'Usuario', correo: user.email };
    } catch (err) {
      // Firestore puede no estar activado todavía en la consola: seguimos
      // en modo local sin romper la página.
      console.warn('SIGNOVA: Firestore no disponible todavía, usando datos locales.', err.message);
      uidActual = null;
      window.SIGNOVA_CLOUD.listo = false;
      window.SIGNOVA_CLOUD.usuario = null;
    }
    localStorage.setItem('signova_uid_local', user.uid);
    localStorage.setItem('signova_sesion', JSON.stringify({
      nombre: user.displayName || 'Usuario', correo: user.email
    }));
  } else {
    // Al cerrar sesión, el progreso que queda en este navegador "pertenecía"
    // a la cuenta que se fue: lo borramos para que no se filtre a la
    // siguiente persona que use este mismo navegador/dispositivo.
    if (localStorage.getItem('signova_uid_local') && window.SIGNOVA) {
      window.SIGNOVA.limpiarProgresoLocal();
    }
    localStorage.removeItem('signova_uid_local');
    uidActual = null;
    window.SIGNOVA_CLOUD.listo = false;
    window.SIGNOVA_CLOUD.usuario = null;
    localStorage.removeItem('signova_sesion');
  }
  document.dispatchEvent(new CustomEvent('signova:cloud-listo', { detail: { conSesion: !!user } }));
});
