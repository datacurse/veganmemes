import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import sharp from 'sharp';
import type { DB } from '../src/lib/types';

// --- ESM-safe dirname ------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---------------------------------------------------------

// Magic bytes for common image formats
const IMAGE_SIGNATURES = {
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  jpg: [0xFF, 0xD8, 0xFF],
  webp: [0x52, 0x49, 0x46, 0x46] // RIFF header for WebP
};

function detectImageFormat(buffer: Buffer): 'png' | 'jpg' | 'webp' | 'unknown' {
  // Check PNG
  if (IMAGE_SIGNATURES.png.every((byte, i) => buffer[i] === byte)) {
    return 'png';
  }

  // Check JPG
  if (IMAGE_SIGNATURES.jpg.every((byte, i) => buffer[i] === byte)) {
    return 'jpg';
  }

  // Check WebP (need to check WEBP at offset 8 as well)
  if (IMAGE_SIGNATURES.webp.every((byte, i) => buffer[i] === byte) &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'webp';
  }

  return 'unknown';
}

async function convertToPng(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .png()
    .toBuffer();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    }),
  });

  try {
    // Get all memes with image data
    console.log('📋 Fetching all memes with image data...');
    const memes = await db
      .selectFrom('memes')
      .select(['id', 'image_data'])
      .where('image_data', 'is not', null)
      .execute();

    console.log(`Found ${memes.length} memes with image data`);

    let convertedCount = 0;
    let errorCount = 0;

    for (const meme of memes) {
      try {
        if (!meme.image_data) continue;

        // Convert to Buffer if needed (depends on your pg driver configuration)
        const buffer = Buffer.isBuffer(meme.image_data)
          ? meme.image_data
          : Buffer.from(meme.image_data as any);

        const format = detectImageFormat(buffer);

        if (format === 'png') {
          // Already PNG, skip
          continue;
        }

        if (format === 'unknown') {
          console.warn(`⚠️  Meme ID ${meme.id}: Unknown image format, skipping`);
          continue;
        }

        console.log(`🔄 Converting meme ID ${meme.id} from ${format} to PNG...`);

        const pngBuffer = await convertToPng(buffer);

        // Update the database
        await db
          .updateTable('memes')
          .set({ image_data: pngBuffer })
          .where('id', '=', meme.id)
          .execute();

        convertedCount++;
        console.log(`✅ Converted meme ID ${meme.id}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing meme ID ${meme.id}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully converted: ${convertedCount} images`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏭️  Skipped (already PNG): ${memes.length - convertedCount - errorCount}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});