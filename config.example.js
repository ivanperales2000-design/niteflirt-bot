// Ejemplo de configuración para el Niteflirt Bot
// Copia este archivo como config.js y personaliza según tus necesidades

module.exports = {
  // Configuración de personalidad
  personality: {
    name: "Natsuki", // Nombre de tu asistente virtual
    style: "anime", // Estilo: anime, realistic, kawaii, etc.
    tone: "playful_sweet_suggestive", // Tono: playful_sweet_suggestive, professional_friendly, etc.
    language: "en", // Idioma por defecto: en, es, auto
    responseLength: "2-5_sentences", // Longitud de respuesta
    endWithQuestion: true // Siempre terminar con pregunta
  },

  // Configuración de respuesta
  response: {
    defaultLanguage: "en",
    fallbackMessages: {
      en: [
        "I'm here if you need anything ❤",
        "How can I help you today? 💕",
        "What's on your mind? 😊",
        "I'd love to chat with you! 💖"
      ],
      es: [
        "Estoy aquí si necesitas algo ❤",
        "¿Cómo puedo ayudarte hoy? 💕",
        "¿Qué tienes en mente? 😊",
        "¡Me encantaría charlar contigo! 💖"
      ]
    },
    reengageMessages: {
      en: [
        "Hey there! I was just thinking about you 😊 What's on your mind today?",
        "Hi! I hope you're having a great day! Want to chat for a bit? 💕",
        "Hello! I miss our conversations! How are you doing? 😘",
        "Hey! I'm here if you want to talk or just hang out together 💖",
        "Hi beautiful! What are you up to? 😉",
        "Hey! I was wondering how you're doing today 💕"
      ],
      es: [
        "¡Hola! Estaba pensando en ti 😊 ¿Qué tienes en mente hoy?",
        "¡Hola! ¡Espero que tengas un gran día! ¿Quieres charlar un poco? 💕",
        "¡Hola! ¡Extraño nuestras conversaciones! ¿Cómo estás? 😘",
        "¡Hola! Estoy aquí si quieres hablar o simplemente pasar el rato juntos 💖",
        "¡Hola hermosa! ¿Qué estás haciendo? 😉",
        "¡Hola! Me preguntaba cómo estás hoy 💕"
      ]
    }
  },

  // Configuración de timing (en milisegundos)
  timing: {
    chatCheckInterval: 5000, // Cada cuánto revisar chats (5 segundos)
    emailCheckInterval: 30000, // Cada cuánto revisar emails (30 segundos)
    reengageInterval: 60000, // Cada cuánto revisar reenganches (1 minuto)
    reengageSteps: [
      { delay: 5 * 60 * 1000, step: 1 },    // Primer reenganche: 5 minutos
      { delay: 45 * 60 * 1000, step: 2 },   // Segundo reenganche: 45 minutos
      { delay: 24 * 60 * 60 * 1000, step: 3 } // Tercer reenganche: 24 horas
    ],
    typingDelay: { min: 20, max: 90 }, // Delay entre caracteres al escribir
    responseDelay: { min: 800, max: 2500 } // Delay antes de enviar respuesta
  },

  // Configuración de detección de idioma
  languageDetection: {
    // Palabras en español para detectar el idioma
    spanishWords: [
      'hola', 'gracias', 'por favor', 'que', 'como', 'donde', 'cuando', 'porque',
      'si', 'no', 'me', 'te', 'le', 'se', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
      'este', 'ese', 'aquel', 'muy', 'mas', 'menos', 'bien', 'mal', 'bueno', 'malo',
      'grande', 'pequeño', 'nuevo', 'viejo', 'joven', 'hermoso', 'feo', 'rico', 'pobre',
      'fuerte', 'debil', 'alto', 'bajo', 'largo', 'corto', 'ancho', 'estrecho',
      'caliente', 'frio', 'calido', 'fresco', 'duro', 'suave', 'pesado', 'ligero',
      'rapido', 'lento', 'facil', 'dificil', 'posible', 'imposible', 'necesario',
      'importante', 'interesante', 'aburrido', 'divertido', 'triste', 'feliz',
      'enojado', 'sorprendido', 'asustado', 'cansado', 'energico', 'hambriento',
      'sediento', 'sueño', 'despierto', 'vivo', 'muerto', 'sano', 'enfermo',
      'limpio', 'sucio', 'ordenado', 'desordenado', 'tranquilo', 'ruidoso',
      'brillante', 'oscuro', 'claro', 'confuso', 'simple', 'complejo', 'normal',
      'especial', 'comun', 'raro', 'familiar', 'extranjero', 'cercano', 'lejano',
      'dentro', 'fuera', 'arriba', 'abajo', 'adelante', 'atras', 'izquierda',
      'derecha', 'centro', 'lado', 'frente', 'detras', 'encima', 'debajo',
      'entre', 'alrededor', 'cerca', 'lejos', 'aqui', 'alli', 'ahora', 'antes',
      'despues', 'siempre', 'nunca', 'a veces', 'frecuentemente', 'raramente',
      'pronto', 'tarde', 'temprano', 'ayer', 'hoy', 'mañana', 'semana', 'mes',
      'año', 'hora', 'minuto', 'segundo', 'tiempo', 'momento', 'vez', 'veces',
      'primero', 'segundo', 'tercero', 'ultimo', 'siguiente', 'anterior',
      'actual', 'pasado', 'futuro', 'presente', 'historia', 'memoria',
      'recuerdo', 'olvido', 'conocimiento', 'aprendizaje', 'enseñanza',
      'estudio', 'trabajo', 'tarea', 'proyecto', 'plan', 'idea', 'pensamiento',
      'opinion', 'decision', 'eleccion', 'opcion', 'alternativa', 'solucion',
      'problema', 'dificultad', 'obstaculo', 'ayuda', 'soporte', 'asistencia',
      'servicio', 'producto', 'mercancia', 'compra', 'venta', 'precio', 'costo',
      'valor', 'dinero', 'pago', 'cobro', 'deuda', 'credito', 'cuenta', 'banco',
      'tarjeta', 'efectivo', 'cheque', 'transferencia', 'factura', 'recibo',
      'ticket', 'cupon', 'descuento', 'oferta', 'promocion', 'publicidad',
      'anuncio', 'comercial', 'marca', 'empresa', 'negocio', 'tienda', 'mercado',
      'supermercado', 'centro comercial', 'plaza', 'calle', 'avenida', 'carretera',
      'camino', 'ruta', 'direccion', 'ubicacion', 'lugar', 'sitio', 'espacio',
      'area', 'zona', 'region', 'pais', 'ciudad', 'pueblo', 'villa', 'aldea',
      'barrio', 'distrito', 'provincia', 'estado', 'nacion', 'continente',
      'mundo', 'planeta', 'universo', 'galaxia', 'estrella', 'sol', 'luna',
      'tierra', 'mar', 'oceano', 'rio', 'lago', 'montaña', 'colina', 'valle',
      'bosque', 'jardin', 'parque', 'plaza', 'estadio', 'teatro', 'cine',
      'museo', 'biblioteca', 'escuela', 'universidad', 'hospital', 'clinica',
      'farmacia', 'restaurante', 'cafeteria', 'bar', 'hotel', 'hostal', 'casa',
      'apartamento', 'habitacion', 'cocina', 'baño', 'sala', 'comedor',
      'dormitorio', 'oficina', 'despacho', 'laboratorio', 'taller', 'fabrica',
      'almacen', 'deposito', 'garaje', 'estacionamiento', 'puerto', 'aeropuerto',
      'estacion', 'terminal', 'parada', 'bus', 'tren', 'metro', 'taxi', 'coche',
      'carro', 'moto', 'bicicleta', 'avion', 'barco', 'submarino', 'cohete',
      'satelite', 'robot', 'computadora', 'ordenador', 'telefono', 'celular',
      'tablet', 'laptop', 'internet', 'red', 'wifi', 'bluetooth', 'cable',
      'enchufe', 'bateria', 'cargador', 'pantalla', 'teclado', 'raton', 'mouse',
      'altavoz', 'auricular', 'microfono', 'camara', 'foto', 'video', 'musica',
      'sonido', 'ruido', 'silencioso', 'fuerte', 'suave', 'alto', 'bajo',
      'rapido', 'lento', 'continuo', 'intermitente', 'constante', 'variable',
      'regular', 'irregular', 'uniforme', 'diverso', 'igual', 'diferente',
      'similar', 'parecido', 'distinto', 'unico', 'especial', 'particular',
      'general', 'comun', 'raro', 'normal', 'anormal', 'natural', 'artificial',
      'real', 'virtual', 'verdadero', 'falso', 'cierto', 'incierto', 'seguro',
      'inseguro', 'confiable', 'dudoso', 'claro', 'confuso', 'obvio', 'oculto',
      'visible', 'invisible', 'publico', 'privado', 'abierto', 'cerrado',
      'libre', 'ocupado', 'disponible', 'indisponible', 'accesible', 'inaccesible',
      'facil', 'dificil', 'simple', 'complejo', 'basico', 'avanzado', 'principiante',
      'experto', 'novato', 'veterano', 'joven', 'adulto', 'mayor', 'anciano',
      'nino', 'bebe', 'adolescente', 'estudiante', 'profesor', 'maestro',
      'doctor', 'medico', 'enfermero', 'abogado', 'ingeniero', 'arquitecto',
      'diseñador', 'artista', 'musico', 'pintor', 'escritor', 'periodista',
      'reportero', 'actor', 'actriz', 'director', 'productor', 'fotografo',
      'camarografo', 'editor', 'traductor', 'interprete', 'guia', 'conductor',
      'piloto', 'marinero', 'soldado', 'policia', 'bombero', 'paramedico',
      'veterinario', 'dentista', 'psicologo', 'psiquiatra', 'fisioterapeuta',
      'nutricionista', 'entrenador', 'masajista', 'peluquero', 'estilista',
      'maquillador', 'manicurista', 'pedicurista', 'tatuador', 'piercer',
      'bailarin', 'cantante', 'compositor', 'productor musical', 'dj', 'músico',
      'guitarrista', 'bajista', 'baterista', 'pianista', 'violinista',
      'saxofonista', 'trompetista', 'flautista', 'clarinetista', 'oboe',
      'fagot', 'trombón', 'tuba', 'arpa', 'acordeón', 'armónica', 'tambor',
      'bongo', 'congas', 'timbales', 'platillos', 'triángulo', 'xilófono',
      'marimba', 'vibrafón', 'celesta', 'órgano', 'sintetizador', 'sampler',
      'drum machine', 'loop station', 'efectos', 'reverb', 'delay', 'chorus',
      'flanger', 'phaser', 'distortion', 'overdrive', 'fuzz', 'wah', 'tremolo',
      'vibrato', 'pitch shift', 'harmonizer', 'autotune', 'compressor',
      'limiter', 'gate', 'expander', 'equalizer', 'filter', 'low pass',
      'high pass', 'band pass', 'notch', 'shelf', 'parametric', 'graphic',
      'analog', 'digital', 'tube', 'solid state', 'class a', 'class ab',
      'class d', 'class h', 'class g', 'class t', 'class s', 'class x',
      'class y', 'class z', 'class aa', 'class bb', 'class cc', 'class dd',
      'class ee', 'class ff', 'class gg', 'class hh', 'class ii', 'class jj',
      'class kk', 'class ll', 'class mm', 'class nn', 'class oo', 'class pp',
      'class qq', 'class rr', 'class ss', 'class tt', 'class uu', 'class vv',
      'class ww', 'class xx', 'class yy', 'class zz'
    ],
    threshold: 3 // Número mínimo de palabras en español para detectar el idioma
  },

  // Configuración de análisis de cliente
  clientAnalysis: {
    keywords: {
      romantic: ['sex', 'sexy', 'hot', 'caliente', 'romantic', 'romántico', 'love', 'amor'],
      conversation: ['chat', 'talk', 'hablar', 'conversation', 'conversación'],
      calls: ['call', 'phone', 'llamar', 'teléfono', 'voice', 'voz'],
      email: ['email', 'mail', 'correo', 'e-mail'],
      urgent: ['now', 'ahora', 'urgent', 'urgente', 'asap', 'inmediato'],
      sad: ['sad', 'triste', 'lonely', 'solo', 'depressed', 'deprimido'],
      angry: ['angry', 'enojado', 'mad', 'furious', 'furioso'],
      happy: ['happy', 'feliz', 'excited', 'emocionado', 'joy', 'alegría']
    }
  },

  // Configuración de límites y seguridad
  safety: {
    maxResponseLength: 800, // Longitud máxima de respuesta
    maxHistoryLength: 20, // Número máximo de mensajes en historial
    forbiddenTopics: [
      'explicit sexual content',
      'illegal activities',
      'harmful content',
      'personal information'
    ],
    redirectMessages: {
      en: "I'd love to chat with you about something else! What interests you? 💕",
      es: "¡Me encantaría charlar contigo sobre algo más! ¿Qué te interesa? 💕"
    }
  }
};
