# AI-Generated Portrait Gallery

This directory is for storing AI-generated portraits and headshots that can be used throughout the site.

## Best Practices for AI Portraits

1. **Consistent Style**: Maintain a consistent visual style across AI-generated portraits
2. **Resolution**: Use high-resolution images (at least 1024x1024 pixels)
3. **Context**: Include forestry and technology elements in the background or surroundings
4. **Professional Look**: Ensure the portraits maintain a professional appearance
5. **Filename Convention**: Use descriptive filenames that include the context or setting (e.g., `ai-portrait-forest-data.jpg`)

## Implementation

To add a portrait to the gallery section, add it to the HTML with this structure:

```html
<div class="ai-portrait-gallery">
  <div class="ai-portrait-item">
    <img src="/assets/images/ai-portraits/filename.jpg" alt="Description of portrait">
    <div class="ai-portrait-caption">
      <h4>Portrait Title</h4>
      <p>Brief description of the context or setting</p>
    </div>
  </div>
  <!-- Add more portrait items as needed -->
</div>
```

The CSS styling for the gallery is already included in the main stylesheet.