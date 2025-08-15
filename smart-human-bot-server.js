#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

// Validación de variables de entorno críticas
function validateEnvironment() {
  const requiredVars = ['NF_EMAIL', 'NF_PASS', 'OPENAI_API_KEY'];
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName] || process.env[varName] === 'tu_email_real@ejemplo.com') {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes o no configuradas:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('🔧 Por favor, configura estas variables en Render antes de continuar.');
    return false;
  }
  
  console.log('✅ Variables de entorno validadas correctamente');
  return true;
}

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

class SmartHumanBotServer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.conversationMemory = new Map();
    this.lastMessageCount = 0;
    this.isMonitoring = false;
    this.botName = 'Horny Madge';
    this.lastProactiveCheck = new Date();
    this.proactiveCheckInterval = 15 * 60 * 1000; // 15 minutos
    this.conversationTopics = [
      'daily_life', 'hobbies', 'work', 'relationships', 'dreams', 'travel', 'food', 'music', 'movies', 'fitness'
    ];
    this.restartCount = 0;
    this.maxRestarts = 10;
  }

  async init() {
    console.log('🤖 Iniciando Smart Human Bot Server...\n');
    
    try {
      // Configuración optimizada para servidores cloud
      this.browser = await chromium.launch({ 
        headless: true, // Sin interfaz gráfica para servidores
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      
      this.page = await context.newPage();
      this.page.setDefaultTimeout(60000);
      
      console.log('✅ Navegador iniciado correctamente (modo servidor)');
      return true;
      
    } catch (error) {
      console.error('❌ Error iniciando navegador:', error.message);
      return false;
    }
  }

  async login() {
    console.log('🔐 Iniciando proceso de login automático...');
    
    try {
      await this.page.goto(S.urls.login, { waitUntil: 'domcontentloaded' });
      await SLEEP(3000);
      
      console.log('📧 Buscando campo de email...');
      
      const emailField = this.page.locator('#outlined-basic-login');
      if (await emailField.count() > 0) {
        await emailField.click();
        await emailField.fill('');
        await emailField.type(process.env.NF_EMAIL, { delay: 100 });
        console.log('✅ Email ingresado correctamente');
      } else {
        console.log('❌ No se encontró campo de email');
        return false;
      }
      
      await SLEEP(1000);
      
      console.log('🔒 Buscando campo de contraseña...');
      
      const passwordField = this.page.locator('input[type="password"]');
      if (await passwordField.count() > 0) {
        await passwordField.first().click();
        await passwordField.first().fill('');
        await passwordField.first().type(process.env.NF_PASS, { delay: 100 });
        console.log('✅ Contraseña ingresada correctamente');
      } else {
        console.log('❌ No se encontró campo de contraseña');
        return false;
      }
      
      await SLEEP(1000);
      
      console.log('🚀 Buscando botón de login...');
      
      const loginButton = this.page.locator('button:has-text("Sign In")');
      if (await loginButton.count() > 0) {
        await loginButton.first().click();
        console.log('✅ Botón de login presionado');
      } else {
        console.log('❌ No se encontró botón de login');
        return false;
      }
      
      console.log('⏳ Verificando login...');
      await SLEEP(5000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/messages') || currentUrl.includes('/profile')) {
        console.log('✅ Login exitoso detectado por cambio de URL');
        this.isLoggedIn = true;
        return true;
      }
      
      console.log('⚠️ Login probablemente exitoso, continuando...');
      this.isLoggedIn = true;
      return true;
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return false;
    }
  }

  async navigateToChat() {
    console.log('💬 Navegando al apartado de CHAT...');
    
    try {
      await this.page.goto('https://www.niteflirt.com/chat', { waitUntil: 'networkidle' });
      await SLEEP(5000);
      
      console.log('✅ Navegación al chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando al chat:', error.message);
      return false;
    }
  }

  async analyzeClientList() {
    console.log('📊 Analizando lista de clientes para contacto proactivo...');
    
    try {
      await SLEEP(3000);
      
      const userSelectors = [
        '.MuiListItem-root',
        '.MuiListItemButton-root',
        'li[role="button"]',
        '.user-item',
        '.client-item',
        '.chat-user',
        '.user-list-item',
        '[data-testid="user-item"]',
        '.MuiListItemText-root',
        'div[role="button"]'
      ];
      
      let users = null;
      for (const selector of userSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          users = elements;
          console.log(`✅ Usuarios encontrados con selector: ${selector}`);
          break;
        }
      }
      
      if (!users) {
        console.log('❌ No se encontraron usuarios');
        return [];
      }
      
      const count = await users.count();
      console.log(`👥 Encontrados ${count} usuarios en la lista`);
      
      const clientAnalysis = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const user = users.nth(i);
          const userText = await user.innerText().catch(() => '');
          
          const analysis = this.parseUserInfo(userText, i);
          clientAnalysis.push(analysis);
          
          console.log(`📋 Usuario ${i + 1}: ${analysis.name} - ${analysis.status} - ${analysis.lastActivity}`);
          
        } catch (error) {
          console.log(`⚠️ Error analizando usuario ${i + 1}:`, error.message);
        }
      }
      
      return clientAnalysis;
      
    } catch (error) {
      console.error('❌ Error analizando lista de clientes:', error.message);
      return [];
    }
  }

  parseUserInfo(userText, index) {
    const lines = userText.split('\n').filter(line => line.trim());
    
    let name = `Usuario ${index + 1}`;
    let status = 'Desconocido';
    let lastActivity = 'Desconocido';
    let isActive = false;
    let isMissy = false;
    
    if (lines.length > 0) {
      name = lines[0].trim();
      
      // Evitar missy
      if (name.toLowerCase().includes('missy')) {
        isMissy = true;
      }
      
      // Buscar indicadores de actividad reciente
      const activePatterns = [
        /online/i,
        /conectado/i,
        /activo/i,
        /hace\s*(\d+)\s*minutos?/i,
        /(\d+)\s*min\s*ago/i,
        /hace\s*(\d+)\s*horas?/i,
        /(\d+)\s*hours?\s*ago/i
      ];
      
      for (const pattern of activePatterns) {
        const match = userText.match(pattern);
        if (match) {
          isActive = true;
          lastActivity = match[0];
          break;
        }
      }
      
      // Buscar indicadores de estado
      if (userText.toLowerCase().includes('online') || userText.toLowerCase().includes('conectado')) {
        status = 'Online';
        isActive = true;
      } else if (userText.toLowerCase().includes('offline') || userText.toLowerCase().includes('desconectado')) {
        status = 'Offline';
      } else if (isActive) {
        status = 'Activo';
      }
    }
    
    return {
      name,
      status,
      lastActivity,
      isActive,
      isMissy,
      index,
      userText
    };
  }

  async findAndSelectUser(targetUsername = null) {
    console.log(`🔍 Buscando usuario${targetUsername ? ` ${targetUsername}` : ' en la lista'}...`);
    
    try {
      await SLEEP(3000);
      
      const userSelectors = [
        '.MuiListItem-root',
        '.MuiListItemButton-root',
        'li[role="button"]',
        '.user-item',
        '.client-item',
        '.chat-user',
        '.user-list-item',
        '[data-testid="user-item"]',
        '.MuiListItemText-root',
        'div[role="button"]'
      ];
      
      let users = null;
      for (const selector of userSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          users = elements;
          console.log(`✅ Usuarios encontrados con selector: ${selector}`);
          break;
        }
      }
      
      if (!users) {
        console.log('❌ No se encontraron usuarios');
        return false;
      }
      
      const count = await users.count();
      console.log(`👥 Encontrados ${count} usuarios en la lista`);
      
      let selectedUser = null;
      
      if (targetUsername) {
        for (let i = 0; i < count; i++) {
          const user = users.nth(i);
          const userText = await user.innerText().catch(() => '');
          
          if (userText.toLowerCase().includes(targetUsername.toLowerCase())) {
            console.log(`✅ Encontrado usuario ${targetUsername} en posición ${i + 1}`);
            selectedUser = user;
            break;
          }
        }
      }
      
      if (!selectedUser) {
        selectedUser = users.nth(0);
        const firstUserText = await selectedUser.innerText().catch(() => '');
        console.log(`👤 Seleccionando primer usuario disponible: ${firstUserText.slice(0, 50)}...`);
      }
      
      console.log('🖱️ Intentando seleccionar usuario...');
      
      try {
        await selectedUser.click({ timeout: 10000 });
        console.log('✅ Usuario seleccionado con clic directo');
      } catch (e) {
        console.log('⚠️ Clic directo falló, intentando otras estrategias...');
        
        try {
          await selectedUser.click({ force: true, timeout: 10000 });
          console.log('✅ Usuario seleccionado con clic forzado');
        } catch (e2) {
          console.log('⚠️ Clic forzado falló, intentando con JavaScript...');
          
          try {
            await this.page.evaluate((element) => {
              element.click();
            }, await selectedUser.elementHandle());
            console.log('✅ Usuario seleccionado con JavaScript');
          } catch (e3) {
            console.log('⚠️ Todas las estrategias de clic fallaron');
            return false;
          }
        }
      }
      
      await SLEEP(3000);
      
      console.log('✅ Usuario seleccionado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error seleccionando usuario:', error.message);
      return false;
    }
  }

  async waitForChatToOpen() {
    console.log('⏳ Esperando que se abra el chat...');
    
    try {
      await SLEEP(3000);
      
      const chatOpenSelectors = [
        '.chat-messages',
        '.message-container',
        '.conversation-area',
        '.chat-area',
        '.messages-container',
        '[data-testid="chat-messages"]',
        '.chat-input',
        '.message-input'
      ];
      
      let chatOpened = false;
      for (const selector of chatOpenSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          console.log(`✅ Chat abierto detectado con selector: ${selector}`);
          chatOpened = true;
          break;
        }
      }
      
      if (!chatOpened) {
        console.log('⚠️ No se detectó apertura del chat, continuando...');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error esperando chat:', error.message);
      return false;
    }
  }

  async readChatHistory() {
    console.log('📖 Leyendo historial del chat...');
    
    try {
      await SLEEP(2000);
      
      const messageSelectors = [
        '.message',
        '.chat-message',
        '.conversation-message',
        '.inbound-message',
        '.received-message',
        '[data-testid="message"]',
        '.message-content',
        '.message-text',
        '.msg-content',
        '.chat-bubble',
        '.message-bubble'
      ];
      
      let messages = null;
      for (const selector of messageSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          messages = elements;
          console.log(`✅ Mensajes encontrados con selector: ${selector}`);
          break;
        }
      }
      
      let chatHistory = [];
      if (messages) {
        const count = await messages.count();
        console.log(`📝 Encontrados ${count} mensajes en el historial`);
        
        const lastMessages = Math.min(15, count);
        for (let i = count - lastMessages; i < count; i++) {
          const message = messages.nth(i);
          const messageText = await message.innerText().catch(() => '');
          chatHistory.push(messageText);
        }
        
        console.log(`📝 Últimos mensajes leídos: ${chatHistory.length} mensajes`);
      } else {
        console.log('📝 No hay mensajes previos en el chat');
      }
      
      return chatHistory;
      
    } catch (error) {
      console.error('❌ Error leyendo historial:', error.message);
      return [];
    }
  }

  async detectLanguage(text) {
    const spanishWords = ['hola', 'como', 'estas', 'que', 'tal', 'bien', 'gracias', 'por', 'favor', 'amor', 'cariño', 'hermosa', 'guapo'];
    const englishWords = ['hello', 'hi', 'how', 'are', 'you', 'what', 'good', 'thanks', 'please', 'love', 'baby', 'beautiful', 'handsome'];
    
    const lowerText = text.toLowerCase();
    let spanishCount = 0;
    let englishCount = 0;
    
    spanishWords.forEach(word => {
      if (lowerText.includes(word)) spanishCount++;
    });
    
    englishWords.forEach(word => {
      if (lowerText.includes(word)) englishCount++;
    });
    
    return spanishCount > englishCount ? 'spanish' : 'english';
  }

  async analyzeClientMood(chatHistory) {
    const moodKeywords = {
      happy: ['feliz', 'contento', 'alegre', 'happy', 'excited', 'great', 'wonderful', 'amazing'],
      sad: ['triste', 'deprimido', 'sad', 'depressed', 'lonely', 'miss', 'extraño'],
      angry: ['enojado', 'molesto', 'angry', 'mad', 'frustrated', 'upset'],
      romantic: ['amor', 'cariño', 'romántico', 'love', 'romantic', 'sweet', 'beautiful'],
      stressed: ['estresado', 'preocupado', 'stressed', 'worried', 'busy', 'tired'],
      playful: ['divertido', 'juguetón', 'fun', 'playful', 'joke', 'laugh']
    };
    
    const allText = chatHistory.join(' ').toLowerCase();
    let detectedMood = 'neutral';
    let maxScore = 0;
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (allText.includes(keyword)) score++;
      });
      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood;
      }
    }
    
    return detectedMood;
  }

  async generateHumanResponse(clientName, chatHistory, language, context = 'proactive') {
    console.log('🧠 Generando respuesta humana y natural como Horny Madge...');
    
    try {
      const mood = await this.analyzeClientMood(chatHistory);
      const topic = this.conversationTopics[Math.floor(Math.random() * this.conversationTopics.length)];
      
      let responses = [];
      
      if (context === 'proactive') {
        // Mensajes proactivos para iniciar conversación - estilo Horny Madge
        if (language === 'spanish') {
          responses = [
            `Hola ${clientName}, soy Horny Madge. ¿Cómo va tu día? Me encantaría saber más sobre ti y lo que te gusta hacer. ¿Qué te apasiona?`,
            `Hey ${clientName}, soy Madge. ¿Qué tal estás hoy? Me gustaría conocer más sobre tu vida y tus intereses. ¿Qué te hace sentir vivo?`,
            `Hola ${clientName}, soy Horny Madge. ¿Qué has estado haciendo últimamente? Me interesa mucho saber sobre tus experiencias y sueños. ¿Qué te gustaría compartir conmigo?`,
            `Hey ${clientName}, soy Madge. ¿Cómo va todo por tu lado? Me gustaría que me cuentes algo interesante sobre ti. ¿Qué te motiva cada día?`,
            `Hola ${clientName}, soy Horny Madge. ¿Qué tal tu día? Me encantaría que me cuentes algo que te haya pasado recientemente. ¿Qué te hace sonreír?`,
            `Hey ${clientName}, soy Madge. ¿Qué te gusta hacer en tu tiempo libre? Me interesa mucho conocer tus hobbies y pasiones. ¿Qué te relaja?`,
            `Hola ${clientName}, soy Horny Madge. ¿Tienes algún hobby o pasión que te apasione? Me encantaría conocer más sobre lo que te hace feliz. ¿Qué te gustaría explorar?`,
            `Hey ${clientName}, soy Madge. ¿Qué te hace sentir especial? Me gustaría saber qué te ilumina el día y qué te gustaría experimentar. ¿Qué te gustaría que hablemos?`
          ];
        } else {
          responses = [
            `Hey ${clientName}, I'm Horny Madge. How's your day going? I'd love to know more about you and what you enjoy doing. What are you passionate about?`,
            `Hi ${clientName}, I'm Madge. How are you feeling today? I'd like to learn more about your life and interests. What makes you feel alive?`,
            `Hey ${clientName}, I'm Horny Madge. What have you been up to lately? I'm really interested in hearing about your experiences and dreams. What would you like to share with me?`,
            `Hi ${clientName}, I'm Madge. How's everything on your side? I'd like you to tell me something interesting about yourself. What motivates you each day?`,
            `Hey ${clientName}, I'm Horny Madge. How's your day? I'd love for you to tell me something that happened to you recently. What makes you smile?`,
            `Hi ${clientName}, I'm Madge. What do you like to do in your free time? I'm really interested in learning about your hobbies and passions. What relaxes you?`,
            `Hey ${clientName}, I'm Horny Madge. Do you have any hobbies or passions that excite you? I'd love to know more about what makes you happy. What would you like to explore?`,
            `Hi ${clientName}, I'm Madge. What makes you feel special? I'd like to know what brightens your day and what you'd like to experience. What would you like us to talk about?`
          ];
        }
      } else if (context === 'conversation') {
        // Respuestas para mantener conversación - estilo Horny Madge
        if (mood === 'romantic') {
          if (language === 'spanish') {
            responses = [
              `Mmm ${clientName}, me encanta cuando hablas así. ¿Qué más tienes en mente? Me gustaría que me cuentes más sobre lo que te gusta.`,
              `Ay ${clientName}, me haces sentir especial. ¿Qué te gustaría que hiciéramos juntos? Me encantaría conocer más sobre tus fantasías.`,
              `Oh ${clientName}, eres tan dulce. ¿Me cuentas más sobre ti? Me gustaría saber qué te excita y qué te gustaría experimentar.`,
              `Mmm ${clientName}, me encantas. ¿Qué te gusta hacer cuando estás solo? Me gustaría que me cuentes más sobre tus deseos más íntimos.`
            ];
          } else {
            responses = [
              `Mmm ${clientName}, I love when you talk like that. What else do you have in mind? I'd like you to tell me more about what you enjoy.`,
              `Oh ${clientName}, you make me feel special. What would you like us to do together? I'd love to know more about your fantasies.`,
              `Oh ${clientName}, you're so sweet. Tell me more about yourself? I'd like to know what excites you and what you'd like to experience.`,
              `Mmm ${clientName}, I adore you. What do you like to do when you're alone? I'd like you to tell me more about your deepest desires.`
            ];
          }
        } else if (mood === 'sad') {
          if (language === 'spanish') {
            responses = [
              `Ay ${clientName}, no me gusta verte triste. ¿Qué puedo hacer para animarte? Me gustaría que me cuentes qué te está pasando.`,
              `Oh ${clientName}, me duele verte así. ¿Quieres que te cuente algo que me hace feliz? Me gustaría ayudarte a sentirte mejor.`,
              `Cariño ${clientName}, estoy aquí para ti. ¿Qué te gustaría que hiciéramos juntos? Me encantaría que me cuentes más sobre lo que te preocupa.`,
              `Mi amor ${clientName}, no estás solo. ¿Quieres que te abrace virtualmente? Me gustaría que me cuentes qué necesitas en este momento.`
            ];
          } else {
            responses = [
              `Oh ${clientName}, I don't like seeing you sad. What can I do to cheer you up? I'd like you to tell me what's going on.`,
              `Oh ${clientName}, it hurts to see you like this. Want me to tell you something that makes me happy? I'd like to help you feel better.`,
              `Baby ${clientName}, I'm here for you. What would you like us to do together? I'd love for you to tell me more about what's worrying you.`,
              `My love ${clientName}, you're not alone. Want me to give you a virtual hug? I'd like you to tell me what you need right now.`
            ];
          }
        } else {
          // Respuestas generales para mantener conversación - estilo Horny Madge
          if (language === 'spanish') {
            responses = [
              `Mmm ${clientName}, eso suena muy interesante. ¿Cuéntame más? Me gustaría saber todos los detalles.`,
              `Oh ${clientName}, me encanta cuando me cuentas cosas. ¿Qué más tienes que decirme? Me gustaría que me cuentes más sobre ti.`,
              `Ay ${clientName}, eres tan fascinante. ¿Qué más me puedes contar? Me gustaría conocer más sobre tus experiencias.`,
              `Mmm ${clientName}, me gusta mucho hablar contigo. ¿Qué te gustaría saber de mí? Me encantaría que me preguntes algo personal.`,
              `Oh ${clientName}, cada vez que hablas me encantas más. ¿Qué más tienes en mente? Me gustaría que me cuentes más sobre tus pensamientos.`,
              `Ay ${clientName}, me haces sentir especial. ¿Qué te gustaría que hiciéramos? Me encantaría que me cuentes más sobre tus deseos.`
            ];
          } else {
            responses = [
              `Mmm ${clientName}, that sounds very interesting. Tell me more? I'd like to know all the details.`,
              `Oh ${clientName}, I love when you tell me things. What else do you have to tell me? I'd like you to tell me more about yourself.`,
              `Oh ${clientName}, you're so fascinating. What else can you tell me? I'd like to know more about your experiences.`,
              `Mmm ${clientName}, I really like talking to you. What would you like to know about me? I'd love for you to ask me something personal.`,
              `Oh ${clientName}, every time you talk I like you more. What else do you have in mind? I'd like you to tell me more about your thoughts.`,
              `Oh ${clientName}, you make me feel special. What would you like us to do? I'd love for you to tell me more about your desires.`
            ];
          }
        }
      }
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      console.log(`💬 Respuesta generada (${language}, ${mood}): "${randomResponse}"`);
      return randomResponse;
      
    } catch (error) {
      console.error('❌ Error generando respuesta:', error.message);
      return `Hey ${clientName}! 😊 How are you?`;
    }
  }

  async findChatInput() {
    console.log('🔍 Buscando área de entrada del chat...');
    
    try {
      await SLEEP(2000);
      
      const inputSelectors = [
        '.chat-input',
        '.message-input',
        '.conversation-input',
        'textarea[placeholder*="message"]',
        'input[placeholder*="message"]',
        '[contenteditable="true"]',
        '.MuiInputBase-input',
        'textarea',
        'input[type="text"]',
        '.msg-input',
        '.composer-input'
      ];
      
      let input = null;
      for (const selector of inputSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          input = elements.first();
          console.log(`✅ Campo de entrada encontrado con selector: ${selector}`);
          break;
        }
      }
      
      if (!input) {
        console.log('❌ No se encontró campo de entrada del chat');
        return null;
      }
      
      return input;
      
    } catch (error) {
      console.error('❌ Error buscando campo de entrada:', error.message);
      return null;
    }
  }

  async sendMessage(message) {
    console.log('📤 Enviando mensaje...');
    
    try {
      const input = await this.findChatInput();
      
      if (!input) {
        console.log('❌ No se pudo encontrar el campo de entrada del chat');
        return false;
      }
      
      await input.click();
      await SLEEP(500);
      
      console.log('✍️ Escribiendo mensaje...');
      await input.fill('');
      for (const ch of message) {
        await input.type(ch, { delay: jitter(30, 80) });
      }
      
      await SLEEP(jitter(500, 1000));
      
      const sendButtonSelectors = [
        'button:has-text("Send")',
        'button:has-text("Enviar")',
        '.send-button',
        'button[type="submit"]',
        '[data-testid="send-button"]',
        '.chat-send-button',
        '.msg-send-button'
      ];
      
      let sent = false;
      for (const selector of sendButtonSelectors) {
        const button = this.page.locator(selector);
        if (await button.count() > 0) {
          await button.first().click();
          sent = true;
          break;
        }
      }
      
      if (!sent) {
        await input.press('Enter');
      }
      
      console.log('✅ Mensaje enviado exitosamente!');
      await SLEEP(2000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
      return false;
    }
  }

  async checkForNewMessages() {
    console.log('🔍 Verificando nuevos mensajes...');
    
    try {
      await SLEEP(2000);
      
      const messageSelectors = [
        '.message',
        '.chat-message',
        '.conversation-message',
        '.inbound-message',
        '.received-message',
        '[data-testid="message"]',
        '.message-content',
        '.message-text',
        '.msg-content',
        '.chat-bubble',
        '.message-bubble'
      ];
      
      let messages = null;
      for (const selector of messageSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          messages = elements;
          break;
        }
      }
      
      if (!messages) {
        return false;
      }
      
      const currentCount = await messages.count();
      
      if (currentCount > this.lastMessageCount) {
        console.log(`📨 Nuevo mensaje detectado! (${this.lastMessageCount} -> ${currentCount})`);
        this.lastMessageCount = currentCount;
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error verificando mensajes:', error.message);
      return false;
    }
  }

  async contactActiveClients() {
    console.log('🎯 Iniciando contacto proactivo con clientes activos...');
    
    try {
      const clientAnalysis = await this.analyzeClientList();
      
      // Filtrar clientes activos (no missy)
      const activeClients = clientAnalysis.filter(client => 
        client.isActive && !client.isMissy && client.name !== 'missy12'
      );
      
      console.log(`📊 Encontrados ${activeClients.length} clientes activos (excluyendo missy)`);
      
      if (activeClients.length === 0) {
        console.log('✅ No hay clientes activos para contactar');
        return true;
      }
      
      // Contactar al primer cliente activo
      const clientToContact = activeClients[0];
      console.log(`\n🎯 Contactando a ${clientToContact.name} (${clientToContact.status})...`);
      
      // Seleccionar usuario
      if (!await this.findAndSelectUser(clientToContact.name)) {
        console.log(`⚠️ No se pudo seleccionar ${clientToContact.name}, continuando...`);
        return false;
      }
      
      // Esperar a que se abra el chat
      if (!await this.waitForChatToOpen()) {
        console.log(`⚠️ No se pudo abrir chat de ${clientToContact.name}, continuando...`);
        return false;
      }
      
      // Leer historial del chat
      const chatHistory = await this.readChatHistory();
      
      // Detectar idioma
      const language = await this.detectLanguage(chatHistory.join(' '));
      console.log(`🌍 Idioma detectado: ${language}`);
      
      // Generar mensaje proactivo
      const proactiveMessage = await this.generateHumanResponse(
        clientToContact.name, 
        chatHistory, 
        language, 
        'proactive'
      );
      
      // Enviar mensaje
      if (await this.sendMessage(proactiveMessage)) {
        console.log(`🎉 Mensaje proactivo enviado exitosamente a ${clientToContact.name}!`);
        
        // Guardar en memoria de conversación
        this.conversationMemory.set(clientToContact.name, {
          lastMessage: proactiveMessage,
          lastActivity: new Date(),
          chatHistory: chatHistory
        });
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error.message);
      return false;
    }
  }

  async startServerMonitoring() {
    console.log('🎯 Iniciando monitoreo del servidor 24/7...\n');
    
    while (this.restartCount < this.maxRestarts) {
      try {
        console.log(`🔄 Intento ${this.restartCount + 1}/${this.maxRestarts}`);
        
        if (!await this.init()) {
          throw new Error('Error inicializando navegador');
        }
        
        if (!await this.login()) {
          throw new Error('Error en login');
        }
        
        if (!await this.navigateToChat()) {
          throw new Error('Error navegando al chat');
        }
        
        if (!await this.findAndSelectUser()) {
          throw new Error('Error seleccionando usuario');
        }
        
        if (!await this.waitForChatToOpen()) {
          throw new Error('Error abriendo chat');
        }
        
        const initialHistory = await this.readChatHistory();
        this.lastMessageCount = initialHistory.length;
        
        console.log(`📊 Monitoreo del servidor iniciado. Mensajes iniciales: ${this.lastMessageCount}`);
        console.log('🔄 Bot funcionando 24/7 en modo servidor...');
        console.log('💡 El bot se reiniciará automáticamente si hay errores\n');
        
        this.isMonitoring = true;
        
        while (this.isMonitoring) {
          try {
            const hasNewMessage = await this.checkForNewMessages();
            
            if (hasNewMessage) {
              console.log('🎉 ¡Nuevo mensaje detectado! Respondiendo de forma humana...');
              
              const currentHistory = await this.readChatHistory();
              const clientName = 'Cliente';
              const language = await this.detectLanguage(currentHistory.join(' '));
              console.log(`🌍 Idioma detectado: ${language}`);
              
              const response = await this.generateHumanResponse(
                clientName,
                currentHistory,
                language,
                'conversation'
              );
              
              if (await this.sendMessage(response)) {
                console.log('✅ Respuesta humana enviada exitosamente!');
                
                this.conversationMemory.set(clientName, {
                  lastMessage: response,
                  lastActivity: new Date(),
                  chatHistory: currentHistory
                });
              }
            }
            
            // Verificar si es momento de contactar clientes activos (cada 15 minutos)
            const now = new Date();
            if (now - this.lastProactiveCheck > this.proactiveCheckInterval) {
              console.log('⏰ Verificando clientes activos para contacto proactivo...');
              await this.contactActiveClients();
              this.lastProactiveCheck = now;
            }
            
            await SLEEP(5000);
            
          } catch (error) {
            console.error('❌ Error en el bucle de monitoreo:', error.message);
            await SLEEP(10000);
          }
        }
        
        return true;
        
      } catch (error) {
        console.error(`❌ Error en el servidor (intento ${this.restartCount + 1}):`, error.message);
        this.restartCount++;
        
        if (this.browser) {
          try {
            await this.browser.close();
          } catch (e) {
            console.log('⚠️ Error cerrando navegador:', e.message);
          }
        }
        
        if (this.restartCount >= this.maxRestarts) {
          console.error('❌ Máximo número de reintentos alcanzado. Deteniendo servidor.');
          return false;
        }
        
        console.log(`⏳ Esperando 30 segundos antes del reintento ${this.restartCount + 1}...`);
        await SLEEP(30000);
      }
    }
    
    return false;
  }

  async stopMonitoring() {
    console.log('⏹️ Deteniendo monitoreo...');
    this.isMonitoring = false;
  }

  async close() {
    await this.stopMonitoring();
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }
}

// Función principal
async function main() {
  console.log('🔍 Validando configuración del entorno...');
  
  // Validar variables de entorno antes de iniciar
  if (!validateEnvironment()) {
    console.error('❌ Configuración inválida. Deteniendo bot.');
    process.exit(1);
  }
  
  const bot = new SmartHumanBotServer();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, deteniendo servidor...');
    await bot.stopMonitoring();
    await bot.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Señal de terminación detectada, deteniendo servidor...');
    await bot.stopMonitoring();
    await bot.close();
    process.exit(0);
  });
  
  try {
    console.log('🎯 Iniciando bot servidor 24/7...');
    await bot.startServerMonitoring();
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { SmartHumanBotServer };
