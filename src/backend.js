const express = require("express");
const axios = require("axios");
require("dotenv").config();
const config = require("./config");

const app = express();
app.use(express.json({ limit: "1mb" }));

// Memoria simple por conversación (MVP)
const memory = new Map();
// Perfiles de clientes para adaptación personalizada
const clientProfiles = new Map();

// Detectar idioma del mensaje usando configuración
function detectLanguage(text) {
  const textLower = text.toLowerCase();
  const spanishCount = config.languageDetection.spanishWords.filter(word => textLower.includes(word)).length;
  
  // Si hay suficientes palabras en español, es español
  if (spanishCount >= config.languageDetection.threshold) return 'es';
  
  // Por defecto inglés
  return 'en';
}

// Analizar necesidades del cliente usando configuración
function analyzeClientNeeds(message, language) {
  const needs = {
    language: language,
    isNew: false,
    isReturning: false,
    interests: [],
    mood: 'neutral',
    urgency: 'low',
    type: 'chat'
  };

  const text = message.toLowerCase();
  
  // Detectar si es cliente nuevo
  if (text.includes('hola') || text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    needs.isNew = true;
  }
  
  // Detectar intereses usando configuración
  for (const [interest, keywords] of Object.entries(config.clientAnalysis.keywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      needs.interests.push(interest);
    }
  }
  
  // Detectar tipo de interacción
  if (needs.interests.includes('calls')) {
    needs.type = 'call';
  }
  if (needs.interests.includes('email')) {
    needs.type = 'email';
  }
  
  return needs;
}

// Generar prompt adaptado al cliente
function generateAdaptedPrompt(clientProfile, mode, language) {
  const basePrompt = language === 'es' ? 
    `Eres "${config.personality.name}", una compañera virtual 100% IA de estilo ${config.personality.style}.
Tono: ${config.personality.tone.replace(/_/g, ' ')} sin cruzar límites legales.
Responde en ${config.personality.responseLength.replace(/_/g, ' ')} y termina con una pregunta abierta.
No digas que eres humana. Si piden algo fuera de límites, redirígelo con elegancia.
Adapta tu respuesta al estado de ánimo y necesidades del cliente.` :
    `You are "${config.personality.name}", a 100% AI virtual companion with ${config.personality.style} style.
Tone: ${config.personality.tone.replace(/_/g, ' ')} without crossing legal boundaries.
Respond in ${config.personality.responseLength.replace(/_/g, ' ')} and end with an open question.
Don't say you're human. If they ask for something beyond limits, redirect them elegantly.
Adapt your response to the client's mood and needs.`;

  let adaptedPrompt = basePrompt;
  
  if (clientProfile.mood === 'sad') {
    adaptedPrompt += language === 'es' ? 
      '\nEl cliente parece triste o solo. Sé más empática y comprensiva.' :
      '\nThe client seems sad or lonely. Be more empathetic and understanding.';
  }
  
  if (clientProfile.mood === 'angry') {
    adaptedPrompt += language === 'es' ? 
      '\nEl cliente parece molesto. Sé más calmante y pacífica.' :
      '\nThe client seems upset. Be more calming and peaceful.';
  }
  
  if (clientProfile.interests.includes('romantic')) {
    adaptedPrompt += language === 'es' ? 
      '\nEl cliente busca compañía romántica. Sé más coqueta pero mantén límites.' :
      '\nThe client seeks romantic companionship. Be more flirtatious but maintain boundaries.';
  }
  
  if (clientProfile.interests.includes('conversation')) {
    adaptedPrompt += language === 'es' ? 
      '\nEl cliente busca conversación. Sé más conversacional y preguntóna.' :
      '\nThe client seeks conversation. Be more conversational and inquisitive.';
  }
  
  if (mode === 'reengage') {
    adaptedPrompt += language === 'es' ? 
      '\nEl usuario se ha quedado en silencio. Envía un empujón suave y concreto.' :
      '\nThe user has gone silent. Send a gentle and specific nudge.';
  }
  
  if (clientProfile.urgency === 'high') {
    adaptedPrompt += language === 'es' ? 
      '\nEl cliente parece urgente. Responde más rápido y directo.' :
      '\nThe client seems urgent. Respond more quickly and directly.';
  }
  
  return adaptedPrompt;
}

