# 🤖 Bot Niteflirt - Horny Madge 24/7

Un bot inteligente y autónomo para Niteflirt que funciona 24/7, responde chats automáticamente y maximiza ganancias con respuestas humanas y naturales. Diseñado para funcionar sin supervisión y generar ingresos automáticamente.

## 🎯 **Nuevas Funcionalidades - Bot Horny Madge**

### **🌟 Personalidad Actualizada**
- **Nombre**: "Horny Madge" - Personalidad seductora y atractiva
- **Estilo**: Más humano, menos emojis, respuestas naturales
- **Enfoque**: Siempre incita a la conversación para maximizar ganancias
- **Adaptación**: Se adapta al idioma y necesidades de cada cliente

### **💰 Optimización para Ganancias**
- **Respuestas que generan más mensajes** - Siempre hace preguntas
- **Contacto proactivo** cada 15 minutos con clientes activos
- **Reenganche inteligente** de clientes inactivos
- **Análisis de cliente** para respuestas personalizadas
- **Sistema de memoria** para mantener contexto de conversación

### **🚀 Funcionamiento 24/7**
- **Despliegue automático** en Railway/Render/Heroku
- **Reinicio automático** en caso de errores
- **Monitoreo continuo** sin supervisión
- **Logs en tiempo real** disponibles 24/7
- **Configuración optimizada** para servidores cloud

## ✨ Características Principales

### 💬 Chat Inteligente - Horny Madge
- **Respuesta automática** a mensajes de chat con personalidad "Horny Madge"
- **Detección de idioma** automática (Español/Inglés)
- **Respuestas que incitan a más mensajes** - Siempre hace preguntas
- **Adaptación personalizada** según el estado de ánimo del cliente
- **Memoria de conversación** para mantener contexto
- **Prevención de duplicados** para evitar respuestas repetidas
- **Contacto proactivo** cada 15 minutos con clientes activos

### 📧 Manejo de Emails
- **Respuesta automática** a emails no leídos
- **Análisis de contenido** del email
- **Respuestas profesionales** pero amigables
- **Integración con el sistema de chat**

### 🔄 Sistema de Reenganche
- **Mensajes automáticos** a clientes inactivos
- **Múltiples niveles** de reenganche (5min, 45min, 24h)
- **Mensajes personalizados** según el perfil del cliente
- **Prevención de spam** con límites inteligentes

### 🎯 Adaptación Inteligente
- **Detección de necesidades** del cliente
- **Análisis de estado de ánimo** (triste, feliz, enojado)
- **Identificación de intereses** (romántico, conversación, llamadas)
- **Respuestas contextuales** y personalizadas

## 🚀 Despliegue 24/7 (Recomendado)

### **Despliegue Automático en Railway**
```bash
# Ejecutar script de despliegue automático
.\deploy-24-7.ps1
```

**El script hace todo automáticamente:**
- ✅ Configura Railway
- ✅ Sube tu código a GitHub
- ✅ Configura variables de entorno
- ✅ Despliega el bot 24/7

### **Plataformas de Despliegue Gratuitas**
- **Railway**: 500 horas/mes gratis
- **Render**: 750 horas/mes gratis
- **Heroku**: Plan gratuito limitado

### **Ventajas del Despliegue 24/7**
- ✅ **Funciona sin tu ordenador** encendido
- ✅ **Reinicio automático** si hay errores
- ✅ **Logs disponibles** 24/7
- ✅ **Monitoreo en tiempo real**
- ✅ **Maximiza ganancias** automáticamente

---

## 📦 Instalación Local
```bash
git clone <repository-url>
cd niteflirt-bot
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto:
```env
# Credenciales de Niteflirt
NF_EMAIL=tu_email@ejemplo.com
NF_PASS=tu_contraseña

# Configuración de la API
OPENAI_API_KEY=tu_api_key_de_openai
BACKEND_URL=http://localhost:3000
BASE_URL=https://www.niteflirt.com

# Configuración del bot Horny Madge
BOT_NAME=Horny Madge
BOT_PERSONALITY=seductive, playful, engaging
MAX_MESSAGE_LENGTH=800
CONVERSATION_MEMORY_SIZE=20

# Configuración de monitoreo 24/7
PROACTIVE_CHECK_INTERVAL=900000
MESSAGE_CHECK_INTERVAL=5000
RESTART_DELAY=30000
MAX_RESTARTS=10

# Puerto del backend (opcional)
PORT=3000
```

## 🎮 Uso

### Inicio Rápido (Recomendado)
```bash
npm start
```

### Inicio Manual
```bash
# Terminal 1: Iniciar el backend
node src/backend.js

