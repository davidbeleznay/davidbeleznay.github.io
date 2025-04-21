/**
 * SVG to JPG Converter
 * This script converts SVG files to JPG files for better browser compatibility
 * 
 * Usage in browser:
 * - Open the HTML file that includes this script
 * - Drag and drop SVG files onto the page
 * - JPG files will be downloaded automatically
 * 
 * Usage with Node.js (requires additional packages):
 * - npm install sharp fs path
 * - node svg-to-jpg-converter.js <input-directory> <output-directory>
 */

// Browser version
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const statusText = document.getElementById('status');
    
    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
      dropArea.classList.remove('highlight');
    }
    
    // Handle file drop
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    }
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
      handleFiles(this.files);
    });
    
    function handleFiles(files) {
      const validFiles = [...files].filter(file => file.type === 'image/svg+xml');
      
      if (validFiles.length === 0) {
        statusText.textContent = 'Please select SVG files only.';
        return;
      }
      
      statusText.textContent = `Converting ${validFiles.length} SVG files...`;
      
      validFiles.forEach(file => {
        convertSvgToJpg(file);
      });
    }
    
    function convertSvgToJpg(file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const svgString = e.target.result;
        
        // Create an image element
        const img = new Image();
        
        img.onload = function() {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          canvas.width = 1200;  // Set desired width
          canvas.height = 800;  // Set desired height
          
          // Draw the image on the canvas
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to JPG
          const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // Create download link
          const link = document.createElement('a');
          link.href = jpgDataUrl;
          link.download = file.name.replace('.svg', '.jpg');
          link.click();
          
          statusText.textContent = `Converted ${file.name} successfully!`;
        };
        
        // Set the source of the image to the SVG as a data URL
        img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
      };
      
      reader.readAsText(file);
    }
  });
}

// Node.js version
if (typeof process !== 'undefined') {
  try {
    const fs = require('fs');
    const path = require('path');
    const sharp = require('sharp');
    
    const inputDir = process.argv[2] || './assets/images/projects';
    const outputDir = process.argv[3] || './assets/images/projects';
    
    // Check if directories exist
    if (!fs.existsSync(inputDir)) {
      console.error(`Input directory ${inputDir} does not exist.`);
      process.exit(1);
    }
    
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory ${outputDir}...`);
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`Searching for SVG files in ${inputDir}...`);
    
    // Get all SVG files in the input directory
    const svgFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.svg'))
      .map(file => path.join(inputDir, file));
    
    console.log(`Found ${svgFiles.length} SVG files.`);
    
    // Convert each SVG file to JPG
    svgFiles.forEach(svgFile => {
      const outputFile = path.join(
        outputDir,
        path.basename(svgFile).replace('.svg', '.jpg')
      );
      
      console.log(`Converting ${svgFile} to ${outputFile}...`);
      
      sharp(svgFile)
        .jpeg({ quality: 90 })
        .toFile(outputFile)
        .then(() => {
          console.log(`Successfully converted ${svgFile} to ${outputFile}.`);
        })
        .catch(err => {
          console.error(`Error converting ${svgFile}:`, err);
        });
    });
  } catch (error) {
    console.error('Error importing Node.js modules:', error);
    console.log('Make sure you have the required dependencies installed:');
    console.log('npm install sharp fs path');
  }
}
