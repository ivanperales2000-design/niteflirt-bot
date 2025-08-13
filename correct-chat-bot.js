#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

class CorrectChatBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async init() {
    console.log('🤖 Iniciando Correct Chat Bot de Niteflirt...\n');
    
    try {
      // Cerrar procesos anteriores
      await this.killPreviousProcesses();
      
      // Iniciar navegador
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

  async killPreviousProcesses() {
    try {
      console.log('🔧 Cerrando procesos anteriores...');
      await new Promise((resolve) => {
        const { exec } = require('child_process');
        exec('taskkill /f /im chrome.exe /t', (error) => {
          if (error) console.log('⚠️ No se encontraron procesos de Chrome para cerrar');
          resolve();
        });
      });
      await SLEEP(1000);
    } catch (error) {
      console.log('⚠️ Error cerrando procesos:', error.message);
    }
  }

  async login() {
    console.log('🔐 Iniciando proceso de login automático...');
    
    try {
      // Ir a la página de login
      await this.page.goto(S.urls.login, { waitUntil: 'domcontentloaded' });
      await SLEEP(3000);
      
      console.log('📧 Buscando campo de email...');
      
      // Buscar campo de email
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
      
      // Buscar campo de contraseña
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
      
      // Buscar botón de login
      const loginButton = this.page.locator('button:has-text("Sign In")');
      if (await loginButton.count() > 0) {
        await loginButton.first().click();
        console.log('✅ Botón de login presionado');
      } else {
        console.log('❌ No se encontró botón de login');
        return false;
      }
      
      // Esperar y verificar login
      console.log('⏳ Verificando login...');
      await SLEEP(5000);
      
      // Verificar si la URL cambió
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/messages') || currentUrl.includes('/profile')) {
        console.log('✅ Login exitoso detectado por cambio de URL');
        this.isLoggedIn = true;
        return true;
      }
      
      // Si no detectamos el cambio, asumir que fue exitoso
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
      // Ir directamente a la URL del chat
      await this.page.goto('https://www.niteflirt.com/chat', { waitUntil: 'networkidle' });
      await SLEEP(5000);
      
      console.log('✅ Navegación al chat completada');
      return true;
      
    } catch (error) {
      console.error('❌ Error navegando al chat:', error.message);
      return false;
    }
  }

