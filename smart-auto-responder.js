#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class SmartAutoResponder {
  constructor() {
    this.browser = null;
    this.page = null;
    this.clientMemory = new Map(); // Memoria de cada cliente
    this.memoryFile = 'client_memory.json';
    this.isMonitoring = false;
    this.lastCheck = new Date();
    this.checkInterval = 30000; // 30 segundos
  }

  async init() {
    console.log('🧠 Iniciando Smart Auto Responder...\n');
    
    try {
      this.browser = await chromium.launch({ 
        headless: false, 
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      this.page = await context.newPage();
      this.page.setDefaultTimeout(60000);
      
      console.log('✅ Navegador iniciado correctamente');
      
      // Cargar memoria de clientes
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
      
      console.log('🔘 Buscando botón de login...');
      
      const loginButton = this.page.locator('button[type="submit"]');
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
      await this.page.goto(S.urls.chat, { waitUntil: 'domcontentloaded' });
      await SLEEP(3000);
      
      console.log('✅ Navegación al chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando a chat:', error.message);
      return false;
    }
  }

  async analyzeAllChats() {
    console.log('🔍 Analizando todos los chats...');
    
    try {
      await SLEEP(3000);
      
      const userSelectors = [
        '.MuiListItemButton-root',
        '.thread-item',
        '.chat-item',
        '.conversation-item',
        '.user-item',
        '[data-testid="thread-item"]',
        '.MuiListItem-root'
      ];
      
      let allUsers = [];
      
      for (const selector of userSelectors) {
        const users = this.page.locator(selector);
        const userCount = await users.count();
        
        if (userCount > 0) {
          console.log(`📊 Encontrados ${userCount} usuarios con selector: ${selector}`);
          
          for (let i = 0; i < userCount; i++) {
            const user = users.nth(i);
            const userText = await user.innerText().catch(() => '');
            
            if (userText && userText.trim().length > 0) {
              allUsers.push({
                element: user,
                text: userText,
                selector: selector,
                index: i
              });
            }
          }
          break; // Usar el primer selector que funcione
        }
      }
      
      console.log(`📋 Total de usuarios encontrados: ${allUsers.length}`);
      
      // Analizar cada usuario
      for (const user of allUsers) {
        await this.analyzeUserChat(user);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error analizando chats:', error.message);
      return false;
    }
  }

  async analyzeUserChat(user) {
    try {
      console.log(`\n👤 Analizando chat de: ${user.text}`);
      
      // Extraer nombre del usuario
      const userName = this.extractUserName(user.text);
      
      // Verificar si tiene mensajes no leídos
      const hasUnread = await this.checkForUnreadMessages(user.element);
      
      if (hasUnread) {
        console.log(`📨 ¡Mensaje no leído detectado en ${userName}!`);
        
        // Abrir el chat
        await user.element.click();
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
          context: {}
        };
        
        // Actualizar memoria con nuevo historial
        clientMemory.chatHistory = chatHistory;
        clientMemory.lastInteraction = new Date().toISOString();
        
        // Analizar el último mensaje
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (lastMessage) {
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
            clientMemory.chatHistory.push(`Bot: ${response}`);
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
      console.error(`❌ Error analizando chat de ${user.text}:`, error.message);
    }
  }

  extractUserName(userText) {
    // Extraer nombre limpio del texto del usuario
    const cleanText = userText.replace(/[^\w\s]/g, '').trim();
    const parts = cleanText.split(/\s+/);
    
    // Buscar el nombre más probable (primeras palabras)
    if (parts.length >= 2) {
      return parts[0] + ' ' + parts[1];
    } else if (parts.length === 1) {
      return parts[0];
    }
    
    return userText.substring(0, 20); // Limitar longitud
  }

  async checkForUnreadMessages(userElement) {
    try {
      const unreadSelectors = [
        '.unread-badge',
        '.unread-indicator',
        '.message-count',
        '[data-testid="unread-badge"]',
        '.MuiBadge-badge',
        '.badge'
      ];
      
      for (const selector of unreadSelectors) {
        if (await userElement.locator(selector).count() > 0) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      return false;
    }
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
        '.MuiTypography-root'
      ];
      
      for (const selector of messageSelectors) {
        const messages = this.page.locator(selector);
        const count = await messages.count();
        
        if (count > 0) {
          console.log(`✅ Encontrados ${count} mensajes con selector: ${selector}`);
          
          const chatHistory = [];
          
          // Leer todos los mensajes (últimos 20 para contexto)
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
      const response = await axios.post('http://localhost:3000/api/reply', {
        message: lastMessage,
        language: clientMemory.language,
        context: 'conversation',
        clientMemory: {
          name: clientMemory.name,
          mood: clientMemory.mood,
          interests: clientMemory.interests,
          conversationStyle: clientMemory.conversationStyle,
          chatHistory: clientMemory.chatHistory.slice(-5) // Últimos 5 mensajes para contexto
        }
      });
      
      if (response.data && response.data.reply) {
        return response.data.reply;
      } else {
        return this.getFallbackResponse(clientMemory);
      }
      
    } catch (error) {
      console.error('❌ Error con IA, usando fallback:', error.message);
      return this.getFallbackResponse(clientMemory);
    }
  }

  getFallbackResponse(clientMemory) {
    const { name, language, mood } = clientMemory;
    
    if (language === 'spanish') {
      const responses = {
        happy: [
          `¡Hola ${name}! 😊 Me alegra verte tan feliz. ¿Qué te ha puesto de tan buen humor? 💕`,
          `Hey ${name}! 🌟 Veo que estás de buen ánimo. ¿Qué te gustaría hacer hoy? ✨`
        ],
        sad: [
          `Ay ${name}, no me gusta verte triste... 😔 ¿Qué puedo hacer para animarte? 💕`,
          `Cariño ${name}, estoy aquí para ti... 💖 ¿Quieres que te cuente algo que me hace feliz? ✨`
        ],
        romantic: [
          `Mmm ${name}, me encanta cuando hablas así... 😘 ¿Qué más tienes en mente? 💕`,
          `Ay ${name}, me haces sonrojar... 🌸 ¿Qué te gustaría que hiciéramos? ✨`
        ],
        neutral: [
          `¡Hola ${name}! 😊 ¿Qué tal va tu día? Me encantaría saber cómo estás 💕`,
          `Hey ${name}! 🌟 ¿Cómo te sientes hoy? Me gustaría charlar un poco contigo 😘`
        ]
      };
      
      const moodResponses = responses[mood] || responses.neutral;
      return moodResponses[Math.floor(Math.random() * moodResponses.length)];
    } else {
      const responses = {
        happy: [
          `Hey ${name}! 😊 I'm glad to see you so happy. What put you in such a good mood? 💕`,
          `Hi ${name}! 🌟 I can see you're in a great mood. What would you like to do today? ✨`
        ],
        sad: [
          `Oh ${name}, I don't like seeing you sad... 😔 What can I do to cheer you up? 💕`,
          `Baby ${name}, I'm here for you... 💖 Want me to tell you something that makes me happy? ✨`
        ],
        romantic: [
          `Mmm ${name}, I love when you talk like that... 😘 What else do you have in mind? 💕`,
          `Oh ${name}, you make me blush... 🌸 What would you like us to do? ✨`
        ],
        neutral: [
          `Hey ${name}! 😊 How's your day going? I'd love to know how you're feeling 💕`,
          `Hi ${name}! 🌟 How are you feeling today? I'd like to chat with you a bit 😘`
        ]
      };
      
      const moodResponses = responses[mood] || responses.neutral;
      return moodResponses[Math.floor(Math.random() * moodResponses.length)];
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
        '.message-input',
        '.chat-input',
        '[data-testid="message-input"]',
        '.MuiInputBase-input',
        'textarea',
        'input[type="text"]'
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
        '.MuiButton-root'
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

  async startMonitoring() {
    console.log('🎯 INICIANDO MONITOREO INTELIGENTE DE TODOS LOS CHATS...\n');
    
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
      
      console.log('🔄 Bot en modo monitoreo continuo...');
      console.log('💡 Presiona Ctrl+C para detener el monitoreo\n');
      
      this.isMonitoring = true;
      
      while (this.isMonitoring) {
        try {
          const now = new Date();
          
          // Verificar si es momento de hacer una nueva verificación
          if (now - this.lastCheck > this.checkInterval) {
            console.log('\n🔍 Verificando chats...');
            await this.analyzeAllChats();
            this.lastCheck = now;
          }
          
          await SLEEP(5000);
          
        } catch (error) {
          console.error('❌ Error en el bucle de monitoreo:', error.message);
          await SLEEP(10000);
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error en monitoreo:', error.message);
      return false;
    } finally {
      await this.saveClientMemory();
      console.log('🌐 Navegador mantenido abierto...');
    }
  }

  async stopMonitoring() {
    console.log('⏹️ Deteniendo monitoreo...');
    this.isMonitoring = false;
  }

  async close() {
    await this.stopMonitoring();
    await this.saveClientMemory();
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }
}

// Función principal
async function main() {
  const bot = new SmartAutoResponder();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, deteniendo bot...');
    await bot.close();
    process.exit(0);
  });
  
  try {
    await bot.startMonitoring();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
  }
}

main();
