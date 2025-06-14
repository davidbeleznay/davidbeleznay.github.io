# Changelog

## 2025-06-08
- **RAINWISE CALCULATOR FIXED:** Restored complete enhanced version after truncation issue
  - **Problem:** File was truncated showing only JavaScript portion (13KB instead of 48KB)
  - **Solution:** Restored complete HTML file with all structure, styles, and scripts
  - **Verified:** All enhanced features are now working properly
  - **Features Restored:**
    - Water consumption history tracking (Step 2)
    - Visual charts using Chart.js
    - Usage insights and personalized recommendations
    - Water-saving alternatives section
    - Enhanced PDF generation with consumption analysis
    - Complete 5-step progress bar
  - **Result:** Calculator is fully functional with all recent enhancements

## 2025-06-07
- **RAINWISE CALCULATOR ENHANCED:** Added water consumption input and personalized recommendations
  - **Added:** New Step 2 for water consumption history with 6 bi-monthly input fields
  - **Enhanced:** Visual chart display using Chart.js to show consumption trends
  - **Added:** Usage insights that analyze seasonal patterns and highlight high-usage periods
  - **Improved:** Calculator now uses actual consumption data when available for more accurate savings calculations
  - **Added:** Water-saving alternatives section with 4 additional conservation strategies
  - **Enhanced:** Alternative savings include low-flow fixtures (2,500 gal/year), native plants (5,000 gal/year), leak fixes (3,000 gal/year), and optimized watering schedules (1,500 gal/year)
  - **Updated:** Progress bar to show 5 steps instead of 4
  - **Enhanced:** PDF report now includes consumption analysis when data is provided
  - **Result:** More personalized and accurate water savings calculations based on actual usage patterns

## 2025-06-06
- **LEARNING HUB MAJOR ENHANCEMENT:** Complete redesign for better interactivity and engagement
  - **Redesigned:** Modern UI with enhanced visual hierarchy and animations
  - **Added:** Interactive progress tracking indicator that follows user scroll
  - **Enhanced:** Course cards with smooth expansion animations and interactive quizzes
  - **Improved:** Learning pathways with distinct color coding and hover effects
  - **Added:** Newsletter signup section for continuous engagement
  - **Enhanced:** Mobile responsiveness with improved touch targets
  - **Added:** Gamification elements ready for badges and achievements
  - **Improved:** Typography using Inter and Space Grotesk fonts for better readability
  - **Added:** Floating background patterns for visual interest
  - **Enhanced:** CTAs with better contrast and hover states
  - **Result:** Much more engaging and interactive learning experience

- **BEAVER AI RESTORATION PAGE ENHANCED:** Complete content overhaul with 2025 implementation details
  - **Updated:** Comprehensive rewrite incorporating real-world EEAGER model implementation
  - **Added:** Impact statement highlighting BC orthophoto integration and Google Earth Engine workflow
  - **Enhanced:** Key benefits grid with visual icons for water storage, habitat, flood control, and carbon
  - **Added:** Detailed detection workflow steps (imagery → neural network → GEE/Colab → export)
  - **Restructured:** AI methodology into four domains with visual cards
  - **Improved:** Copy throughout with stronger CTAs and clearer value propositions
  - **Added:** Future directions grid highlighting scaling opportunities
  - **Enhanced:** Mobile responsiveness with better layouts and touch targets
  - **Added:** Strong closing CTA for watershed management transformation
  - **Result:** Much more compelling and actionable project page

## 2025-06-04
- **RESOURCES PAGE FIXED:** Created working standalone HTML resources page
  - **Problem:** Resources page at /resources/ was not displaying properly due to Jekyll processing issues
  - **Solution:** Created standalone HTML version with complete header, navigation, and footer
  - **Added:** Professional styling with enhanced resource cards and hover effects
  - **Enhanced:** Better organization with featured resources and external resource sections
  - **Improved:** SEO meta tags and social media optimization for resources page
  - **Result:** Resources page now works properly and displays all content beautifully

- **PROJECT IMAGE FIXED:** Corrected Climate-Smart Forestry image path
  - **Problem:** Climate-Smart Forestry project card showing broken image placeholder
  - **Solution:** Updated image path to use existing climate-smart-forestry.jpg
  - **Result:** Project card now displays proper image instead of broken placeholder

- **HERO SECTION COMPLETELY REDESIGNED:** Created impactful hero without banners, much more professional
  - **Enhanced:** Larger hero image (400x400px) with professional hover effects and shadows
  - **Added:** Compelling stats section (20+ Years Experience, 50+ AI Prompts, 15+ Projects)
  - **Improved:** Better typography with gradient text effects on "Engineer. Forester."
  - **Enhanced:** More descriptive subtitle highlighting 20+ years of forestry expertise
  - **Added:** Professional CTA button with gradient and hover animations
  - **Responsive:** Mobile-optimized with stacked layout on smaller screens
  - **NO BANNERS:** Clean, professional design focused on personal branding