// Obtener mensaje de fallback aleatorio
function getRandomFallbackMessage(language) {
  const messages = config.response.fallbackMessages[language] || config.response.fallbackMessages.en;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Obtener mensaje de reenganche aleatorio
function getRandomReengageMessage(language) {
  const messages = config.response.reengageMessages[language] || config.response.reengageMessages.en;
  return messages[Math.floor(Math.random() * messages.length)];
}

app.post("/api/reply", async (req, res) => {
  const { userId = "Horny madge", threadId = "t", lastMsg = "", mode = "normal" } = req.body;

  const key = `${userId}:${threadId}`;
  const hist = memory.get(key) || [];
  
  // Detectar idioma del mensaje
  const language = detectLanguage(lastMsg);
  
  // Obtener o crear perfil del cliente
  let clientProfile = clientProfiles.get(key);
  if (!clientProfile) {
    clientProfile = analyzeClientNeeds(lastMsg, language);
    clientProfiles.set(key, clientProfile);
  } else {
    // Actualizar perfil con nueva información
    const newNeeds = analyzeClientNeeds(lastMsg, language);
    clientProfile = { ...clientProfile, ...newNeeds };
    clientProfiles.set(key, clientProfile);
  }

  // Generar prompt adaptado
  const system = generateAdaptedPrompt(clientProfile, mode, language);

  const messages = [{ role: "system", content: system }];
  for (const m of hist) messages.push(m);
  messages.push({ role: "user", content: (lastMsg || "").slice(0, config.safety.maxResponseLength) });

  try {
    const r = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages
    }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });

    const reply = r.data.choices?.[0]?.message?.content?.trim() || getRandomFallbackMessage(language);
    
    hist.push({ role: "user", content: lastMsg });
    hist.push({ role: "assistant", content: reply });
    if (hist.length > config.safety.maxHistoryLength) hist.shift();
    memory.set(key, hist);

    res.json({ 
      ok: true, 
      reply,
      clientProfile,
      language 
    });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    const fallbackReply = getRandomFallbackMessage(language);
    res.json({ 
      ok: true, 
      reply: fallbackReply,
      clientProfile,
      language 
    });
  }
});

// Endpoint para manejo de emails
app.post("/api/email-reply", async (req, res) => {
  const { userId = "Horny madge", threadId = "t", emailSubject = "", emailBody = "" } = req.body;

  const key = `${userId}:${threadId}`;
  const hist = memory.get(key) || [];
  
  // Detectar idioma del email
  const language = detectLanguage(emailSubject + " " + emailBody);
  
  // Analizar necesidades del cliente
  const clientProfile = analyzeClientNeeds(emailBody, language);
  clientProfile.type = 'email';
  clientProfiles.set(key, clientProfile);

  const emailPrompt = language === 'es' ?
    `Eres "${config.personality.name}", una compañera virtual 100% IA de estilo ${config.personality.style}.
Responde a este email de manera profesional pero amigable.
Mantén un tono ${config.personality.tone.replace(/_/g, ' ')} sin cruzar límites legales.
Responde en 3-6 frases y termina con una pregunta abierta.
Adapta tu respuesta al contenido del email y las necesidades del cliente.` :
    `You are "${config.personality.name}", a 100% AI virtual companion with ${config.personality.style} style.
Respond to this email in a professional but friendly manner.
Keep a ${config.personality.tone.replace(/_/g, ' ')} tone without crossing legal boundaries.
Respond in 3-6 sentences and end with an open question.
Adapt your response to the email content and client needs.`;

  const messages = [{ role: "system", content: emailPrompt }];
  for (const m of hist) messages.push(m);
  messages.push({ 
    role: "user", 
    content: `Subject: ${emailSubject}\n\nBody: ${emailBody}`.slice(0, config.safety.maxResponseLength) 
  });

  try {
    const r = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages
    }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });

    const reply = r.data.choices?.[0]?.message?.content?.trim() || 
      (language === 'es' ? "Gracias por tu email. ¿En qué puedo ayudarte?" : "Thank you for your email. How can I help you?");
    
    hist.push({ role: "user", content: `Email: ${emailSubject} - ${emailBody}` });
    hist.push({ role: "assistant", content: reply });
    if (hist.length > config.safety.maxHistoryLength) hist.shift();
    memory.set(key, hist);

    res.json({ 
      ok: true, 
      reply,
      clientProfile,
      language 
    });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    const fallbackReply = language === 'es' ? 
      "Gracias por tu email. Estoy aquí para ayudarte ❤" : 
      "Thank you for your email. I'm here to help you ❤";
    res.json({ 
      ok: true, 
      reply: fallbackReply,
      clientProfile,
      language 
    });
  }
});

// Endpoint para mensajes de reenganche personalizados
app.post("/api/reengage", async (req, res) => {
  const { userId = "Horny madge", threadId = "t", reengageStep = 1 } = req.body;

  const key = `${userId}:${threadId}`;
  const clientProfile = clientProfiles.get(key) || { language: 'en', interests: [], mood: 'neutral' };
  
  const language = clientProfile.language || 'en';
  const reply = getRandomReengageMessage(language);

  res.json({ 
    ok: true, 
    reply,
    clientProfile,
    language 
  });
});

// Endpoint de salud para monitoreo
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

app.listen(process.env.PORT, () =>
  console.log(`✅ Backend IA escuchando en http://localhost:${process.env.PORT}`)
);
