import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = './public';

const optimizeImage = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        return;
    }

    // Skip files ending in _tmp.webp to avoid loops
    if (filePath.endsWith('_tmp.webp')) return;

    const baseName = path.basename(filePath, ext);
    const outPath = path.join(publicDir, `${baseName}.webp`);

    console.log(`Processing ${filePath}...`);

    const tmpOutPath = path.join(publicDir, `${baseName}_tmp.webp`);

    await sharp(filePath)
        .webp({ quality: 80, effort: 6 })
        .toFile(tmpOutPath);

    // If we are replacing an existing file, delete the old one first
    if (fs.existsSync(outPath)) {
        if (outPath === filePath) {
            // We are replacing a webp with a webp. Delete the original.
            fs.unlinkSync(filePath);
        } else if (fs.existsSync(outPath)) {
            // The .webp version exists, but original wasn't .webp. Delete the .webp
            fs.unlinkSync(outPath);
        }
    }

    // Now rename
    fs.renameSync(tmpOutPath, outPath);

    // If original wasn't webp, remove original
    if (ext !== '.webp' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const run = async () => {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
        const fullPath = path.join(publicDir, file);
        if (fs.statSync(fullPath).isFile()) {
            try {
                await optimizeImage(fullPath);
            } catch (e) {
                console.error("Error processing " + file, e.message);
            }
        }
    }
    console.log('Optimizations complete.');
};

run().catch(console.error);
