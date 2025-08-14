# Script de Despliegue 24/7 para Bot Niteflirt - Horny Madge (Render)
# Alternativa a Railway para cuentas no verificadas

Write-Host "🚀 Iniciando despliegue 24/7 del Bot Niteflirt - Horny Madge en Render" -ForegroundColor Green
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

Write-Host "✅ Configuración verificada correctamente" -ForegroundColor Green

# Inicializar git si no está inicializado
if (-not (Test-Path ".git")) {
    Write-Host "📦 Inicializando repositorio Git..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Bot Niteflirt - Horny Madge 24/7"
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Pasos para desplegar en Render:" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ve a https://render.com y crea una cuenta" -ForegroundColor White
Write-Host "2. Haz clic en 'New Web Service'" -ForegroundColor White
Write-Host "3. Conecta tu repositorio de GitHub: https://github.com/ivanperales2000-design/niteflirt-bot.git" -ForegroundColor White
Write-Host "4. Configura el servicio:" -ForegroundColor White
Write-Host "   - Name: niteflirt-bot-horny-madge" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor White
Write-Host "   - Start Command: node smart-human-bot-server.js" -ForegroundColor White
Write-Host ""
Write-Host "5. En Environment Variables, añade:" -ForegroundColor White
Write-Host "   NF_EMAIL=tu_email_real" -ForegroundColor White
Write-Host "   NF_PASS=tu_contraseña_real" -ForegroundColor White
Write-Host "   OPENAI_API_KEY=tu_api_key" -ForegroundColor White
Write-Host "   BOT_NAME=Horny Madge" -ForegroundColor White
Write-Host "   BOT_PERSONALITY=seductive, playful, engaging" -ForegroundColor White
Write-Host ""
Write-Host "6. Haz clic en 'Create Web Service'" -ForegroundColor White
Write-Host ""
Write-Host "✅ Tu bot estará funcionando en 5-10 minutos!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Ventajas de Render:" -ForegroundColor Yellow
Write-Host "   - 750 horas/mes gratis (más que Railway)" -ForegroundColor White
Write-Host "   - No requiere verificación de GitHub" -ForegroundColor White
Write-Host "   - Muy estable y confiable" -ForegroundColor White
Write-Host ""
Write-Host "¡Tu bot Horny Madge estará funcionando 24/7! 💰🤖" -ForegroundColor Green