- **RESOURCES NAVIGATION FIXED:** Corrected links to ensure resources page works properly
  - **Problem:** Resources link was not working from pure HTML homepage
  - **Solution:** Updated navigation to properly link to `/resources/` Jekyll page
  - **Result:** Resources page should now be accessible and display properly

- **LAYOUT ISSUES FIXED:** Resolved "weird" layout problems after hero image restoration
  - **Problem:** Jekyll front matter in index.html was causing rendering issues
  - **Solution:** Created proper HTML file without Jekyll syntax conflicts
  - **Added:** Complete HTML structure with proper header, navigation, and footer
  - **Fixed:** All sections now display correctly with proper styling
  - **Result:** Site displays professional layout with hero image and all content properly formatted

- **BLANK PAGE FIXED:** Final resolution of Jekyll index file conflicts
  - **Problem:** Empty index.html file was causing blank page display
  - **Solution:** Replaced index.html with proper Jekyll content including hero image layout
  - **Added:** Hero section with personal headshot and "Engineer. Forester. AI Explorer." tagline
  - **Result:** Site now displays proper hero layout with professional image and branding
  - **Note:** GitHub Pages should rebuild and display correctly within 2-3 minutes

- **CRITICAL FIX:** Resolved conflicting index.html file that was preventing hero image from displaying
  - **Problem:** An old index.html file was taking precedence over index.md, showing the old forest background design
  - **Solution:** Deleted conflicting index.html file to allow Jekyll to properly process index.md
  - **Result:** Hero section now displays proper layout with personal headshot and "Engineer. Forester. AI Explorer." tagline
  - **Note:** Site should fully rebuild within 2-3 minutes after this commit

- **HERO SECTION RESTORED:** Implemented hero image layout with professional tagline
  - **Added:** Hero image using `/assets/images/profile/hero-headshot.jpg`
  - **Enhanced:** Tagline changed to "Engineer. Forester. AI Explorer." with green highlighting
  - **Improved:** Two-column layout with image on left, content on right
  - **Mobile-responsive:** Stacks vertically on mobile devices
  - **Result:** Professional appearance matching original design vision

- **RESOURCES PAGE FIXED:** Resolved blank screen issue and added comprehensive content
  - **Problem:** Jekyll collection loop was commented out, causing empty appearance
  - **Solution:** Added featured resources grid with actual useful content
  - **Added:** Links to AI Prompt Library (50+ prompts), Learning Hub, and RainWise Calculator
  - **Enhanced:** External resources section with forestry and AI tools
  - **Styled:** Custom CSS for resource cards with hover effects
  - **Result:** Resources page now provides real value to visitors

- **CSS ENHANCEMENTS:** Added new hero layout styles and improved responsive design
  - **Added:** `.hero-with-image` class for side-by-side layout
  - **Enhanced:** Professional styling with shadows and rounded corners
  - **Improved:** Mobile responsiveness for hero section
  - **Forced:** Clean white background on hero sections (no forest background images)
  - **Result:** Better visual hierarchy and professional appearance

- **HOMEPAGE RESTORED:** Fixed styling and layout issues after site came back online
  - **Problem:** Temporary HTML homepage was interfering with Jekyll processing
  - **Solution:** Restored proper Jekyll-based index.md with layout: default
  - **Fixed:** Removed conflicting index.html file that was bypassing Jekyll layouts
  - **Enabled Jekyll:** Removed .nojekyll file to allow proper CSS and layout processing
  - **Result:** Site now uses proper Jekyll layouts, CSS, and styling as intended

- **EMERGENCY FIX:** Final resolution of persistent blank page issue
  - **Problem:** Empty index.html file still present in root directory causing Jekyll conflicts
  - **Solution:** Completely removed conflicting index.html file from root directory
  - **Backup:** Moved original content to index_backup.html for safety  
  - **Result:** Jekyll can now properly process index.md as homepage without file conflicts
  - **Status:** Site should be fully functional after GitHub Pages rebuild

## 2025-06-02
- **CRITICAL FIX:** Resolved blank page issue caused by conflicting index files
  - **Problem:** Both index.html and index.md existed in root, causing Jekyll build conflicts
  - **Solution:** Moved conflicting index.html content to enhanced _layouts/default.html
  - **Enhanced SEO:** Integrated all SEO metadata, Open Graph tags, and Schema.org markup into Jekyll layout system
  - **Improved:** Added dynamic meta tags that work with Jekyll front matter variables
  - **Added:** Font Awesome CSS for icon support across all pages
  - **Result:** Jekyll now properly processes index.md as homepage with full SEO metadata

