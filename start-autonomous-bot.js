#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Bot Autónomo 24/7...\n');

// Función para iniciar un proceso
function startProcess(command, args, name) {
  console.log(`📡 Iniciando ${name}...`);
  
  const process = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });
  
  process.on('error', (error) => {
    console.error(`❌ Error iniciando ${name}:`, error.message);
  });
  
  process.on('exit', (code) => {
    console.log(`⚠️ ${name} terminó con código: ${code}`);
  });
  
  return process;
}

// Función principal
async function main() {
  try {
    // Iniciar el backend primero
    console.log('🔧 Iniciando backend...');
    const backend = startProcess('node', ['src/backend.js'], 'Backend');
    
    // Esperar un poco para que el backend se inicie
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Iniciar el bot autónomo
    console.log('🤖 Iniciando bot autónomo...');
    const bot = startProcess('node', ['autonomous-chat-bot.js'], 'Bot Autónomo');
    
    // Manejar señales de terminación
    process.on('SIGINT', async () => {
      console.log('\n🛑 Deteniendo todos los procesos...');
      backend.kill('SIGINT');
      bot.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Deteniendo todos los procesos...');
      backend.kill('SIGTERM');
      bot.kill('SIGTERM');
      process.exit(0);
    });
    
    console.log('\n✅ Bot autónomo iniciado correctamente');
    console.log('🔄 Funcionando en modo 24/7...');
    console.log('💡 Presiona Ctrl+C para detener\n');
    
  } catch (error) {
    console.error('❌ Error iniciando bot autónomo:', error.message);
    process.exit(1);
  }
}

main();
