// Turns the About photo into the hero's pixel portrait: crop to head and shoulders, shrink to 88x88,
// limit to 32 flat colors (no dither). Writes public/hero/portrait-pixel.png.
// Run: node scripts/portrait-art.mjs   (uses sharp, which Next.js already installs)
import sharp from "sharp";

await sharp("public/images/about.jpg") // 720x900
  .extract({ left: 60, top: 50, width: 600, height: 600 })
  .resize(88, 88)
  .modulate({ saturation: 1.25, brightness: 1.12 })
  .png({ palette: true, colours: 32, dither: 0 })
  .toFile("public/hero/portrait-pixel.png");
console.log("wrote public/hero/portrait-pixel.png 88 x 88");
