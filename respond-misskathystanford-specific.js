#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class RespondMissKathystanfordSpecific {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetUser = 'misskathystanford';
  }

  async init() {
    console.log('🧠 Iniciando bot para responder a misskathystanford...\n');
    
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
      return true;
      
    } catch (error) {
      console.error('❌ Error iniciando navegador:', error.message);
      return false;
    }
  }

  async login() {
    console.log('🔐 Iniciando proceso de login...');
    
    try {
      await this.page.goto('https://www.niteflirt.com/login', { waitUntil: 'domcontentloaded' });
      await SLEEP(3000);
      
      console.log('📧 Buscando campo de email...');
      
      // Intentar múltiples selectores para el email
      const emailSelectors = [
        '#outlined-basic-login',
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Email"]'
      ];
      
      let emailField = null;
      for (const selector of emailSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          emailField = elements.first();
          console.log(`✅ Campo de email encontrado: ${selector}`);
          break;
        }
      }
      
      if (!emailField) {
        console.log('❌ No se encontró campo de email');
        return false;
      }
      
      await emailField.click();
      await emailField.fill('');
      await emailField.type(process.env.NF_EMAIL, { delay: 100 });
      console.log('✅ Email ingresado correctamente');
      
      await SLEEP(1000);
      
      console.log('🔒 Buscando campo de contraseña...');
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password"]',
        'input[placeholder*="Password"]'
      ];
      
      let passwordField = null;
      for (const selector of passwordSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          passwordField = elements.first();
          console.log(`✅ Campo de contraseña encontrado: ${selector}`);
          break;
        }
      }
      
      if (!passwordField) {
        console.log('❌ No se encontró campo de contraseña');
        return false;
      }
      
      await passwordField.click();
      await passwordField.fill('');
      await passwordField.type(process.env.NF_PASS, { delay: 100 });
      console.log('✅ Contraseña ingresada correctamente');
      
      await SLEEP(1000);
      
      console.log('🔘 Buscando botón de login...');
      
      const loginSelectors = [
        'button[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'button:has-text("Iniciar")',
        '.login-button',
        '.submit-button'
      ];
      
      let loginButton = null;
      for (const selector of loginSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          loginButton = elements.first();
          console.log(`✅ Botón de login encontrado: ${selector}`);
          break;
        }
      }
      
      if (!loginButton) {
        console.log('❌ No se encontró botón de login');
        return false;
      }
      
      await loginButton.click();
      console.log('✅ Botón de login clickeado');
      
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
      await SLEEP(3000);
      
      console.log('✅ Navegación al chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando a chat:', error.message);
      return false;
    }
  }

  async findMissKathystanford() {
    console.log(`🔍 Buscando usuario: ${this.targetUser}`);
    
    try {
      await SLEEP(3000);
      
      const userSelectors = [
        '.MuiListItemButton-root',
        '.thread-item',
        '.chat-item',
        '.conversation-item',
        '.user-item',
        '[data-testid="thread-item"]',
        '.MuiListItem-root',
        'div[role="button"]',
        '.chat-list-item'
      ];
      
      for (const selector of userSelectors) {
        const users = this.page.locator(selector);
        const userCount = await users.count();
        
        if (userCount > 0) {
          console.log(`📊 Encontrados ${userCount} usuarios con selector: ${selector}`);
          
          for (let i = 0; i < userCount; i++) {
            const user = users.nth(i);
            const userText = await user.innerText().catch(() => '');
            
            console.log(`👤 Usuario ${i + 1}: "${userText}"`);
            
            if (userText.toLowerCase().includes(this.targetUser.toLowerCase())) {
              console.log(`✅ ¡Usuario ${this.targetUser} encontrado!`);
              await user.click();
              await SLEEP(3000);
              return true;
            }
          }
        }
      }
      
      console.log(`❌ Usuario ${this.targetUser} no encontrado en la lista`);
      return false;
      
    } catch (error) {
      console.error('❌ Error buscando usuario:', error.message);
      return false;
    }
  }

  async readLastMessage() {
    console.log('📖 Leyendo último mensaje...');
    
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
        '.message-body',
        '.text-message'
      ];
      
      for (const selector of messageSelectors) {
        const messages = this.page.locator(selector);
        const count = await messages.count();
        
        if (count > 0) {
          console.log(`✅ Encontrados ${count} mensajes con selector: ${selector}`);
          
          // Leer el último mensaje
          const lastMessage = messages.nth(count - 1);
          const messageText = await lastMessage.innerText().catch(() => '');
          
          if (messageText && messageText.trim().length > 0) {
            console.log(`📨 Último mensaje: "${messageText}"`);
            return messageText;
          }
        }
      }
      
      console.log('📝 No se encontraron mensajes');
      return null;
      
    } catch (error) {
      console.error('❌ Error leyendo mensaje:', error.message);
      return null;
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
    
    const language = spanishCount > englishCount ? 'spanish' : 'english';
    console.log(`🌍 Idioma detectado: ${language} (español: ${spanishCount}, inglés: ${englishCount})`);
    return language;
  }

  async generateResponse(lastMessage, language) {
    console.log('🤖 Generando respuesta inteligente...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/reply', {
        message: lastMessage,
        language: language,
        context: 'conversation',
        clientMemory: {
          name: 'misskathystanford',
          mood: 'neutral',
          interests: [],
          conversationStyle: 'friendly',
          chatHistory: [lastMessage]
        }
      });
      
      if (response.data && response.data.reply) {
        console.log(`💬 Respuesta generada: "${response.data.reply}"`);
        return response.data.reply;
      } else {
        return this.getFallbackResponse(lastMessage, language);
      }
      
    } catch (error) {
      console.error('❌ Error con IA, usando fallback:', error.message);
      return this.getFallbackResponse(lastMessage, language);
    }
  }

  getFallbackResponse(lastMessage, language) {
    const lowerMessage = lastMessage.toLowerCase();
    
    if (language === 'spanish') {
      if (lowerMessage.includes('hola') || lowerMessage.includes('hey') || lowerMessage.includes('hi')) {
        return '¡Hola cariño! 😊 ¿Qué tal va tu día? Me encanta verte por aquí 💕';
      } else if (lowerMessage.includes('como') && lowerMessage.includes('estas')) {
        return '¡Muy bien amor! 😘 Me siento genial ahora que estás aquí. ¿Y tú cómo te sientes? 💖';
      } else if (lowerMessage.includes('que') && lowerMessage.includes('haces')) {
        return 'Estoy aquí pensando en ti... 😊 ¿Qué te gustaría que hiciéramos juntos? 💕';
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
      } else if (lowerMessage.includes('what') && lowerMessage.includes('doing')) {
        return 'I\'m here thinking about you... 😊 What would you like us to do together? 💕';
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

  async respondToMissKathystanford() {
    console.log('🎯 INICIANDO RESPUESTA A MISSKATHYSTANFORD...\n');
    
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
      
      if (!await this.findMissKathystanford()) {
        console.log('❌ No se pudo encontrar el usuario');
        return false;
      }
      
      const lastMessage = await this.readLastMessage();
      if (!lastMessage) {
        console.log('❌ No se pudo leer el último mensaje');
        return false;
      }
      
      const language = await this.detectLanguage(lastMessage);
      const response = await this.generateResponse(lastMessage, language);
      
      if (await this.sendMessage(response)) {
        console.log('✅ ¡Respuesta enviada exitosamente a misskathystanford!');
        return true;
      } else {
        console.log('❌ Error enviando respuesta');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error en proceso:', error.message);
      return false;
    } finally {
      console.log('🌐 Navegador mantenido abierto para inspección...');
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }
}

// Función principal
async function main() {
  const responder = new RespondMissKathystanfordSpecific();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, cerrando...');
    await responder.close();
    process.exit(0);
  });
  
  try {
    await responder.respondToMissKathystanford();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
  }
}

main();
