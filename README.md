# 🤖 Niteflirt Bot - Asistente Virtual Inteligente

Un bot inteligente para Niteflirt que responde chats, emails y mantiene conversaciones adaptadas a las necesidades del cliente.

## ✨ Características Principales

### 💬 Chat Inteligente
- **Respuesta automática** a mensajes de chat
- **Detección de idioma** automática (Español/Inglés)
- **Adaptación personalizada** según el estado de ánimo del cliente
- **Memoria de conversación** para mantener contexto
- **Prevención de duplicados** para evitar respuestas repetidas

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

## 🚀 Instalación

1. **Clona el repositorio:**
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
npm start          # Inicia backend y bot automáticamente
npm run dev        # Modo desarrollo (mismo que start)
npm run start:backend  # Solo el backend
npm run start:bot      # Solo el bot
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

## 📊 Monitoreo

El bot proporciona logs detallados:
- ✅ **Chats respondidos** con resumen del mensaje
- 📧 **Emails procesados** con asunto
- 💬 **Reenganches enviados** con detalles
- ❌ **Errores** con información de depuración

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

## 🔮 Próximas Funcionalidades

- [ ] **Manejo de llamadas** automático
- [ ] **Análisis de sentimientos** avanzado
- [ ] **Integración con CRM** externo
- [ ] **Dashboard web** para monitoreo
- [ ] **Múltiples personalidades** configurables
- [ ] **Sistema de reportes** y estadísticas

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

**¡Disfruta de tu asistente virtual inteligente! 🤖💕**
