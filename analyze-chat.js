#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

async function analyzeChatPage() {
  console.log('🔍 Analizando página de chat de Niteflirt...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    console.log('🔐 Iniciando login...');
    await page.goto(S.urls.login, { waitUntil: 'domcontentloaded' });
    await SLEEP(3000);
    
    const emailField = page.locator('#outlined-basic-login');
    if (await emailField.count() > 0) {
      await emailField.click();
      await emailField.fill('');
      await emailField.type(process.env.NF_EMAIL, { delay: 100 });
      console.log('✅ Email ingresado');
    }
    
    await SLEEP(1000);
    
    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.count() > 0) {
      await passwordField.first().click();
      await passwordField.first().fill('');
      await passwordField.first().type(process.env.NF_PASS, { delay: 100 });
      console.log('✅ Contraseña ingresada');
    }
    
    await SLEEP(1000);
    
    const loginButton = page.locator('button:has-text("Sign In")');
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      console.log('✅ Login completado');
    }
    
    await SLEEP(5000);
    
    // Navegar al chat
    console.log('💬 Navegando al chat...');
    await page.goto('https://www.niteflirt.com/dashboard', { waitUntil: 'networkidle' });
    await SLEEP(3000);
    
    const chatLink = page.locator('a:has-text("Chat")');
    if (await chatLink.count() > 0) {
      await chatLink.first().click();
      console.log('✅ Navegación al chat completada');
    }
    
    await SLEEP(5000);
    
    // Analizar la página
    console.log('🔍 Analizando estructura de la página...\n');
    
    // 1. Analizar todos los elementos clickeables
    console.log('📊 Elementos clickeables:');
    const clickableElements = await page.locator('button, a, [role="button"], [tabindex]').all();
    console.log(`Total de elementos clickeables: ${clickableElements.length}`);
    
    for (let i = 0; i < Math.min(20, clickableElements.length); i++) {
      const element = clickableElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.innerText().catch(() => '');
      const className = await element.getAttribute('class').catch(() => '');
      console.log(`${i + 1}. ${tagName} - "${text.slice(0, 50)}" - class: "${className}"`);
    }
    
    console.log('\n📋 Elementos con texto relacionado con chat:');
    const chatTextElements = await page.locator('text=/chat|message|conversation|thread|user|client/i').all();
    console.log(`Total de elementos con texto de chat: ${chatTextElements.length}`);
    
    for (let i = 0; i < Math.min(10, chatTextElements.length); i++) {
      const element = chatTextElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.innerText().catch(() => '');
      const className = await element.getAttribute('class').catch(() => '');
      console.log(`${i + 1}. ${tagName} - "${text.slice(0, 100)}" - class: "${className}"`);
    }
    
    console.log('\n🎯 Elementos con clases específicas:');
    const specificClasses = [
      '.MuiListItem-root',
      '.MuiListItemButton-root',
      '.chat-item',
      '.message-item',
      '.conversation-item',
      '.thread-item',
      '.user-item'
    ];
    
    for (const className of specificClasses) {
      const elements = page.locator(className);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ ${className}: ${count} elementos encontrados`);
        const firstElement = elements.first();
        const text = await firstElement.innerText().catch(() => '');
        console.log(`   Primer elemento: "${text.slice(0, 100)}"`);
      } else {
        console.log(`❌ ${className}: 0 elementos encontrados`);
      }
    }
    
    console.log('\n🔍 Elementos con atributos específicos:');
    const specificAttributes = [
      '[data-testid*="chat"]',
      '[data-testid*="message"]',
      '[data-testid*="user"]',
      '[role="listitem"]',
      '[role="button"]'
    ];
    
    for (const attr of specificAttributes) {
      const elements = page.locator(attr);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ ${attr}: ${count} elementos encontrados`);
        const firstElement = elements.first();
        const text = await firstElement.innerText().catch(() => '');
        console.log(`   Primer elemento: "${text.slice(0, 100)}"`);
      } else {
        console.log(`❌ ${attr}: 0 elementos encontrados`);
      }
    }
    
    console.log('\n🌐 URL actual:', page.url());
    console.log('📄 Título de la página:', await page.title());
    
    console.log('\n✅ Análisis completado. Navegador mantenido abierto para inspección manual...');
    
  } catch (error) {
    console.error('❌ Error en el análisis:', error.message);
  }
}

analyzeChatPage();
