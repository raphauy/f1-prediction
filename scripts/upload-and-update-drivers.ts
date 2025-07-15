import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

// URLs de imágenes de los pilotos desde el sitio oficial de F1
const DRIVER_IMAGE_URLS: Record<string, string> = {
  // Red Bull
  "Max Verstappen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  "Liam Lawson": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
  
  // McLaren
  "Lando Norris": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  "Oscar Piastri": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  
  // Ferrari
  "Charles Leclerc": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  "Lewis Hamilton": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  
  // Mercedes
  "George Russell": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  "Andrea Kimi Antonelli": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png",
  
  // Aston Martin
  "Fernando Alonso": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  "Lance Stroll": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  
  // Alpine
  "Pierre Gasly": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  "Jack Doohan": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png",
  
  // RB
  "Yuki Tsunoda": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png",
  "Isack Hadjar": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png",
  
  // Haas
  "Oliver Bearman": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png",
  "Esteban Ocon": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  
  // Sauber
  "Nico Hulkenberg": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  "Gabriel Bortoleto": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOT01_Gabriel_Bortoleto/gabbot01.png",
  
  // Williams
  "Alexander Albon": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  "Carlos Sainz": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  "Franco Colapinto": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png",
  
  // Pilotos anteriores
  "Zhou Guanyu": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Z/ZHOGUA01_Zhou_Guanyu/zhogua01.png",
  "Valtteri Bottas": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
  "Kevin Magnussen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png",
  "Sergio Pérez": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
};

async function downloadAndUploadImage(driverName: string, imageUrl: string): Promise<string | null> {
  try {
    console.log(`Descargando imagen para ${driverName}...`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Error al descargar imagen para ${driverName}: ${response.status}`);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], { type: 'image/png' });
    
    // Crear nombre de archivo slug
    const fileName = `${driverName.toLowerCase().replace(/\s+/g, '-')}.png`;
    
    // Subir a Vercel Blob
    console.log(`Subiendo imagen de ${driverName} a Vercel Blob...`);
    const { url } = await put(`drivers/${fileName}`, blob, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    console.log(`✓ Imagen de ${driverName} subida exitosamente`);
    return url;
  } catch (error) {
    console.error(`Error procesando imagen de ${driverName}:`, error);
    return null;
  }
}

async function updateDriversFile() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Error: BLOB_READ_WRITE_TOKEN no está configurado en .env');
    process.exit(1);
  }
  
  console.log('Iniciando proceso de actualización de pilotos con imágenes...\n');
  
  // Leer el archivo actual
  const driversFilePath = path.join(process.cwd(), 'src/lib/constants/drivers.ts');
  const currentContent = await fs.readFile(driversFilePath, 'utf-8');
  
  // Procesar cada piloto y obtener sus URLs
  const driverImageMap: Record<string, string> = {};
  
  for (const [driverName, imageUrl] of Object.entries(DRIVER_IMAGE_URLS)) {
    const uploadedUrl = await downloadAndUploadImage(driverName, imageUrl);
    if (uploadedUrl) {
      driverImageMap[driverName] = uploadedUrl;
    }
  }
  
  // Actualizar el contenido del archivo con las URLs
  let updatedContent = currentContent;
  
  // Para cada piloto con imagen, actualizar su entrada en el archivo
  for (const [driverName, imageUrl] of Object.entries(driverImageMap)) {
    // Buscar el patrón del piloto y añadir la imageUrl
    const driverPattern = new RegExp(
      `(name: "${driverName}",\\s*team: "[^"]+",\\s*number: \\d+)(\\s*})`,
      'g'
    );
    
    updatedContent = updatedContent.replace(
      driverPattern,
      `$1,\n    imageUrl: "${imageUrl}"$2`
    );
  }
  
  // Guardar el archivo actualizado
  await fs.writeFile(driversFilePath, updatedContent);
  
  console.log('\n✅ Proceso completado!');
  console.log(`Total de imágenes procesadas: ${Object.keys(driverImageMap).length}`);
  console.log('\nArchivo drivers.ts actualizado con las URLs de las imágenes');
  console.log('\nLas imágenes están almacenadas en Vercel Blob en la carpeta "drivers/"');
}

// Ejecutar el script
updateDriversFile().catch(console.error);