# Terminal 2: Iniciar el bot
node src/bot.js
```

### Scripts Disponibles
```bash
npm start          # Bot principal (ultimate-bot.js)
npm run server     # Bot optimizado para servidores 24/7
npm run deploy     # Bot para despliegue en cloud
npm run autonomous # Bot autónomo 24/7
npm run monitor    # Monitoreo en tiempo real
npm test           # Pruebas básicas
npm run dev        # Modo desarrollo
```

## ⚙️ Configuración

El bot es altamente configurable a través del archivo `src/config.js`. Puedes copiar `config.example.js` como `config.js` y personalizarlo:

```bash
cp config.example.js src/config.js
```

### Personalidad
```javascript
personality: {
  name: "Natsuki",
  style: "anime",
  tone: "playful_sweet_suggestive",
  language: "en", // en, es, auto
  responseLength: "2-5_sentences",
  endWithQuestion: true
}
```

### Timing
```javascript
timing: {
  chatCheckInterval: 5000, // 5 segundos
  emailCheckInterval: 30000, // 30 segundos
  reengageInterval: 60000, // 1 minuto
  reengageSteps: [
    { delay: 5 * 60 * 1000, step: 1 },    // 5 minutos
    { delay: 45 * 60 * 1000, step: 2 },   // 45 minutos
    { delay: 24 * 60 * 60 * 1000, step: 3 } // 24 horas
  ]
}
```

## 🔧 Funcionalidades Técnicas

### Detección de Idioma
- **Análisis de palabras clave** en español
- **Umbral configurable** para detección
- **Fallback a inglés** por defecto

### Análisis de Cliente
- **Detección de intereses** (romántico, conversación, llamadas, emails)
- **Análisis de estado de ánimo** (triste, feliz, enojado, neutral)
- **Detección de urgencia** en mensajes
- **Perfiles persistentes** por cliente

### Sistema de Memoria
- **Historial de conversación** limitado
- **Prevención de duplicados**
- **Gestión de estado** por hilo/email

### Seguridad
- **Límites de longitud** de respuestas
- **Filtros de contenido** inapropiado
- **Redirección elegante** de temas prohibidos

## 📊 Monitoreo y Control 24/7

### **Logs en Tiempo Real**
El bot proporciona logs detallados:
- ✅ **Login exitoso** como "Horny Madge"
- ✅ **Chats respondidos** con resumen del mensaje
- ✅ **Contacto proactivo** a clientes activos
- 📧 **Emails procesados** con asunto
- 💬 **Reenganches enviados** con detalles
- 🔄 **Reinicio automático** si hay errores
- ❌ **Errores** con información de depuración

### **Comandos de Control (Railway)**
```bash
# Ver logs en tiempo real
railway logs

# Verificar estado del bot
railway status

# Reiniciar bot
railway restart

# Detener bot
railway down

# Abrir dashboard
railway open
```

### **Monitoreo Local**
```bash
# Ver logs del bot
npm run monitor

# Ejecutar pruebas
npm test
```

## 🔄 Flujo de Trabajo

1. **Inicio:** Login automático o manual
2. **Chat:** Monitoreo continuo de mensajes no leídos
3. **Email:** Verificación periódica de emails
4. **Reenganche:** Mensajes automáticos a clientes inactivos
5. **Adaptación:** Análisis continuo de necesidades del cliente

## 🛠️ Estructura del Proyecto

```
src/
├── bot.js          # Bot principal con navegación
├── backend.js      # API de IA y lógica de respuesta
├── selectors.js    # Selectores CSS para elementos web
└── config.js       # Configuración personalizable
```

## 🔮 Funcionalidades Implementadas y Próximas

### ✅ **Ya Implementadas**
- ✅ **Bot Horny Madge** con personalidad seductora
- ✅ **Funcionamiento 24/7** en servidores cloud
- ✅ **Contacto proactivo** a clientes activos
- ✅ **Respuestas optimizadas** para maximizar ganancias
- ✅ **Despliegue automático** en Railway/Render/Heroku
- ✅ **Reinicio automático** en caso de errores
- ✅ **Monitoreo en tiempo real** con logs detallados

### 🚀 **Próximas Funcionalidades**
- [ ] **Manejo de llamadas** automático
- [ ] **Análisis de sentimientos** avanzado
- [ ] **Integración con CRM** externo
- [ ] **Dashboard web** para monitoreo
- [ ] **Múltiples personalidades** configurables
- [ ] **Sistema de reportes** y estadísticas
- [ ] **Machine Learning** para mejorar respuestas
- [ ] **Predicciones** de comportamiento de clientes

## ⚠️ Notas Importantes

- **Uso responsable:** El bot está diseñado para mantener límites legales y éticos
- **Configuración:** Ajusta la personalidad y comportamiento según tus necesidades
- **Monitoreo:** Revisa regularmente los logs para asegurar funcionamiento correcto
- **Actualizaciones:** Mantén las dependencias actualizadas para mejor rendimiento

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🎉 **¡Tu Bot Horny Madge está Listo!**

### **¿Qué puedes hacer ahora?**
1. **Desplegar en Railway**: `.\deploy-24-7.ps1`
2. **Monitorear logs**: `railway logs`
3. **Verificar funcionamiento**: `railway status`
4. **Maximizar ganancias** automáticamente

### **Ventajas del Bot Horny Madge 24/7**
- ✅ **Funciona sin supervisión** las 24 horas
- ✅ **Genera ingresos automáticamente**
- ✅ **Respuestas humanas** que incitan a más mensajes
- ✅ **Contacto proactivo** con clientes activos
- ✅ **Monitoreo completo** en tiempo real

**¡Tu bot está listo para maximizar tus ganancias automáticamente! 💰🤖**