  async findAndSelectUser(targetUsername = null) {
    console.log(`🔍 Buscando usuario${targetUsername ? ` ${targetUsername}` : ' en la lista'}...`);
    
    try {
      await SLEEP(3000);
      
      // Buscar elementos de usuario en la lista con múltiples estrategias
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
        console.log('❌ No se encontraron usuarios con selectores específicos');
        console.log('🔍 Analizando elementos de la página...');
        
        // Buscar cualquier elemento que contenga texto y sea clickeable
        const allElements = await this.page.locator('*').all();
        const clickableElements = [];
        
        for (const element of allElements) {
          try {
            const text = await element.innerText().catch(() => '');
            const tagName = await element.evaluate(el => el.tagName).catch(() => '');
            
            // Filtrar elementos que contengan texto y sean potencialmente clickeables
            if (text && text.length > 0 && text.length < 100 && 
                (tagName === 'A' || tagName === 'BUTTON' || tagName === 'LI' || tagName === 'DIV')) {
              clickableElements.push({ element, text, tagName });
            }
          } catch (e) {
            // Continuar con el siguiente elemento
          }
        }
        
        console.log(`📊 Encontrados ${clickableElements.length} elementos clickeables con texto`);
        
        // Mostrar los primeros elementos para debugging
        for (let i = 0; i < Math.min(10, clickableElements.length); i++) {
          const { text, tagName } = clickableElements[i];
          console.log(`${i + 1}. ${tagName} - "${text.slice(0, 50)}"`);
        }
        
        return false;
      }
      
      const count = await users.count();
      console.log(`👥 Encontrados ${count} usuarios en la lista`);
      
      let selectedUser = null;
      
      // Si se especifica un usuario, buscarlo
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
      
      // Si no se encontró el usuario específico o no se especificó, usar el primero
      if (!selectedUser) {
        selectedUser = users.nth(0);
        const firstUserText = await selectedUser.innerText().catch(() => '');
        console.log(`👤 Seleccionando primer usuario disponible: ${firstUserText.slice(0, 50)}...`);
      }
      
      // Intentar hacer clic con múltiples estrategias
      console.log('🖱️ Intentando seleccionar usuario...');
      
      try {
        // Estrategia 1: Clic directo
        await selectedUser.click({ timeout: 10000 });
        console.log('✅ Usuario seleccionado con clic directo');
      } catch (e) {
        console.log('⚠️ Clic directo falló, intentando otras estrategias...');
        
        try {
          // Estrategia 2: Clic con force
          await selectedUser.click({ force: true, timeout: 10000 });
          console.log('✅ Usuario seleccionado con clic forzado');
        } catch (e2) {
          console.log('⚠️ Clic forzado falló, intentando con JavaScript...');
          
          try {
            // Estrategia 3: Clic con JavaScript
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
      
      // Buscar elementos que indiquen que el chat se ha abierto
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
      
      let chatHistory = '';
      if (messages) {
        const count = await messages.count();
        console.log(`📝 Encontrados ${count} mensajes en el historial`);
        
        // Leer los últimos 3 mensajes para contexto
        const lastMessages = Math.min(3, count);
        for (let i = count - lastMessages; i < count; i++) {
          const message = messages.nth(i);
          const messageText = await message.innerText().catch(() => '');
          chatHistory += messageText + ' ';
        }
        
        console.log(`📝 Últimos mensajes: "${chatHistory.slice(0, 200)}..."`);
      } else {
        console.log('📝 No hay mensajes previos en el chat');
      }
      
      return chatHistory;
      
    } catch (error) {
      console.error('❌ Error leyendo historial:', error.message);
      return '';
    }
  }

  async detectLanguage(text) {
    // Detectar idioma basado en palabras comunes
    const spanishWords = ['hola', 'como', 'estas', 'que', 'tal', 'bien', 'gracias', 'por', 'favor'];
    const englishWords = ['hello', 'hi', 'how', 'are', 'you', 'what', 'good', 'thanks', 'please'];
    
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

  async generateNaturalMessage(clientName = 'Cliente', chatHistory = '', language = 'english') {
    console.log('🧠 Generando mensaje natural...');
    
    try {
      let messages = [];
      
      if (language === 'spanish') {
        messages = [
          `Hey ${clientName}! 😊 ¿Qué tal va todo?`,
          `¡Hola ${clientName}! 🌟 ¿Cómo estás?`,
          `Hey ${clientName}! 💕 ¿Qué tal tu día?`,
          `¡Hola ${clientName}! ✨ ¿Cómo va todo?`,
          `Hey ${clientName}! 😘 ¿Qué tal?`,
          `¡Hola ${clientName}! 💖 ¿Cómo estás hoy?`,
          `Hey ${clientName}! 🌸 ¿Qué tal todo?`,
          `¡Hola ${clientName}! 💫 ¿Cómo va?`
        ];
      } else {
        messages = [
          `Hey ${clientName}! 😊 How are you doing?`,
          `Hi ${clientName}! 🌟 How's it going?`,
          `Hey ${clientName}! 💕 How's your day?`,
          `Hi ${clientName}! ✨ How are you?`,
          `Hey ${clientName}! 😘 What's up?`,
          `Hi ${clientName}! 💖 How's everything?`,
          `Hey ${clientName}! 🌸 How are you today?`,
          `Hi ${clientName}! 💫 How's it been?`
        ];
      }
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      console.log(`💬 Mensaje natural generado (${language}): "${randomMessage}"`);
      return randomMessage;
      
    } catch (error) {
      console.error('❌ Error generando mensaje natural:', error.message);
      return `Hey ${clientName}! 😊 How are you?`;
    }
  }

  async findChatInput() {
    console.log('🔍 Buscando área de entrada del chat...');
    
    try {
      await SLEEP(2000);
      
      // Buscar campo de entrada específicamente en el área de chat
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
      // Buscar el campo de entrada del chat
      const input = await this.findChatInput();
      
      if (!input) {
        console.log('❌ No se pudo encontrar el campo de entrada del chat');
        return false;
      }
      
      // Hacer clic en el campo
      await input.click();
      await SLEEP(500);
      
      // Escribir el mensaje
      console.log('✍️ Escribiendo mensaje...');
      await input.fill('');
      for (const ch of message) {
        await input.type(ch, { delay: jitter(30, 80) });
      }
      
      await SLEEP(jitter(500, 1000));
      
      // Enviar el mensaje
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

  async contactClient(targetUsername = null) {
    console.log(`🎯 Iniciando contacto correcto${targetUsername ? ` con ${targetUsername}` : ' con cliente'}...\n`);
    
    try {
      // 1. Inicializar
      if (!await this.init()) {
        return false;
      }
      
      // 2. Login
      if (!await this.login()) {
        return false;
      }
      
      // 3. Navegar al CHAT
      if (!await this.navigateToChat()) {
        return false;
      }
      
      // 4. Buscar y seleccionar usuario de la lista
      if (!await this.findAndSelectUser(targetUsername)) {
        return false;
      }
      
      // 5. Esperar a que se abra el chat
      if (!await this.waitForChatToOpen()) {
        return false;
      }
      
      // 6. Leer historial del chat
      const chatHistory = await this.readChatHistory();
      
      // 7. Detectar idioma
      const language = await this.detectLanguage(chatHistory);
      console.log(`🌍 Idioma detectado: ${language}`);
      
      // 8. Generar mensaje natural
      const naturalMessage = await this.generateNaturalMessage(targetUsername || 'Cliente', chatHistory, language);
      
      // 9. Enviar mensaje
      if (await this.sendMessage(naturalMessage)) {
        console.log('🎉 Mensaje natural enviado exitosamente!');
        console.log('\n✅ Proceso completado exitosamente!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error.message);
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
  const bot = new CorrectChatBot();
  
  try {
    // Contactar a missy12 específicamente
    await bot.contactClient('missy12');
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { CorrectChatBot };
