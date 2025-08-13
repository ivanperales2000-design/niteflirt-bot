#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

class SmartBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.currentChat = null;
  }

  async init() {
    console.log('🤖 Iniciando Smart Bot de Niteflirt...\n');
    
    try {
      // Cerrar cualquier proceso anterior
      await this.killPreviousProcesses();
      
      // Iniciar navegador
      this.browser = await chromium.launch({ 
        headless: false, 
        slowMo: 50,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      this.page = await context.newPage();
      
      // Configurar timeouts
      this.page.setDefaultTimeout(30000);
      this.page.setDefaultNavigationTimeout(30000);
      
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
    console.log('🔐 Iniciando proceso de login...');
    
    try {
      // Ir a la página de login
      await this.page.goto(S.urls.login, { waitUntil: 'domcontentloaded' });
      await SLEEP(2000);
      
      // Verificar si ya está logueado
      const alreadyLoggedIn = await this.page.locator(S.auth.loggedIn).count() > 0;
      if (alreadyLoggedIn) {
        console.log('✅ Ya está logueado');
        this.isLoggedIn = true;
        return true;
      }
      
      // Intentar login automático
      console.log('📧 Intentando login automático...');
      
      // Buscar campo de email
      const emailField = this.page.locator(S.auth.emailField);
      if (await emailField.count() > 0) {
        await emailField.first().fill(process.env.NF_EMAIL);
        console.log('✅ Email ingresado');
      } else {
        console.log('⚠️ No se encontró campo de email');
      }
      
      // Buscar campo de contraseña
      const passwordField = this.page.locator(S.auth.passwordField);
      if (await passwordField.count() > 0) {
        await passwordField.first().fill(process.env.NF_PASS);
        console.log('✅ Contraseña ingresada');
      } else {
        console.log('⚠️ No se encontró campo de contraseña');
      }
      
      // Buscar botón de login
      const loginButton = this.page.locator(S.auth.loginButton);
      if (await loginButton.count() > 0) {
        await loginButton.first().click();
        console.log('✅ Botón de login presionado');
        await SLEEP(3000);
      } else {
        console.log('⚠️ No se encontró botón de login');
      }
      
      // Esperar login manual si es necesario
      console.log('⏳ Esperando completar login...');
      await this.page.waitForSelector(S.auth.loggedIn, { timeout: 300000 });
      
      this.isLoggedIn = true;
      console.log('✅ Login completado exitosamente\n');
      return true;
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return false;
    }
  }

  async navigateToChat() {
    console.log('💬 Navegando a la sección de chat...');
    
    try {
      // Ir directamente a la URL de chat
      await this.page.goto(S.urls.chat, { waitUntil: 'networkidle' });
      await SLEEP(3000);
      
      // Verificar que estamos en la página correcta
      const chatElements = await this.page.locator(S.chat.threadList).count();
      if (chatElements > 0) {
        console.log('✅ Navegación al chat completada');
        return true;
      } else {
        console.log('⚠️ No se detectaron elementos de chat, intentando navegación manual...');
        
        // Intentar hacer clic en enlaces de navegación
        const inboxLink = this.page.locator(S.navigation.inboxLink);
        if (await inboxLink.count() > 0) {
          await inboxLink.first().click();
          await SLEEP(3000);
          console.log('✅ Navegación manual completada');
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error navegando al chat:', error.message);
      return false;
    }
  }

  async findAndOpenChat(targetUsername = null) {
    console.log(`🔍 Buscando chat${targetUsername ? ` de ${targetUsername}` : ' disponible'}...`);
    
    try {
      // Esperar a que carguen los chats
      await SLEEP(2000);
      
      // Buscar elementos de chat
      const threads = this.page.locator(S.chat.threadItem);
      const count = await threads.count();
      
      console.log(`📬 Encontrados ${count} chats disponibles`);
      
      if (count === 0) {
        console.log('❌ No se encontraron chats disponibles');
        return false;
      }
      
      let selectedThread = null;
      
      // Si se especifica un usuario, buscarlo
      if (targetUsername) {
        for (let i = 0; i < count; i++) {
          const thread = threads.nth(i);
          const threadText = await thread.innerText().catch(() => '');
          
          if (threadText.toLowerCase().includes(targetUsername.toLowerCase())) {
            console.log(`✅ Encontrado chat de ${targetUsername} en posición ${i + 1}`);
            selectedThread = thread;
            break;
          }
        }
      }
      
      // Si no se encontró el usuario específico o no se especificó, usar el primero
      if (!selectedThread) {
        selectedThread = threads.nth(0);
        const firstThreadText = await selectedThread.innerText().catch(() => '');
        console.log(`📬 Abriendo primer chat disponible: ${firstThreadText.slice(0, 50)}...`);
      }
      
      // Hacer clic en el chat
      await selectedThread.click();
      await SLEEP(2000);
      
      // Verificar que se abrió correctamente
      const messageInput = this.page.locator(S.chat.messageInput);
      if (await messageInput.count() > 0) {
        console.log('✅ Chat abierto correctamente');
        this.currentChat = selectedThread;
        return true;
      } else {
        console.log('❌ No se pudo abrir el chat');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error abriendo chat:', error.message);
      return false;
    }
  }

  async readLastMessage() {
    console.log('📖 Leyendo último mensaje...');
    
    try {
      const lastMessage = this.page.locator(S.chat.lastInboundMsg);
      let lastMessageText = '';
      
      if (await lastMessage.count() > 0) {
        lastMessageText = await lastMessage.last().innerText().catch(() => '');
        console.log(`📝 Último mensaje: "${lastMessageText.slice(0, 100)}..."`);
      } else {
        console.log('📝 No hay mensajes previos');
      }
      
      return lastMessageText;
      
    } catch (error) {
      console.error('❌ Error leyendo mensaje:', error.message);
      return '';
    }
  }

  async generateResponse(lastMessage, clientName = 'Cliente') {
    console.log('🧠 Generando respuesta con IA...');
    
    try {
      const payload = {
        userId: 'Natsuki',
        threadId: clientName,
        lastMsg: lastMessage || 'Hola, ¿cómo estás?',
        mode: 'normal'
      };
      
      const { data } = await axios.post(process.env.BACKEND_URL + '/api/reply', payload);
      const reply = data?.reply || '¡Hola! ¿Cómo estás hoy? 😊 Me encantaría charlar contigo! 💕';
      
      console.log(`💬 Respuesta generada: "${reply}"`);
      return reply;
      
    } catch (error) {
      console.error('❌ Error generando respuesta:', error.message);
      return '¡Hola! ¿Cómo estás hoy? 😊 Me encantaría charlar contigo! 💕';
    }
  }

  async sendMessage(message) {
    console.log('📤 Enviando mensaje...');
    
    try {
      // Buscar campo de entrada
      const input = this.page.locator(S.chat.messageInput).first();
      if (await input.count() === 0) {
        console.log('❌ No se encontró campo de entrada de mensaje');
        return false;
      }
      
      // Hacer clic en el campo
      await input.click();
      await SLEEP(500);
      
      // Escribir el mensaje con delays naturales
      console.log('✍️ Escribiendo mensaje...');
      for (const ch of message) {
        await input.type(ch, { delay: jitter(30, 80) });
      }
      
      await SLEEP(jitter(500, 1000));
      
      // Enviar el mensaje
      const sendButton = this.page.locator(S.chat.sendButton).first();
      if (await sendButton.count() > 0) {
        await sendButton.click();
      } else {
        await input.press('Enter');
      }
      
      console.log('✅ Mensaje enviado exitosamente!');
      
      // Esperar a que se envíe
      await SLEEP(2000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
      return false;
    }
  }

  async waitForResponse(timeout = 10000) {
    console.log('⏳ Esperando respuesta...');
    
    try {
      const startTime = Date.now();
      let lastMessageCount = await this.page.locator(S.chat.lastInboundMsg).count();
      
      while (Date.now() - startTime < timeout) {
        await SLEEP(1000);
        
        const currentMessageCount = await this.page.locator(S.chat.lastInboundMsg).count();
        if (currentMessageCount > lastMessageCount) {
          const newMessage = await this.page.locator(S.chat.lastInboundMsg).last().innerText().catch(() => '');
          console.log(`📨 Nueva respuesta recibida: "${newMessage.slice(0, 100)}..."`);
          return newMessage;
        }
      }
      
      console.log('⏰ Timeout esperando respuesta');
      return null;
      
    } catch (error) {
      console.error('❌ Error esperando respuesta:', error.message);
      return null;
    }
  }

  async contactClient(targetUsername = null) {
    console.log(`🎯 Iniciando contacto${targetUsername ? ` con ${targetUsername}` : ' con cliente'}...\n`);
    
    try {
      // 1. Inicializar
      if (!await this.init()) {
        return false;
      }
      
      // 2. Login
      if (!await this.login()) {
        return false;
      }
      
      // 3. Navegar al chat
      if (!await this.navigateToChat()) {
        return false;
      }
      
      // 4. Buscar y abrir chat
      if (!await this.findAndOpenChat(targetUsername)) {
        return false;
      }
      
      // 5. Leer último mensaje
      const lastMessage = await this.readLastMessage();
      
      // 6. Generar respuesta
      const response = await this.generateResponse(lastMessage, targetUsername || 'Cliente');
      
      // 7. Enviar mensaje
      if (await this.sendMessage(response)) {
        console.log('🎉 Mensaje enviado exitosamente!');
        
        // 8. Esperar respuesta opcional
        await this.waitForResponse(5000);
        
        console.log('\n✅ Proceso completado exitosamente!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error.message);
      return false;
    } finally {
      // No cerrar el navegador para que el usuario pueda ver el resultado
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
  const bot = new SmartBot();
  
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

module.exports = { SmartBot };
