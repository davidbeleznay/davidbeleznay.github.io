---
layout: page
title: Resources
permalink: /resources/
---

## AI Forester Resources

Useful tools, datasets, and references for the forestry-AI intersection.

### Featured Resources

<div class="resource-grid">

<div class="resource-card">
  <h3><a href="https://drive.google.com/file/d/16ZgRiskDNVCyqpxBFA-IskUzwNYNUogO/view?usp=sharing" target="_blank">AI Prompts for Forestry (50+ Prompts)</a></h3>
  <p>A comprehensive collection of AI prompts specifically designed for forestry professionals, covering everything from forest inventory to climate adaptation planning.</p>
  <div class="resource-meta">
    <span class="type">Prompt Library</span>
    <span class="categories">
      <span class="category">AI Tools</span>
      <span class="category">Forestry</span>
    </span>
  </div>
</div>

<div class="resource-card">
  <h3><a href="/learning/">AI Forestry Learning Hub</a></h3>
  <p>Structured educational pathways, tutorials, and case studies for learning how to apply AI in forestry contexts.</p>
  <div class="resource-meta">
    <span class="type">Educational</span>
    <span class="categories">
      <span class="category">Tutorials</span>
      <span class="category">Case Studies</span>
    </span>
  </div>
</div>

<div class="resource-card">
  <h3><a href="/tools/rainwise-calculator.html">RainWise Calculator</a></h3>
  <p>Interactive tool for calculating precipitation and rainfall patterns, useful for forest hydrology assessments.</p>
  <div class="resource-meta">
    <span class="type">Calculator</span>
    <span class="categories">
      <span class="category">Hydrology</span>
      <span class="category">Tools</span>
    </span>
  </div>
</div>

</div>

### External Resources

**AI & Machine Learning for Environmental Science:**
- [Google Earth Engine](https://earthengine.google.com/) - Cloud-based platform for planetary-scale geospatial analysis
- [OpenAI API Documentation](https://platform.openai.com/docs) - For integrating AI language models into forestry applications
- [Hugging Face Transformers](https://huggingface.co/transformers/) - Open-source machine learning library

**Forestry Data & Tools:**
- [USDA Forest Service Research Data Archive](https://www.fs.usda.gov/rds/) - Open access to forest research datasets
- [Global Forest Watch](https://www.globalforestwatch.org/) - Real-time forest monitoring platform
- [Forest Inventory and Analysis (FIA) Database](https://www.fia.fs.usda.gov/) - Comprehensive forest data for the United States

**Climate & Environmental Data:**
- [Climate Data Online](https://www.ncdc.noaa.gov/cdo-web/) - Historical weather and climate data
- [NASA Earthdata](https://earthdata.nasa.gov/) - Earth science data from NASA missions
- [WorldClim](https://www.worldclim.org/) - Global climate data for ecological modeling

<style>
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.resource-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.resource-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.resource-card h3 a {
  color: var(--primary-dark);
  text-decoration: none;
}

.resource-card h3 a:hover {
  color: var(--accent);
}

.resource-card p {
  color: var(--gray);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.resource-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.type {
  background-color: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.categories {
  display: flex;
  gap: 0.25rem;
}

.category {
  background-color: var(--light-gray);
  color: var(--dark);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
