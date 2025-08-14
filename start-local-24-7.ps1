# Script para ejecutar Bot Niteflirt - Horny Madge 24/7 localmente
# Alternativa cuando no puedes usar servicios cloud

Write-Host "🚀 Iniciando Bot Niteflirt - Horny Madge 24/7 localmente" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "smart-human-bot-server.js")) {
    Write-Host "❌ Error: No se encuentra smart-human-bot-server.js" -ForegroundColor Red
    exit 1
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encuentra archivo .env" -ForegroundColor Yellow
    Write-Host "Creando archivo .env desde config.env.example..." -ForegroundColor Cyan
    if (Test-Path "config.env.example") {
        Copy-Item "config.env.example" ".env"
        Write-Host "✅ Archivo .env creado. Por favor, edítalo con tus credenciales reales" -ForegroundColor Green
        Write-Host "Después de editar .env, ejecuta este script nuevamente" -ForegroundColor Yellow
        exit 1
    }
}

# Instalar PM2 si no está instalado
try {
    $null = Get-Command pm2 -ErrorAction Stop
    Write-Host "✅ PM2 ya está instalado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando PM2..." -ForegroundColor Cyan
    npm install -g pm2
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
npm install

# Configurar PM2 para reinicio automático
Write-Host "⚙️  Configurando PM2 para reinicio automático..." -ForegroundColor Cyan

# Crear archivo de configuración PM2
$pm2Config = @"
{
  "apps": [{
    "name": "niteflirt-bot-horny-madge",
    "script": "smart-human-bot-server.js",
    "instances": 1,
    "autorestart": true,
    "watch": false,
    "max_memory_restart": "1G",
    "env": {
      "NODE_ENV": "production"
    },
    "error_file": "./logs/err.log",
    "out_file": "./logs/out.log",
    "log_file": "./logs/combined.log",
    "time": true
  }]
}
"@

$pm2Config | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Iniciar el bot con PM2
Write-Host "🚀 Iniciando bot con PM2..." -ForegroundColor Cyan
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar automáticamente al arrancar Windows
Write-Host "⚙️  Configurando inicio automático..." -ForegroundColor Cyan
pm2 startup
pm2 save

Write-Host ""
Write-Host "🎉 ¡Bot Horny Madge iniciado exitosamente!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   pm2 status          # Ver estado del bot" -ForegroundColor White
Write-Host "   pm2 logs            # Ver logs en tiempo real" -ForegroundColor White
Write-Host "   pm2 restart all     # Reiniciar bot" -ForegroundColor White
Write-Host "   pm2 stop all        # Detener bot" -ForegroundColor White
Write-Host "   pm2 delete all      # Eliminar bot de PM2" -ForegroundColor White
Write-Host ""
Write-Host "💡 El bot se reiniciará automáticamente si:" -ForegroundColor Yellow
Write-Host "   - Se cierra inesperadamente" -ForegroundColor White
Write-Host "   - Tu PC se reinicia" -ForegroundColor White
Write-Host "   - Hay errores" -ForegroundColor White
Write-Host ""
Write-Host "✅ Tu bot está funcionando 24/7 localmente! 💰🤖" -ForegroundColor Green
