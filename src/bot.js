const { chromium } = require('playwright');
const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config();
const S = require('./selectors');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const state = new Map(); // threadId -> { lastInboundAt, lastOutboundAt, reengageStep }
const lastHandledByThread = new Map(); // threadId -> lastMessageText
const emailState = new Map(); // emailId -> { lastHandledAt }
let browser, ctx, page;

async function login() {
  // Validar variables de entorno requeridas
  console.log('🔍 Verificando variables de entorno...');
  
  if (!process.env.BASE_URL || process.env.BASE_URL.trim() === '') {
    console.error("❌ ERROR: BASE_URL no está definido en el archivo .env. Añade BASE_URL=https://www.niteflirt.com y reinicia.");
    process.exit(1);
  }
  
  if (!process.env.NF_EMAIL || process.env.NF_EMAIL.trim() === '') {
    console.error("❌ ERROR: NF_EMAIL no está definido en el archivo .env. Añade NF_EMAIL=tu_email y reinicia.");
    process.exit(1);
  }
  
  if (!process.env.NF_PASS || process.env.NF_PASS.trim() === '') {
    console.error("❌ ERROR: NF_PASS no está definido en el archivo .env. Añade NF_PASS=tu_contraseña y reinicia.");
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    console.error("❌ ERROR: OPENAI_API_KEY no está definido en el archivo .env. Añade OPENAI_API_KEY=tu_api_key y reinicia.");
    process.exit(1);
  }
  
  if (!process.env.BACKEND_URL || process.env.BACKEND_URL.trim() === '') {
    console.error("❌ ERROR: BACKEND_URL no está definido en el archivo .env. Añade BACKEND_URL=http://localhost:3000 y reinicia.");
    process.exit(1);
  }
  
  // Confirmar que las variables se han cargado correctamente
  console.log('✅ Variables de entorno cargadas:');
  console.log(`   📧 NF_EMAIL: ${process.env.NF_EMAIL}`);
  console.log(`   🌐 BASE_URL: ${process.env.BASE_URL}`);
  console.log(`   🔗 BACKEND_URL: ${process.env.BACKEND_URL}`);
  console.log(`   🤖 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '***configurado***' : 'NO CONFIGURADO'}`);
  console.log(`   🔒 NF_PASS: ${process.env.NF_PASS ? '***configurado***' : 'NO CONFIGURADO'}`);
  
  browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Construir URL de login
  const loginUrl = `${process.env.BASE_URL.replace(/\/$/, '')}/login`;
  
  // Verificar si existe nf_state.json
  if (fs.existsSync('nf_state.json')) {
    console.log('🔑 Usando sesión guardada en nf_state.json');
    try {
    ctx = await browser.newContext({ storageState: 'nf_state.json' });
    page = await ctx.newPage();

      // Ir directamente a la página principal
      await page.goto(process.env.BASE_URL, { waitUntil: 'domcontentloaded' });
      await SLEEP(2000);

      // Verificar si ya estamos logueados
      const alreadyIn = await page.locator(S.auth.loggedIn).first().isVisible().catch(()=>false) || 
                       await page.locator(S.auth.loggedInCSS).first().isVisible().catch(()=>false);
    if (alreadyIn) {
      console.log('✅ Sesión válida, ya estamos logueados');
      return;
      }
    } catch (error) {
      console.log('⚠️ Error con sesión guardada, creando nueva sesión...');
    }
  }

  // Crear nuevo contexto para login
  console.log('🔐 Iniciando proceso de login automático...');
  ctx = await browser.newContext();
  page = await ctx.newPage();

  try {
    // Ir a la página de login
    console.log(`🌐 Navegando a: ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    await SLEEP(2000);
    
    // Buscar y llenar el campo de email
    console.log('📧 Buscando campo de email...');
    const emailInput = page.locator('input[type="email"], input[name="username"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    if (await emailInput.count() > 0) {
      await emailInput.first().fill(process.env.NF_EMAIL);
      console.log('✅ Email ingresado');
      await SLEEP(500);
    } else {
      console.log('⚠️ No se encontró campo de email, intentando otros selectores...');
      const altEmailInput = page.locator('input[type="text"]').first();
      if (await altEmailInput.count() > 0) {
        await altEmailInput.fill(process.env.NF_EMAIL);
        console.log('✅ Email ingresado (selector alternativo)');
        await SLEEP(500);
      }
    }
    
    // Buscar y llenar el campo de contraseña
    console.log('🔒 Buscando campo de contraseña...');
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill(process.env.NF_PASS);
      console.log('✅ Contraseña ingresada');
      await SLEEP(500);
    }

    // Buscar y hacer clic en el botón de login
    console.log('🚀 Buscando botón de login...');
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Entrar"), button:has-text("Login"), button:has-text("Log in"), input[type="submit"]');
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      console.log('✅ Botón de login presionado');
    } else {
      console.log('⚠️ No se encontró botón de login, intentando Enter...');
      await page.keyboard.press('Enter');
    }

    // Esperar a que se complete el login
    console.log('⏳ Esperando a que se complete el login...');
    await SLEEP(3000);
    
    // Verificar si el login fue exitoso
    const loginSuccess = await page.locator(S.auth.loggedIn).first().isVisible().catch(()=>false) ||
                        await page.locator(S.auth.loggedInCSS).first().isVisible().catch(()=>false);
    if (loginSuccess) {
      console.log('✅ Login exitoso!');
    } else {
      console.log('⚠️ Login automático no detectado, esperando login manual...');
      await page.waitForSelector(S.auth.loggedIn, { timeout: 300000 }); // 5 minutos
    }
    
    // Guardar el estado de sesión
    await ctx.storageState({ path: 'nf_state.json' });
    console.log('✅ Sesión guardada en nf_state.json');
    
  } catch (error) {
    console.error('❌ Error durante el login:', error.message);
    console.log('💡 Por favor, completa el login manualmente en la ventana del navegador');
    
    // Esperar a que el usuario complete el login manualmente
    await page.waitForSelector(S.auth.loggedIn, { timeout: 300000 }); // 5 minutos
    
    // Guardar el estado de sesión después del login manual
    await ctx.storageState({ path: 'nf_state.json' });
    console.log('✅ Sesión guardada en nf_state.json');
  }
}

async function gotoChat() {
  await page.goto(S.urls.chat, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
}

async function openFirstUnreadThread() {
  const threads = page.locator(S.chat.threadItem);
  const count = await threads.count();
  for (let i=0;i<count;i++){
    const t = threads.nth(i);
    const hasUnread = await t.locator(S.chat.unreadBadgeOnThread).count().catch(()=>0);
    if (hasUnread > 0) { 
      await t.click(); 
      console.log(`📬 Abierto hilo no leído #${i+1}`);
      return true; 
    }
  }
  return false;
}

