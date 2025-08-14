#!/bin/bash

# Script de Despliegue 24/7 para Bot Niteflirt - Horny Madge
# Este script automatiza el proceso de despliegue en Railway

echo "🚀 Iniciando despliegue 24/7 del Bot Niteflirt - Horny Madge"
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "smart-human-bot-server.js" ]; then
    echo "❌ Error: No se encuentra smart-human-bot-server.js"
    echo "Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encuentra archivo .env"
    echo "Creando archivo .env desde config.env.example..."
    if [ -f "config.env.example" ]; then
        cp config.env.example .env
        echo "✅ Archivo .env creado. Por favor, edítalo con tus credenciales reales"
        echo "   - NF_EMAIL: Tu email de Niteflirt"
        echo "   - NF_PASS: Tu contraseña de Niteflirt"
        echo "   - OPENAI_API_KEY: Tu API key de OpenAI"
        echo ""
        echo "Después de editar .env, ejecuta este script nuevamente"
        exit 1
    else
        echo "❌ No se encuentra config.env.example"
        exit 1
    fi
fi

# Verificar que las variables críticas están configuradas
source .env
if [ -z "$NF_EMAIL" ] || [ "$NF_EMAIL" = "tu_email@ejemplo.com" ]; then
    echo "❌ Error: NF_EMAIL no está configurado correctamente en .env"
    exit 1
fi

if [ -z "$NF_PASS" ] || [ "$NF_PASS" = "tu_contraseña" ]; then
    echo "❌ Error: NF_PASS no está configurado correctamente en .env"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "tu_api_key_de_openai_aqui" ]; then
    echo "❌ Error: OPENAI_API_KEY no está configurado correctamente en .env"
    exit 1
fi

echo "✅ Configuración verificada correctamente"

# Inicializar git si no está inicializado
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    git add .
    git commit -m "Bot Niteflirt - Horny Madge 24/7"
    echo "✅ Repositorio Git inicializado"
fi

# Verificar si Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Login en Railway
echo "🔐 Iniciando sesión en Railway..."
railway login

# Crear proyecto en Railway
echo "🚀 Creando proyecto en Railway..."
railway init

# Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
railway variables set NF_EMAIL="$NF_EMAIL"
railway variables set NF_PASS="$NF_PASS"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set BOT_NAME="Horny Madge"
railway variables set BOT_PERSONALITY="seductive, playful, engaging"
railway variables set MAX_MESSAGE_LENGTH="800"
railway variables set CONVERSATION_MEMORY_SIZE="20"
railway variables set PROACTIVE_CHECK_INTERVAL="900000"
railway variables set MESSAGE_CHECK_INTERVAL="5000"
railway variables set RESTART_DELAY="30000"
railway variables set MAX_RESTARTS="10"

# Desplegar
echo "🚀 Desplegando bot en Railway..."
railway up

echo ""
echo "🎉 ¡Despliegue completado!"
echo "=================================================="
echo "✅ Tu bot 'Horny Madge' está funcionando 24/7 en Railway"
echo "📊 Para ver los logs: railway logs"
echo "🌐 Para abrir la aplicación: railway open"
echo "🛑 Para detener: railway down"
echo ""
echo "💡 El bot se reiniciará automáticamente si hay errores"
echo "💡 Los logs están disponibles 24/7 en Railway"
echo ""
echo "¡Tu bot está listo para maximizar tus ganancias! 💰"
