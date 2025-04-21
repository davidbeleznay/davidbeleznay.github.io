# Project Images for AI Forester Website

This directory contains images used for the AI Forester website projects section.

## SVG Placeholder Images

The following SVG placeholder images have been created to display projects on the website:

1. **beaver-dam-ai.svg** - Beaver and AI Assisted Ecological Restoration project image
2. **forestry-data-visualization.svg** - Forestry Data Visualization project image
3. **prompt-engineering.svg** - Prompt Engineering for Forestry project image

## Converting SVG to JPG

These SVG files need to be converted to JPG format for proper display on the website. Two methods are available:

### Browser Conversion Method

1. Navigate to [tools/svg-to-jpg.html](../../tools/svg-to-jpg.html) in your browser
2. Drag and drop the SVG files onto the converter
3. The converted JPG files will be downloaded automatically

### Node.js Conversion Method

If you have Node.js installed, you can use the provided script to convert all SVG files at once:

1. Install required dependencies:
   ```bash
   npm install sharp fs path
   ```

2. Run the conversion script:
   ```bash
   node scripts/svg-to-jpg-converter.js assets/images/projects assets/images/projects
   ```

## Image Requirements

For optimal website performance:

- Final JPG images should be 1200×800 pixels
- File size should be under 200KB per image
- Images should maintain the AI Forester brand color scheme
- Use descriptive file names that match the content

## Replacement Plan

After converting SVG files to JPG format, ensure all HTML files reference the JPG versions instead of the SVG files.

The main references are in:
- `index.html` - Featured projects section
- `projects/index.html` - Projects listing page
- Individual project pages

## Future Improvements

These placeholder images should be replaced with actual project photographs or more detailed custom graphics when available.