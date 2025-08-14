#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const SLEEP = ms => new Promise(r => setTimeout(r, ms));

class ExploreChatPage {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🧠 Iniciando explorador de página de chat...\n');
    
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

  async explorePage() {
    console.log('🔍 Explorando la página de chat...');
    
    try {
      await SLEEP(3000);
      
      // Obtener la URL actual
      const currentUrl = this.page.url();
      console.log(`🌐 URL actual: ${currentUrl}`);
      
      // Buscar todos los elementos clickeables
      const clickableSelectors = [
        'a[href]',
        'button',
        'div[role="button"]',
        '.MuiListItemButton-root',
        '.MuiListItem-root',
        '[data-testid]',
        '.nav-item',
        '.menu-item'
      ];
      
      console.log('\n📋 Elementos clickeables encontrados:');
      
      for (const selector of clickableSelectors) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`\n🔍 Selector: ${selector} (${count} elementos)`);
          
          // Mostrar los primeros 10 elementos
          const maxElements = Math.min(count, 10);
          for (let i = 0; i < maxElements; i++) {
            const element = elements.nth(i);
            const text = await element.innerText().catch(() => '');
            const href = await element.getAttribute('href').catch(() => '');
            
            if (text.trim()) {
              console.log(`  ${i + 1}. "${text}" ${href ? `(${href})` : ''}`);
            }
          }
          
          if (count > 10) {
            console.log(`  ... y ${count - 10} elementos más`);
          }
        }
      }
      
      // Buscar elementos específicos que podrían ser chats
      console.log('\n💬 Buscando elementos de chat específicos:');
      
      const chatSelectors = [
        '.chat-list',
        '.conversation-list',
        '.thread-list',
        '.message-list',
        '.user-list',
        '.contact-list',
        '[data-testid*="chat"]',
        '[data-testid*="message"]',
        '[data-testid*="thread"]',
        '.sidebar',
        '.chat-sidebar',
        '.conversation-sidebar'
      ];
      
      for (const selector of chatSelectors) {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ Encontrado: ${selector} (${count} elementos)`);
          
          // Mostrar contenido
          for (let i = 0; i < Math.min(count, 5); i++) {
            const element = elements.nth(i);
            const text = await element.innerText().catch(() => '');
            if (text.trim()) {
              console.log(`  ${i + 1}. "${text.substring(0, 100)}..."`);
            }
          }
        }
      }
      
      // Buscar elementos que contengan "misskathystanford" o similares
      console.log('\n🔍 Buscando elementos que contengan "misskathystanford":');
      
      const allTextElements = this.page.locator('*');
      const allText = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .map(el => el.textContent)
          .filter(text => text && text.trim().length > 0)
          .join(' ');
      });
      
      if (allText.toLowerCase().includes('misskathystanford')) {
        console.log('✅ ¡Encontrado "misskathystanford" en el texto de la página!');
        
        // Buscar el elemento específico
        const elements = this.page.locator('*:has-text("misskathystanford")');
        const count = await elements.count();
        console.log(`📊 Encontrados ${count} elementos que contienen "misskathystanford"`);
        
        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = elements.nth(i);
          const text = await element.innerText().catch(() => '');
          console.log(`  ${i + 1}. "${text}"`);
        }
      } else {
        console.log('❌ No se encontró "misskathystanford" en el texto de la página');
      }
      
      // Buscar elementos que contengan "miss" o "kathy"
      console.log('\n🔍 Buscando elementos que contengan "miss" o "kathy":');
      
      const missElements = this.page.locator('*:has-text("miss")');
      const missCount = await missElements.count();
      console.log(`📊 Encontrados ${missCount} elementos que contienen "miss"`);
      
      const kathyElements = this.page.locator('*:has-text("kathy")');
      const kathyCount = await kathyElements.count();
      console.log(`📊 Encontrados ${kathyCount} elementos que contienen "kathy"`);
      
      // Mostrar algunos ejemplos
      for (let i = 0; i < Math.min(missCount, 3); i++) {
        const element = missElements.nth(i);
        const text = await element.innerText().catch(() => '');
        if (text.trim()) {
          console.log(`  miss ${i + 1}. "${text.substring(0, 100)}..."`);
        }
      }
      
      for (let i = 0; i < Math.min(kathyCount, 3); i++) {
        const element = kathyElements.nth(i);
        const text = await element.innerText().catch(() => '');
        if (text.trim()) {
          console.log(`  kathy ${i + 1}. "${text.substring(0, 100)}..."`);
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error explorando página:', error.message);
      return false;
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
  const explorer = new ExploreChatPage();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Interrupción detectada, cerrando...');
    await explorer.close();
    process.exit(0);
  });
  
  try {
    if (!await explorer.init()) {
      return;
    }
    
    if (!await explorer.login()) {
      console.log('❌ Error en login');
      return;
    }
    
    if (!await explorer.navigateToChat()) {
      console.log('❌ Error navegando al chat');
      return;
    }
    
    await explorer.explorePage();
    
    console.log('\n🌐 Navegador mantenido abierto para inspección manual...');
    console.log('💡 Puedes explorar manualmente la página para encontrar misskathystanford');
    
  } catch (error) {
    console.error('❌ Error en main:', error.message);
  }
}

main();
