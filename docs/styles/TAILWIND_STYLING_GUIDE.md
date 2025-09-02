# Guía de Estilos Tailwind para MiApp

## 📋 Índice

1. [Sistema de Colores](#sistema-de-colores)
2. [Variables CSS Reactivas](#variables-css-reactivas)
3. [Cómo Usar los Estilos](#cómo-usar-los-estilos)
4. [Errores Comunes](#errores-comunes)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎨 Sistema de Colores

Esta aplicación usa **Tailwind 4** con **variables CSS reactivas** que cambian automáticamente entre light y dark mode.

### Variables Disponibles

```css
/* Variables Reactivas (cambian automáticamente con .dark) */
--color-app-background     /* Fondo principal de la app */
--color-app-foreground     /* Texto principal/títulos */
--color-text-primary       /* Texto primario */
--color-text-secondary     /* Texto secundario */
--color-neutral            /* Fondos secundarios/tarjetas */
--color-border             /* Bordes */

/* Variables Estáticas (no cambian con tema) */
--color-primary            /* Color principal de marca (amber) */
--color-secondary          /* Color secundario de marca */
--color-accent-primary     /* Acentos primarios */
--color-accent-secondary   /* Acentos secundarios (teal) */
```

### Valores por Tema

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--color-app-background` | `#F9FAFB` | `#1B1B1B` |
| `--color-app-foreground` | `#111827` | `#fef3c7` |
| `--color-text-primary` | `#1B1B1B` | `#F9FAFB` |
| `--color-text-secondary` | `#6B7280` | `#9CA3AF` |
| `--color-neutral` | `#F9FAFB` | `#1B1B1B` |
| `--color-border` | `#E5E7EB` | `#4B5563` |

---

## ⚡ Variables CSS Reactivas

### ✅ Cómo Funcionan

Las variables CSS cambian automáticamente cuando se detecta la clase `.dark` en el HTML:

```css
/* Definición */
:root {
  --color-text-primary: #1B1B1B;  /* Light mode */
}

.dark {
  --color-text-primary: #F9FAFB;  /* Dark mode */
}
```

### 🔄 Ventajas del Sistema

- **Automático**: Sin necesidad de clases `dark:`
- **Centralizado**: Cambios en un solo lugar
- **Performante**: Transiciones CSS nativas
- **Mantenible**: Menos código repetitivo

---

## 🚀 Cómo Usar los Estilos

### ✅ Forma CORRECTA

```javascript
// Usar variables CSS con la sintaxis [var()]
className="bg-[var(--color-app-background)] text-[var(--color-text-primary)]"
```

### ❌ Formas INCORRECTAS

```javascript
// ❌ Clases personalizadas inexistentes
className="bg-background-light text-text-primary"

// ❌ Mezclar sistemas (redundante y problemático)
className="bg-[var(--color-neutral)] dark:bg-neutral-dark"

// ❌ Usar clases que no están definidas en Tailwind
className="text-foreground-light border-border-dark"
```

---

## 🚨 Errores Comunes

### 1. **Clases Personalizadas Inexistentes**

```javascript
// ❌ INCORRECTO - Estas clases NO existen
"text-text-primary"
"bg-background-light" 
"border-border-dark"
"text-foreground-light"

// ✅ CORRECTO - Usar variables CSS
"text-[var(--color-text-primary)]"
"bg-[var(--color-app-background)]"
"border-[var(--color-border)]"
"text-[var(--color-app-foreground)]"
```

### 2. **Redundancia Dark/Light**

```javascript
// ❌ INCORRECTO - Redundante con variables reactivas
"bg-neutral-light dark:bg-neutral-dark"

// ✅ CORRECTO - Una sola clase reactiva
"bg-[var(--color-neutral)]"
```

### 3. **Mezclar Sistemas**

```javascript
// ❌ INCORRECTO - Mezclando sistemas
"text-[var(--color-text-primary)] dark:text-white"

// ✅ CORRECTO - Solo variables reactivas
"text-[var(--color-text-primary)]"
```

---

## 💡 Mejores Prácticas

### 1. **Usa Solo Variables CSS Reactivas**

```javascript
// ✅ Para elementos que deben cambiar con el tema
const buttonClass = `
  bg-[var(--color-neutral)]
  text-[var(--color-text-primary)]
  border-[var(--color-border)]
`;
```

### 2. **Colores Estáticos Solo Cuando Sea Necesario**

```javascript
// ✅ Para elementos que NO deben cambiar con el tema
const brandButton = `
  bg-[var(--color-primary)]      // Amber siempre
  text-[var(--color-text-primary)] // Reactivo
`;
```

### 3. **Organiza los Estilos**

```javascript
// ✅ Estructura clara
const buttonStyles = `
  /* Layout */
  inline-flex items-center justify-center
  px-6 py-3 rounded-lg
  
  /* Colors (reactivos) */
  bg-[var(--color-neutral)]
  text-[var(--color-text-primary)]
  border border-[var(--color-border)]
  
  /* States */
  hover:bg-[var(--color-primary)]
  focus:ring-2 focus:ring-[var(--color-primary)]
  
  /* Animations */
  transition-all duration-200 ease-in-out
`;
```

### 4. **Evita Clases Dark Innecesarias**

```javascript
// ❌ Innecesario con variables reactivas
"focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark"

// ✅ Simplificado
"focus:ring-offset-2 focus:ring-[var(--color-primary)]"
```

---

## 🎯 Ejemplos Prácticos

### Botón Básico

```javascript
const Button = ({ children, variant = "primary" }) => {
  const baseStyles = `
    inline-flex items-center justify-center
    px-4 py-2 rounded-lg font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
  
  const variants = {
    primary: `
      bg-[var(--color-primary)]
      text-[var(--color-app-foreground)]
      hover:bg-[var(--color-secondary)]
      focus:ring-[var(--color-primary)]
    `,
    secondary: `
      bg-[var(--color-neutral)]
      text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      hover:bg-[var(--color-app-background)]
      focus:ring-[var(--color-primary)]
    `
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};
```

### Tarjeta con Tema

```javascript
const Card = ({ children }) => (
  <div className={`
    p-6 rounded-lg shadow-sm
    bg-[var(--color-neutral)]
    border border-[var(--color-border)]
    text-[var(--color-text-primary)]
  `}>
    {children}
  </div>
);
```

### Input Field

```javascript
const Input = ({ placeholder, ...props }) => (
  <input
    className={`
      w-full px-3 py-2 rounded-md
      bg-[var(--color-neutral)]
      text-[var(--color-text-primary)]
      border border-[var(--color-border)]
      placeholder:text-[var(--color-text-secondary)]
      focus:ring-2 focus:ring-[var(--color-primary)]
      focus:border-[var(--color-primary)]
    `}
    placeholder={placeholder}
    {...props}
  />
);
```

---

## 🔍 Validación de Estilos

### Checklist antes de usar una clase:

- [ ] ¿La clase existe en Tailwind estándar? (ej: `text-white`, `bg-red-500`)
- [ ] ¿Es una variable CSS válida? (ej: `bg-[var(--color-primary)]`)
- [ ] ¿Evito redundancia dark/light con variables reactivas?
- [ ] ¿El estilo cambiará correctamente entre temas?

### Comando para verificar:

```bash
# Buscar clases potencialmente problemáticas
grep -r "text-text-\|bg-background-\|border-border-" src/
```

---

## 📚 Referencias

- **Ubicación de variables CSS**: `src/app/globals.css`
- **ThemeProvider**: `src/app/providers/ThemeProvider.tsx`
- **Documentación Tailwind 4**: [Tailwind CSS v4.0](https://tailwindcss.com/docs)

---

## 🆘 Solución de Problemas

### El color no cambia en dark mode:

1. ✅ Verificar que uses `bg-[var(--color-variable)]`
2. ✅ Confirmar que la variable existe en `globals.css`
3. ✅ Asegurar que no hay clases `dark:` conflictivas
4. ✅ Revisar que ThemeProvider esté activo

### Clase no se aplica:

1. ✅ Verificar sintaxis: `[var(--color-name)]`
2. ✅ Confirmar que la variable esté definida
3. ✅ Eliminar clases personalizadas inexistentes

---

**💡 Recuerda**: En esta app, las variables CSS son reactivas. ¡Una sola clase, múltiples temas!
