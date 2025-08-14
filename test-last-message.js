#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class TestLastMessage {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async init() {
    console.log('🧪 Iniciando test de detección de último mensaje...\n');
    
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
        this.isLoggedIn = true;
        return true;
      }
      
      // Verificar elementos que indican login exitoso
      const loggedInSelectors = [
        '.user-menu',
        '.profile-menu',
        '[data-testid="user-menu"]',
        '.avatar',
        '.user-avatar'
      ];
      
      for (const selector of loggedInSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          console.log(`✅ Login exitoso detectado por selector: ${selector}`);
          this.isLoggedIn = true;
          return true;
        }
      }
      
      console.log('❌ No se pudo confirmar el login');
      return false;
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return false;
    }
  }

  async navigateToChat() {
    console.log('💬 Navegando a la sección de chat...');
    
    try {
      // Intentar navegar directamente al chat
      await this.page.goto(S.urls.chat, { waitUntil: 'domcontentloaded' });
      await SLEEP(3000);
      
      console.log('✅ Navegación a chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando a chat:', error.message);
      return false;
    }
  }

  async findAndSelectUser(targetUsername = null) {
    console.log('🔍 Buscando usuarios en la lista de chat...');
    
    try {
      await SLEEP(3000);
      
      const userSelectors = [
        '.thread-item',
        '.chat-item',
        '.conversation-item',
        '.user-item',
        '[data-testid="thread-item"]',
        '.MuiListItem-root',
        '.list-item',
        '.chat-thread',
        '.conversation-thread'
      ];
      
      let userElements = null;
      for (const selector of userSelectors) {
        const elements = this.page.locator(selector);
        if (await elements.count() > 0) {
          userElements = elements;
          console.log(`✅ Usuarios encontrados con selector: ${selector}`);
          break;
        }
      }
      
      if (!userElements) {
        console.log('❌ No se encontraron usuarios en la lista');
        return false;
      }
      
      const userCount = await userElements.count();
      console.log(`📊 Encontrados ${userCount} usuarios en la lista`);
      
      // Si se especifica un usuario, buscarlo
      if (targetUsername) {
        for (let i = 0; i < userCount; i++) {
          const userElement = userElements.nth(i);
          const userText = await userElement.innerText().catch(() => '');
          if (userText.toLowerCase().includes(targetUsername.toLowerCase())) {
            console.log(`🎯 Usuario encontrado: ${userText}`);
            await userElement.click();
            return true;
          }
        }
        console.log(`❌ Usuario ${targetUsername} no encontrado`);
        return false;
      }
      
      // Seleccionar el primer usuario con mensaje no leído o el primero disponible
      for (let i = 0; i < userCount; i++) {
        const userElement = userElements.nth(i);
        const userText = await userElement.innerText().catch(() => '');
        
        // Verificar si tiene indicador de mensaje no leído
        const unreadSelectors = [
          '.unread-badge',
          '.unread-indicator',
          '.message-count',
          '[data-testid="unread-badge"]'
        ];
        
        let hasUnread = false;
        for (const unreadSelector of unreadSelectors) {
          if (await userElement.locator(unreadSelector).count() > 0) {
            hasUnread = true;
            break;
          }
        }
        
        if (hasUnread) {
          console.log(`📨 Usuario con mensaje no leído encontrado: ${userText}`);
          await userElement.click();
          return true;
        }
      }
      
      // Si no hay mensajes no leídos, seleccionar el primer usuario
      const firstUser = userElements.first();
      const firstUserText = await firstUser.innerText().catch(() => '');
      console.log(`👤 Seleccionando primer usuario disponible: ${firstUserText}`);
      await firstUser.click();
      return true;
      
    } catch (error) {
      console.error('❌ Error seleccionando usuario:', error.message);
      return false;
    }
  }

  async readLastMessage() {
    console.log('📖 Leyendo el último mensaje del chat...');
    
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
      
      if (!messages) {
        console.log('📝 No hay mensajes en el chat');
        return null;
      }
      
      const count = await messages.count();
      console.log(`📝 Encontrados ${count} mensajes en total`);
      
      if (count === 0) {
        console.log('📝 No hay mensajes para leer');
        return null;
      }
      
      // Obtener el último mensaje
      const lastMessage = messages.nth(count - 1);
      const messageText = await lastMessage.innerText().catch(() => '');
      
      console.log(`📨 Último mensaje: "${messageText}"`);
      return messageText;
      
    } catch (error) {
      console.error('❌ Error leyendo último mensaje:', error.message);
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

  async generateResponse(lastMessage, language) {
    console.log('🤖 Generando respuesta inteligente...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/reply', {
        message: lastMessage,
        language: language,
        context: 'conversation'
      });
      
      if (response.data && response.data.reply) {
        console.log(`💬 Respuesta generada: "${response.data.reply}"`);
        return response.data.reply;
      } else {
        console.log('⚠️ No se pudo generar respuesta con IA, usando fallback');
        return this.getFallbackResponse(language);
      }
      
    } catch (error) {
      console.error('❌ Error generando respuesta con IA:', error.message);
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
    console.log('📤 Enviando mensaje...');
    
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
          console.log(`✅ Campo de entrada encontrado con selector: ${selector}`);
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
      console.log('✅ Mensaje escrito en el campo de entrada');
      
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
          sendButton = elements.last(); // Usar el último botón encontrado
          console.log(`✅ Botón de enviar encontrado con selector: ${selector}`);
          break;
        }
      }
      
      if (!sendButton) {
        console.log('❌ No se encontró botón de enviar');
        return false;
      }
      
      await sendButton.click();
      console.log('✅ Mensaje enviado exitosamente!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
      return false;
    }
  }

  async testLastMessageDetection() {
    console.log('🧪 Iniciando test de detección de último mensaje...\n');
    
    try {
      if (!await this.init()) {
        return false;
      }
      
      if (!await this.login()) {
        console.log('❌ Falló el login');
        return false;
      }
      
      if (!await this.navigateToChat()) {
        console.log('❌ Falló la navegación al chat');
        return false;
      }
      
      if (!await this.findAndSelectUser()) {
        console.log('❌ No se pudo seleccionar usuario');
        return false;
      }
      
      await SLEEP(3000);
      
      const lastMessage = await this.readLastMessage();
      
      if (!lastMessage) {
        console.log('📝 No hay mensajes para responder');
        return true;
      }
      
      console.log(`\n📨 ÚLTIMO MENSAJE DETECTADO:`);
      console.log(`"${lastMessage}"`);
      console.log('');
      
      const language = await this.detectLanguage(lastMessage);
      const response = await this.generateResponse(lastMessage, language);
      
      console.log(`\n💬 RESPUESTA GENERADA:`);
      console.log(`"${response}"`);
      console.log('');
      
      if (await this.sendMessage(response)) {
        console.log('✅ Test completado exitosamente!');
        console.log('🎯 El bot detectó el último mensaje y respondió de manera inteligente');
      } else {
        console.log('❌ Error enviando la respuesta');
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error en el test:', error.message);
      return false;
    } finally {
      console.log('🌐 Navegador mantenido abierto para inspección...');
      console.log('💡 Presiona Ctrl+C para cerrar el navegador');
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
  const test = new TestLastMessage();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, cerrando...');
    await test.close();
    process.exit(0);
  });
  
  try {
    await test.testLastMessageDetection();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
  }
}

main();
