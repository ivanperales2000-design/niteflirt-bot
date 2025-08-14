#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class UltimateNiteflirtBotEnhanced {
  constructor() {
    this.browser = null;
    this.page = null;
    this.clientMemory = new Map();
    this.memoryFile = 'client_memory.json';
    this.isMonitoring = false;
    this.lastCheck = new Date();
    this.checkInterval = 10 * 60 * 60 * 1000;
    this.restartAttempts = 0;
    this.maxRestartAttempts = 5;
  }

  async init() {
    console.log('🧠 Iniciando BOT ÚLTIMO MEJORADO de Niteflirt...\n');
    
    try {
      this.browser = await chromium.launch({ 
        headless: false, // Cambiado a false para ver qué está pasando
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      this.page = await context.newPage();
      this.page.setDefaultTimeout(60000);
      
      console.log('✅ Navegador iniciado correctamente');
      
      await this.loadClientMemory();
      
      return true;
      
    } catch (error) {
      console.error('❌ Error iniciando navegador:', error.message);
      return false;
    }
  }

  async loadClientMemory() {
    try {
      const data = await fs.readFile(this.memoryFile, 'utf8');
      const memory = JSON.parse(data);
      this.clientMemory = new Map(Object.entries(memory));
      console.log(`📚 Memoria cargada: ${this.clientMemory.size} clientes`);
    } catch (error) {
      console.log('📚 No se encontró memoria previa, iniciando nueva');
      this.clientMemory = new Map();
    }
  }

  async saveClientMemory() {
    try {
      const memory = Object.fromEntries(this.clientMemory);
      await fs.writeFile(this.memoryFile, JSON.stringify(memory, null, 2));
      console.log('💾 Memoria guardada');
    } catch (error) {
      console.error('❌ Error guardando memoria:', error.message);
    }
  }

  async login() {
    console.log('🔐 Iniciando proceso de login...');
    
    try {
      await this.page.goto('https://www.niteflirt.com/login', { waitUntil: 'domcontentloaded' });
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
      
      console.log('🔘 Buscando botón de login...');
      
      const loginButton = this.page.locator('button:has-text("Sign In")');
      if (await loginButton.count() > 0) {
        await loginButton.click();
        console.log('✅ Botón de login clickeado');
      } else {
        console.log('❌ No se encontró botón de login');
        return false;
      }
      
      await SLEEP(5000);
      
      const currentUrl = this.page.url();
      console.log(`🌐 URL actual: ${currentUrl}`);
      
      if (currentUrl.includes('niteflirt.com') && !currentUrl.includes('login')) {
        console.log('✅ Login exitoso detectado por URL');
        return true;
      }
      
      console.log('⚠️ Login probablemente exitoso, continuando...');
      return true;
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return false;
    }
  }

  async navigateToChat() {
    console.log('💬 Navegando al apartado de CHAT...');
    
    try {
      await this.page.goto('https://www.niteflirt.com/chat', { waitUntil: 'domcontentloaded' });
      await SLEEP(5000);
      
      console.log('✅ Navegación al chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando a chat:', error.message);
      return false;
    }
  }

  async analyzeAllChatsEnhanced() {
    console.log('🔍 Analizando todos los chats con detección mejorada...');
    
    try {
      await SLEEP(3000);
      
      // Primero, buscar específicamente misskathystanford
      console.log('🎯 Buscando específicamente misskathystanford...');
      
      const missKathystanfordFound = await this.findAndAnalyzeSpecificUser('misskathystanford');
      
      if (missKathystanfordFound) {
        console.log('✅ misskathystanford analizada y respondida');
      } else {
        console.log('⚠️ misskathystanford no encontrada o sin mensajes pendientes');
      }
      
      // Luego analizar todos los demás chats
      console.log('🔍 Analizando resto de chats...');
      
      const chatSelectors = [
        'div[role="button"]',
        '.MuiListItemButton-root',
        '.thread-item',
        '.chat-item',
        '.conversation-item',
        '.user-item',
        '[data-testid="thread-item"]',
        '.MuiListItem-root'
      ];
      
      let allChats = [];
      
      for (const selector of chatSelectors) {
        const chats = this.page.locator(selector);
        const chatCount = await chats.count();
        
        if (chatCount > 0) {
          console.log(`📊 Encontrados ${chatCount} chats con selector: ${selector}`);
          
          for (let i = 0; i < chatCount; i++) {
            const chat = chats.nth(i);
            const chatText = await chat.innerText().catch(() => '');
            
            if (chatText && chatText.trim().length > 0 && 
                !chatText.includes('Find Women') && 
                !chatText.includes('Find Men') &&
                !chatText.includes('Find Transgender') &&
                !chatText.includes('More Options') &&
                !chatText.toLowerCase().includes('misskathystanford')) { // Excluir misskathystanford ya analizada
              
              allChats.push({
                element: chat,
                text: chatText,
                selector: selector,
                index: i
              });
            }
          }
          break;
        }
      }
      
      console.log(`📋 Total de chats adicionales encontrados: ${allChats.length}`);
      
      // Analizar cada chat
      for (const chat of allChats) {
        await this.analyzeChatEnhanced(chat);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error analizando chats:', error.message);
      return false;
    }
  }

  async findAndAnalyzeSpecificUser(userName) {
    try {
      console.log(`🎯 Buscando usuario específico: ${userName}`);
      
      // Buscar usando múltiples estrategias
      const searchStrategies = [
        `*:has-text("${userName}")`,
        `*:has-text("${userName.toLowerCase()}")`,
        `*:has-text("${userName.toUpperCase()}")`,
        `[data-testid*="${userName}"]`,
        `.user-item:has-text("${userName}")`,
        `.thread-item:has-text("${userName}")`
      ];
      
      let userElement = null;
      
      for (const strategy of searchStrategies) {
        const elements = this.page.locator(strategy);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ Usuario ${userName} encontrado con estrategia: ${strategy}`);
          userElement = elements.first();
          break;
        }
      }
      
      if (!userElement) {
        console.log(`❌ Usuario ${userName} no encontrado`);
        return false;
      }
      
      // Verificar si tiene mensajes sin responder
      const hasUnread = await this.checkForUnreadMessagesEnhanced(userElement, userName);
      
      if (hasUnread) {
        console.log(`📨 ¡Mensaje sin responder detectado en ${userName}!`);
        
        // Abrir el chat
        await userElement.click();
        await SLEEP(3000);
        
        // Leer historial completo
        const chatHistory = await this.readFullChatHistory();
        
        // Obtener memoria del cliente
        const clientMemory = this.clientMemory.get(userName) || {
          name: userName,
          language: 'english',
          mood: 'neutral',
          interests: [],
          conversationStyle: 'friendly',
          lastInteraction: null,
          chatHistory: [],
          context: {},
          responseCount: 0
        };
        
        // Actualizar memoria con nuevo historial
        clientMemory.chatHistory = chatHistory;
        clientMemory.lastInteraction = new Date().toISOString();
        
        // Analizar el último mensaje
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (lastMessage && !lastMessage.startsWith('You:')) {
          console.log(`📨 Último mensaje de ${userName}: "${lastMessage}"`);
          
          // Detectar idioma
          clientMemory.language = await this.detectLanguage(lastMessage);
          
          // Analizar estado de ánimo
          clientMemory.mood = await this.analyzeMood(chatHistory);
          
          // Generar respuesta contextual
          const response = await this.generateContextualResponse(clientMemory, lastMessage);
          
          console.log(`💬 Respuesta generada para ${userName}: "${response}"`);
          
          // Enviar respuesta
          if (await this.sendMessage(response)) {
            console.log(`✅ Respuesta enviada exitosamente a ${userName}`);
            
            // Actualizar memoria
            clientMemory.chatHistory.push(`You: ${response}`);
            clientMemory.responseCount++;
            this.clientMemory.set(userName, clientMemory);
            
            // Guardar memoria
            await this.saveClientMemory();
          }
        }
        
        // Volver a la lista de chats
        await this.navigateToChat();
        await SLEEP(2000);
        
        return true;
      } else {
        console.log(`✅ ${userName}: Sin mensajes pendientes`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error analizando usuario específico ${userName}:`, error.message);
      return false;
    }
  }

  async analyzeChatEnhanced(chat) {
    try {
      console.log(`\n👤 Analizando chat: ${chat.text.substring(0, 50)}...`);
      
      // Extraer nombre del usuario
      const userName = this.extractUserName(chat.text);
      
      // Verificar si tiene mensajes no leídos o sin responder
      const hasUnread = await this.checkForUnreadMessagesEnhanced(chat.element, userName);
      
      if (hasUnread) {
        console.log(`📨 ¡Mensaje sin responder detectado en ${userName}!`);
        
        // Abrir el chat
        await chat.element.click();
        await SLEEP(3000);
        
        // Leer historial completo
        const chatHistory = await this.readFullChatHistory();
        
        // Obtener memoria del cliente
        const clientMemory = this.clientMemory.get(userName) || {
          name: userName,
          language: 'english',
          mood: 'neutral',
          interests: [],
          conversationStyle: 'friendly',
          lastInteraction: null,
          chatHistory: [],
          context: {},
          responseCount: 0
        };
        
        // Actualizar memoria con nuevo historial
        clientMemory.chatHistory = chatHistory;
        clientMemory.lastInteraction = new Date().toISOString();
        
        // Analizar el último mensaje
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (lastMessage && !lastMessage.startsWith('You:')) {
          console.log(`📨 Último mensaje: "${lastMessage}"`);
          
          // Detectar idioma
          clientMemory.language = await this.detectLanguage(lastMessage);
          
          // Analizar estado de ánimo
          clientMemory.mood = await this.analyzeMood(chatHistory);
          
          // Generar respuesta contextual
          const response = await this.generateContextualResponse(clientMemory, lastMessage);
          
          console.log(`💬 Respuesta generada: "${response}"`);
          
          // Enviar respuesta
          if (await this.sendMessage(response)) {
            console.log('✅ Respuesta enviada exitosamente');
            
            // Actualizar memoria
            clientMemory.chatHistory.push(`You: ${response}`);
            clientMemory.responseCount++;
            this.clientMemory.set(userName, clientMemory);
            
            // Guardar memoria
            await this.saveClientMemory();
          }
        }
        
        // Volver a la lista de chats
        await this.navigateToChat();
        await SLEEP(2000);
      } else {
        console.log(`✅ ${userName}: Sin mensajes pendientes`);
      }
      
    } catch (error) {
      console.error(`❌ Error analizando chat de ${chat.text}:`, error.message);
    }
  }

  async checkForUnreadMessagesEnhanced(chatElement, userName) {
    try {
      console.log(`🔍 Verificando mensajes sin responder para ${userName}...`);
      
      // 1. Verificar badges de mensajes no leídos
      const unreadSelectors = [
        '.unread-badge',
        '.unread-indicator',
        '.message-count',
        '[data-testid="unread-badge"]',
        '.MuiBadge-badge',
        '.badge',
        '.notification-badge',
        '.unread-count'
      ];
      
      for (const selector of unreadSelectors) {
        const badges = chatElement.locator(selector);
        if (await badges.count() > 0) {
          const badgeText = await badges.first().innerText().catch(() => '');
          console.log(`✅ Badge encontrado: ${badgeText}`);
          return true;
        }
      }
      
      // 2. Verificar el texto del chat para indicadores de mensajes sin responder
      const chatText = await chatElement.innerText().catch(() => '');
      console.log(`📝 Texto del chat de ${userName}: "${chatText}"`);
      
      // Buscar indicadores de mensajes sin responder
      const unreadIndicators = [
        'unread',
        'new',
        'unresponded',
        'pending',
        'missed',
        'leído pero sin responder',
        'read but not responded'
      ];
      
      for (const indicator of unreadIndicators) {
        if (chatText.toLowerCase().includes(indicator)) {
          console.log(`✅ Indicador encontrado: ${indicator}`);
          return true;
        }
      }
      
      // 3. Verificar si el último mensaje no es del bot
      if (chatText && !chatText.includes('You:') && !chatText.includes('You :')) {
        console.log(`✅ Último mensaje no es del bot`);
        return true;
      }
      
      // 4. Verificar si hay timestamps recientes (últimas 24 horas)
      const timeIndicators = [
        'today',
        'hoy',
        'now',
        'ahora',
        'just now',
        'hace poco',
        'minutes ago',
        'minutos'
      ];
      
      for (const timeIndicator of timeIndicators) {
        if (chatText.toLowerCase().includes(timeIndicator)) {
          console.log(`✅ Indicador de tiempo reciente: ${timeIndicator}`);
          return true;
        }
      }
      
      console.log(`❌ No se encontraron indicadores de mensajes sin responder para ${userName}`);
      return false;
      
    } catch (error) {
      console.error(`❌ Error verificando mensajes para ${userName}:`, error.message);
      return false;
    }
  }

  extractUserName(chatText) {
    const lines = chatText.split('\n');
    const firstLine = lines[0] || chatText;
    
    const cleanText = firstLine.replace(/[^\w\s]/g, '').trim();
    const parts = cleanText.split(/\s+/);
    
    if (parts.length >= 2) {
      return parts[0] + ' ' + parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    
    return chatText.substring(0, 20);
  }

  async readFullChatHistory() {
    console.log('📖 Leyendo historial completo del chat...');
    
    try {
      await SLEEP(3000);
      
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
        '.message-bubble',
        '.MuiTypography-root',
        'p',
        'div'
      ];
      
      for (const selector of messageSelectors) {
        const messages = this.page.locator(selector);
        const count = await messages.count();
        
        if (count > 0) {
          console.log(`✅ Encontrados ${count} mensajes con selector: ${selector}`);
          
          const chatHistory = [];
          
          const startIndex = Math.max(0, count - 20);
          for (let i = startIndex; i < count; i++) {
            const message = messages.nth(i);
            const messageText = await message.innerText().catch(() => '');
            
            if (messageText && messageText.trim().length > 0) {
              chatHistory.push(messageText);
            }
          }
          
          console.log(`📝 Historial leído: ${chatHistory.length} mensajes`);
          return chatHistory;
        }
      }
      
      console.log('📝 No se encontraron mensajes');
      return [];
      
    } catch (error) {
      console.error('❌ Error leyendo historial:', error.message);
      return [];
    }
  }

  async detectLanguage(text) {
    const spanishWords = ['hola', 'como', 'estas', 'que', 'tal', 'bien', 'gracias', 'por', 'favor', 'amor', 'cariño', 'hermosa', 'guapo', 'te', 'me', 'mi', 'tu', 'su', 'nos', 'les'];
    const englishWords = ['hello', 'hi', 'how', 'are', 'you', 'what', 'good', 'thanks', 'please', 'love', 'baby', 'beautiful', 'handsome', 'the', 'and', 'for', 'with', 'this', 'that'];
    
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

  async analyzeMood(chatHistory) {
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

  async generateContextualResponse(clientMemory, lastMessage) {
    console.log('🤖 Generando respuesta contextual...');
    
    try {
      // Respuesta específica para misskathystanford sobre bra lines
      if (clientMemory.name.toLowerCase().includes('misskathystanford') && 
          lastMessage.toLowerCase().includes('bra lines')) {
        
        const responses = [
          "Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?",
          "Oh honey, that's such a sexy thought... 😊 The way your bra lines show through your blouse is incredibly alluring. It's like you're giving a little peek into what's underneath... 🌸 Are you planning to wear something special today?",
          "Baby, that's so hot... 🔥 The way your bra lines show through your blouse is such a turn-on. It's like you're teasing without even trying... 💕 What kind of bra are you thinking about wearing?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Respuesta usando IA si está disponible
      try {
        const response = await axios.post('http://localhost:3000/api/reply', {
          message: lastMessage,
          language: clientMemory.language,
          context: 'conversation',
          clientMemory: {
            name: clientMemory.name,
            mood: clientMemory.mood,
            interests: clientMemory.interests,
            conversationStyle: clientMemory.conversationStyle,
            chatHistory: clientMemory.chatHistory.slice(-5)
          }
        });
        
        if (response.data && response.data.reply) {
          return response.data.reply;
        }
      } catch (error) {
        console.log('⚠️ IA no disponible, usando fallback');
      }
      
      // Fallback responses
      return this.getFallbackResponse(clientMemory, lastMessage);
      
    } catch (error) {
      console.error('❌ Error con IA, usando fallback:', error.message);
      return this.getFallbackResponse(clientMemory, lastMessage);
    }
  }

  getFallbackResponse(clientMemory, lastMessage) {
    const { name, language, mood } = clientMemory;
    const lowerMessage = lastMessage.toLowerCase();
    
    if (language === 'spanish') {
      if (lowerMessage.includes('hola') || lowerMessage.includes('hey') || lowerMessage.includes('hi')) {
        return '¡Hola cariño! 😊 ¿Qué tal va tu día? Me encanta verte por aquí 💕';
      } else if (lowerMessage.includes('como') && lowerMessage.includes('estas')) {
        return '¡Muy bien amor! 😘 Me siento genial ahora que estás aquí. ¿Y tú cómo te sientes? 💖';
      } else if (lowerMessage.includes('amor') || lowerMessage.includes('cariño')) {
        return 'Mmm amor, me encanta cuando me llamas así... 😘 ¿Qué más tienes en mente? 💕';
      } else if (lowerMessage.includes('hermosa') || lowerMessage.includes('guapa') || lowerMessage.includes('bonita')) {
        return 'Ay cariño, me haces sonrojar... 🌸 ¿Qué te gustaría que hiciéramos? ✨';
      } else {
        return '¡Hola amor! 😊 Me encanta charlar contigo. ¿Qué te gustaría hacer hoy? 💕';
      }
    } else {
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return 'Hey baby! 😊 How are you doing today? I love seeing you here 💕';
      } else if (lowerMessage.includes('how') && lowerMessage.includes('are') && lowerMessage.includes('you')) {
        return 'I\'m doing great baby! 😘 I feel amazing now that you\'re here. How are you feeling? 💖';
      } else if (lowerMessage.includes('love') || lowerMessage.includes('baby')) {
        return 'Mmm baby, I love when you call me that... 😘 What else do you have in mind? 💕';
      } else if (lowerMessage.includes('beautiful') || lowerMessage.includes('gorgeous') || lowerMessage.includes('pretty')) {
        return 'Oh baby, you make me blush... 🌸 What would you like us to do? ✨';
      } else {
        return 'Hey baby! 😊 I love chatting with you. What would you like to do today? 💕';
      }
    }
  }

  async sendMessage(message) {
    console.log('📤 Enviando respuesta...');
    
    try {
      await SLEEP(1000);
      
      const inputSelectors = [
        'textarea[placeholder*="message"]',
        'input[placeholder*="message"]',
        'textarea[placeholder*="escribir"]',
        'input[placeholder*="escribir"]',
        'textarea[placeholder*="type"]',
        'input[placeholder*="type"]',
        '.message-input',
        '.chat-input',
        '[data-testid="message-input"]',
        '.MuiInputBase-input',
        'textarea',
        'input[type="text"]',
        '.composer-input'
      ];
      
      let inputField = null;
      for (const selector of inputSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          inputField = elements.first();
          console.log(`✅ Campo de entrada encontrado: ${selector}`);
          break;
        }
      }
      
      if (!inputField) {
        console.log('❌ No se encontró campo de entrada');
        return false;
      }
      
      await inputField.click();
      await inputField.fill('');
      await inputField.type(message, { delay: 50 });
      console.log('✅ Mensaje escrito');
      
      await SLEEP(1000);
      
      const sendSelectors = [
        'button[type="submit"]',
        '.send-button',
        '.submit-button',
        '[data-testid="send-button"]',
        'button:has-text("Send")',
        'button:has-text("Enviar")',
        '.MuiButton-root',
        'button[aria-label*="send"]',
        'button[title*="send"]'
      ];
      
      let sendButton = null;
      for (const selector of sendSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          sendButton = elements.last();
          console.log(`✅ Botón de enviar encontrado: ${selector}`);
          break;
        }
      }
      
      if (!sendButton) {
        console.log('❌ No se encontró botón de enviar');
        return false;
      }
      
      await sendButton.click();
      console.log('✅ ¡Respuesta enviada exitosamente!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
      return false;
    }
  }

  async startEnhancedMonitoring() {
    console.log('🎯 INICIANDO BOT ÚLTIMO MEJORADO...\n');
    
    try {
      if (!await this.init()) {
        return false;
      }
      
      if (!await this.login()) {
        console.log('❌ Error en login');
        return false;
      }
      
      if (!await this.navigateToChat()) {
        console.log('❌ Error navegando al chat');
        return false;
      }
      
      // Analizar todos los chats con detección mejorada
      await this.analyzeAllChatsEnhanced();
      
      console.log('✅ Análisis completado');
      
      // Mantener el navegador abierto para inspección
      console.log('🌐 Navegador mantenido abierto para inspección...');
      console.log('💡 Presiona Ctrl+C para cerrar');
      
      // Esperar indefinidamente
      await new Promise(() => {});
      
    } catch (error) {
      console.error('❌ Error en monitoreo:', error.message);
      return false;
    } finally {
      await this.saveClientMemory();
    }
  }

  async close() {
    await this.saveClientMemory();
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }
}

// Función principal
async function main() {
  const bot = new UltimateNiteflirtBotEnhanced();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, deteniendo bot...');
    await bot.close();
    process.exit(0);
  });
  
  try {
    await bot.startEnhancedMonitoring();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
    await bot.close();
  }
}

main();
