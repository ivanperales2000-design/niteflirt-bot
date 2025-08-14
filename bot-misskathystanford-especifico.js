#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class BotMissKathystanfordEspecifico {
  constructor() {
    this.browser = null;
    this.page = null;
    this.targetUser = 'misskathystanford';
    this.targetMessage = 'bra lines';
  }

  async init() {
    console.log('🎯 Iniciando Bot Específico para misskathystanford...\n');
    
    try {
      this.browser = await chromium.launch({ 
        headless: false, // Visible para debug
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

  async findAndAnalyzeMissKathystanford() {
    console.log(`🎯 Buscando específicamente ${this.targetUser}...`);
    
    try {
      await SLEEP(3000);
      
      // Buscar usando múltiples estrategias
      const searchStrategies = [
        `*:has-text("${this.targetUser}")`,
        `*:has-text("MissKathystanford")`,
        `*:has-text("MISSKATHYSTANFORD")`,
        `[data-testid*="${this.targetUser}"]`,
        `.user-item:has-text("${this.targetUser}")`,
        `.thread-item:has-text("${this.targetUser}")`,
        `div:has-text("${this.targetUser}")`,
        `span:has-text("${this.targetUser}")`,
        `a:has-text("${this.targetUser}")`
      ];
      
      let userElement = null;
      
      for (const strategy of searchStrategies) {
        const elements = this.page.locator(strategy);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ ${this.targetUser} encontrada con estrategia: ${strategy}`);
          
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
        console.log(`❌ ${this.targetUser} no encontrada o no clickeable`);
        return false;
      }
      
      // Mostrar el texto del elemento encontrado
      const elementText = await userElement.innerText().catch(() => '');
      console.log(`📝 Texto del elemento encontrado: "${elementText}"`);
      
      // Verificar si tiene el mensaje específico sobre bra lines
      if (elementText.toLowerCase().includes(this.targetMessage)) {
        console.log(`🎯 ¡Mensaje sobre "${this.targetMessage}" detectado!`);
        
        // Hacer click en el elemento
        console.log(`🖱️ Haciendo click en ${this.targetUser}...`);
        await userElement.click();
        await SLEEP(3000);
        
        // Leer el mensaje completo
        const fullMessage = await this.readFullMessage();
        
        if (fullMessage) {
          console.log(`📨 Mensaje completo: "${fullMessage}"`);
          
          // Generar respuesta específica
          const response = this.generateBraLinesResponse(fullMessage);
          console.log(`💬 Respuesta generada: "${response}"`);
          
          // Enviar respuesta
          if (await this.sendMessage(response)) {
            console.log('✅ ¡Respuesta enviada exitosamente a misskathystanford!');
            return true;
          } else {
            console.log('❌ No se pudo enviar la respuesta');
            return false;
          }
        }
      } else {
        console.log(`⚠️ ${this.targetUser} encontrada pero sin mensaje sobre "${this.targetMessage}"`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error buscando ${this.targetUser}:`, error.message);
      return false;
    }
  }

  async readFullMessage() {
    console.log('📖 Leyendo mensaje completo...');
    
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
          
          // Buscar el mensaje que contenga "bra lines"
          for (let i = count - 1; i >= 0; i--) {
            const message = messages.nth(i);
            const messageText = await message.innerText().catch(() => '');
            
            if (messageText && messageText.toLowerCase().includes(this.targetMessage)) {
              console.log(`📨 Mensaje con "${this.targetMessage}" encontrado: "${messageText}"`);
              return messageText;
            }
          }
        }
      }
      
      console.log('📝 No se encontró mensaje específico sobre bra lines');
      return null;
      
    } catch (error) {
      console.error('❌ Error leyendo mensaje:', error.message);
      return null;
    }
  }

  generateBraLinesResponse(fullMessage) {
    console.log('🤖 Generando respuesta específica para bra lines...');
    
    const lowerMessage = fullMessage.toLowerCase();
    
    // Respuestas específicas para el mensaje sobre bra lines
    if (lowerMessage.includes('i can\'t stop thinking about having my own visible bra lines on display through my blouse')) {
      const responses = [
        "Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?",
        "Oh honey, that's such a sexy thought... 😊 The way your bra lines show through your blouse is incredibly alluring. It's like you're giving a little peek into what's underneath... 🌸 Are you planning to wear something special today?",
        "Baby, that's so hot... 🔥 The way your bra lines show through your blouse is such a turn-on. It's like you're teasing without even trying... 💕 What kind of bra are you thinking about wearing?"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Respuesta general para cualquier mensaje sobre bra lines
    const responses = [
      "Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?",
      "Oh honey, that's such a sexy thought... 😊 The way your bra lines show through your blouse is incredibly alluring. It's like you're giving a little peek into what's underneath... 🌸 Are you planning to wear something special today?",
      "Baby, that's so hot... 🔥 The way your bra lines show through your blouse is such a turn-on. It's like you're teasing without even trying... 💕 What kind of bra are you thinking about wearing?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
    console.log('🎯 INICIANDO RESPUESTA ESPECÍFICA A MISSKATHYSTANFORD...\n');
    
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
      
      if (await this.findAndAnalyzeMissKathystanford()) {
        console.log('🎉 ¡RESPUESTA ENVIADA EXITOSAMENTE A MISSKATHYSTANFORD!');
        return true;
      } else {
        console.log('❌ No se pudo responder a misskathystanford');
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
  const bot = new BotMissKathystanfordEspecifico();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, deteniendo...');
    await bot.close();
    process.exit(0);
  });
  
  try {
    await bot.respondToMissKathystanford();
  } catch (error) {
    console.error('❌ Error en main:', error.message);
    await bot.close();
  }
}

main();
