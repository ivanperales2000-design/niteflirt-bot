#!/usr/bin/env node

const { chromium } = require('playwright');
require('dotenv').config();

const SLEEP = ms => new Promise(r => setTimeout(r, ms));

async function debugLogin() {
  console.log('🔍 Analizando página de login de Niteflirt...\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Ir a la página de login
    await page.goto('https://www.niteflirt.com/login', { waitUntil: 'domcontentloaded' });
    await SLEEP(3000);
    
    console.log('📄 Analizando elementos de la página...\n');
    
    // Buscar todos los inputs
    const inputs = await page.locator('input').all();
    console.log(`🔍 Encontrados ${inputs.length} campos de input:`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      
      console.log(`  Input ${i + 1}:`);
      console.log(`    Type: ${type}`);
      console.log(`    Name: ${name}`);
      console.log(`    ID: ${id}`);
      console.log(`    Placeholder: ${placeholder}`);
      console.log(`    Class: ${className}`);
      console.log('');
    }
    
    // Buscar formularios
    const forms = await page.locator('form').all();
    console.log(`📝 Encontrados ${forms.length} formularios:`);
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const action = await form.getAttribute('action');
      const method = await form.getAttribute('method');
      const className = await form.getAttribute('class');
      
      console.log(`  Form ${i + 1}:`);
      console.log(`    Action: ${action}`);
      console.log(`    Method: ${method}`);
      console.log(`    Class: ${className}`);
      console.log('');
    }
    
    // Buscar botones
    const buttons = await page.locator('button').all();
    console.log(`🔘 Encontrados ${buttons.length} botones:`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const type = await button.getAttribute('type');
      const text = await button.innerText();
      const className = await button.getAttribute('class');
      
      console.log(`  Button ${i + 1}:`);
      console.log(`    Type: ${type}`);
      console.log(`    Text: "${text}"`);
      console.log(`    Class: ${className}`);
      console.log('');
    }
    
    // Buscar elementos con texto relacionado con login
    const loginTexts = await page.locator('text=/login|sign|email|password|username/i').all();
    console.log(`📋 Encontrados ${loginTexts.length} elementos con texto de login:`);
    
    for (let i = 0; i < Math.min(loginTexts.length, 10); i++) {
      const element = loginTexts[i];
      const text = await element.innerText();
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const className = await element.getAttribute('class');
      
      console.log(`  Element ${i + 1}:`);
      console.log(`    Tag: ${tagName}`);
      console.log(`    Text: "${text}"`);
      console.log(`    Class: ${className}`);
      console.log('');
    }
    
    console.log('✅ Análisis completado. Revisa la información arriba para identificar los selectores correctos.');
    
  } catch (error) {
    console.error('❌ Error en el análisis:', error.message);
  } finally {
    console.log('🌐 Navegador mantenido abierto para inspección manual...');
  }
}

debugLogin();
