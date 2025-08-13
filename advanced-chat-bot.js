#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

class AdvancedChatBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.conversationMemory = new Map(); // Memoria de conversaciones
    this.lastActivityCheck = new Date();
  }

  async init() {
    console.log('🤖 Iniciando Advanced Chat Bot de Niteflirt...\n');
    
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

  async analyzeClientList() {
    console.log('📊 Analizando lista de clientes...');
    
    try {
      await SLEEP(3000);
      
      // Buscar elementos de usuario en la lista
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
        console.log('❌ No se encontraron usuarios');
        return [];
      }
      
      const count = await users.count();
      console.log(`👥 Encontrados ${count} usuarios en la lista`);
      
      const clientAnalysis = [];
      
      // Analizar cada usuario
      for (let i = 0; i < count; i++) {
        try {
          const user = users.nth(i);
          const userText = await user.innerText().catch(() => '');
          
          // Extraer información del usuario
          const analysis = this.parseUserInfo(userText, i);
          clientAnalysis.push(analysis);
          
          console.log(`📋 Usuario ${i + 1}: ${analysis.name} - ${analysis.status} - ${analysis.lastActivity}`);
          
        } catch (error) {
          console.log(`⚠️ Error analizando usuario ${i + 1}:`, error.message);
        }
      }
      
      return clientAnalysis;
      
    } catch (error) {
      console.error('❌ Error analizando lista de clientes:', error.message);
      return [];
    }
  }

  parseUserInfo(userText, index) {
    // Parsear información del usuario desde el texto
    const lines = userText.split('\n').filter(line => line.trim());
    
    let name = `Usuario ${index + 1}`;
    let status = 'Desconocido';
    let lastActivity = 'Desconocido';
    let isInactive = false;
    
    // Buscar patrones en el texto
    if (lines.length > 0) {
      name = lines[0].trim();
      
      // Buscar indicadores de inactividad
      const inactivityPatterns = [
        /(\d+)\s*días?\s*sin\s*actividad/i,
        /(\d+)\s*days?\s*inactive/i,
        /(\d+)\s*días?\s*desconectado/i,
        /(\d+)\s*days?\s*offline/i
      ];
      
      for (const pattern of inactivityPatterns) {
        const match = userText.match(pattern);
        if (match) {
          const days = parseInt(match[1]);
          lastActivity = `${days} días inactivo`;
          isInactive = days >= 5; // 5 o más días de inactividad
          break;
        }
      }
      
      // Buscar indicadores de estado
      if (userText.toLowerCase().includes('online') || userText.toLowerCase().includes('conectado')) {
        status = 'Online';
      } else if (userText.toLowerCase().includes('offline') || userText.toLowerCase().includes('desconectado')) {
        status = 'Offline';
      } else if (isInactive) {
        status = 'Inactivo';
      }
    }
    
    return {
      name,
      status,
      lastActivity,
      isInactive,
      index,
      userText
    };
  }

  async findAndSelectUser(targetUsername = null) {
    console.log(`🔍 Buscando usuario${targetUsername ? ` ${targetUsername}` : ' en la lista'}...`);
    
    try {
      await SLEEP(3000);
      
      // Buscar elementos de usuario en la lista
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
        console.log('❌ No se encontraron usuarios');
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
      
      let chatHistory = [];
      if (messages) {
        const count = await messages.count();
        console.log(`📝 Encontrados ${count} mensajes en el historial`);
        
        // Leer los últimos 5 mensajes para contexto
        const lastMessages = Math.min(5, count);
        for (let i = count - lastMessages; i < count; i++) {
          const message = messages.nth(i);
          const messageText = await message.innerText().catch(() => '');
          chatHistory.push(messageText);
        }
        
        console.log(`📝 Últimos mensajes leídos: ${chatHistory.length} mensajes`);
      } else {
        console.log('📝 No hay mensajes previos en el chat');
      }
      
      return chatHistory;
      
    } catch (error) {
      console.error('❌ Error leyendo historial:', error.message);
      return [];
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

  async generateContextualMessage(clientName = 'Cliente', chatHistory = [], language = 'english', isInactive = false) {
    console.log('🧠 Generando mensaje contextual...');
    
    try {
      let messages = [];
      
      if (isInactive) {
        // Mensajes para clientes inactivos
        if (language === 'spanish') {
          messages = [
            `¡Hola ${clientName}! 😊 ¿Dónde te habías metido? Me había extrañado no saber de ti 💕`,
            `Hey ${clientName}! 🌟 ¡Qué bueno verte de vuelta! ¿Cómo has estado? 😘`,
            `¡Hola ${clientName}! 💖 ¡Te extrañaba! ¿Qué tal todo por tu lado? ✨`,
            `Hey ${clientName}! 💫 ¡Bienvenido de vuelta! ¿Cómo va todo contigo? 😊`,
            `¡Hola ${clientName}! 🌸 ¡Me alegra verte de nuevo! ¿Qué tal tu día? 💕`
          ];
        } else {
          messages = [
            `Hey ${clientName}! 😊 Where have you been? I missed hearing from you! 💕`,
            `Hi ${clientName}! 🌟 Great to see you back! How have you been? 😘`,
            `Hey ${clientName}! 💖 I missed you! How's everything going? ✨`,
            `Hi ${clientName}! 💫 Welcome back! How are you doing? 😊`,
            `Hey ${clientName}! 🌸 So glad to see you again! How's your day? 💕`
          ];
        }
      } else if (chatHistory.length > 0) {
        // Mensajes contextuales basados en la conversación
        const lastMessage = chatHistory[chatHistory.length - 1];
        const language = await this.detectLanguage(lastMessage);
        
        if (language === 'spanish') {
          messages = [
            `¡Hola ${clientName}! 😊 ¿Qué tal va todo?`,
            `Hey ${clientName}! 🌟 ¿Cómo estás?`,
            `¡Hola ${clientName}! 💕 ¿Qué tal tu día?`,
            `Hey ${clientName}! ✨ ¿Cómo va todo?`,
            `¡Hola ${clientName}! 😘 ¿Qué tal?`
          ];
        } else {
          messages = [
            `Hey ${clientName}! 😊 How are you doing?`,
            `Hi ${clientName}! 🌟 How's it going?`,
            `Hey ${clientName}! 💕 How's your day?`,
            `Hi ${clientName}! ✨ How are you?`,
            `Hey ${clientName}! 😘 What's up?`
          ];
        }
      } else {
        // Mensajes proactivos para nuevos contactos
        if (language === 'spanish') {
          messages = [
            `¡Hola ${clientName}! 😊 ¿Qué tal va todo? Me encantaría charlar contigo 💕`,
            `Hey ${clientName}! 🌟 ¿Cómo estás? ¿Qué tal tu día? 😘`,
            `¡Hola ${clientName}! 💖 ¿Cómo va todo? Me gustaría saber más sobre ti ✨`,
            `Hey ${clientName}! 💫 ¿Qué tal? ¿Hay algo interesante que quieras compartir? 😊`,
            `¡Hola ${clientName}! 🌸 ¿Cómo estás hoy? Me encantaría conectar contigo 💕`
          ];
        } else {
          messages = [
            `Hey ${clientName}! 😊 How are you doing? I'd love to chat with you! 💕`,
            `Hi ${clientName}! 🌟 How are you? How's your day going? 😘`,
            `Hey ${clientName}! 💖 How's everything? I'd like to know more about you ✨`,
            `Hi ${clientName}! 💫 What's up? Anything interesting you'd like to share? 😊`,
            `Hey ${clientName}! 🌸 How are you today? I'd love to connect with you 💕`
          ];
        }
      }
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      console.log(`💬 Mensaje contextual generado (${language}): "${randomMessage}"`);
      return randomMessage;
      
    } catch (error) {
      console.error('❌ Error generando mensaje contextual:', error.message);
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

  async contactInactiveClients() {
    console.log('🎯 Iniciando contacto con clientes inactivos...\n');
    
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
      
      // 4. Analizar lista de clientes
      const clientAnalysis = await this.analyzeClientList();
      
      // 5. Filtrar clientes inactivos
      const inactiveClients = clientAnalysis.filter(client => client.isInactive);
      console.log(`📊 Encontrados ${inactiveClients.length} clientes inactivos`);
      
      if (inactiveClients.length === 0) {
        console.log('✅ No hay clientes inactivos para contactar');
        return true;
      }
      
      // 6. Contactar a los primeros 2 clientes inactivos
      const clientsToContact = inactiveClients.slice(0, 2);
      
      for (const client of clientsToContact) {
        console.log(`\n🎯 Contactando a ${client.name} (${client.lastActivity})...`);
        
        // Seleccionar usuario
        if (!await this.findAndSelectUser(client.name)) {
          console.log(`⚠️ No se pudo seleccionar ${client.name}, continuando...`);
          continue;
        }
        
        // Esperar a que se abra el chat
        if (!await this.waitForChatToOpen()) {
          console.log(`⚠️ No se pudo abrir chat de ${client.name}, continuando...`);
          continue;
        }
        
        // Leer historial del chat
        const chatHistory = await this.readChatHistory();
        
        // Detectar idioma
        const language = await this.detectLanguage(chatHistory.join(' '));
        console.log(`🌍 Idioma detectado: ${language}`);
        
        // Generar mensaje contextual
        const contextualMessage = await this.generateContextualMessage(
          client.name, 
          chatHistory, 
          language, 
          true // isInactive
        );
        
        // Enviar mensaje
        if (await this.sendMessage(contextualMessage)) {
          console.log(`🎉 Mensaje enviado exitosamente a ${client.name}!`);
          
          // Guardar en memoria de conversación
          this.conversationMemory.set(client.name, {
            lastMessage: contextualMessage,
            lastActivity: new Date(),
            chatHistory: chatHistory
          });
        }
        
        // Esperar antes del siguiente cliente
        await SLEEP(3000);
      }
      
      console.log('\n✅ Proceso de contacto con clientes inactivos completado!');
      return true;
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error.message);
      return false;
    } finally {
      console.log('🌐 Navegador mantenido abierto para inspección...');
    }
  }

  async contactSpecificClient(targetUsername = null) {
    console.log(`🎯 Iniciando contacto específico${targetUsername ? ` con ${targetUsername}` : ' con cliente'}...\n`);
    
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
      const language = await this.detectLanguage(chatHistory.join(' '));
      console.log(`🌍 Idioma detectado: ${language}`);
      
      // 8. Generar mensaje contextual
      const contextualMessage = await this.generateContextualMessage(
        targetUsername || 'Cliente', 
        chatHistory, 
        language, 
        false
      );
      
      // 9. Enviar mensaje
      if (await this.sendMessage(contextualMessage)) {
        console.log('🎉 Mensaje contextual enviado exitosamente!');
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
  const bot = new AdvancedChatBot();
  
  try {
    // Opción 1: Contactar clientes inactivos
    console.log('🎯 Ejecutando contacto con clientes inactivos...');
    await bot.contactInactiveClients();
    
    // Opción 2: Contactar cliente específico (descomenta si quieres usar)
    // console.log('🎯 Ejecutando contacto específico con missy12...');
    // await bot.contactSpecificClient('missy12');
    
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { AdvancedChatBot };