async function readLastInbound() {
  const last = page.locator(S.chat.lastInboundMsg);
  if (await last.count() === 0) return null;
  const txt = await last.last().innerText().catch(()=>null);
  return txt ? txt.trim() : null;
}

async function sendReply(text) {
  const input = page.locator(S.chat.messageInput).first();
  await input.click();
  for (const ch of text) {
    await input.type(ch, { delay: jitter(20, 90) });
  }
  await SLEEP(jitter(300, 900));
  const btn = page.locator(S.chat.sendButton).first();
  await btn.click().catch(()=>input.press('Enter'));
}

async function getCurrentThreadId() {
  // Usa el título/cabecera como id simple de hilo (MVP)
  let header = 'thread';
  try { header = await page.locator('header, .thread-header, .conversation-header').first().innerText(); } catch {}
  return (header || 'thread').slice(0,80);
}

async function handleCurrentThread() {
  const threadId = await getCurrentThreadId();
  const lastMsg = await readLastInbound();
  
  if (!lastMsg) return false;
  
  // Evitar duplicar respuestas
  const lastHandled = lastHandledByThread.get(threadId);
  if (lastHandled === lastMsg) return false;
  
  console.log(`💬 Respondiendo hilo actual [${threadId}]: "${lastMsg.slice(0,50)}..."`);
  
  const now = Date.now();
  const st = state.get(threadId) || { reengageStep: 0 };
  st.lastInboundAt = now;
  state.set(threadId, st);

  const payload = { userId: 'Horny madge', threadId, lastMsg, mode: 'normal' };
  const { data } = await axios.post(process.env.BACKEND_URL, payload);
  const reply = data?.reply || 'Tell me more 😉';

  await SLEEP(jitter(800, 2500));
  await sendReply(reply);

  st.lastOutboundAt = Date.now();
  st.reengageStep = 0;
  state.set(threadId, st);
  
  // Guardar el mensaje respondido para evitar duplicados
  lastHandledByThread.set(threadId, lastMsg);

  return true;
}

