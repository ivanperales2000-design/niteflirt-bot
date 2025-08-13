#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();
const S = require('./src/selectors');

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

async function testNavigation() {
  console.log('🧪 Iniciando prueba de navegación de Niteflirt...\n');
  
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
    
    // Probar navegación a cada sección
    const sections = ['dashboard', 'chat', 'mail', 'visitors', 'favorites', 'calls', 'profile'];
    
    for (const section of sections) {
      console.log(`🌐 Probando navegación a: ${section}`);
      
      try {
        await page.goto(S.urls[section], { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');
        
        // Verificar que la página cargó correctamente
        const title = await page.title();
        console.log(`   ✅ ${section}: ${title}`);
        
        // Verificar elementos específicos de cada sección
        await testSectionElements(page, section);
        
        await SLEEP(2000);
      } catch (error) {
        console.log(`   ❌ Error en ${section}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Prueba de navegación completada!');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  } finally {
    await browser.close();
  }
}

async function testSectionElements(page, section) {
  const selectors = S[section];
  if (!selectors) return;
  
  for (const [elementName, selector] of Object.entries(selectors)) {
    if (typeof selector === 'string') {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          console.log(`   🔍 ${elementName}: ${count} elementos encontrados`);
        }
      } catch (error) {
        // Ignorar errores de selectores
      }
    }
  }
}

// Función para probar análisis específico
async function testAnalysis() {
  console.log('\n🔍 Iniciando prueba de análisis...\n');
  
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
    
    console.log('⚠️ Por favor, completa el login manualmente...');
    await page.waitForSelector(S.auth.loggedIn, { timeout: 300000 });
    console.log('✅ Login completado\n');
    
    // Probar análisis de cada sección
    console.log('📊 Probando análisis de dashboard...');
    await page.goto(S.urls.dashboard, { waitUntil: 'domcontentloaded' });
    await testDashboardAnalysis(page);
    
    console.log('\n👥 Probando análisis de visitantes...');
    await page.goto(S.urls.visitors, { waitUntil: 'domcontentloaded' });
    await testVisitorsAnalysis(page);
    
    console.log('\n❤️ Probando análisis de favoritos...');
    await page.goto(S.urls.favorites, { waitUntil: 'domcontentloaded' });
    await testFavoritesAnalysis(page);
    
    console.log('\n📞 Probando análisis de llamadas...');
    await page.goto(S.urls.calls, { waitUntil: 'domcontentloaded' });
    await testCallsAnalysis(page);
    
    console.log('\n💬 Probando análisis de chat...');
    await page.goto(S.urls.chat, { waitUntil: 'domcontentloaded' });
    await testChatAnalysis(page);
    
    console.log('\n📧 Probando análisis de emails...');
    await page.goto(S.urls.mail, { waitUntil: 'domcontentloaded' });
    await testMailAnalysis(page);
    
    console.log('\n🎉 Prueba de análisis completada!');
    
  } catch (error) {
    console.error('❌ Error en prueba de análisis:', error.message);
  } finally {
    await browser.close();
  }
}

async function testDashboardAnalysis(page) {
  try {
    const stats = {};
    
    // Probar selectores de dashboard
    for (const [statName, selector] of Object.entries(S.dashboard)) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        const text = await element.first().innerText();
        stats[statName] = text;
        console.log(`   📊 ${statName}: ${text}`);
      }
    }
    
    return stats;
  } catch (error) {
    console.error('   ❌ Error analizando dashboard:', error.message);
    return {};
  }
}

async function testVisitorsAnalysis(page) {
  try {
    const visitors = [];
    const visitorItems = page.locator(S.visitors.visitorItem);
    const count = await visitorItems.count();
    
    console.log(`   👥 Total de visitantes encontrados: ${count}`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = visitorItems.nth(i);
      const visitor = {};
      
      for (const [fieldName, selector] of Object.entries(S.visitors)) {
        if (fieldName !== 'visitorItem') {
          const element = item.locator(selector);
          if (await element.count() > 0) {
            visitor[fieldName] = await element.first().innerText();
          }
        }
      }
      
      if (visitor.visitorName) {
        visitors.push(visitor);
        console.log(`   👤 ${visitor.visitorName} - ${visitor.visitDate || 'Sin fecha'}`);
      }
    }
    
    return visitors;
  } catch (error) {
    console.error('   ❌ Error analizando visitantes:', error.message);
    return [];
  }
}

async function testFavoritesAnalysis(page) {
  try {
    const favorites = [];
    const favoriteItems = page.locator(S.favorites.favoriteItem);
    const count = await favoriteItems.count();
    
    console.log(`   ❤️ Total de favoritos encontrados: ${count}`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = favoriteItems.nth(i);
      const favorite = {};
      
      for (const [fieldName, selector] of Object.entries(S.favorites)) {
        if (fieldName !== 'favoriteItem') {
          const element = item.locator(selector);
          if (await element.count() > 0) {
            favorite[fieldName] = await element.first().innerText();
          }
        }
      }
      
      if (favorite.favoriteName) {
        favorites.push(favorite);
        console.log(`   ❤️ ${favorite.favoriteName} - ${favorite.favoriteDate || 'Sin fecha'}`);
      }
    }
    
    return favorites;
  } catch (error) {
    console.error('   ❌ Error analizando favoritos:', error.message);
    return [];
  }
}

async function testCallsAnalysis(page) {
  try {
    const calls = [];
    const callItems = page.locator(S.calls.callItem);
    const count = await callItems.count();
    
    console.log(`   📞 Total de llamadas encontradas: ${count}`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const item = callItems.nth(i);
      const call = {};
      
      for (const [fieldName, selector] of Object.entries(S.calls)) {
        if (fieldName !== 'callItem') {
          const element = item.locator(selector);
          if (await element.count() > 0) {
            call[fieldName] = await element.first().innerText();
          }
        }
      }
      
      calls.push(call);
      const status = call.missedCall ? '❌ Perdida' : call.answeredCall ? '✅ Contestada' : '❓ Desconocida';
      console.log(`   📞 ${status} - ${call.callDuration || 'Sin duración'} - ${call.callDate || 'Sin fecha'}`);
    }
    
    return calls;
  } catch (error) {
    console.error('   ❌ Error analizando llamadas:', error.message);
    return [];
  }
}

async function testChatAnalysis(page) {
  try {
    const threads = page.locator(S.chat.threadItem);
    const count = await threads.count();
    
    console.log(`   💬 Total de hilos de chat encontrados: ${count}`);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const thread = threads.nth(i);
      const chat = {};
      
      // Verificar elementos de chat
      for (const [fieldName, selector] of Object.entries(S.chat)) {
        if (!['threadItem', 'threadList'].includes(fieldName)) {
          const element = thread.locator(selector);
          if (await element.count() > 0) {
            chat[fieldName] = true;
          }
        }
      }
      
      if (chat.clientName) {
        console.log(`   💬 Hilo ${i + 1}: ${chat.clientName ? 'Con nombre' : 'Sin nombre'} - ${chat.unreadBadgeOnThread ? 'No leído' : 'Leído'}`);
      }
    }
    
    return { threadCount: count };
  } catch (error) {
    console.error('   ❌ Error analizando chat:', error.message);
    return { threadCount: 0 };
  }
}

async function testMailAnalysis(page) {
  try {
    const emails = page.locator(S.mail.unreadRow);
    const count = await emails.count();
    
    console.log(`   📧 Total de emails no leídos encontrados: ${count}`);
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const email = emails.nth(i);
      const mail = {};
      
      // Verificar elementos de email
      for (const [fieldName, selector] of Object.entries(S.mail)) {
        if (!['unreadRow', 'mailList'].includes(fieldName)) {
          const element = email.locator(selector);
          if (await element.count() > 0) {
            mail[fieldName] = true;
          }
        }
      }
      
      console.log(`   📧 Email ${i + 1}: ${mail.emailSubject ? 'Con asunto' : 'Sin asunto'} - ${mail.emailSender ? 'Con remitente' : 'Sin remitente'}`);
    }
    
    return { unreadCount: count };
  } catch (error) {
    console.error('   ❌ Error analizando emails:', error.message);
    return { unreadCount: 0 };
  }
}

// Ejecutar pruebas
if (require.main === module) {
  const testType = process.argv[2] || 'navigation';
  
  if (testType === 'navigation') {
    testNavigation();
  } else if (testType === 'analysis') {
    testAnalysis();
  } else {
    console.log('Uso: node test-navigation.js [navigation|analysis]');
    console.log('  navigation: Prueba navegación básica');
    console.log('  analysis: Prueba análisis de secciones');
  }
}

module.exports = { testNavigation, testAnalysis };
