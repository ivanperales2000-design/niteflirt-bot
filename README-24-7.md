# 🤖 Bot Niteflirt 24/7 - Guía de Despliegue Gratuito

## 🎯 **Opciones GRATUITAS para Funcionamiento 24/7**

### **1. 🌐 Railway (RECOMENDADO)**
**Costo**: **GRATIS** por 500 horas/mes
**Perfecto para**: Pruebas y uso inicial

#### **Pasos para Railway:**

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con GitHub

2. **Subir el código**
   ```bash
   # Crear repositorio en GitHub
   git init
   git add .
   git commit -m "Bot Niteflirt 24/7"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/niteflirt-bot.git
   git push -u origin main
   ```
     ```
     NF_EMAIL=tu_email@ejemplo.com
     NF_PASS=tu_contraseña
     BASE_URL=https://www.niteflirt.com
     BACKEND_URL=http://localhost:3000
     PORT=3000
     OPENAI_API_KEY=tu_api_key_de_openai_aqui
     BOT_NAME=Horny Madge
     BOT_PERSONALITY=seductive, playful, engaging
     MAX_MESSAGE_LENGTH=800
     CONVERSATION_MEMORY_SIZE=20
     PROACTIVE_CHECK_INTERVAL=900000
     MESSAGE_CHECK_INTERVAL=5000
     RESTART_DELAY=30000
     MAX_RESTARTS=10
     ```

5. **Desplegar**
   - Railway detectará automáticamente que es un proyecto Node.js
   - Usará el archivo `nixpacks.toml` para configurar Chrome
   - El bot se ejecutará automáticamente

### **2. ☁️ Render**
**Costo**: **GRATIS** por 750 horas/mes
**Perfecto para**: Proyectos pequeños

#### **Pasos para Render:**

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Regístrate

2. **Crear nuevo servicio**
   - "New Web Service"
   - Conecta tu repositorio de GitHub

3. **Configurar**
   - **Build Command**: `npm install`
   - **Start Command**: `node smart-human-bot-server.js`
   - **Environment Variables**: Igual que Railway

### **3. 🚀 Heroku**
**Costo**: **GRATIS** (con limitaciones)
**Perfecto para**: Pruebas iniciales

#### **Pasos para Heroku:**

1. **Instalar Heroku CLI**
   ```bash
   # Windows
   winget install --id=Heroku.HerokuCLI
   ```

2. **Crear aplicación**
   ```bash
   heroku login
   heroku create tu-bot-niteflirt
   ```

3. **Configurar**
   ```bash
   heroku config:set NF_EMAIL=tu_email@ejemplo.com
   heroku config:set NF_PASS=tu_contraseña
   heroku config:set OPENAI_API_KEY=tu_api_key_de_openai_aqui
   heroku config:set BOT_NAME="Horny Madge"
   heroku config:set BOT_PERSONALITY="seductive, playful, engaging"
   heroku config:set MAX_MESSAGE_LENGTH=800
   heroku config:set CONVERSATION_MEMORY_SIZE=20
   heroku config:set PROACTIVE_CHECK_INTERVAL=900000
   heroku config:set MESSAGE_CHECK_INTERVAL=5000
   heroku config:set RESTART_DELAY=30000
   heroku config:set MAX_RESTARTS=10
   ```

4. **Desplegar**
   ```bash
   git push heroku main
   ```

## 🔧 **Configuración del Bot para Servidores**

### **Archivos Creados:**

1. **`smart-human-bot-server.js`** - Bot optimizado para servidores
   - Modo headless (sin interfaz gráfica)
   - Reinicio automático en caso de errores
   - Configuración optimizada para servidores cloud

2. **`nixpacks.toml`** - Configuración para Railway
   - Instala Chrome automáticamente
   - Configura el entorno de Node.js

3. **`railway.json`** - Configuración específica de Railway
   - Política de reinicio automático
   - Configuración de replicas

## 📊 **Monitoreo y Logs**

### **Ver logs en Railway:**
- Ve a tu proyecto en Railway
- Pestaña "Deployments"
- Haz clic en el deployment activo
- Ve a "Logs"

### **Ver logs en Render:**
- Ve a tu servicio en Render
- Pestaña "Logs"

### **Ver logs en Heroku:**
```bash
heroku logs --tail
```

## 🎯 **Ventajas del Despliegue 24/7**

✅ **Funciona sin tu ordenador**
✅ **Reinicio automático si hay errores**
✅ **Logs disponibles 24/7**
✅ **Escalable según necesidades**
✅ **Monitoreo en tiempo real**

## 💰 **Costos Estimados**

| Plataforma | Plan Gratuito | Plan Pagado |
|------------|---------------|-------------|
| **Railway** | 500h/mes | $5/mes |
| **Render** | 750h/mes | $7/mes |
| **Heroku** | Limitado | $7/mes |

## 🚀 **Comandos Rápidos**

### **Para probar localmente antes de desplegar:**
```bash
node smart-human-bot-server.js
```

### **Para verificar que todo funciona:**
```bash
npm test
```

## 🔍 **Solución de Problemas**

### **Error: Chrome no se instala**
- Verifica que `nixpacks.toml` esté en el repositorio
- Railway instalará Chrome automáticamente

### **Error: Variables de entorno**
- Asegúrate de configurar todas las variables en la plataforma
- Verifica que no haya espacios extra

### **Error: Timeout**
- El bot tiene reinicio automático
- Revisa los logs para más detalles

## 📈 **Próximos Pasos**

1. **Elegir plataforma** (Recomiendo Railway)
2. **Crear repositorio en GitHub**
3. **Configurar variables de entorno**
4. **Desplegar**
5. **Monitorear logs**

## 🎉 **¡Resultado Final!**

Tu bot funcionará **24/7** sin necesidad de tener tu ordenador encendido, respondiendo automáticamente a mensajes y contactando clientes activos para maximizar tus ganancias.

**¿Te gustaría que te ayude con algún paso específico del despliegue?**
