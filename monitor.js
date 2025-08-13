#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Monitoreando el bot de Niteflirt...\n');

// Función para ejecutar un comando y mostrar logs en tiempo real
function runCommand(command, args, label) {
  const process = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  process.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('💬') || output.includes('📬') || output.includes('📧') || 
        output.includes('✅') || output.includes('❌') || output.includes('⚠️')) {
      console.log(`[${label}] ${output.trim()}`);
    }
  });

  process.stderr.on('data', (data) => {
    console.error(`[${label} ERROR] ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`[${label}] Proceso terminado con código ${code}`);
  });

  return process;
}

// Verificar si el backend está corriendo
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log('✅ Backend funcionando correctamente');
      return true;
    }
  } catch (error) {
    console.log('⚠️ Backend no responde, iniciando...');
    return false;
  }
}

// Función principal
async function main() {
  console.log('🤖 Iniciando monitoreo del bot...\n');
  
  // Verificar backend
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.log('🚀 Iniciando backend...');
    runCommand('node', ['src/backend.js'], 'Backend');
    
    // Esperar a que el backend se inicie
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('🤖 Iniciando bot...');
  const botProcess = runCommand('node', ['src/bot.js'], 'Bot');
  
  // Manejar cierre limpio
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo monitoreo...');
    botProcess.kill();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('❌ Error en monitoreo:', error);
  process.exit(1);
});
