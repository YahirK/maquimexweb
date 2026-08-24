import heicConvert from 'heic-convert';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const heicFiles = [
  'images/proyectos/PILGRIMS .HEIC',
  'images/proyectos/dek cholul.HEIC',
  'images/proyectos/escalera de bronchisimo.HEIC',
  'images/proyectos/escultura en progreso.HEIC',
];

for (const relPath of heicFiles) {
  const inputPath = join(__dirname, relPath);
  const outputPath = inputPath.replace(/\.HEIC$/i, '.jpg');
  const name = basename(relPath);

  try {
    console.log(`Convirtiendo: ${name}...`);
    const inputBuffer = await readFile(inputPath);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.90,
    });
    await writeFile(outputPath, Buffer.from(outputBuffer));
    console.log(`  ✅ Guardado: ${basename(outputPath)}`);
  } catch (err) {
    console.error(`  ❌ Error con ${name}: ${err.message}`);
  }
}

console.log('\nConversión completada.');
