/* ==========================================================================
   chatbot.js — HANDNOVA
   Asistente virtual basado en reglas (sin IA / sin llamadas a servidor).
   Detecta palabras clave en la pregunta del usuario y responde con
   respuestas predefinidas sobre LSC, la plataforma, categorías, juegos,
   cuenta y progreso. Se incluye en TODAS las páginas junto a
   gamification.js y dibuja su propia burbuja flotante con JS puro,
   así no hay que tocar el HTML de cada página.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. BASE DE CONOCIMIENTO
   *    Cada entrada tiene varias frases disparadoras (p) y una
   *    respuesta (r). Se busca coincidencia por inclusión de texto,
   *    ignorando tildes/mayúsculas, y gana la frase más larga que
   *    coincida (más específica).
   * ------------------------------------------------------------------ */
  const BASE = [

    /* ---- 1. Saludos y sobre el bot ---- */
    { p: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal'],
      r: '¡Hola! 👋 Soy el asistente de HANDNOVA. Puedo ayudarte con dudas sobre la Lengua de Señas Colombiana, las categorías, los juegos, tu cuenta y tu progreso. ¿Qué necesitas?' },
    { p: ['quien eres', 'que eres', 'eres una ia', 'eres un robot', 'eres humano', 'con quien hablo'],
      r: 'Soy un asistente de reglas de HANDNOVA: reconozco palabras clave en tu mensaje y te respondo con información predefinida sobre la plataforma. No soy una IA generativa, así que funciono mejor con preguntas cortas y directas 🙂' },
    { p: ['que puedes hacer', 'para que sirves', 'en que me ayudas', 'ayuda', 'necesito ayuda', 'que sabes hacer'],
      r: 'Puedo orientarte sobre: qué es la LSC, cómo usar las categorías, el buscador, el abecedario, los juegos (Quiz, Busca Parejas, Contrarreloj, Deletreo), tu cuenta, tu progreso, tus logros y el modo oscuro. Pregúntame por cualquiera de esos temas.' },
    { p: ['gracias', 'muchas gracias', 'te lo agradezco', 'genial gracias'],
      r: '¡Con gusto! Si te surge otra duda mientras aprendes, aquí estaré 👋' },
    { p: ['adios', 'chao', 'nos vemos', 'hasta luego', 'bye'],
      r: '¡Hasta luego! Sigue practicando tu LSC 💪 Puedes volver a abrirme cuando quieras, tu conversación queda guardada.' },
    { p: ['quien te creo', 'quien te programo', 'como funcionas', 'eres inteligencia artificial'],
      r: 'Soy un chatbot basado en reglas: comparo tu mensaje contra una lista de palabras clave y te devuelvo la respuesta asociada. No entiendo lenguaje natural complejo, así que si no te respondo bien, intenta con menos palabras o términos más directos.' },

    /* ---- 2. Sobre la Lengua de Señas Colombiana (LSC) ---- */
    { p: ['que es lsc', 'que es la lengua de senas colombiana', 'que significa lsc', 'lsc'],
      r: 'LSC es la Lengua de Señas Colombiana: la lengua natural de la comunidad sorda en Colombia. Tiene su propia gramática, distinta a la del español, y se expresa con las manos, el cuerpo y expresiones faciales.' },
    { p: ['es un idioma oficial', 'la lsc es oficial en colombia', 'esta reconocida por la ley'],
      r: 'Sí. La Ley 324 de 1996 y la Ley 982 de 2005 reconocen la Lengua de Señas Colombiana como la lengua propia de la comunidad sorda del país.' },
    { p: ['por que aprender lsc', 'para que sirve aprender senas', 'por que aprender senas'],
      r: 'Aprender LSC te permite comunicarte con la comunidad sorda de Colombia, generar entornos más inclusivos y romper barreras de comunicación en la familia, la escuela o el trabajo. En Colombia hay cientos de miles de personas sordas.' },
    { p: ['cuantas personas sordas hay en colombia', 'cuanta gente usa lsc'],
      r: 'Se estima que en Colombia hay más de 500.000 personas con discapacidad auditiva, muchas de las cuales usan la LSC como su lengua principal de comunicación.' },
    { p: ['la lsc es igual al espanol', 'la lsc tiene la misma gramatica del espanol', 'lsc es como escribir en el aire'],
      r: 'No. La LSC no es "español con las manos": tiene su propia gramática, orden de palabras y estructura, igual que cualquier otro idioma. No es una traducción literal del español.' },
    { p: ['la lsc es igual en todos los paises', 'la lengua de senas es universal', 'existe una sola lengua de senas'],
      r: 'No existe una lengua de señas universal. Cada país (o incluso región) suele tener la suya: LSC en Colombia, ASL en Estados Unidos, LSE en España, etc. Todas son independientes entre sí.' },
    { p: ['que es el alfabeto dactilologico', 'que es dactilologico', 'deletrear con las manos'],
      r: 'El alfabeto dactilológico es el conjunto de señas que representan cada letra del abecedario con la mano. Se usa para deletrear nombres propios, siglas o palabras que aún no tienen una seña establecida en LSC. Puedes practicarlo en la sección Abecedario o en el juego de Deletreo.' },
    { p: ['que es la comunidad sorda', 'quienes son la comunidad sorda'],
      r: 'La comunidad sorda es el conjunto de personas sordas que comparten la LSC como lengua e identidad cultural propia. No se ven a sí mismas como "personas con discapacidad que no oyen", sino como una comunidad lingüística y cultural.' },
    { p: ['necesito saber espanol para aprender lsc', 'necesito experiencia previa'],
      r: 'No necesitas experiencia previa. HANDNOVA está pensado para estudiantes, familias y cualquier persona que quiera empezar desde cero a comunicarse en LSC.' },
    { p: ['que es una glosa', 'que es glosar'],
      r: 'Una glosa es la forma de escribir una seña usando palabras en mayúscula del español, solo como referencia (por ejemplo: YO CASA IR). No es una traducción literal, es solo una anotación para representar la seña por escrito.' },
    { p: ['la lsc tiene expresiones faciales', 'las expresiones faciales importan en lsc'],
      r: 'Sí, las expresiones faciales son parte fundamental de la gramática de la LSC: pueden cambiar el significado de una seña, indicar preguntas, negaciones o intensidad, igual que la entonación en el español hablado.' },
    { p: ['puedo aprender lsc solo con videos', 'es suficiente con la plataforma para aprender lsc'],
      r: 'HANDNOVA es un excelente punto de partida para familiarizarte con el vocabulario y la lógica de la LSC, pero para dominarla te recomendamos también practicar con la comunidad sorda o tomar cursos certificados con intérpretes.' },

    /* ---- 3. Sobre la plataforma HANDNOVA ---- */
    { p: ['que es HANDNOVA', 'que es esta pagina', 'que es esta plataforma', 'de que trata HANDNOVA'],
      r: 'HANDNOVA es una plataforma web para aprender Lengua de Señas Colombiana (LSC) con videos reales, organizados por categorías, además de juegos, un buscador de señas y seguimiento de tu progreso.' },
    { p: ['es gratis', 'cuesta dinero', 'tiene algun costo', 'debo pagar'],
      r: 'HANDNOVA es un proyecto formativo, de acceso libre. No tiene ningún costo.' },
    { p: ['quien hizo HANDNOVA', 'quien creo esta pagina', 'quien desarrollo esto'],
      r: 'HANDNOVA es un proyecto formativo desarrollado en el marco del SENA, con el objetivo de acercar la Lengua de Señas Colombiana a más personas.' },
    { p: ['necesito internet', 'funciona sin internet', 'funciona offline'],
      r: 'Necesitas conexión a internet, ya que los videos de las señas y algunos recursos se cargan desde la web.' },
    { p: ['funciona en el celular', 'funciona en movil', 'tiene aplicacion', 'hay app para descargar'],
      r: 'HANDNOVA funciona directamente desde el navegador y su diseño se adapta a celular, tablet y computador. No necesitas descargar ninguna aplicación.' },
    { p: ['tengo que registrarme para usar la pagina', 'necesito crear cuenta para ver las lecciones'],
      r: 'Puedes explorar las categorías, el abecedario y el buscador sin necesidad de registrarte. Crear una cuenta es solo necesario si quieres guardar tu progreso, tu racha y tus logros.' },
    { p: ['necesito camara', 'necesito una webcam', 'para que sirve la camara'],
      r: 'La cámara solo es necesaria si usas las herramientas de práctica con reconocimiento de manos (parte del módulo de machine learning del proyecto). Para ver videos de señas, jugar o consultar el buscador no la necesitas.' },
    { p: ['que secciones tiene HANDNOVA', 'que puedo hacer en HANDNOVA', 'que opciones tiene el menu'],
      r: 'El menú principal tiene: Categorías (lecciones por tema), Abecedario, Buscar (encuentra una seña por palabra), Cuenta, y en "Más": Juego, Quiz y Progreso.' },
    { p: ['HANDNOVA sirve para intérpretes', 'sirve para nivel avanzado'],
      r: 'HANDNOVA está pensado principalmente para principiantes: vocabulario básico por categorías, el abecedario y práctica con juegos. Es un buen primer paso antes de una formación más avanzada o certificada.' },
    { p: ['en que colores esta el logo', 'de que color es HANDNOVA'],
      r: 'La identidad visual de HANDNOVA usa un degradado de magenta, morado y cian, tanto en el logo como en los acentos de la interfaz.' },

    /* ---- 4. Categorías / lecciones ---- */
    { p: ['que son las categorias', 'como funcionan las categorias', 'para que sirven las categorias', 'que hay en categorias', 'categorias', 'que categorias hay'],
      r: 'Las categorías agrupan señas por tema (Saludos, Familia, Colores, etc.). Cada una tiene una lista de videos cortos con la seña de cada palabra, para que aprendas por bloques de vocabulario relacionado.' },
    { p: ['cuantas categorias hay', 'cuantos temas hay disponibles'],
      r: 'Actualmente hay 11 categorías: Saludos, Familia, Emociones, Profesiones, Escuela, Vida diaria, Comida, Colores, Cuerpo humano y Animales, además del Abecedario como sección aparte.' },
    { p: ['como veo una categoria', 'como entro a una leccion', 'donde encuentro las lecciones'],
      r: 'Ve al menú y toca "Categorías". Ahí verás tarjetas con cada tema; al tocar una entras a la lección y ves los videos de las señas de esa categoría.' },
    { p: ['que hay en saludos', 'que se aprende en la categoria saludos', 'saludos'],
      r: 'En la categoría Saludos encuentras: Hola, Buenos días, Buenas tardes, Buenas noches y ¿Cómo estás?' },
    { p: ['que hay en familia', 'que se aprende en la categoria familia', 'familia'],
      r: 'En la categoría Familia encuentras las señas de: Abuelo, Mamá, Papá, Hijo y Familia.' },
    { p: ['que hay en emociones', 'que se aprende en la categoria emociones', 'emociones'],
      r: 'En la categoría Emociones encuentras: Amor, Feliz, Desagrado, Ira, Sorpresa y Triste.' },
    { p: ['que hay en profesiones', 'que se aprende en la categoria profesiones', 'profesiones'],
      r: 'En la categoría Profesiones encuentras: Profesor, Cantante, Enfermera, Ingeniero, Policía y Psicólogo.' },
    { p: ['que hay en escuela', 'que se aprende en la categoria escuela', 'escuela'],
      r: 'En la categoría Escuela encuentras: Cuaderno, Colegio, Colores, Esfero y Maleta.' },
    { p: ['que hay en vida diaria', 'que se aprende en la categoria vida diaria', 'vida diaria'],
      r: 'En la categoría Vida diaria encuentras: Casa, Comer, Dormir, Trabajar, Caminar y Tiempo.' },
    { p: ['que hay en comida', 'que se aprende en la categoria comida', 'comida'],
      r: 'En la categoría Comida encuentras: Almuerzo, Caliente, Cena, Desayunar y Hambre.' },
    { p: ['que hay en colores', 'que se aprende en la categoria colores', 'senas de colores', 'colores'],
      r: 'En la categoría Colores encuentras las señas de: Rojo, Azul, Amarillo, Negro y Blanco.' },
    { p: ['que hay en cuerpo humano', 'que se aprende en la categoria cuerpo', 'cuerpo humano'],
      r: 'En la categoría Cuerpo humano encuentras: Cabeza, Brazos, Pies, Manos, Boca y Ojo.' },
    { p: ['que hay en animales', 'que se aprende en la categoria animales', 'animales'],
      r: 'En la categoría Animales encuentras: Perro, Gato, Loro, Vaca, Caballo y Tiburón.' },
    { p: ['como se dice hola en senas', 'como saludo en lsc'],
      r: 'La seña de "Hola" está en la categoría Saludos, junto con Buenos días, Buenas tardes, Buenas noches y ¿Cómo estás?' },
    { p: ['como se dice mama en senas', 'como se dice papa en senas'],
      r: 'Las señas de Mamá y Papá están en la categoría Familia, junto con Abuelo, Hijo y Familia.' },
    { p: ['como se dice rojo en senas', 'como se dice azul en senas'],
      r: 'Las señas de los colores (Rojo, Azul, Amarillo, Negro, Blanco) están en la categoría Colores.' },
    { p: ['como se dice perro en senas', 'como se dice gato en senas'],
      r: 'Las señas de animales como Perro y Gato están en la categoría Animales, junto con Loro, Vaca, Caballo y Tiburón.' },
    { p: ['como se dice feliz en senas', 'como se dice triste en senas'],
      r: 'Las señas de emociones como Feliz y Triste están en la categoría Emociones, junto con Amor, Desagrado, Ira y Sorpresa.' },
    { p: ['como se dice profesor en senas', 'como se dice policia en senas'],
      r: 'Las señas de oficios como Profesor y Policía están en la categoría Profesiones, junto con Cantante, Enfermera, Ingeniero y Psicólogo.' },
    { p: ['como se dice comer en senas', 'como se dice dormir en senas'],
      r: 'Las señas de Comer y Dormir están en la categoría Vida diaria, junto con Casa, Trabajar, Caminar y Tiempo.' },
    { p: ['no encuentro una palabra en las categorias', 'una palabra no esta en ninguna categoria'],
      r: 'Si no encuentras una palabra dentro de las categorías, prueba en la sección "Buscar": ahí puedes escribir cualquier palabra y ver si existe su video. Si tampoco aparece, seguramente aún no está disponible en la plataforma.' },

    /* ---- 5. Abecedario ---- */
    { p: ['que es el abecedario', 'para que sirve la seccion abecedario', 'abecedario'],
      r: 'La sección Abecedario muestra en video cómo se hace cada letra con la mano (alfabeto dactilológico), de la A a la Z, incluyendo la Ñ.' },
    { p: ['cuantas letras tiene el abecedario', 'cuantas letras hay en la seccion abecedario'],
      r: 'El Abecedario de HANDNOVA tiene las 27 letras del alfabeto español, incluida la Ñ.' },
    { p: ['donde encuentro el abecedario', 'como entro al abecedario'],
      r: 'Puedes entrar al Abecedario desde el menú principal, entre "Categorías" y "Buscar".' },
    { p: ['para que sirve saber el abecedario en senas', 'para que sirve el alfabeto dactilologico'],
      r: 'El abecedario en señas (dactilológico) se usa para deletrear palabras que no tienen una seña propia, como nombres, siglas o palabras nuevas. Es una herramienta base antes de aprender vocabulario completo.' },
    { p: ['el abecedario tiene la letra ene con tilde', 'esta la nn en el abecedario'],
      r: 'Sí, el abecedario incluye la letra Ñ, además de la A a la Z.' },
    { p: ['abecedario y deletreo son lo mismo', 'diferencia entre abecedario y deletreo'],
      r: 'No son lo mismo: el Abecedario es una sección de consulta, con el video de cada letra por separado. Deletreo es un juego, en la sección Práctica, donde debes deletrear palabras completas letra por letra usando ese alfabeto.' },

    /* ---- 6. Buscador ---- */
    { p: ['como busco una sena', 'como funciona el buscador', 'como uso buscar', 'buscar', 'buscador'],
      r: 'En la sección "Buscar" escribes cualquier palabra en el cuadro de búsqueda y, si existe, verás su video en LSC al instante.' },
    { p: ['donde esta el buscador', 'donde encuentro buscar'],
      r: 'La sección "Buscar" está en el menú principal, con el ícono de una lupa.' },
    { p: ['que pasa si busco una palabra que no existe', 'no aparece la palabra que busque'],
      r: 'Si buscas una palabra que aún no está en el catálogo de señas de HANDNOVA, el buscador te avisará que no encontró resultados. Puedes intentar con sinónimos o revisar las categorías disponibles.' },
    { p: ['el buscador necesita internet', 'el buscador funciona sin conexion'],
      r: 'Sí, el buscador necesita conexión a internet para cargar el catálogo de señas y los videos.' },
    { p: ['antes se llamaba traductor', 'donde quedo el traductor'],
      r: 'Esa función ahora se llama "Buscar" en el menú (antes decía "Traductor"). Hace lo mismo: encuentras el video de una seña escribiendo la palabra.' },
    { p: ['el buscador traduce frases completas', 'puedo traducir un texto completo'],
      r: 'No, el buscador funciona por palabras individuales, no traduce frases u oraciones completas a LSC.' },

    /* ---- 7. Juegos: overview ---- */
    { p: ['que juegos hay', 'que juegos tiene HANDNOVA', 'donde estan los juegos', 'juegos'],
      r: 'HANDNOVA tiene 3 juegos: Quiz (preguntas de opción múltiple), Busca Parejas (relacionar palabra y video) y Contrarreloj (adivina la seña antes de que se acabe el tiempo). Los encuentras en el menú "Más".' },
    { p: ['como entro a los juegos', 'donde esta la seccion de juegos'],
      r: 'Ve al menú "Más" y toca "Juego"; ahí verás las 3 opciones disponibles: Quiz, Busca Parejas y Contrarreloj.' },
    { p: ['los juegos sirven para practicar', 'para que sirven los juegos'],
      r: 'Los juegos son una forma divertida de repasar el vocabulario que ya viste en las categorías, reforzando la memoria visual de cada seña.' },
    { p: ['hay tabla de puntajes', 'hay ranking en los juegos', 'se guardan los puntajes'],
      r: 'Tus mejores puntajes se guardan en tu progreso local (por ejemplo, tu mejor puntaje de Quiz), y algunos de ellos desbloquean logros.' },

    /* ---- 7b. Quiz ---- */
    { p: ['como funciona el quiz', 'como se juega el quiz', 'quiz', 'uso el juego de quiz'],
      r: 'En el Quiz eliges una categoría y respondes preguntas de opción múltiple sobre las señas de esa categoría. Pon a prueba lo que ya aprendiste.' },
    { p: ['puedo elegir la categoria del quiz', 'el quiz tiene categorias'],
      r: 'Sí, al entrar al Quiz primero eliges la categoría que quieres practicar (por ejemplo, Colores o Animales) antes de empezar las preguntas.' },
    { p: ['que logro desbloquea el quiz', 'hay logro por el quiz'],
      r: 'Hay logros como "Primer quiz" (completar tu primer quiz) y "Puntaje 10+" (sacar 10 puntos o más en un quiz).' },

    /* ---- 7c. Busca Parejas / juego.html ---- */
    { p: ['como funciona busca parejas', 'como se juega busca parejas', 'que es el juego de parejas', 'parejas', 'busca parejas'],
      r: 'En Busca Parejas debes encontrar la palabra que corresponde a cada video de seña, eligiendo primero la categoría que quieres practicar.' },
    { p: ['busca parejas tiene categorias', 'puedo elegir tema en busca parejas'],
      r: 'Sí, antes de jugar eliges la categoría cuyas señas quieres practicar en el juego de Busca Parejas.' },

    /* ---- 7d. Contrarreloj ---- */
    { p: ['como funciona contrarreloj', 'como se juega contrarreloj', 'que es contrarreloj', 'contrarreloj'],
      r: 'En Contrarreloj se muestra un video con una seña y debes elegir la palabra correcta antes de que se acabe el tiempo. Si encadenas aciertos seguidos, multiplicas tu puntaje con combos.' },
    { p: ['que es un combo en contrarreloj', 'como sumo combo'],
      r: 'Un combo se forma cuando aciertas varias respuestas seguidas sin fallar en Contrarreloj; entre más grande el combo, más puntos ganas por cada acierto. Hay incluso un logro por llegar a combo x3.' },
    { p: ['contrarreloj tiene limite de tiempo', 'cuanto tiempo tengo para responder'],
      r: 'Sí, en Contrarreloj tienes un tiempo limitado para responder cada seña; si se acaba el tiempo, pierdes esa ronda.' },

    /* ---- 7e. Deletreo ---- */
    { p: ['como funciona deletreo', 'como se juega deletreo', 'que es el juego de deletreo', 'deletreo'],
      r: 'En Deletreo ves el video de una seña y debes deletrear la palabra letra por letra, usando el alfabeto dactilológico, tal como se hace con nombres propios o palabras sin seña propia.' },
    { p: ['deletreo usa el abecedario', 'para jugar deletreo necesito saber el abecedario'],
      r: 'Sí, Deletreo se apoya directamente en el alfabeto dactilológico: por eso es una buena idea repasar primero la sección Abecedario.' },

    /* ---- 8. Cuenta / autenticación ---- */
    { p: ['como creo una cuenta', 'como me registro', 'como me creo un usuario', 'registro', 'cuenta', 'crear cuenta'],
      r: 'Ve a "Cuenta" en el menú y elige "Crear cuenta". Completa tus datos y listo: podrás guardar tu progreso, tu racha y tus logros.' },
    { p: ['como inicio sesion', 'como hago login', 'donde inicio sesion', 'login', 'iniciar sesion'],
      r: 'Ve a "Cuenta" en el menú principal y usa el formulario de inicio de sesión con tu correo y contraseña.' },
    { p: ['olvide mi contrasena', 'como recupero mi contrasena', 'no recuerdo mi clave'],
      r: 'En la pantalla de inicio de sesión hay una opción de "Recuperar contraseña" donde puedes restablecerla con tu correo registrado.' },
    { p: ['como cierro sesion', 'como salgo de mi cuenta', 'como hago logout'],
      r: 'Desde la sección "Cuenta" encuentras la opción para cerrar sesión.' },
    { p: ['es obligatorio crear una cuenta', 'puedo usar HANDNOVA sin cuenta'],
      r: 'No es obligatorio. Puedes ver categorías, el abecedario y usar el buscador sin cuenta. Solo la necesitas para guardar tu progreso, racha y logros.' },
    { p: ['puedo cambiar mis datos de cuenta', 'como edito mi perfil'],
      r: 'En la sección "Cuenta" puedes gestionar la información de tu perfil una vez hayas iniciado sesión.' },
    { p: ['mis datos estan seguros', 'donde se guardan mis datos'],
      r: 'Tu información de cuenta se guarda en la base de datos del proyecto (PHP + MariaDB); tu progreso de juego y logros se guardan localmente en tu navegador.' },

    /* ---- 9. Progreso, racha, XP y logros ---- */
    { p: ['como veo mi progreso', 'donde esta mi progreso', 'progreso'],
      r: 'Ve al menú "Más" y toca "Progreso". Ahí ves tu avance por categoría, tus logros y tu historial reciente.' },
    { p: ['que es la racha', 'como funciona la racha', 'como sumo dias de racha', 'racha'],
      r: 'La racha cuenta los días seguidos que practicas en HANDNOVA. Se muestra en la barra de navegación y aumenta cada día que entras y practicas algo.' },
    { p: ['que es el xp', 'que es el nivel', 'como subo de nivel'],
      r: 'El XP son puntos de experiencia que ganas al usar la plataforma (jugar, completar retos, etc.). Al acumular suficiente XP subes de nivel dentro de HANDNOVA.' },
    { p: ['que son los logros', 'donde veo mis logros', 'que logros hay', 'logros'],
      r: 'Los logros son insignias que desbloqueas al cumplir ciertos retos: por ejemplo crear tu cuenta, jugar tu primer quiz, usar el buscador, jugar 5 partidas, visitar 5 categorías, o mantener una racha de 7 días. Los ves en la sección Progreso.' },
    { p: ['cuantos logros hay', 'cuantos logros puedo desbloquear'],
      r: 'Actualmente hay 12 logros disponibles en HANDNOVA, desde "Perfil creado" hasta "Maestro de señas" (20 partidas jugadas en total).' },
    { p: ['que es el logro explorador', 'como desbloqueo explorador'],
      r: 'El logro "Explorador" se desbloquea al visitar 5 categorías distintas de lecciones.' },
    { p: ['que es el logro velocista', 'como desbloqueo velocista'],
      r: 'El logro "Velocista" se desbloquea al jugar una ronda del juego Contrarreloj.' },
    { p: ['que es el logro constante', 'como desbloqueo constante'],
      r: 'El logro "Constante" se desbloquea al mantener una racha de 3 días seguidos practicando en HANDNOVA.' },
    { p: ['que es el logro maestro de senas', 'como desbloqueo maestro de senas'],
      r: 'El logro "Maestro de señas" se desbloquea al jugar 20 partidas en total, sumando todos los juegos de la plataforma.' },
    { p: ['mi progreso se guarda si cambio de dispositivo', 'mi progreso se sincroniza entre dispositivos'],
      r: 'Tu racha, XP y logros se guardan en el navegador de tu dispositivo (localStorage), así que si cambias de celular o computador o borras los datos del navegador, ese progreso local no se transfiere automáticamente.' },
    { p: ['como veo mi historial', 'donde esta mi historial reciente'],
      r: 'En la sección "Progreso" encuentras un bloque de "Historial reciente" con tus últimas actividades en HANDNOVA.' },

    /* ---- 10. Modo oscuro / accesibilidad ---- */
    { p: ['como activo el modo oscuro', 'donde esta el modo oscuro', 'como pongo la pagina en oscuro', 'modo oscuro'],
      r: 'El modo oscuro se activa desde las opciones de tu cuenta/perfil y se aplica automáticamente en toda la plataforma, incluyendo categorías, juegos y este mismo chat.' },
    { p: ['el modo oscuro se guarda', 'tengo que activar el modo oscuro cada vez'],
      r: 'No, una vez lo activas queda guardado en tu navegador y se mantiene al navegar entre páginas.' },

    /* ---- 11. Navegación general / soporte ---- */
    { p: ['como vuelvo al inicio', 'donde esta el inicio'],
      r: 'Toca el logo "HANDNOVA" en la esquina superior izquierda, o la opción "Inicio" del menú, para volver a la página principal.' },
    { p: ['tengo un error', 'la pagina no carga', 'un video no funciona', 'encontre un bug'],
      r: 'Lamento el inconveniente. Intenta recargar la página; si el problema sigue, revisa tu conexión a internet. Este chat no puede corregir errores técnicos directamente, pero puedes reportarlo a quien administre el proyecto.' },
    { p: ['en que lenguaje esta hecho HANDNOVA', 'con que tecnologia esta hecho'],
      r: 'El frontend está hecho en HTML, CSS y JavaScript; el backend usa PHP con base de datos MariaDB, y hay un módulo aparte en Python para el reconocimiento de manos.' },
    { p: ['puedo contribuir al proyecto', 'como colaboro con HANDNOVA'],
      r: 'HANDNOVA es un proyecto formativo; si quieres colaborar o sugerir mejoras, lo mejor es contactar directamente a quienes lo desarrollan.' },
  ];

  /* Sugerencias rápidas que se muestran al abrir el chat por primera vez */
  const SUGERENCIAS = [
    '¿Qué es la LSC?',
    '¿Qué hay en Categorías?',
    '¿Cómo juego el Quiz?',
    '¿Cómo busco una seña?',
    '¿Qué son los logros?'
  ];

  const RESPUESTAS_DEFECTO = [
    'No entendí muy bien tu pregunta 🤔 ¿Puedes reformularla con otras palabras? Por ejemplo, pregúntame "¿qué hay en la categoría animales?" o "¿cómo funciona el quiz?".',
    'Todavía no tengo una respuesta para eso. Prueba con temas como: categorías, abecedario, buscar, juegos, cuenta, progreso o logros.',
    'Hmm, no logré identificar tu pregunta. Intenta ser más específico, por ejemplo: "¿cómo creo una cuenta?" o "¿qué es el abecedario?".'
  ];

  /* ------------------------------------------------------------------ *
   * 2. UTILIDADES DE TEXTO Y BÚSQUEDA
   * ------------------------------------------------------------------ */
  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/[¿?¡!.,;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function encontrarRespuesta(pregunta) {
    const texto = normalizar(pregunta);
    let mejor = null;
    let mejorPuntaje = 0;
    for (let i = 0; i < BASE.length; i++) {
      const entrada = BASE[i];
      for (let j = 0; j < entrada.p.length; j++) {
        const patron = normalizar(entrada.p[j]);
        if (patron && texto.indexOf(patron) !== -1 && patron.length > mejorPuntaje) {
          mejorPuntaje = patron.length;
          mejor = entrada;
        }
      }
    }
    if (mejor) return mejor.r;
    return RESPUESTAS_DEFECTO[Math.floor(Math.random() * RESPUESTAS_DEFECTO.length)];
  }

  /* ------------------------------------------------------------------ *
   * 3. PERSISTENCIA DEL HISTORIAL (localStorage, compartido entre páginas)
   * ------------------------------------------------------------------ */
  const CLAVE_HISTORIAL = 'HANDNOVA_chat_historial';
  const MAX_MENSAJES = 60;

  function cargarHistorial() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_HISTORIAL) || '[]');
    } catch (e) {
      return [];
    }
  }

  function guardarHistorial(historial) {
    const recortado = historial.slice(-MAX_MENSAJES);
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(recortado));
  }

  /* ------------------------------------------------------------------ *
   * 4. ESTILOS (inyectados una sola vez)
   * ------------------------------------------------------------------ */
  function inyectarEstilos() {
    if (document.getElementById('HANDNOVA-chatbot-estilos')) return;
    const estilo = document.createElement('style');
    estilo.id = 'HANDNOVA-chatbot-estilos';
    estilo.textContent = `
      .sv-cb-burbuja {
        position: fixed; bottom: 22px; right: 22px; width: 58px; height: 58px;
        border-radius: 50%; border: none; cursor: pointer; z-index: 9999;
        background: linear-gradient(135deg, var(--magenta, #e040fb), var(--morado, #7c3aed), var(--cyan, #00bcd4));
        box-shadow: var(--sombra-lg, 0 20px 50px rgba(30,20,60,0.25));
        display: flex; align-items: center; justify-content: center;
        transition: transform .2s ease;
      }
      .sv-cb-burbuja:hover { transform: scale(1.07); }
      .sv-cb-burbuja svg { width: 26px; height: 26px; color: white; }
      .sv-cb-burbuja .sv-cb-badge {
        position: absolute; top: -2px; right: -2px; background: #ef4444; color: white;
        font-size: 10px; font-weight: 800; width: 18px; height: 18px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
      }

      .sv-cb-panel {
        position: fixed; bottom: 92px; right: 22px; width: 350px; max-width: 92vw;
        height: 500px; max-height: 74vh; background: #ffffff; border-radius: var(--radio-lg, 22px);
        box-shadow: var(--sombra-lg, 0 20px 50px rgba(30,20,60,0.25)); z-index: 9999;
        display: flex; flex-direction: column; overflow: hidden;
        opacity: 0; transform: translateY(16px) scale(.97); pointer-events: none;
        transition: opacity .18s ease, transform .18s ease;
        font-family: var(--font-cuerpo, 'Poppins', sans-serif);
      }
      .sv-cb-panel.sv-cb-abierto { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

      .sv-cb-header {
        background: linear-gradient(to right, var(--magenta, #e040fb), #a855f7, var(--cyan, #00bcd4));
        color: white; padding: 14px 16px; display: flex; align-items: center; gap: 10px;
        flex-shrink: 0;
      }
      .sv-cb-header-avatar {
        width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.22);
        display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
      }
      .sv-cb-header-texto { flex: 1; min-width: 0; }
      .sv-cb-header-texto strong { display: block; font-size: 14px; font-family: var(--font-titulos, 'Outfit', sans-serif); }
      .sv-cb-header-texto span { display: block; font-size: 11px; opacity: .85; }
      .sv-cb-cerrar {
        background: none; border: none; color: white; opacity: .85; cursor: pointer;
        width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
        border-radius: 50%; flex-shrink: 0;
      }
      .sv-cb-cerrar:hover { opacity: 1; background: rgba(255,255,255,.15); }

      .sv-cb-mensajes {
        flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
        background: var(--azul-fondo, #dff0f5); background: #f7f8fb;
      }
      .sv-cb-msg { max-width: 82%; padding: 9px 12px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; }
      .sv-cb-msg-bot { align-self: flex-start; background: white; color: var(--negro, #1a1a1a); border-bottom-left-radius: 4px; box-shadow: var(--sombra-sm, 0 2px 10px rgba(30,20,60,.06)); }
      .sv-cb-msg-user { align-self: flex-end; background: linear-gradient(135deg, var(--morado, #7c3aed), var(--cyan, #00bcd4)); color: white; border-bottom-right-radius: 4px; }

      .sv-cb-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 12px; flex-shrink: 0; }
      .sv-cb-chip {
        border: 1px solid rgba(124,58,237,.28); background: white; color: var(--morado, #7c3aed);
        font-size: 11.5px; font-weight: 600; padding: 6px 10px; border-radius: 30px; cursor: pointer;
        transition: background .15s ease;
      }
      .sv-cb-chip:hover { background: rgba(124,58,237,.08); }

      .sv-cb-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #eee; flex-shrink: 0; background: white; }
      .sv-cb-input {
        flex: 1; border: 1px solid #e2e2e2; border-radius: 20px; padding: 9px 14px; font-size: 13px;
        font-family: inherit; outline: none;
      }
      .sv-cb-input:focus { border-color: var(--morado, #7c3aed); }
      .sv-cb-enviar {
        width: 36px; height: 36px; border-radius: 50%; border: none; flex-shrink: 0; cursor: pointer;
        background: linear-gradient(135deg, var(--morado, #7c3aed), var(--cyan, #00bcd4)); color: white;
        display: flex; align-items: center; justify-content: center;
      }
      .sv-cb-enviar:disabled { opacity: .5; cursor: default; }
      .sv-cb-enviar svg { width: 16px; height: 16px; }

      @media (max-width: 420px) {
        .sv-cb-panel { right: 4vw; left: 4vw; width: auto; bottom: 88px; }
        .sv-cb-burbuja { right: 16px; bottom: 16px; }
      }

      /* ---- Modo oscuro (misma convención que el resto de HANDNOVA) ---- */
      body.modo-oscuro .sv-cb-panel { background: #1a1d27; }
      body.modo-oscuro .sv-cb-mensajes { background: #12141c; }
      body.modo-oscuro .sv-cb-msg-bot { background: #232733; color: #e5e7eb; }
      body.modo-oscuro .sv-cb-chip { background: #232733; border-color: #333846; color: #c4b5fd; }
      body.modo-oscuro .sv-cb-chip:hover { background: #2a2e3b; }
      body.modo-oscuro .sv-cb-form { background: #1a1d27; border-top-color: #2a2e3b; }
      body.modo-oscuro .sv-cb-input { background: #232733; border-color: #333846; color: #e5e7eb; }
    `;
    document.head.appendChild(estilo);
  }

  /* ------------------------------------------------------------------ *
   * 5. CONSTRUCCIÓN DEL WIDGET
   * ------------------------------------------------------------------ */
  function crearWidget() {
    inyectarEstilos();

    // Burbuja flotante
    const burbuja = document.createElement('button');
    burbuja.className = 'sv-cb-burbuja';
    burbuja.type = 'button';
    burbuja.title = 'Asistente HANDNOVA';
    burbuja.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>';

    // Panel
    const panel = document.createElement('div');
    panel.className = 'sv-cb-panel';
    panel.innerHTML = `
      <div class="sv-cb-header">
        <div class="sv-cb-header-avatar">🤖</div>
        <div class="sv-cb-header-texto">
          <strong>Asistente HANDNOVA</strong>
        </div>
        <button type="button" class="sv-cb-cerrar" title="Cerrar" id="sv-cb-cerrar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="sv-cb-mensajes" id="sv-cb-mensajes"></div>
      <div class="sv-cb-chips" id="sv-cb-chips"></div>
      <form class="sv-cb-form" id="sv-cb-form">
        <input class="sv-cb-input" id="sv-cb-input" type="text" autocomplete="off" placeholder="Escribe tu pregunta..." maxlength="200">
        <button class="sv-cb-enviar" type="submit" id="sv-cb-enviar" title="Enviar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    `;

    document.body.appendChild(burbuja);
    document.body.appendChild(panel);

    const zonaMensajes = panel.querySelector('#sv-cb-mensajes');
    const zonaChips = panel.querySelector('#sv-cb-chips');
    const form = panel.querySelector('#sv-cb-form');
    const input = panel.querySelector('#sv-cb-input');
    const btnCerrar = panel.querySelector('#sv-cb-cerrar');

    let historial = cargarHistorial();

    function pintarMensaje(rol, texto) {
      const burbujaMsg = document.createElement('div');
      burbujaMsg.className = 'sv-cb-msg ' + (rol === 'user' ? 'sv-cb-msg-user' : 'sv-cb-msg-bot');
      burbujaMsg.textContent = texto;
      zonaMensajes.appendChild(burbujaMsg);
      zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
    }

    function pintarChips() {
      zonaChips.innerHTML = '';
      SUGERENCIAS.forEach(function (sugerencia) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sv-cb-chip';
        chip.textContent = sugerencia;
        chip.addEventListener('click', function () { enviarPregunta(sugerencia); });
        zonaChips.appendChild(chip);
      });
    }

    function renderizarTodo() {
      zonaMensajes.innerHTML = '';
      if (historial.length === 0) {
        const bienvenida = '¡Hola! 👋 Soy el asistente de HANDNOVA. Pregúntame sobre la LSC, las categorías, los juegos, tu cuenta o tu progreso.';
        pintarMensaje('bot', bienvenida);
        historial.push({ rol: 'bot', texto: bienvenida });
        guardarHistorial(historial);
      } else {
        historial.forEach(function (m) { pintarMensaje(m.rol, m.texto); });
      }
      const yaPregunto = historial.some(function (m) { return m.rol === 'user'; });
      if (!yaPregunto) pintarChips();
    }

    function enviarPregunta(texto) {
      const limpio = texto.trim();
      if (!limpio) return;
      zonaChips.innerHTML = '';
      pintarMensaje('user', limpio);
      historial.push({ rol: 'user', texto: limpio });

      const respuesta = encontrarRespuesta(limpio);
      // pequeño retardo para que se sienta como una respuesta, no un salto brusco
      setTimeout(function () {
        pintarMensaje('bot', respuesta);
        historial.push({ rol: 'bot', texto: respuesta });
        guardarHistorial(historial);
      }, 260);

      guardarHistorial(historial);
      input.value = '';
      input.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      enviarPregunta(input.value);
    });

    function abrirPanel() {
      panel.classList.add('sv-cb-abierto');
      input.focus();
    }
    function cerrarPanel() {
      panel.classList.remove('sv-cb-abierto');
    }

    burbuja.addEventListener('click', function () {
      if (panel.classList.contains('sv-cb-abierto')) { cerrarPanel(); } else { abrirPanel(); }
    });
    btnCerrar.addEventListener('click', cerrarPanel);

    renderizarTodo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', crearWidget);
  } else {
    crearWidget();
  }
})();
