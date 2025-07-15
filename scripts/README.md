# Scripts de Actualización de Pilotos F1

## Descripción

Estos scripts permiten actualizar la información de los pilotos de F1 con los datos más recientes.

## Scripts disponibles

### 1. `update-drivers-simple.ts`
Actualiza el archivo `src/lib/constants/drivers.ts` con la información actual de los pilotos:
- Pilotos activos de 2025
- Pilotos que compitieron pero ya no están activos
- Estructura preparada para URLs de imágenes

**Uso:**
```bash
npx tsx scripts/update-drivers-simple.ts
```

### 2. `upload-and-update-drivers.ts`
Descarga las imágenes oficiales de los pilotos desde Formula1.com, las sube a Vercel Blob Storage y actualiza el archivo `drivers.ts` con las URLs.

**Requisitos:**
- Configurar `BLOB_READ_WRITE_TOKEN` en el archivo `.env`

**Uso:**
```bash
npx tsx scripts/upload-and-update-drivers.ts
```

Este script:
1. Descarga las imágenes oficiales de cada piloto (incluidos los anteriores)
2. Las sube a Vercel Blob Storage
3. Actualiza directamente el archivo `drivers.ts` añadiendo el campo `imageUrl` a cada piloto

## Cambios realizados en la estructura

### Antes:
```typescript
{ name: "Lewis Hamilton", team: "Mercedes", number: 44 }
```

### Ahora:
```typescript
{
  name: "Lewis Hamilton",
  team: "Ferrari",  // Actualizado para 2025
  number: 44,
  imageUrl?: string  // Campo opcional para la URL de la imagen
}
```

## Actualizaciones principales para 2025:

### Cambios de equipos:
- Lewis Hamilton: Mercedes → Ferrari
- Carlos Sainz: Ferrari → Williams
- Esteban Ocon: Alpine → Haas

### Nuevos pilotos:
- Andrea Kimi Antonelli (Mercedes)
- Liam Lawson (Red Bull)
- Jack Doohan (Alpine)
- Oliver Bearman (Haas)
- Isack Hadjar (RB)
- Gabriel Bortoleto (Sauber)

### Cambios de nombre de equipos:
- AlphaTauri → RB
- Alfa Romeo → Sauber

### Pilotos que ya no están:
- Sergio Pérez
- Kevin Magnussen
- Valtteri Bottas
- Zhou Guanyu
- Franco Colapinto

## Integración con la aplicación

Para usar las imágenes en componentes:

```typescript
import { F1_DRIVERS_2025 } from "@/lib/constants/drivers"

// En tu componente
const driver = F1_DRIVERS_2025.find(d => d.name === "Max Verstappen")
const imageUrl = driver?.imageUrl // URL de la imagen en Vercel Blob
```

## Notas importantes

1. Las imágenes se almacenan en Vercel Blob con la estructura: `drivers/[nombre-slug].png`
2. El script `upload-and-update-drivers.ts` requiere conexión a internet para descargar las imágenes
3. Asegúrate de tener configurado `BLOB_READ_WRITE_TOKEN` antes de ejecutar el script de imágenes
4. El script actualiza directamente el archivo `drivers.ts`, no crea archivos adicionales