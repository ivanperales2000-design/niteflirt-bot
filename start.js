#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🤖 Iniciando Niteflirt Bot...\n');

// Función para ejecutar un proceso
function runProcess(command, args, name, color) {
  const process = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  process.on('error', (error) => {
    console.error(`❌ Error iniciando ${name}:`, error.message);
  });

  process.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} terminó con código ${code}`);
    }
  });

  return process;
}

// Función para verificar si el puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Puerto disponible
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Puerto en uso
    });
  });
}

// Función principal
async function main() {
  const PORT = process.env.PORT || 3000;
  
  // Verificar si el backend ya está corriendo
  const portInUse = await checkPort(PORT);
  
  if (portInUse) {
    console.log(`⚠️  Puerto ${PORT} ya está en uso. Asumiendo que el backend ya está corriendo.`);
  } else {
    console.log('🚀 Iniciando backend...');
    const backend = runProcess('node', ['src/backend.js'], 'Backend', 'blue');
    
    // Esperar un poco para que el backend se inicie
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('🤖 Iniciando bot...');
  const bot = runProcess('node', ['src/bot.js'], 'Bot', 'green');

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo bot...');
    bot.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo bot...');
    bot.kill('SIGTERM');
    process.exit(0);
  });
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