async function handleUnreadOnce() {
  const opened = await openFirstUnreadThread();
  if (!opened) return false;

  const threadId = await getCurrentThreadId();
  console.log(`📬 Procesando hilo no leído [${threadId}]`);

  const lastMsg = await readLastInbound();
  if (!lastMsg) return true;

  const now = Date.now();
  const st = state.get(threadId) || { reengageStep: 0 };
  st.lastInboundAt = now;
  state.set(threadId, st);

  const payload = { userId: 'Horny madge', threadId, lastMsg, mode: 'normal' };
  const { data } = await axios.post(process.env.BACKEND_URL, payload);
  const reply = data?.reply || 'Tell me more 😉';

  await SLEEP(jitter(800, 2500));
  await sendReply(reply);

  st.lastOutboundAt = Date.now();
  st.reengageStep = 0;
  state.set(threadId, st);
  
  // Guardar el mensaje respondido para evitar duplicados
  lastHandledByThread.set(threadId, lastMsg);

  return true;
}

async function gotoMail() {
  await page.goto(S.urls.mail, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
}

async function openFirstUnreadEmail() {
  const emails = page.locator(S.mail.unreadRow);
  const count = await emails.count();
  for (let i=0;i<count;i++){
    const e = emails.nth(i);
    const isUnread = await e.locator('.unread, [data-unread="true"]').count().catch(()=>0);
    if (isUnread > 0) { 
      await e.click(); 
      console.log(`📧 Abierto email no leído #${i+1}`);
      return true; 
    }
  }
  return false;
}

async function readEmailContent() {
  const subject = await page.locator('.email-subject, .mail-subject, h1, h2').first().innerText().catch(()=>'No Subject');
  const body = await page.locator(S.mail.mailBody).first().innerText().catch(()=>'No content');
  return { subject: subject.trim(), body: body.trim() };
}

async function sendEmailReply(text) {
  const replyBox = page.locator(S.mail.replyBox).first();
  await replyBox.click();
  for (const ch of text) {
    await replyBox.type(ch, { delay: jitter(20, 90) });
  }
  await SLEEP(jitter(300, 900));
  const btn = page.locator(S.mail.sendMailButton).first();
  await btn.click().catch(()=>replyBox.press('Enter'));
}

async function getCurrentEmailId() {
  // Usa el asunto como id simple del email (MVP)
  let subject = 'email';
  try { 
    subject = await page.locator('.email-subject, .mail-subject, h1, h2').first().innerText(); 
  } catch {}
  return (subject || 'email').slice(0,80);
}

async function handleCurrentEmail() {
  const emailId = await getCurrentEmailId();
  const emailContent = await readEmailContent();
  
  if (!emailContent.body) return false;
  
  // Evitar duplicar respuestas
  const lastHandled = emailState.get(emailId);
  if (lastHandled && Date.now() - lastHandled < 60000) return false; // 1 minuto
  
  console.log(`📧 Respondiendo email [${emailId}]: "${emailContent.subject}"`);
  
  const payload = { 
    userId: 'Horny madge', 
    threadId: emailId, 
    emailSubject: emailContent.subject, 
    emailBody: emailContent.body 
  };
  
  try {
    const { data } = await axios.post(`${process.env.BACKEND_URL}/api/email-reply`, payload);
    const reply = data?.reply || 'Thank you for your email. How can I help you?';

    await SLEEP(jitter(800, 2500));
    await sendEmailReply(reply);

    emailState.set(emailId, { lastHandledAt: Date.now() });
    console.log(`✅ Email respondido: ${emailContent.subject}`);
    return true;
  } catch (error) {
    console.error('Error responding email:', error.message);
    return false;
  }
}

async function handleUnreadEmailOnce() {
  const opened = await openFirstUnreadEmail();
  if (!opened) return false;

  const emailId = await getCurrentEmailId();
  console.log(`📧 Procesando email no leído [${emailId}]`);

  const emailContent = await readEmailContent();
  if (!emailContent.body) return true;

  const payload = { 
    userId: 'Horny madge', 
    threadId: emailId, 
    emailSubject: emailContent.subject, 
    emailBody: emailContent.body 
  };
  
  try {
    const { data } = await axios.post(`${process.env.BACKEND_URL}/api/email-reply`, payload);
    const reply = data?.reply || 'Thank you for your email. How can I help you?';

    await SLEEP(jitter(800, 2500));
    await sendEmailReply(reply);

    emailState.set(emailId, { lastHandledAt: Date.now() });
    console.log(`✅ Email respondido: ${emailContent.subject}`);
    return true;
  } catch (error) {
    console.error('Error responding email:', error.message);
    return false;
  }
}

async function reengageSweep() {
  const now = Date.now();
  for (const [threadId, st] of state.entries()) {
    if (!st.lastInboundAt || !st.lastOutboundAt) continue;
    const msSinceInbound = now - st.lastInboundAt;
    let neededStep = null;

    if (st.reengageStep === 0 && msSinceInbound > 5*60*1000) neededStep = 1;        // 5 min
    else if (st.reengageStep === 1 && msSinceInbound > 45*60*1000) neededStep = 2;  // 45 min
    else if (st.reengageStep === 2 && msSinceInbound > 24*60*60*1000) neededStep = 3; // 24 h

    if (!neededStep) continue;

    try {
      const { data } = await axios.post(`${process.env.BACKEND_URL}/api/reengage`, {
      userId: 'Horny madge',
      threadId,
        reengageStep: neededStep
    });

    const reply = data?.reply || 'Still there? 😉';
      
      // Navegar al chat y enviar el mensaje
      await gotoChat();
      
      // Buscar el hilo específico (simplificado - en producción necesitarías más lógica)
      const threads = page.locator(S.chat.threadItem);
      const count = await threads.count();
      let found = false;
      
      for (let i=0; i<count && !found; i++){
        const t = threads.nth(i);
        const threadText = await t.innerText().catch(()=>'');
        if (threadText.includes(threadId.slice(0,20))) {
          await t.click();
          found = true;
    await SLEEP(jitter(600, 1800));
    await sendReply(reply);
          console.log(`💬 Reenganche enviado a [${threadId}]: ${reply.slice(0,50)}...`);
        }
      }

    st.lastOutboundAt = Date.now();
    st.reengageStep = neededStep;
    state.set(threadId, st);
    } catch (error) {
      console.error('Error in reengage:', error.message);
    }
  }
}

async function watchLoop() {
  console.log('🔄 Iniciando bucle de monitoreo inteligente...');
  
  // Realizar análisis inicial completo
  console.log('🔍 Realizando análisis inicial de la web...');
  await performFullAnalysis();
  
  // Ir al chat para comenzar el monitoreo
  await gotoChat();
  
  let analysisCounter = 0;
  
  while (true) {
    try {
      analysisCounter++;
      
      // Manejar hilos no leídos en chat
      const handledUnread = await handleUnreadOnce();
      
      // Manejar hilo actual cada 5 segundos
      const handledCurrent = await handleCurrentThread();
      
      // Manejar emails cada 30 segundos
      if (Date.now() % 30000 < 5000) {
        console.log('📧 Verificando emails...');
        await gotoMail();
        const handledEmail = await handleUnreadEmailOnce();
        if (handledEmail) {
          await SLEEP(2000);
          await gotoChat(); // Volver al chat
        }
      }
      
      // Realizar análisis completo cada 10 minutos (600 segundos)
      if (analysisCounter % 120 === 0) { // Cada 120 iteraciones (10 minutos)
        console.log('🔍 Realizando análisis periódico completo...');
        await performFullAnalysis();
        await gotoChat(); // Volver al chat después del análisis
      }
      
      // Verificar visitantes nuevos cada 5 minutos
      if (analysisCounter % 60 === 0) {
        console.log('👥 Verificando visitantes nuevos...');
        await gotoSection('visitors');
        const visitors = await analyzeVisitors();
        if (visitors.length > 0) {
          console.log(`👥 Nuevos visitantes detectados: ${visitors.length}`);
          // Aquí podrías implementar lógica para contactar visitantes nuevos
        }
        await gotoChat(); // Volver al chat
      }
      
      // Verificar favoritos cada 15 minutos
      if (analysisCounter % 180 === 0) {
        console.log('❤️ Verificando favoritos...');
        await gotoSection('favorites');
        const favorites = await analyzeFavorites();
        if (favorites.length > 0) {
          console.log(`❤️ Favoritos actuales: ${favorites.length}`);
          // Aquí podrías implementar lógica para contactar favoritos
        }
        await gotoChat(); // Volver al chat
      }
      
      // Verificar llamadas perdidas cada 10 minutos
      if (analysisCounter % 120 === 0) {
        console.log('📞 Verificando llamadas perdidas...');
        await gotoSection('calls');
        const calls = await analyzeCallHistory();
        const missedCalls = calls.filter(call => call.missed);
        if (missedCalls.length > 0) {
          console.log(`📞 Llamadas perdidas: ${missedCalls.length}`);
          // Aquí podrías implementar lógica para contactar clientes con llamadas perdidas
        }
        await gotoChat(); // Volver al chat
      }
      
      // Buscar clientes inactivos para reenganche cada 5 minutos
      if (analysisCounter % 60 === 0) {
        console.log('😴 Verificando clientes inactivos...');
        const inactiveClients = await findInactiveClients();
        if (inactiveClients.length > 0) {
          console.log(`😴 Clientes inactivos encontrados: ${inactiveClients.length}`);
          // El reenganche se maneja en la función reengageSweep
        }
      }
      
      // Verificar notificaciones cada 2 minutos
      if (analysisCounter % 24 === 0) {
        console.log('🔔 Verificando notificaciones...');
        const notifications = await analyzeNotifications();
        const unreadNotifications = notifications.filter(n => n.unread);
        if (unreadNotifications.length > 0) {
          console.log(`🔔 Notificaciones no leídas: ${unreadNotifications.length}`);
        }
      }
      
      // Si no hay nada que procesar, esperar
      if (!handledUnread && !handledCurrent) {
        await SLEEP(5000); // Esperar 5 segundos
      }
      
    } catch (e) {
      console.error('❌ Error en bucle de monitoreo:', e.message);
      await SLEEP(5000);
      
      // Intentar volver al chat si hay error
      try {
        await gotoChat();
      } catch (chatError) {
        console.error('❌ Error volviendo al chat:', chatError.message);
      }
    }
  }
}

function scheduleReengage() {
  // Reenganche cada minuto
  cron.schedule('* * * * *', async () => {
    try { 
      await reengageSweep(); 
    } catch(e){ 
      console.error('reengage err', e.message); 
    }
  });
}

// ===== FUNCIONES DE NAVEGACIÓN Y ANÁLISIS =====

// Navegar a diferentes secciones
async function gotoSection(section) {
  const url = S.urls[section];
  if (!url) {
    console.log(`❌ URL no encontrada para sección: ${section}`);
    return false;
  }
  
  console.log(`🌐 Navegando a ${section}: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  return true;
}

// Analizar dashboard y estadísticas
async function analyzeDashboard() {
  console.log('📊 Analizando dashboard...');
  
  try {
    const stats = {};
    
    // Obtener ganancias
    const earningsElement = page.locator(S.dashboard.earningsDisplay);
    if (await earningsElement.count() > 0) {
      stats.earnings = await earningsElement.first().innerText();
      console.log(`💰 Ganancias: ${stats.earnings}`);
    }
    
    // Obtener conteo de mensajes
    const messageCountElement = page.locator(S.dashboard.messageCount);
    if (await messageCountElement.count() > 0) {
      stats.messageCount = await messageCountElement.first().innerText();
      console.log(`💬 Mensajes: ${stats.messageCount}`);
    }
    
    // Obtener conteo de llamadas
    const callCountElement = page.locator(S.dashboard.callCount);
    if (await callCountElement.count() > 0) {
      stats.callCount = await callCountElement.first().innerText();
      console.log(`📞 Llamadas: ${stats.callCount}`);
    }
    
    // Obtener conteo de visitantes
    const visitorCountElement = page.locator(S.dashboard.visitorCount);
    if (await visitorCountElement.count() > 0) {
      stats.visitorCount = await visitorCountElement.first().innerText();
      console.log(`👥 Visitantes: ${stats.visitorCount}`);
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Error analizando dashboard:', error.message);
    return null;
  }
}

// Analizar visitantes recientes
async function analyzeVisitors() {
  console.log('👥 Analizando visitantes...');
  
  try {
    const visitors = [];
    const visitorItems = page.locator(S.visitors.visitorItem);
    const count = await visitorItems.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const item = visitorItems.nth(i);
      const visitor = {};
      
      // Obtener nombre del visitante
      const nameElement = item.locator(S.visitors.visitorName);
      if (await nameElement.count() > 0) {
        visitor.name = await nameElement.first().innerText();
      }
      
      // Obtener fecha de visita
      const dateElement = item.locator(S.visitors.visitDate);
      if (await dateElement.count() > 0) {
        visitor.date = await dateElement.first().innerText();
      }
      
      // Obtener estado
      const statusElement = item.locator(S.visitors.visitorStatus);
      if (await statusElement.count() > 0) {
        visitor.status = await statusElement.first().innerText();
      }
      
      if (visitor.name) {
        visitors.push(visitor);
        console.log(`👤 Visitante: ${visitor.name} - ${visitor.date || 'Fecha desconocida'}`);
      }
    }
    
    return visitors;
  } catch (error) {
    console.error('❌ Error analizando visitantes:', error.message);
    return [];
  }
}

// Analizar favoritos
async function analyzeFavorites() {
  console.log('❤️ Analizando favoritos...');
  
  try {
    const favorites = [];
    const favoriteItems = page.locator(S.favorites.favoriteItem);
    const count = await favoriteItems.count();
    
    for (let i = 0; i < Math.min(count, 20); i++) {
      const item = favoriteItems.nth(i);
      const favorite = {};
      
      // Obtener nombre del favorito
      const nameElement = item.locator(S.favorites.favoriteName);
      if (await nameElement.count() > 0) {
        favorite.name = await nameElement.first().innerText();
      }
      
      // Obtener fecha
      const dateElement = item.locator(S.favorites.favoriteDate);
      if (await dateElement.count() > 0) {
        favorite.date = await dateElement.first().innerText();
      }
      
      if (favorite.name) {
        favorites.push(favorite);
        console.log(`❤️ Favorito: ${favorite.name} - ${favorite.date || 'Fecha desconocida'}`);
      }
    }
    
    return favorites;
  } catch (error) {
    console.error('❌ Error analizando favoritos:', error.message);
    return [];
  }
}

// Analizar historial de llamadas
async function analyzeCallHistory() {
  console.log('📞 Analizando historial de llamadas...');
  
  try {
    const calls = [];
    const callItems = page.locator(S.calls.callItem);
    const count = await callItems.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const item = callItems.nth(i);
      const call = {};
      
      // Verificar si es llamada perdida
      const missedElement = item.locator(S.calls.missedCall);
      call.missed = await missedElement.count() > 0;
      
      // Verificar si es llamada contestada
      const answeredElement = item.locator(S.calls.answeredCall);
      call.answered = await answeredElement.count() > 0;
      
      // Obtener duración
      const durationElement = item.locator(S.calls.callDuration);
      if (await durationElement.count() > 0) {
        call.duration = await durationElement.first().innerText();
      }
      
      // Obtener fecha
      const dateElement = item.locator(S.calls.callDate);
      if (await dateElement.count() > 0) {
        call.date = await dateElement.first().innerText();
      }
      
      calls.push(call);
      const status = call.missed ? '❌ Perdida' : call.answered ? '✅ Contestada' : '❓ Desconocida';
      console.log(`📞 Llamada: ${status} - ${call.duration || 'Sin duración'} - ${call.date || 'Fecha desconocida'}`);
    }
    
    return calls;
  } catch (error) {
    console.error('❌ Error analizando historial de llamadas:', error.message);
    return [];
  }
}

// Buscar clientes inactivos para reenganche
async function findInactiveClients() {
  console.log('🔍 Buscando clientes inactivos...');
  
  try {
    const inactiveClients = [];
    
    // Ir a la sección de chat
    await gotoChat();
    
    // Obtener todos los hilos
    const threads = page.locator(S.chat.threadItem);
    const count = await threads.count();
    
    for (let i = 0; i < count; i++) {
      const thread = threads.nth(i);
      const client = {};
      
      // Obtener nombre del cliente
      const nameElement = thread.locator(S.chat.clientName);
      if (await nameElement.count() > 0) {
        client.name = await nameElement.first().innerText();
      }
      
      // Verificar si tiene mensajes no leídos
      const unreadElement = thread.locator(S.chat.unreadBadgeOnThread);
      client.hasUnread = await unreadElement.count() > 0;
      
      // Obtener último mensaje
      const lastMessageElement = thread.locator(S.chat.lastInboundMsg);
      if (await lastMessageElement.count() > 0) {
        client.lastMessage = await lastMessageElement.first().innerText();
      }
      
      // Obtener timestamp del último mensaje (si está disponible)
      const timeElement = thread.locator('.timestamp, .time, .date');
      if (await timeElement.count() > 0) {
        client.lastActivity = await timeElement.first().innerText();
      }
      
      if (client.name) {
        // Determinar si está inactivo (sin mensajes no leídos y sin actividad reciente)
        if (!client.hasUnread && client.lastActivity) {
          inactiveClients.push(client);
          console.log(`😴 Cliente inactivo: ${client.name} - Última actividad: ${client.lastActivity}`);
        }
      }
    }
    
    return inactiveClients;
  } catch (error) {
    console.error('❌ Error buscando clientes inactivos:', error.message);
    return [];
  }
}

// Analizar notificaciones
async function analyzeNotifications() {
  console.log('🔔 Analizando notificaciones...');
  
  try {
    const notifications = [];
    const notificationItems = page.locator(S.notifications.notificationItem);
    const count = await notificationItems.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = notificationItems.nth(i);
      const notification = {};
      
      // Obtener texto de la notificación
      const textElement = item.locator(S.notifications.notificationText);
      if (await textElement.count() > 0) {
        notification.text = await textElement.first().innerText();
      }
      
      // Verificar si no está leída
      const unreadElement = item.locator(S.notifications.unreadNotifications);
      notification.unread = await unreadElement.count() > 0;
      
      if (notification.text) {
        notifications.push(notification);
        const status = notification.unread ? '🔔 No leída' : '✅ Leída';
        console.log(`${status}: ${notification.text.slice(0, 50)}...`);
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('❌ Error analizando notificaciones:', error.message);
    return [];
  }
}

// Función principal de análisis completo
async function performFullAnalysis() {
  console.log('🔍 Iniciando análisis completo de la web...\n');
  
  const analysis = {
    dashboard: null,
    visitors: [],
    favorites: [],
    calls: [],
    inactiveClients: [],
    notifications: []
  };
  
  try {
    // Analizar dashboard
    await gotoSection('dashboard');
    analysis.dashboard = await analyzeDashboard();
    
    // Analizar visitantes
    await gotoSection('visitors');
    analysis.visitors = await analyzeVisitors();
    
    // Analizar favoritos
    await gotoSection('favorites');
    analysis.favorites = await analyzeFavorites();
    
    // Analizar llamadas
    await gotoSection('calls');
    analysis.calls = await analyzeCallHistory();
    
    // Buscar clientes inactivos
    analysis.inactiveClients = await findInactiveClients();
    
    // Analizar notificaciones
    analysis.notifications = await analyzeNotifications();
    
    console.log('\n✅ Análisis completo finalizado');
    console.log(`📊 Resumen:`);
    console.log(`   👥 Visitantes: ${analysis.visitors.length}`);
    console.log(`   ❤️ Favoritos: ${analysis.favorites.length}`);
    console.log(`   📞 Llamadas: ${analysis.calls.length}`);
    console.log(`   😴 Clientes inactivos: ${analysis.inactiveClients.length}`);
    console.log(`   🔔 Notificaciones: ${analysis.notifications.length}`);
    
    return analysis;
  } catch (error) {
    console.error('❌ Error en análisis completo:', error.message);
    return analysis;
  }
}

(async () => {
 try {
   await login();
   scheduleReengage();
   await watchLoop();
 } catch (e) {
   console.error('Fatal:', e);
   process.exit(1);
 }
})();
