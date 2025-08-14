#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const axios = require('axios');
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class RespondMissKathystanfordFinal {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetUser = 'misskathystanford';
  }

  async init() {
    console.log('🧠 Iniciando bot final para responder a misskathystanford...\n');
    
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

  async findMissKathystanford() {
    console.log(`🔍 Buscando usuario: ${this.targetUser}`);
    
    try {
      await SLEEP(3000);
      
      // Buscar elementos que contengan el texto del usuario
      const userElements = this.page.locator(`*:has-text("${this.targetUser}")`);
      const userCount = await userElements.count();
      
      console.log(`📊 Encontrados ${userCount} elementos que contienen "${this.targetUser}"`);
      
      if (userCount > 0) {
        // Buscar el elemento clickeable que contenga el usuario
        for (let i = 0; i < userCount; i++) {
          const element = userElements.nth(i);
          const text = await element.innerText().catch(() => '');
          
          console.log(`👤 Elemento ${i + 1}: "${text}"`);
          
          // Verificar si es un elemento clickeable
          const isClickable = await element.isVisible() && 
                             (await element.getAttribute('role') === 'button' ||
                              await element.tagName() === 'A' ||
                              await element.tagName() === 'BUTTON' ||
                              await element.locator('a, button, [role="button"]').count() > 0);
          
          if (isClickable) {
            console.log(`✅ ¡Usuario ${this.targetUser} encontrado y clickeable!`);
            await element.click();
            await SLEEP(3000);
            return true;
          }
        }
        
        // Si no encontramos un elemento clickeable, intentar hacer click en el padre
        console.log('🔍 Intentando hacer click en el elemento padre...');
        const firstElement = userElements.first();
        await firstElement.click();
        await SLEEP(3000);
        return true;
      }
      
      console.log(`❌ Usuario ${this.targetUser} no encontrado`);
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
      
      // Buscar el mensaje específico de misskathystanford
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
        '.text-message',
        'p',
        'div'
      ];
      
      for (const selector of messageSelectors) {
        const messages = this.page.locator(selector);
        const count = await messages.count();
        
        if (count > 0) {
          console.log(`✅ Encontrados ${count} mensajes con selector: ${selector}`);
          
          // Buscar el mensaje que contenga "bra lines" o "blouse"
          for (let i = count - 1; i >= 0; i--) {
            const message = messages.nth(i);
            const messageText = await message.innerText().catch(() => '');
            
            if (messageText && messageText.toLowerCase().includes('bra lines') || 
                messageText.toLowerCase().includes('blouse')) {
              console.log(`📨 Mensaje encontrado: "${messageText}"`);
              return messageText;
            }
          }
          
          // Si no encontramos el mensaje específico, tomar el último
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

  async generateResponse(lastMessage) {
    console.log('🤖 Generando respuesta inteligente...');
    
    try {
      // Respuesta específica para el mensaje sobre bra lines
      if (lastMessage.toLowerCase().includes('bra lines') || 
          lastMessage.toLowerCase().includes('blouse')) {
        
        const responses = [
          "Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?",
          
          "Oh honey, that's such a sexy thought... 😊 The way your bra lines show through your blouse is incredibly alluring. It's like you're giving a little peek into what's underneath... 🌸 Are you planning to wear something special today?",
          
          "Baby, that's so hot... 🔥 The way your bra lines show through your blouse is such a turn-on. It's like you're teasing without even trying... 💕 What kind of bra are you thinking about wearing?",
          
          "Mmm, I can just imagine how sexy that would look... 😘 Your bra lines showing through your blouse, giving just a hint of what's underneath... 💕 Are you feeling particularly naughty today?",
          
          "That's such a beautiful thought, baby... ✨ The way your bra lines show through your blouse is so feminine and alluring... 💕 What's got you thinking about that today?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        console.log(`💬 Respuesta generada: "${response}"`);
        return response;
      }
      
      // Respuesta general si no es sobre bra lines
      const generalResponses = [
        "Hey baby! 😊 I love chatting with you. What's on your mind today? 💕",
        "Hi honey! 🌸 How are you feeling? I'd love to know what you're thinking about... 💕",
        "Hey there! 😘 What's got you thinking today? I'm all ears... 💕",
        "Hello beautiful! ✨ How's your day going? I'd love to hear from you... 💕",
        "Hi baby! 💕 What's on your mind? I'm here to listen... 😊"
      ];
      
      const response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      console.log(`💬 Respuesta generada: "${response}"`);
      return response;
      
    } catch (error) {
      console.error('❌ Error generando respuesta:', error.message);
      return "Hey baby! 😊 How are you doing today? 💕";
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
        '.composer-input',
        'input',
        'textarea'
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
        'button[title*="send"]',
        'button'
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
      
      const response = await this.generateResponse(lastMessage);
      
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
  const responder = new RespondMissKathystanfordFinal();
  
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
