#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class MissKathystanfordResponder {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🧠 Iniciando Respondedor Específico para misskathystanford...\n');
    
    try {
      this.browser = await chromium.launch({ 
        headless: false, // Visible para ver qué pasa
        slowMo: 200,
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
    console.log('🎯 Buscando específicamente misskathystanford...');
    
    try {
      // Buscar usando múltiples estrategias
      const searchStrategies = [
        `*:has-text("misskathystanford")`,
        `*:has-text("misskathystanford")`,
        `*:has-text("MissKathystanford")`,
        `*:has-text("MISSKATHYSTANFORD")`,
        `[data-testid*="misskathystanford"]`,
        `.user-item:has-text("misskathystanford")`,
        `.thread-item:has-text("misskathystanford")`,
        `div:has-text("misskathystanford")`,
        `span:has-text("misskathystanford")`,
        `a:has-text("misskathystanford")`
      ];
      
      let userElement = null;
      
      for (const strategy of searchStrategies) {
        const elements = this.page.locator(strategy);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ misskathystanford encontrada con estrategia: ${strategy}`);
          
          // Verificar que sea clickeable
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i);
            const isVisible = await element.isVisible();
            const isEnabled = await element.isEnabled();
            
            if (isVisible && isEnabled) {
              console.log(`✅ Elemento ${i} es visible y habilitado`);
              userElement = element;
              break;
            }
          }
          
          if (userElement) break;
        }
      }
      
      if (!userElement) {
        console.log('❌ misskathystanford no encontrada o no clickeable');
        return false;
      }
      
      // Mostrar el texto del elemento encontrado
      const elementText = await userElement.innerText().catch(() => '');
      console.log(`📝 Texto del elemento encontrado: "${elementText}"`);
      
      // Hacer click en el elemento
      console.log('🖱️ Haciendo click en misskathystanford...');
      await userElement.click();
      await SLEEP(3000);
      
      console.log('✅ Click exitoso en misskathystanford');
      return true;
      
    } catch (error) {
      console.error('❌ Error buscando misskathystanford:', error.message);
      return false;
    }
  }

  async readLastMessage() {
    console.log('📖 Leyendo el último mensaje...');
    
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

  generateResponse(lastMessage) {
    console.log('🤖 Generando respuesta específica...');
    
    const lowerMessage = lastMessage.toLowerCase();
    
    // Respuesta específica para bra lines
    if (lowerMessage.includes('bra lines')) {
      const responses = [
        "Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?",
        "Oh honey, that's such a sexy thought... 😊 The way your bra lines show through your blouse is incredibly alluring. It's like you're giving a little peek into what's underneath... 🌸 Are you planning to wear something special today?",
        "Baby, that's so hot... 🔥 The way your bra lines show through your blouse is such a turn-on. It's like you're teasing without even trying... 💕 What kind of bra are you thinking about wearing?"
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      console.log(`💬 Respuesta generada: "${response}"`);
      return response;
    }
    
    // Respuestas generales basadas en el contenido
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hey baby! 😊 How are you doing today? I love seeing you here 💕";
    } else if (lowerMessage.includes('how') && lowerMessage.includes('are') && lowerMessage.includes('you')) {
      return "I'm doing great baby! 😘 I feel amazing now that you're here. How are you feeling? 💖";
    } else if (lowerMessage.includes('love') || lowerMessage.includes('baby')) {
      return "Mmm baby, I love when you call me that... 😘 What else do you have in mind? 💕";
    } else if (lowerMessage.includes('beautiful') || lowerMessage.includes('gorgeous') || lowerMessage.includes('pretty')) {
      return "Oh baby, you make me blush... 🌸 What would you like us to do? ✨";
    } else {
      return "Hey baby! 😊 I love chatting with you. What would you like to do today? 💕";
    }
  }

  async sendMessage(message) {
    console.log('📤 Enviando respuesta...');
    
    try {
      await SLEEP(2000);
      
      // Buscar campo de entrada con múltiples selectores
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
        'input[type="text"]',
        'textarea[rows]',
        '.input-field',
        '.text-input'
      ];
      
      let inputField = null;
      
      for (const selector of inputSelectors) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ Campo de entrada encontrado: ${selector} (${count} elementos)`);
          
          // Probar cada elemento hasta encontrar uno que funcione
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i);
            const isVisible = await element.isVisible();
            const isEnabled = await element.isEnabled();
            
            if (isVisible && isEnabled) {
              inputField = element;
              console.log(`✅ Usando elemento ${i} del selector ${selector}`);
              break;
            }
          }
          
          if (inputField) break;
        }
      }
      
      if (!inputField) {
        console.log('❌ No se encontró campo de entrada válido');
        return false;
      }
      
      // Escribir el mensaje
      console.log('✍️ Escribiendo mensaje...');
      await inputField.click();
      await SLEEP(500);
      await inputField.fill('');
      await SLEEP(500);
      await inputField.type(message, { delay: 50 });
      console.log('✅ Mensaje escrito correctamente');
      
      await SLEEP(2000);
      
      // Buscar botón de enviar
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
        'button:has-text("Send Message")',
        'button:has-text("Enviar Mensaje")',
        'input[type="submit"]',
        'button[class*="send"]',
        'button[class*="submit"]'
      ];
      
      let sendButton = null;
      
      for (const selector of sendSelectors) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ Botón de enviar encontrado: ${selector} (${count} elementos)`);
          
          // Probar cada botón hasta encontrar uno que funcione
          for (let i = 0; i < count; i++) {
            const element = elements.nth(i);
            const isVisible = await element.isVisible();
            const isEnabled = await element.isEnabled();
            const buttonText = await element.innerText().catch(() => '');
            
            if (isVisible && isEnabled) {
              sendButton = element;
              console.log(`✅ Usando botón ${i}: "${buttonText}"`);
              break;
            }
          }
          
          if (sendButton) break;
        }
      }
      
      if (!sendButton) {
        console.log('❌ No se encontró botón de enviar válido');
        return false;
      }
      
      // Hacer click en el botón de enviar
      console.log('🚀 Haciendo click en botón de enviar...');
      await sendButton.click();
      console.log('✅ ¡Respuesta enviada exitosamente!');
      
      await SLEEP(3000);
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
        console.log('❌ No se pudo encontrar misskathystanford');
        return false;
      }
      
      const lastMessage = await this.readLastMessage();
      
      if (!lastMessage) {
        console.log('❌ No se pudo leer el último mensaje');
        return false;
      }
      
      const response = this.generateResponse(lastMessage);
      
      if (await this.sendMessage(response)) {
        console.log('🎉 ¡RESPUESTA ENVIADA EXITOSAMENTE A MISSKATHYSTANFORD!');
        return true;
      } else {
        console.log('❌ No se pudo enviar la respuesta');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error.message);
      return false;
    } finally {
      // Mantener el navegador abierto para inspección
      console.log('🌐 Navegador mantenido abierto para inspección...');
      console.log('💡 Presiona Ctrl+C para cerrar');
      
      // Esperar indefinidamente
      await new Promise(() => {});
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
  const responder = new MissKathystanfordResponder();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, deteniendo...');
    await responder.close();
    process.exit(0);
  });
  
  try {
    await responder.respondToMissKathystanford();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
    await responder.close();
  }
}

main();
