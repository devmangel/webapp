# Guía de Uso - Sistema de Importación

## 🚀 Inicio Rápido

### 1. Acceso a la Interfaz

Navega a la página de importación en tu dashboard:
```
https://tu-app.com/dashboard/import
```

### 2. Preparar tu Markdown

El sistema acepta múltiples formatos de especificaciones en markdown. Aquí algunos ejemplos:

#### Formato Básico
```markdown
# EP-01 — Registro de Usuarios

**Objetivo:** Permitir que los usuarios se registren en la plataforma

## Historias

* **ST-01.1** Como visitante quiero crear una cuenta para acceder a la plataforma
* **ST-01.2** Como usuario quiero verificar mi email para activar mi cuenta

## Tareas

* **FE-01** Crear formulario de registro
* **BE-01** Implementar endpoint de registro
* **BE-02** Sistema de envío de emails
```

### 3. Importar desde la UI

1. **Pega tu markdown** en el área de texto
2. **Presiona "🚀 Crear Proyecto con IA"**  
3. **Espera el procesamiento** (10-60 segundos)
4. **Revisa los resultados** con feedback detallado

---

## 📚 Formatos de Markdown Soportados

### Formato Completo (Recomendado)

```markdown
# Sistema de Gestión de Inventario

## Descripción
Plataforma para gestionar inventario de productos en múltiples almacenes con control de stock en tiempo real.

# ÉPICA EP-01 — Gestión de Productos

**Objetivo:** Permitir CRUD completo de productos con categorización

**Duración estimada:** 3 semanas

**Prioridad:** CRÍTICA

## Historias de Usuario

### ST-01.1 — Crear Producto
**Como** administrador  
**Quiero** crear nuevos productos  
**Para** mantener el catálogo actualizado  

**Criterios de Aceptación:**
- Campos requeridos: nombre, código, categoría, precio
- Validación de código único
- Subida de imágenes opcional

**Story Points:** 5

### ST-01.2 — Listar Productos  
**Como** usuario  
**Quiero** ver lista de productos con filtros  
**Para** encontrar productos específicos

**Story Points:** 3

## Tareas Técnicas

### Frontend
- **FE-01:** Formulario de creación de producto
- **FE-02:** Lista con paginación y filtros  
- **FE-03:** Componente de subida de imágenes

### Backend
- **BE-01:** Modelo y migración de productos
- **BE-02:** API CRUD de productos (/api/products)
- **BE-03:** Validaciones y reglas de negocio

### Testing
- **TEST-01:** Tests unitarios del modelo Product
- **TEST-02:** Tests de integración API productos

# ÉPICA EP-02 — Control de Stock

**Objetivo:** Monitoreo en tiempo real de niveles de inventario

**Duración estimada:** 4 semanas  

**Prioridad:** ALTA

## Historias de Usuario

### ST-02.1 — Actualizar Stock
**Como** operario de almacén  
**Quiero** registrar entradas y salidas de productos  
**Para** mantener stock actualizado

**Story Points:** 8

### ST-02.2 — Alertas de Stock Bajo  
**Como** gerente  
**Quiero** recibir alertas cuando el stock esté bajo  
**Para** evitar desabastos

**Story Points:** 5

## Tareas Técnicas

### Backend
- **BE-04:** Sistema de transacciones de stock
- **BE-05:** Cálculo automático de stock actual
- **BE-06:** Motor de alertas y notificaciones

### Operations  
- **OPS-01:** Configurar notificaciones por email
- **OPS-02:** Dashboard de monitoreo de stock
```

### Formato Simplificado

```markdown
# Mi Aplicación Web

## EP-01: Autenticación
- Login con email/password
- Registro de usuarios  
- Recuperación de contraseña

**Tareas:**
- FE: Formularios de auth
- BE: JWT y validaciones
- TEST: Tests de seguridad

## EP-02: Dashboard
- Vista general de datos
- Métricas en tiempo real
- Filtros y búsquedas

**Tareas:**
- FE: Componentes de dashboard
- BE: APIs de métricas
- OPS: Configuración de analytics
```

### Formato de Lista

```markdown
# Proyecto E-commerce

* **EP-01 — Catálogo** (CRÍTICA, 2 semanas)
  - ST-01.1: Listar productos (3 pts)
  - ST-01.2: Filtrar por categorías (2 pts) 
  - FE-01: Componentes de producto
  - BE-01: API de productos

* **EP-02 — Carrito** (ALTA, 3 semanas)
  - ST-02.1: Agregar al carrito (5 pts)
  - ST-02.2: Modificar cantidades (3 pts)
  - FE-02: Estado global del carrito
  - BE-02: Persistencia del carrito

* **EP-03 — Checkout** (ALTA, 4 semanas)
  - ST-03.1: Proceso de pago (8 pts)
  - ST-03.2: Confirmación de orden (5 pts)
  - BE-03: Integración pasarelas de pago
  - OPS-01: Configurar Stripe/PayPal
```

