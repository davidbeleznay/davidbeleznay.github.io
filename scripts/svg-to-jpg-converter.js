/**
 * SVG to JPG Conversion Script
 * 
 * This script can be used in both Node.js and browser environments to convert SVG files to JPG format.
 * 
 * Browser Usage: Copy the browser section to a HTML file or use the provided svg-to-jpg.html tool.
 * Node.js Usage: Save this script and run with Node.js, providing input and output directories.
 */

// ========================
// BROWSER IMPLEMENTATION
// ========================

function convertSvgToJpgInBrowser(svgString, width = 1200, height = 800) {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create an image element to render the SVG
    const img = new Image();
    
    // Convert SVG string to data URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    // Handle image loading
    img.onload = () => {
      // Fill background with white (since JPGs don't support transparency)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to data URL then to blob
      canvas.toBlob((blob) => {
        resolve(blob);
        // Clean up
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
      URL.revokeObjectURL(url);
    };
    
    // Start loading the image
    img.src = url;
  });
}

// Example browser implementation:
/*
document.getElementById('convertButton').addEventListener('click', async () => {
  const svgInput = document.getElementById('svgInput').value;
  
  try {
    const jpgBlob = await convertSvgToJpgInBrowser(svgInput);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(jpgBlob);
    downloadLink.download = 'converted-image.jpg';
    downloadLink.click();
    
    // Clean up
    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    console.error('Conversion failed:', error);
  }
});
*/

// ========================
// NODE.JS IMPLEMENTATION
// ========================

// This section requires:
// npm install sharp fs path

/*
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertSvgToJpgNode(inputFile, outputFile, width = 1200, height = 800) {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(inputFile);
    
    // Convert to JPG using sharp
    await sharp(svgBuffer)
      .resize(width, height)
      .jpeg({ quality: 95 })
      .toFile(outputFile);
    
    console.log(`Converted ${inputFile} to ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${inputFile}:`, error);
    return false;
  }
}

async function processDirectory(inputDir, outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all SVG files
  const files = fs.readdirSync(inputDir)
    .filter(file => file.toLowerCase().endsWith('.svg'));
  
  console.log(`Found ${files.length} SVG files to convert`);
  
  // Process each file
  for (const file of files) {
    const inputFile = path.join(inputDir, file);
    const outputFile = path.join(
      outputDir, 
      file.replace(/\.svg$/i, '.jpg')
    );
    
    await convertSvgToJpgNode(inputFile, outputFile);
  }
}

// Main execution (if run directly)
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node svg-to-jpg-converter.js <input-directory> <output-directory>');
    process.exit(1);
  }
  
  const [inputDir, outputDir] = args;
  
  processDirectory(inputDir, outputDir)
    .then(() => console.log('Conversion complete'))
    .catch(err => console.error('Conversion failed:', err));
}

module.exports = {
  convertSvgToJpgNode,
  processDirectory
};
*/
