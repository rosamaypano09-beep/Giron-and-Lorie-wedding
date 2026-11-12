import fs from "fs";
import path from "path";
import sharp from "sharp";

// Get directories from command line args or use defaults
const args = process.argv.slice(2);
const DIRECTORIES = args.length > 0
  ? args.map(dir => path.resolve(process.cwd(), dir))
  : [
      path.resolve(process.cwd(), "public", "images"),
      path.resolve(process.cwd(), "public", "desktop-background"),
      path.resolve(process.cwd(), "public", "mobile-background"),
      path.resolve(process.cwd(), "public", "Details"),
      path.resolve(process.cwd(), "public", "frontboxes"),
      path.resolve(process.cwd(), "public", "story"),
      path.resolve(process.cwd(), "public", "desktop_slide"),
      path.resolve(process.cwd(), "public", "mobile_slide"),
      path.resolve(process.cwd(), "public", "monogram"),
    ];

const VALID_INPUT_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG",".HEIC"]);

async function convertImageToWebp(inputPath: string, quality: number = 80): Promise<void> {
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const outputPath = path.join(path.dirname(inputPath), `${baseName}.webp`);

  if (fs.existsSync(outputPath)) {
    console.log(`Skipping ${inputPath} - WebP already exists`);
    return; // skip if already converted
  }

  try {
    const image = sharp(inputPath, { failOn: "none" });
    await image.webp({ quality }).toFile(outputPath);
    console.log(`✓ Converted: ${inputPath} -> ${outputPath}`);
  } catch (err) {
    throw new Error(`Failed to convert ${inputPath}: ${err}`);
  }
}

function getAllImageFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string): void {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (VALID_INPUT_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

async function main(): Promise<void> {
  // Check all directories exist
  for (const dir of DIRECTORIES) {
    if (!fs.existsSync(dir)) {
      console.warn(`Warning: Directory not found: ${dir}`);
    }
  }

  // Get all image files from all directories
  const targets: string[] = [];
  for (const dir of DIRECTORIES) {
    if (fs.existsSync(dir)) {
      const files = getAllImageFiles(dir);
      targets.push(...files);
    }
  }

  if (targets.length === 0) {
    console.log("No JPG/PNG images found to convert.");
    return;
  }

  console.log(`Found ${targets.length} images in the following directories:`);
  DIRECTORIES.forEach(dir => console.log(`  - ${dir}`));
  console.log(`Converting to WebP format...\n`);

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of targets) {
    try {
      const outputPath = path.join(
        path.dirname(file),
        `${path.basename(file, path.extname(file))}.webp`
      );
      
      if (fs.existsSync(outputPath)) {
        skipped++;
        continue;
      }
      
      await convertImageToWebp(file, 82);
      converted += 1;
    } catch (err) {
      console.error(`✗ ${err}`);
      failed += 1;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Converted: ${converted}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${targets.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