---

## 🎯 Mejores Prácticas

### ✅ Estructura Clara

**Recomendado:**
```markdown
# ÉPICA EP-01 — Título Descriptivo

**Objetivo:** Descripción clara del valor de negocio

**Prioridad:** CRÍTICA|ALTA|MEDIA|BAJA|PENDIENTE

## Historias
- Formato "Como X quiero Y para Z"
- Story points estimados

## Tareas  
- Prefijos claros: FE-, BE-, OPS-, DOCS-, TEST-
- Descripciones técnicas específicas
```

### ✅ Prioridades Textuales

Usa las **5 prioridades soportadas**:

| Prioridad | Cuándo Usar | Ejemplo |
|-----------|-------------|---------|
| **CRÍTICA** | Infraestructura, seguridad, core | Autenticación, Base de datos |
| **ALTA** | Funcionalidades principales | CRUD principales, APIs core |  
| **MEDIA** | Funcionalidades importantes | Filtros, búsquedas, reportes |
| **BAJA** | Mejoras y optimizaciones | UI polish, performance |
| **PENDIENTE** | Futuras iteraciones | Features avanzadas, integraciones |

### ✅ Story Points

Usa la **escala Fibonacci** para estimación:

| Puntos | Complejidad | Ejemplo |
|--------|-------------|---------|
| **1** | Muy simple | Cambio de texto, ajuste CSS |
| **2** | Simple | Componente básico, validación |
| **3** | Pequeño | Formulario simple, listado básico |
| **5** | Mediano | CRUD completo, integración API |
| **8** | Grande | Dashboard complejo, autenticación |
| **13** | Muy grande | Sistema de pagos, reportes avanzados |
| **21** | Épico | Arquitectura completa, migración grande |

### ✅ Tipos de Tareas

Usa **prefijos consistentes**:

| Prefijo | Tipo | Ejemplo |
|---------|------|---------|
| **FE-** | Frontend | `FE-01: Componente de login` |
| **BE-** | Backend | `BE-01: API de usuarios` |
| **OPS-** | Operations | `OPS-01: Configurar CI/CD` |
| **DOCS-** | Documentation | `DOCS-01: Guía de instalación` |
| **TEST-** | Testing | `TEST-01: Tests e2e login` |

---

## 💡 Ejemplos por Tipo de Proyecto

### 🛍️ E-commerce

```markdown
# Tienda Online Productos Artesanales

# EP-01 — Catálogo de Productos (CRÍTICA)

## Historias
* **ST-01.1** Como visitante quiero ver productos para decidir compras (5 pts)
* **ST-01.2** Como cliente quiero filtrar por categoría para encontrar productos (3 pts)
* **ST-01.3** Como vendedor quiero subir productos para vender (8 pts)

## Tareas
* **FE-01** Grid de productos responsivo
* **FE-02** Filtros y buscador  
* **BE-01** API CRUD productos
* **BE-02** Subida de imágenes a S3

# EP-02 — Carrito de Compras (ALTA)

## Historias  
* **ST-02.1** Como cliente quiero agregar productos al carrito (5 pts)
* **ST-02.2** Como cliente quiero modificar cantidades para ajustar pedido (3 pts)

## Tareas
* **FE-03** Estado global del carrito (Zustand)
* **FE-04** Mini carrito en header
* **BE-03** Persistir carrito en BD
```

### 📊 Dashboard Analytics

```markdown
# Plataforma de Analytics

# EP-01 — Recolección de Datos (CRÍTICA)

## Historias
* **ST-01.1** Como analista quiero conectar fuentes de datos para obtener métricas (13 pts)
* **ST-01.2** Como usuario quiero ver datos en tiempo real para tomar decisiones (8 pts)

## Tareas
* **BE-01** Pipeline de ingesta de datos
* **BE-02** ETL con transformaciones
* **OPS-01** Configurar Apache Kafka
* **OPS-02** Base de datos de series temporales

# EP-02 — Visualizaciones (ALTA)

## Historias
* **ST-02.1** Como gerente quiero dashboards ejecutivos para reportes (8 pts)
* **ST-02.2** Como analista quiero gráficos interactivos para análisis (5 pts)

## Tareas  
* **FE-01** Librería de componentes de gráficos
* **FE-02** Builder de dashboards drag & drop
* **BE-03** API de consultas optimizada
```

### 🏥 Sistema Médico

