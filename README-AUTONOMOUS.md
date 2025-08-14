# 🤖 Bot Autónomo Niteflirt 24/7

## Descripción

Este bot funciona de forma completamente autónoma, analizando todos los chats cada 10 horas, detectando mensajes sin responder, manteniendo memoria de cada cliente, y respondiendo inteligentemente sin supervisión.

## Características Principales

### 🔄 Monitoreo Autónomo
- **Intervalo de verificación**: Cada 10 horas
- **Modo headless**: Funciona sin interfaz gráfica para 24/7
- **Reinicio automático**: Se reinicia automáticamente si hay errores
- **Manejo de errores**: Captura y maneja errores no controlados

### 🧠 Memoria Inteligente
- **Memoria por cliente**: Guarda información de cada usuario
- **Historial de chat**: Mantiene contexto de conversaciones
- **Análisis de estado de ánimo**: Detecta el humor del cliente
- **Detección de idioma**: Responde en español o inglés según el cliente

### 💬 Respuestas Contextuales
- **Respuestas específicas**: Para casos especiales como misskathystanford
- **IA integrada**: Usa OpenAI para respuestas inteligentes
- **Fallback responses**: Respuestas predefinidas si la IA no está disponible
- **Adaptación al cliente**: Se adapta al estilo de conversación

### 🔍 Análisis Completo
- **Detección de mensajes sin responder**: Identifica chats pendientes
- **Análisis de todos los chats**: Revisa toda la lista de conversaciones
- **Extracción de nombres**: Identifica usuarios automáticamente
- **Lectura de historial**: Lee hasta 20 mensajes para contexto

## Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` con:
```env
NF_EMAIL=tu_email@ejemplo.com
NF_PASS=tu_contraseña
OPENAI_API_KEY=tu_api_key_de_openai
```

### 3. Iniciar Backend (Opcional)
Si quieres usar IA para respuestas:
```bash
node src/backend.js
```

## Uso

### Iniciar Bot Autónomo Completo
```bash
npm run autonomous
```
Este comando inicia tanto el backend como el bot autónomo.

### Solo Bot Autónomo
```bash
npm run bot-24-7
```
Solo el bot sin backend (usará respuestas fallback).

### Iniciar Manualmente
```bash
node autonomous-chat-bot.js
```

## Funcionamiento

### Ciclo de Monitoreo
1. **Inicio**: Login automático a Niteflirt
2. **Navegación**: Va al apartado de chat
3. **Análisis**: Revisa todos los chats cada 10 horas
4. **Detección**: Identifica mensajes sin responder
5. **Respuesta**: Genera y envía respuestas contextuales
6. **Memoria**: Guarda información del cliente
7. **Repetición**: Continúa el ciclo

### Manejo de Errores
- **Reinicio automático**: Si hay 5 errores consecutivos
- **Recuperación**: Espera 30 segundos antes de reiniciar
- **Logs detallados**: Registra todos los eventos
- **Memoria persistente**: Guarda datos antes de reiniciar

### Respuestas Especiales
El bot tiene respuestas específicas para casos especiales:

#### misskathystanford - Bra Lines
```javascript
"Mmm baby, I love that you're thinking about showing off your bra lines through your blouse... 😘 It's such a tease, isn't it? The way the fabric clings and reveals just enough to drive someone wild... 💕 What else are you thinking about wearing?"
```

## Archivos Importantes

### `autonomous-chat-bot.js`
Bot principal con todas las funcionalidades autónomas.

### `start-autonomous-bot.js`
Script que inicia backend y bot juntos.

### `client_memory.json`
Archivo donde se guarda la memoria de los clientes.

### `src/backend.js`
Servidor de IA para respuestas inteligentes.

## Configuración Avanzada

### Cambiar Intervalo de Verificación
En `autonomous-chat-bot.js`, línea 15:
```javascript
this.checkInterval = 10 * 60 * 60 * 1000; // 10 horas
```

### Modificar Respuestas Fallback
En la función `getFallbackResponse()` del bot.

### Ajustar Selectores
En las funciones de análisis de chat si cambia la web.

## Monitoreo y Logs

### Logs del Bot
- ✅ Operaciones exitosas
- ❌ Errores y problemas
- 📨 Mensajes enviados
- 🔍 Análisis de chats
- 💾 Guardado de memoria

### Verificar Estado
El bot muestra logs detallados de:
- Inicio de sesión
- Análisis de chats
- Mensajes enviados
- Errores y recuperaciones

## Despliegue 24/7

### En Servidor Local
```bash
npm run autonomous
```

### En Servidor Remoto
1. Subir archivos al servidor
2. Instalar dependencias: `npm install`
3. Configurar `.env`
4. Ejecutar: `npm run autonomous`
5. Usar PM2 o similar para mantener el proceso activo

### Con PM2 (Recomendado)
```bash
npm install -g pm2
pm2 start start-autonomous-bot.js --name "niteflirt-bot"
pm2 startup
pm2 save
```

## Seguridad

### Credenciales
- Nunca compartir archivo `.env`
- Usar contraseñas seguras
- Rotar credenciales periódicamente

### API Keys
- Proteger OpenAI API key
- Monitorear uso de API
- Configurar límites de uso

## Solución de Problemas

### Bot no inicia
1. Verificar credenciales en `.env`
2. Comprobar conexión a internet
3. Revisar logs de error

### No responde mensajes
1. Verificar que el backend esté funcionando
2. Comprobar selectores de la web
3. Revisar logs de análisis

### Errores de memoria
1. Verificar permisos de escritura
2. Comprobar espacio en disco
3. Revisar formato de `client_memory.json`

## Soporte

Para problemas o mejoras:
1. Revisar logs detallados
2. Verificar configuración
3. Comprobar conectividad
4. Revisar cambios en la web de Niteflirt

---

**⚠️ Importante**: Este bot está diseñado para funcionar de forma autónoma. Una vez iniciado, funcionará continuamente sin supervisión. Asegúrate de que las credenciales sean correctas antes de iniciarlo.
