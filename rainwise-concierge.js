// Concierge Service Addition for RainWise Calculator
// This script adds the concierge service offer to the existing calculator

// Webhook URL for updating existing records when concierge is selected
const CONCIERGE_UPDATE_WEBHOOK = 'https://hook.us2.make.com/19p8ls4flqou0jqsy368v8rjmzwz7ydh';

// Function to add concierge section when results are shown
function addConciergeSection() {
  // Check if concierge section already exists
  if (document.getElementById('conciergeServiceSection')) {
    return;
  }
  
  // Find the cta-section div
  const ctaSection = document.querySelector('.cta-section');
  
  if (ctaSection && ctaSection.parentNode) {
    // Get the bath savings if available
    let bathsSaved = '';
    let savingsMessage = 'Our concierge service completely simplifies the rebate process.';
    
    // Try to get bath savings from the results
    const waterSavingsElement = document.getElementById('waterSavings');
    if (waterSavingsElement) {
      const bathText = waterSavingsElement.querySelector('div')?.textContent;
      if (bathText && bathText.includes('baths')) {
        bathsSaved = bathText;
        savingsMessage = `Save ${bathsSaved} of water every year! Our concierge service makes it easy.`;
      }
    }
    
    // Create the concierge service section
    const conciergeSection = document.createElement('div');
    conciergeSection.id = 'conciergeServiceSection';
    conciergeSection.innerHTML = `
      <div style="background: #F0F7FF; border: 2px solid #2196F3; border-radius: 10px; padding: 30px; margin: 40px 0; text-align: center;">
        <h3 style="color: #1976D2; margin-bottom: 15px;">💼 Want Us to Handle Everything for You?</h3>
        <p style="font-size: 1.1em; margin-bottom: 20px;">${savingsMessage} We handle all the paperwork, follow-ups, and submissions.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 25px 0; text-align: left;">
          <div style="padding: 10px;">✅ Complete all application forms</div>
          <div style="padding: 10px;">✅ Gather required documentation</div>
          <div style="padding: 10px;">✅ Submit to RDN on your behalf</div>
          <div style="padding: 10px;">✅ Track application status</div>
          <div style="padding: 10px;">✅ Handle any follow-ups needed</div>
          <div style="padding: 10px;">✅ Ensure approval or money back</div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; margin-top: 10px;">
          <p style="font-size: 1.2em; margin-bottom: 15px;"><strong>Complete Concierge Service: $25</strong></p>
          <p style="color: #666; margin-bottom: 20px;">Average client gets $875 in rebates - that's a 35x return!</p>
          <button id="conciergeButton" onclick="activateConciergeService()" style="background: #2196F3; color: white; padding: 12px 30px; font-size: 1.1em; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
            Yes, Handle My Rebates →
          </button>
        </div>
        
        <p style="margin-top: 15px; font-size: 0.9em; color: #666;">🛡️ 100% Money-Back Guarantee if rebates aren't approved</p>
      </div>
    `;
    
    // Insert after the cta-section
    ctaSection.parentNode.insertBefore(conciergeSection, ctaSection.nextSibling);
    console.log('Concierge section added to page');
  }
}

// Store the user's email when they save results
window.userEmailForUpdate = null;

// Try multiple ways to ensure the concierge section is added
document.addEventListener('DOMContentLoaded', function() {
  console.log('RainWise Concierge Service initializing...');
  
  // Hook into the email capture to store the user's email
  const originalCaptureLeadWithResults = window.captureLeadWithResults;
  if (originalCaptureLeadWithResults) {
    window.captureLeadWithResults = function() {
      // Store the email for later use in concierge update
      const emailInput = document.getElementById('user-email');
      if (emailInput && emailInput.value) {
        window.userEmailForUpdate = emailInput.value;
        console.log('Stored email for concierge update:', window.userEmailForUpdate);
      }
      // Call original function
      originalCaptureLeadWithResults();
    };
  }
  
  // Method 1: Override calculateSavings function
  setTimeout(function() {
    const originalCalculateSavings = window.calculateSavings;
    if (originalCalculateSavings) {
      window.calculateSavings = function() {
        // Call original function
        originalCalculateSavings();
        
        // Add concierge section after calculation
        setTimeout(addConciergeSection, 1000);
      };
      console.log('Hooked into calculateSavings');
    }
  }, 100);
  
  // Method 2: Watch for results section to become visible
  const observer = new MutationObserver(function(mutations) {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection && resultsSection.style.display !== 'none') {
      addConciergeSection();
    }
  });
  
  // Start observing
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    observer.observe(resultsSection, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    console.log('Watching results section for visibility changes');
  }
  
  // Method 3: Check periodically for the first few seconds
  let checkCount = 0;
  const checkInterval = setInterval(function() {
    checkCount++;
    const ctaSection = document.querySelector('.cta-section');
    const resultsSection = document.getElementById('resultsSection');
    
    if (ctaSection && resultsSection && resultsSection.style.display !== 'none') {
      addConciergeSection();
      clearInterval(checkInterval);
    }
    
    // Stop checking after 10 seconds
    if (checkCount > 20) {
      clearInterval(checkInterval);
    }
  }, 500);
});

// Add the concierge service activation function
window.activateConciergeService = function() {
  console.log('Concierge service activation started');
  
  // Get the email to identify which record to update
  const emailToUpdate = window.userEmailForUpdate || 
                        document.getElementById('user-email')?.value ||
                        document.getElementById('email')?.value || '';
  
  if (!emailToUpdate) {
    alert('Please save your results first using the "Save My Results" button above, then activate the concierge service.');
    // Scroll to email capture section
    const emailSection = document.querySelector('[style*="background: linear-gradient(135deg, #4CAF50, #2E7D32)"]');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  
  // Get bath savings if available
  let bathsSaved = 0;
  const waterSavingsElement = document.getElementById('waterSavings');
  if (waterSavingsElement) {
    const bathText = waterSavingsElement.querySelector('div')?.textContent;
    if (bathText) {
      const bathMatch = bathText.match(/[\d,]+/);
      if (bathMatch) {
        bathsSaved = parseInt(bathMatch[0].replace(/,/g, ''));
      }
    }
  }
  
  // Prepare data for the UPDATE webhook (not create)
  const updateData = {
    Email: emailToUpdate,  // This is the KEY to find the record
    ServiceType: 'Concierge',  // Update to Concierge
    ServiceFee: 25,
    BathsSaved: bathsSaved,
    ConciergeActivatedAt: new Date().toISOString(),
    Name: document.getElementById('fullName')?.value || '',
    Phone: document.getElementById('phoneMain')?.value || ''
  };
  
  console.log('Sending concierge update to webhook:', updateData);
  
  // Send to the SEPARATE concierge update webhook
  const formData = new URLSearchParams();
  for (const key in updateData) {
    formData.append(key, updateData[key]);
  }
  
  fetch(CONCIERGE_UPDATE_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    mode: 'no-cors'
  })
  .then(() => {
    console.log('Concierge update sent successfully');
    alert('Thank you for choosing our concierge service! We\'ll contact you within 24 hours to get started and arrange payment.');
    
    // Update button to show activated
    const button = document.getElementById('conciergeButton');
    if (button) {
      button.textContent = '✓ Concierge Service Activated';
      button.disabled = true;
      button.style.background = '#4CAF50';
    }
  })
  .catch(error => {
    console.error('Concierge update error:', error);
    alert('There was an error processing your request. Please try again or contact us directly.');
  });
};

console.log('RainWise Concierge Service loaded - Update webhook configured');