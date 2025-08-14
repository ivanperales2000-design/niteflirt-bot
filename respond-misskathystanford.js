#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class RespondMissKathystanford {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetUser = 'misskathystanford';
  }

  async init() {
    console.log('🚀 Iniciando respuesta a misskathystanford...\n');
    
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
      
      // Verificar si el login fue exitoso
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

  async findMissKathystanford() {
    console.log(`🔍 Buscando usuario: ${this.targetUser}...`);
    
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
      
      for (const selector of userSelectors) {
        const users = this.page.locator(selector);
        const userCount = await users.count();
        
        if (userCount > 0) {
          console.log(`📊 Encontrados ${userCount} usuarios con selector: ${selector}`);
          
          for (let i = 0; i < userCount; i++) {
            const user = users.nth(i);
            const userText = await user.innerText().catch(() => '');
            
            console.log(`👤 Usuario ${i + 1}: ${userText}`);
            
            // Buscar misskathystanford (ignorando mayúsculas/minúsculas)
            if (userText.toLowerCase().includes(this.targetUser.toLowerCase())) {
              console.log(`🎯 ¡Usuario encontrado: ${userText}!`);
              await user.click();
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

  async waitForChatToOpen() {
    console.log('⏳ Esperando que se abra el chat...');
    
    try {
      await SLEEP(3000);
      
      // Verificar si el chat se abrió buscando elementos del chat
      const chatSelectors = [
        '.chat-messages',
        '.message-container',
        '.conversation-area',
        '.chat-area',
        '.messages-container'
      ];
      
      for (const selector of chatSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          console.log('✅ Chat abierto correctamente');
          return true;
        }
      }
      
      console.log('⚠️ No se detectó apertura del chat, continuando...');
      return true;
      
    } catch (error) {
      console.error('❌ Error esperando chat:', error.message);
      return false;
    }
  }

  async readLastMessage() {
    console.log('📖 Leyendo último mensaje del chat...');
    
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
          
          // Obtener el último mensaje
          const lastMessage = messages.nth(count - 1);
          const messageText = await lastMessage.innerText().catch(() => '');
          
          if (messageText && messageText.trim().length > 0) {
            console.log(`📨 Último mensaje: "${messageText}"`);
            return messageText;
          }
        }
      }
      
      console.log('📝 No se encontraron mensajes legibles');
      return null;
      
    } catch (error) {
      console.error('❌ Error leyendo mensaje:', error.message);
      return null;
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
    
    const language = spanishCount > englishCount ? 'spanish' : 'english';
    console.log(`🌍 Idioma detectado: ${language} (español: ${spanishCount}, inglés: ${englishCount})`);
    return language;
  }

  async generateResponse(message, language) {
    console.log('🤖 Generando respuesta inteligente...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/reply', {
        message: message,
        language: language,
        context: 'conversation'
      });
      
      if (response.data && response.data.reply) {
        console.log(`💬 Respuesta generada: "${response.data.reply}"`);
        return response.data.reply;
      } else {
        return this.getFallbackResponse(language);
      }
      
    } catch (error) {
      console.error('❌ Error con IA, usando fallback:', error.message);
      return this.getFallbackResponse(language);
    }
  }

  getFallbackResponse(language) {
    if (language === 'spanish') {
      const responses = [
        '¡Hola! 😊 ¿Qué tal va tu día? Me encantaría saber cómo estás 💕',
        'Hey! 🌟 ¿Cómo te sientes hoy? Me gustaría charlar un poco contigo 😘',
        '¡Hola! 💖 ¿Qué has estado haciendo? Me interesa mucho saber de ti ✨',
        'Hey! 💫 ¿Cómo va todo por tu lado? Me gustaría conocer más sobre ti 😊'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        'Hey! 😊 How\'s your day going? I\'d love to know how you\'re feeling 💕',
        'Hi! 🌟 How are you feeling today? I\'d like to chat with you a bit 😘',
        'Hey! 💖 What have you been up to? I\'m really interested in knowing more about you ✨',
        'Hi! 💫 How\'s everything on your side? I\'d like to get to know you better 😊'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
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
      
      // Buscar botón de enviar
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

  async respondToMissKathystanford() {
    console.log(`🎯 INICIANDO RESPUESTA A ${this.targetUser.toUpperCase()}...\n`);
    
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
        console.log(`❌ No se pudo encontrar ${this.targetUser}`);
        return false;
      }
      
      if (!await this.waitForChatToOpen()) {
        console.log('❌ Error abriendo chat');
        return false;
      }
      
      const lastMessage = await this.readLastMessage();
      
      if (!lastMessage) {
        console.log('📝 No hay mensaje para responder');
        return true;
      }
      
      console.log(`\n📨 MENSAJE PENDIENTE DE ${this.targetUser.toUpperCase()}:`);
      console.log(`"${lastMessage}"`);
      console.log('');
      
      const language = await this.detectLanguage(lastMessage);
      const response = await this.generateResponse(lastMessage, language);
      
      console.log(`\n💬 RESPUESTA GENERADA:`);
      console.log(`"${response}"`);
      console.log('');
      
      if (await this.sendMessage(response)) {
        console.log('🎉 ¡RESPUESTA ENVIADA EXITOSAMENTE!');
        console.log(`✅ El bot respondió a ${this.targetUser} de manera inteligente`);
      } else {
        console.log('❌ Error enviando la respuesta');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error en respuesta:', error.message);
      return false;
    } finally {
      console.log('🌐 Navegador mantenido abierto...');
      console.log('💡 Presiona Ctrl+C para cerrar');
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
  const responder = new RespondMissKathystanford();
  
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
