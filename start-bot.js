#!/usr/bin/env node

const readline = require('readline');
const { AutoResponseBot } = require('./auto-response-bot');
const { AdvancedChatBot } = require('./advanced-chat-bot');
const { CompleteBot } = require('./complete-bot');
const { SmartHumanBot } = require('./smart-human-bot');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n🤖 === BOT DE NITEFLIRT === 🤖');
  console.log('================================');
  console.log('1. 🔄 Modo Respuesta Automática (Solo responde mensajes)');
  console.log('2. 📊 Modo Clientes Inactivos (Contacta clientes inactivos)');
  console.log('3. 🎯 Modo Completo (Todo integrado)');
  console.log('4. 🧠 Modo Inteligente y Humano (Recomendado)');
  console.log('5. ❌ Salir');
  console.log('================================');
}

async function startBot() {
  showMenu();
  
  rl.question('\n💡 Selecciona una opción (1-5): ', async (answer) => {
    try {
      switch (answer.trim()) {
        case '1':
          console.log('\n🔄 Iniciando modo Respuesta Automática...');
          console.log('📝 Este modo solo responde a mensajes entrantes como "Horny Madge"');
          const autoBot = new AutoResponseBot();
          await autoBot.startMonitoring();
          break;
          
        case '2':
          console.log('\n📊 Iniciando modo Clientes Inactivos...');
          console.log('📝 Este modo contacta clientes inactivos (5+ días)');
          const advancedBot = new AdvancedChatBot();
          await advancedBot.contactInactiveClients();
          break;
          
        case '3':
          console.log('\n🎯 Iniciando modo Completo...');
          console.log('📝 Este modo incluye:');
          console.log('   ✅ Respuesta automática a mensajes');
          console.log('   ✅ Contacto con clientes inactivos cada 30 min');
          console.log('   ✅ Monitoreo continuo');
          const completeBot = new CompleteBot();
          await completeBot.startCompleteMonitoring();
          break;
          
                 case '4':
           console.log('\n🧠 Iniciando modo Inteligente y Humano...');
           console.log('📝 Este modo incluye:');
           console.log('   ✅ Respuestas muy humanas y naturales');
           console.log('   ✅ Análisis del estado de ánimo del cliente');
           console.log('   ✅ Contacto proactivo con clientes activos (no missy)');
           console.log('   ✅ Conversaciones que se alargan al máximo');
           console.log('   ✅ Adaptación total a las necesidades del cliente');
           const smartBot = new SmartHumanBot();
           await smartBot.startSmartMonitoring();
           break;
           
         case '5':
           console.log('\n👋 ¡Hasta luego!');
           rl.close();
           process.exit(0);
           break;
           
         default:
           console.log('\n❌ Opción no válida. Por favor selecciona 1-5.');
           await startBot();
           break;
      }
    } catch (error) {
      console.error('❌ Error iniciando bot:', error.message);
      await startBot();
    }
  });
}

// Manejar interrupción del proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupción detectada, cerrando...');
  rl.close();
  process.exit(0);
});

// Iniciar el menú
startBot();