## 2025-06-01
- **SEO & METADATA ENHANCEMENT:** Comprehensive SEO optimization across all educational pages
  - Enhanced homepage with educational-focused title: "AI Forester | Forestry Education, AI Tutorials & Climate-Smart Solutions"
  - Added comprehensive keywords including "AI forester, forestry education, sustainable forestry practices, forest management AI, environmental technology education"
  - Implemented Schema.org markup for Professional Service with educational focus
  - Updated learning hub title: "AI Forestry Education Hub | Free Courses, Tutorials & Case Studies for Forest Professionals"
  - Added Educational Organization schema markup with course details and provider credentials
  - Enhanced resources page with "AI Tools & Resources for Foresters | Free Prompt Library & Educational Materials"
  - Implemented DataCatalog schema for resource collection with 50+ AI prompts
  - Added comprehensive accessibility improvements with aria-labels and semantic HTML
  - Optimized meta descriptions to emphasize educational value and free resources
- **MAJOR:** Complete Learning Hub redesign with structured educational pathways
  - Added three skill-level pathways: Beginner (4-6 weeks), Intermediate (6-8 weeks), Advanced (8-12 weeks)
  - Created 15+ comprehensive tutorials with expandable course content and learning objectives
  - Added 6 detailed case studies with real-world applications and measurable outcomes
  - Built comprehensive AI Forestry Glossary with 20+ essential terms and definitions
  - Included AI Tools Guide with specific forestry use cases for each tool
  - Added interactive course expansion and smooth scrolling navigation
  - Structured learning stats display (15+ tutorials, 3 skill levels, 6 case studies)
  - Enhanced SEO with educational-focused meta tags and keywords
- **EDUCATIONAL REFRAMING:** Updated homepage hero section with educational focus
  - Changed hero subtitle from "Helping busy builders unlock real-world potential with AI + tech solutions..." to "Exploring the intersection of forestry and AI to foster sustainable practices."
  - Updated primary CTA from "See My Work" to "Dive into Learning" to emphasize educational value
  - Enhanced meta descriptions and page titles to reflect educational positioning
  - Shifted brand positioning from service-focused to education and exploration-focused
- **FIXED:** Updated Google Drive link in prompt library from folder to specific file
  - Changed from: `https://drive.google.com/drive/folders/1hNs6pFCquZ3ABCzNpUNW5r10h6rrYHzd`
  - Changed to: `https://drive.google.com/file/d/16ZgRiskDNVCyqpxBFA-IskUzwNYNUogO/view?usp=sharing`
  - Updated in resources/index.html modal success section for proper prompt library access

## 2025-04-27
- Added sitemap.xml for improved search engine and AI crawler indexing
  - Included all main pages and sections with appropriate priority levels
  - Set lastmod dates to reflect recent content updates
  - Organized with logical hierarchy (homepage > main sections > specific content)
- Added robots.txt file optimized for AI scraping and search engine indexing
  - Included explicit permissions for AI bots (GPTBot, Google-Extended, Claude-Web, Anthropic-AI)
  - Set crawl-delay to balance server load and comprehensive indexing
  - Explicitly marked content directories as scrapable
- Moved "Not a real BDA" disclaimer closer to the image:
  - Converted text to an overlay positioned on the BDA image
  - Added semi-transparent dark background with white text for better visibility
  - Ensured mobile responsiveness with appropriate positioning
- Updated image sizes in beaver-ai-restoration.html:
  - Reduced featured hero beaver image to 50% width with centered layout
  - Restored AI dashboard image to 600px width (from 300px)
  - Added responsive adjustments for mobile viewing
- Further reduced AI dashboard image size to 50% of its previous size
  - Decreased max-width from 600px to 300px
  - Maintained the wrapper div structure for consistent centering
  - Improved overall page proportion with smaller dashboard visualization
- Further reduced AI dashboard image size to 75% of previous size
  - Decreased max-width from 800px to 600px
  - Added wrapper div for better control of image display
  - Improved centering and proportion for better page balance
- Adjusted BDA image layout proportions - increased image size and reduced spacing between image and text
  - Increased BDA image column width from 45% to 50%
  - Increased BDA image max height from 300px to 400px
  - Reduced padding between image and text for tighter layout
- Reduced AI dashboard image size with max-width constraint and centered layout
  - Added max-width of 800px to the dashboard container
  - Added auto margins for proper centering
