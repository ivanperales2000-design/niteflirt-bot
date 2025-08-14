# Script de Despliegue 24/7 para Bot Niteflirt - Horny Madge (Windows)
# Este script automatiza el proceso de despliegue en Railway

Write-Host "🚀 Iniciando despliegue 24/7 del Bot Niteflirt - Horny Madge" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "smart-human-bot-server.js")) {
    Write-Host "❌ Error: No se encuentra smart-human-bot-server.js" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encuentra archivo .env" -ForegroundColor Yellow
    Write-Host "Creando archivo .env desde config.env.example..." -ForegroundColor Cyan
    if (Test-Path "config.env.example") {
        Copy-Item "config.env.example" ".env"
        Write-Host "✅ Archivo .env creado. Por favor, edítalo con tus credenciales reales" -ForegroundColor Green
        Write-Host "   - NF_EMAIL: Tu email de Niteflirt" -ForegroundColor White
        Write-Host "   - NF_PASS: Tu contraseña de Niteflirt" -ForegroundColor White
        Write-Host "   - OPENAI_API_KEY: Tu API key de OpenAI" -ForegroundColor White
        Write-Host ""
        Write-Host "Después de editar .env, ejecuta este script nuevamente" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ No se encuentra config.env.example" -ForegroundColor Red
        exit 1
    }
}

# Verificar que las variables críticas están configuradas
$envContent = Get-Content ".env" | Where-Object { $_ -match "^NF_EMAIL=" }
$nfEmail = $envContent -replace "^NF_EMAIL=", ""

$envContent = Get-Content ".env" | Where-Object { $_ -match "^NF_PASS=" }
$nfPass = $envContent -replace "^NF_PASS=", ""

$envContent = Get-Content ".env" | Where-Object { $_ -match "^OPENAI_API_KEY=" }
$openaiKey = $envContent -replace "^OPENAI_API_KEY=", ""

if ($nfEmail -eq "tu_email@ejemplo.com" -or $nfEmail -eq "") {
    Write-Host "❌ Error: NF_EMAIL no está configurado correctamente en .env" -ForegroundColor Red
    exit 1
}

if ($nfPass -eq "tu_contraseña" -or $nfPass -eq "") {
    Write-Host "❌ Error: NF_PASS no está configurado correctamente en .env" -ForegroundColor Red
    exit 1
}

if ($openaiKey -eq "tu_api_key_de_openai_aqui" -or $openaiKey -eq "") {
    Write-Host "❌ Error: OPENAI_API_KEY no está configurado correctamente en .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuración verificada correctamente" -ForegroundColor Green

# Inicializar git si no está inicializado
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositorio Git..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Bot Niteflirt - Horny Madge 24/7"
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

# Verificar si Railway CLI está instalado
try {
    $null = Get-Command railway -ErrorAction Stop
    Write-Host "✅ Railway CLI ya está instalado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando Railway CLI..." -ForegroundColor Cyan
    npm install -g @railway/cli
}

# Login en Railway
Write-Host "🔐 Iniciando sesión en Railway..." -ForegroundColor Cyan
railway login

# Crear proyecto en Railway
Write-Host "🚀 Creando proyecto en Railway..." -ForegroundColor Cyan
railway init

# Configurar variables de entorno
Write-Host "⚙️  Configurando variables de entorno..." -ForegroundColor Cyan
railway variables set NF_EMAIL="$nfEmail"
railway variables set NF_PASS="$nfPass"
railway variables set OPENAI_API_KEY="$openaiKey"
railway variables set BOT_NAME="Horny Madge"
railway variables set BOT_PERSONALITY="seductive, playful, engaging"
railway variables set MAX_MESSAGE_LENGTH="800"
railway variables set CONVERSATION_MEMORY_SIZE="20"
railway variables set PROACTIVE_CHECK_INTERVAL="900000"
railway variables set MESSAGE_CHECK_INTERVAL="5000"
railway variables set RESTART_DELAY="30000"
railway variables set MAX_RESTARTS="10"

# Desplegar
Write-Host "🚀 Desplegando bot en Railway..." -ForegroundColor Cyan
railway up

Write-Host ""
Write-Host "🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Tu bot 'Horny Madge' está funcionando 24/7 en Railway" -ForegroundColor Green
Write-Host "📊 Para ver los logs: railway logs" -ForegroundColor White
Write-Host "🌐 Para abrir la aplicación: railway open" -ForegroundColor White
Write-Host "🛑 Para detener: railway down" -ForegroundColor White
Write-Host ""
Write-Host "💡 El bot se reiniciará automáticamente si hay errores" -ForegroundColor Yellow
Write-Host "💡 Los logs están disponibles 24/7 en Railway" -ForegroundColor Yellow
Write-Host ""
Write-Host "¡Tu bot está listo para maximizar tus ganancias! 💰" -ForegroundColor Green