```markdown
# Sistema de Gestión Hospitalaria

# EP-01 — Gestión de Pacientes (CRÍTICA)

## Historias
* **ST-01.1** Como recepcionista quiero registrar pacientes para crear historias clínicas (5 pts)
* **ST-01.2** Como médico quiero buscar pacientes para acceder a su información (3 pts)
* **ST-01.3** Como paciente quiero ver mis citas para planificar visitas (2 pts)

## Tareas
* **FE-01** Formulario de registro de pacientes
* **FE-02** Búsqueda con filtros avanzados
* **BE-01** Modelo de pacientes con validaciones
* **BE-02** Sistema de búsqueda con Elasticsearch
* **DOCS-01** Manual de uso para recepcionistas

# EP-02 — Historia Clínica Digital (ALTA)  

## Historias
* **ST-02.1** Como médico quiero registrar consultas para documentar tratamientos (8 pts)
* **ST-02.2** Como especialista quiero ver historial completo para diagnósticos (5 pts)

## Tareas
* **FE-03** Editor de notas médicas rich text
* **FE-04** Timeline de historial médico
* **BE-03** Versionado de historias clínicas
* **BE-04** Permisos granulares por especialidad
* **TEST-01** Tests de privacidad y seguridad
```

---

## 🔧 Configuración Avanzada

### Personalizar Desarrollador

Por defecto, todas las tareas se asignan a:
```typescript
const FIXED_DEVELOPER_ID = '06aec8c6-b939-491b-b711-f04d7670e045';
```

### Llamada Direct a API

```typescript
const response = await fetch('/api/dashboard/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: `# Mi Proyecto\n\n## EP-01: Feature principal...`,
    uploaderId: '06aec8c6-b939-491b-b711-f04d7670e045',
    assigneeId: '06aec8c6-b939-491b-b711-f04d7670e045'
  })
});

const result = await response.json();

if (result.success) {
  console.log(`✅ Proyecto creado: ${result.projectId}`);
  console.log(`📊 Stats: ${result.summary.epics} épicas, ${result.summary.stories} historias`);
} else {
  console.error('❌ Error:', result.feedback.errors);
}
```

---

## 🎨 Casos de Uso Comunes

### 🔄 Migración de Especificaciones Existentes

**Tienes specs en Google Docs/Notion/Confluence?**

1. **Copia el contenido** y conviértelo a markdown básico
2. **Estructura por épicas** usando headers `#` 
3. **Identifica historias** con formato "Como X quiero Y"
4. **Lista tareas técnicas** con prefijos FE/BE/OPS
5. **Importa y refina** con el feedback de IA

### 📋 Planning de Sprint

**Planificando un nuevo sprint?**

1. **Define la épica principal** del sprint
2. **Lista las historias prioritarias** con story points
3. **Desglosa en tareas técnicas** específicas
4. **Importa para crear** el sprint automáticamente
5. **Revisa fechas** y ajusta si es necesario

### 🚀 MVP Rápido

**Necesitas un MVP rápido?**

```markdown
# MVP - App de Notas

# EP-01 — Core Features (CRÍTICA, 2 semanas)

## Historias MVP
* **ST-01.1** Como usuario quiero crear notas para capturar ideas (3 pts)
* **ST-01.2** Como usuario quiero editar notas para actualizar contenido (2 pts)  
* **ST-01.3** Como usuario quiero buscar notas para encontrar información (5 pts)

## Tareas Mínimas
* **FE-01** Editor de texto simple
* **FE-02** Lista de notas  
* **BE-01** API CRUD notas
* **BE-02** Búsqueda full-text
* **OPS-01** Deploy en Vercel
```

### 🔧 Proyecto Técnico/Infraestructura

```markdown
# Migración a Microservicios

# EP-01 — Arquitectura Base (CRÍTICA, 4 semanas)

## Historias Técnicas  
* **ST-01.1** Como DevOps quiero API Gateway centralizado para rutear requests (13 pts)
* **ST-01.2** Como desarrollador quiero service discovery para conectar servicios (8 pts)

## Tareas de Infraestructura
* **OPS-01** Configurar Kong API Gateway
* **OPS-02** Setup de Consul para service discovery
* **OPS-03** Configurar Docker Compose para desarrollo
* **BE-01** Refactor auth como microservicio independiente
* **BE-02** Implementar circuit breakers
* **DOCS-01** Guía de arquitectura de microservicios
```

---

## ⚡ Tips y Trucos

### 🚀 Para Importaciones Rápidas

- **Usa títulos descriptivos** para épicas: mejor "Gestión de Usuarios" que "EP-01"
- **Incluye objetivos claros** para ayudar a la IA a entender el contexto
- **Separa claramente** historias de tareas técnicas
- **Usa story points** para mejorar estimaciones de sprints

### 🎯 Para Máxima Precisión

- **Proporciona contexto** del tipo de aplicación al inicio
- **Define roles específicos** en historias ("Como admin", "Como cliente")  
- **Incluye criterios de aceptación** cuando sea crítico
- **Especifica tecnologías** en tareas técnicas si son relevantes

### 🔧 Para Proyectos Complejos

- **Divide en múltiples importaciones** si tienes >20 épicas
- **Usa dependencias explícitas** entre tareas cuando sea necesario
- **Incluye sección de arquitectura** para contexto técnico
- **Especifica integraciones externas** como tareas OPS

---

Esta guía te ayudará a **maximizar la efectividad** del sistema de importación y crear proyectos **bien estructurados** desde el primer día.