- Updated AI monitoring dashboard image to use AIData.jpg for a more realistic data visualization
- Added custom styling for the AI dashboard container with background, shadow, and improved caption
- Enhanced the dashboard image alt text and caption to provide more context about the monitoring system
- Redesigned BDA image layout with side-by-side format (image left, text right)
- Added clearer "Not a real BDA" disclaimer to the caption
- Added light background and subtle shadow to the image-text container for better visual separation
- Implemented responsive layout adjustment for mobile devices
- Reduced BDA image size in beaver-ai-restoration.html for better visual balance
- Added custom CSS to control BDA image dimensions and ensure proper display
- Updated beaver-ai-restoration.html to use BDA.jpg image for the Beaver-Dam Analogue installation section
- Added note that the pictured approach is not how professional BDAs are typically made
- Added link to the Low-Tech Process-Based Restoration Design Manual at https://lowtechpbr.restoration.usu.edu/manual/
- Removed the "Results & Innovations" section with specific metrics and claims for a more accurate representation
- Updated all "beaver dam" references to "beaver dam analogues (BDA)" for consistency across the site
- Updated alt text and descriptions related to beaver projects
- Updated beaver-ai-restoration.html page with correct BDA terminology
- Updated homepage beaver project section with correct BDA terminology
- Updated projects index page with correct BDA terminology
- Updated forest-inventory-analysis.html page case study section to use climate-smart-forestry.jpg instead of beaver-dam-ai.jpg
- Updated projects index page to use climate-smart-forestry.jpg instead of climate-smart-forestry-cover.jpg
- Updated homepage to use climate-smart-forestry.jpg instead of climate-smart-forestry-cover.jpg
- Updated image caption text for better context and description
- Updated projects index page to link to forest-inventory-analysis.html
- Updated homepage featured projects section to link to climate-smart forestry content via forest-inventory-analysis.html
- Simplified climate-smart forestry project description on homepage for better readability
- Completely replaced forest-inventory-analysis.html with Climate-Smart Forestry content
- Updated images in forest-inventory-analysis.html:
  - Added climate-smart-forester.jpg award ceremony photo to recognition section
  - Updated case study section with the primary climate-smart-forestry.jpg image
- Enhanced alt text for award ceremony photo for better accessibility
- Updated image captions to be more descriptive and SEO-friendly
- Enhanced climate-smart forestry content with practical applications section targeting specific user groups
- Added resources section to climate-smart forestry page with links to blog and consultation options
- Replaced old Forest Inventory Analysis page with comprehensive Climate-Smart Forestry content
- Updated projects index to reflect climate-smart forestry focus
- Created new blog post on climate-smart forestry in /content/blog/climate-smart-forestry/
- Improved SEO with enhanced meta titles and descriptions focused on climate-smart forestry
- Updated homepage to link to new climate-smart forestry page
- Created new Climate-Smart Forestry project page highlighting adaptation and mitigation work
- Added personal story about training AI headshot model with 6-year-old's help
- Removed old SVG files to resolve caching issues:
  - Cleaned up `assets/images/services/ai-team-structure.svg`
  - Cleaned up `assets/images/services/implementation-approaches.svg`
- Updated professional visuals description to include "professional headshots for busy professionals"
- Replaced SVG diagrams with JPG images in services.html:
  - Updated team approach visual with AIteam.jpg 
  - Updated implementation approaches visual with Service2.jpg
- Improved alt text for better accessibility and SEO

## 2025-04-26
- Updated hero section with right-aligned text overlay to prevent covering the person in the image
- Modified gradient overlay direction from left-to-right to right-to-left for better text readability
- Adjusted content positioning for optimal visual balance
- Changed header branding from "David Beleznay" to "AI Forester" throughout site
- Improved hero text styling with green coloring for "Engineer. Forester."
- Added AI portrait gallery structure and styles for future AI-generated headshots
- Updated meta information to reflect AI Forester branding
- Created /assets/images/services/ directory for service diagrams
- Added AI team structure SVG diagram
- Added implementation approaches SVG diagram 
- Updated services page to use AI Forester branding
- Removed client success stories section from services page
- Updated headshots section on services page to reference AI-generated visuals
- Fixed projects page logo spacing and branding
- Fixed products page logo spacing and updated newsletter section title
- Ensured consistent "AI Forester" branding across all site headers
- Updated LinkedIn and social links to use consistent formatting
- Added AI-generated portrait images to /assets/images/ai-portraits/ directory
- Updated AI portrait gallery with actual AI images
- Enhanced AI portrait gallery with placeholder slots for future images
- Added new Applications of AI Imagery section to portrait gallery page
- Replaced placeholder image references on services page with actual AI portraits
- Added link from services page to AI portrait gallery
- Optimized image display heights for better consistency
