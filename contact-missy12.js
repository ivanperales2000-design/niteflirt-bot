#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');
const axios = require('axios');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;

async function contactMissy12() {
  console.log('🎯 Iniciando contacto directo con missy12...\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  
  try {
    // Login
    console.log('🔐 Iniciando login...');
    await page.goto(S.urls.login, { waitUntil: 'domcontentloaded' });
    await SLEEP(2000);
    
    // Login manual (el usuario debe completarlo)
    console.log('⚠️ Por favor, completa el login manualmente...');
    await page.waitForSelector(S.auth.loggedIn, { timeout: 300000 });
    console.log('✅ Login completado\n');
    
    // Ir directamente al chat
    console.log('💬 Navegando al chat...');
    await page.goto(S.urls.chat, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await SLEEP(2000);
    
    // Buscar el chat de missy12
    console.log('🔍 Buscando chat de missy12...');
    const threads = page.locator(S.chat.threadItem);
    const count = await threads.count();
    
    let missy12Found = false;
    let missy12Thread = null;
    
    for (let i = 0; i < count; i++) {
      const thread = threads.nth(i);
      const threadText = await thread.innerText().catch(() => '');
      
      if (threadText.toLowerCase().includes('missy12')) {
        console.log(`✅ Encontrado chat de missy12 en posición ${i + 1}`);
        missy12Thread = thread;
        missy12Found = true;
        break;
      }
    }
    
    if (!missy12Found) {
      console.log('❌ No se encontró el chat de missy12');
      console.log('🔍 Buscando cualquier chat disponible...');
      
      // Si no encuentra missy12, abrir el primer chat disponible
      if (count > 0) {
        missy12Thread = threads.nth(0);
        const firstThreadText = await missy12Thread.innerText().catch(() => '');
        console.log(`📬 Abriendo primer chat disponible: ${firstThreadText.slice(0, 50)}...`);
      }
    }
    
    if (missy12Thread) {
      // Hacer clic en el chat
      await missy12Thread.click();
      console.log('✅ Chat abierto');
      await SLEEP(2000);
      
      // Leer el último mensaje
      console.log('📖 Leyendo último mensaje...');
      const lastMessage = page.locator(S.chat.lastInboundMsg);
      let lastMessageText = '';
      
      if (await lastMessage.count() > 0) {
        lastMessageText = await lastMessage.last().innerText().catch(() => '');
        console.log(`📝 Último mensaje: "${lastMessageText.slice(0, 100)}..."`);
      } else {
        console.log('📝 No hay mensajes previos');
      }
      
      // Generar respuesta usando IA
      console.log('🧠 Generando respuesta con IA...');
      const payload = {
        userId: 'Natsuki',
        threadId: 'missy12',
        lastMsg: lastMessageText || 'Hola, ¿cómo estás?',
        mode: 'normal'
      };
      
      try {
        const { data } = await axios.post(process.env.BACKEND_URL + '/api/reply', payload);
        const reply = data?.reply || '¡Hola! ¿Cómo estás hoy? 😊';
        
        console.log(`💬 Respuesta generada: "${reply}"`);
        
        // Enviar la respuesta
        console.log('📤 Enviando mensaje...');
        const input = page.locator(S.chat.messageInput).first();
        await input.click();
        
        // Escribir el mensaje con delays naturales
        for (const ch of reply) {
          await input.type(ch, { delay: jitter(20, 90) });
        }
        
        await SLEEP(jitter(300, 900));
        
        // Enviar el mensaje
        const sendButton = page.locator(S.chat.sendButton).first();
        await sendButton.click().catch(() => input.press('Enter'));
        
        console.log('✅ Mensaje enviado exitosamente!');
        
        // Esperar un poco para ver la respuesta
        await SLEEP(3000);
        
        // Verificar si hay respuesta
        const newMessages = page.locator(S.chat.lastInboundMsg);
        if (await newMessages.count() > 0) {
          const newMessageText = await newMessages.last().innerText().catch(() => '');
          if (newMessageText !== lastMessageText) {
            console.log(`📨 Nueva respuesta recibida: "${newMessageText.slice(0, 100)}..."`);
          }
        }
        
      } catch (error) {
        console.error('❌ Error generando respuesta:', error.message);
        
        // Enviar mensaje de fallback
        const fallbackMessage = '¡Hola! ¿Cómo estás hoy? 😊 Me encantaría charlar contigo! 💕';
        console.log(`💬 Enviando mensaje de fallback: "${fallbackMessage}"`);
        
        const input = page.locator(S.chat.messageInput).first();
        await input.click();
        
        for (const ch of fallbackMessage) {
          await input.type(ch, { delay: jitter(20, 90) });
        }
        
        await SLEEP(jitter(300, 900));
        
        const sendButton = page.locator(S.chat.sendButton).first();
        await sendButton.click().catch(() => input.press('Enter'));
        
        console.log('✅ Mensaje de fallback enviado!');
      }
      
    } else {
      console.log('❌ No se encontró ningún chat disponible');
    }
    
    console.log('\n🎉 Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
  } finally {
    // No cerrar el navegador para que el usuario pueda ver el resultado
    console.log('🌐 Navegador mantenido abierto para inspección...');
  }
}

// Ejecutar el script
if (require.main === module) {
  contactMissy12();
}

module.exports = { contactMissy12 };
