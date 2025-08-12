/**
 * RainWise Calculator - Webhook & Lead Capture Integration
 * For AI Forester (www.aiforester.com)
 * 
 * This module handles email capture, lead generation, and webhook integration
 * for the RainWise water rebate calculator.
 */

// ============================================
// CONFIGURATION
// ============================================

const WEBHOOK_CONFIG = {
  // Replace with your actual webhook URL from Make.com, Zapier, or n8n
  WEBHOOK_URL: 'https://hook.us1.make.com/YOUR_UNIQUE_WEBHOOK_ID',
  
  // Fallback email for testing (replace with your email)
  ADMIN_EMAIL: 'david@aiforester.com',
  
  // Rate limiting
  MAX_ATTEMPTS_PER_HOUR: 5,
  
  // Local storage keys
  STORAGE_KEY: 'rainwise_calculation',
  QUEUE_KEY: 'rainwise_lead_queue',
  ATTEMPTS_KEY: 'rainwise_rate_limit'
};

// ============================================
// EMAIL CAPTURE & LEAD GENERATION
// ============================================

/**
 * Main function to capture lead with calculation results
 */
async function captureLeadWithResults(calcResults) {
  try {
    // Validate email
    const emailInput = document.getElementById('user-email');
    const userEmail = emailInput?.value?.trim();
    
    if (!userEmail || !validateEmail(userEmail)) {
      showNotification('Please enter a valid email to save your results', 'error');
      return false;
    }
    
    // Check rate limiting
    if (!checkRateLimit(userEmail)) {
      showNotification('Too many attempts. Please try again later.', 'error');
      return false;
    }
    
    // Show loading state
    showLoadingState(true);
    
    // Prepare comprehensive lead data
    const leadData = prepareLeadData(userEmail, calcResults);
    
    // Send to webhook
    const success = await sendToWebhook(leadData);
    
    if (success) {
      // Store locally for quick retrieval
      localStorage.setItem(WEBHOOK_CONFIG.STORAGE_KEY, JSON.stringify(leadData));
      
      // Show success modal
      showSuccessModal(calcResults, userEmail);
      
      // Track conversion
      trackEvent('lead_captured', {
        rebate_amount: calcResults.totalRebate,
        email_provided: true,
        water_savings: calcResults.annualWaterSaved
      });
      
      return true;
    } else {
      // Save to local queue for retry
      saveToLocalQueue(leadData);
      showNotification('Results saved locally. We\'ll email them shortly.', 'warning');
      return false;
    }
    
  } catch (error) {
    console.error('Lead capture error:', error);
    showNotification('Unable to save results. Please try again.', 'error');
    return false;
  } finally {
    showLoadingState(false);
  }
}

/**
 * Prepare comprehensive lead data package
 */
function prepareLeadData(email, calcResults) {
  // Get form data
  const formData = collectFormData();
  
  // Calculate engagement metrics
  const engagementData = calculateEngagement();
  
  return {
    // Contact Information
    contact: {
      email: email,
      name: document.getElementById('fullName')?.value || '',
      phone: document.getElementById('phoneMain')?.value || '',
      phoneAlt: document.getElementById('phoneAlt')?.value || '',
      address: document.getElementById('propertyAddress')?.value || '',
      city: document.getElementById('city')?.value || 'Nanaimo',
      province: 'BC',
      postalCode: document.getElementById('postalCode')?.value || ''
    },
    
    // Calculation Results
    calculation: {
      // Rebate amounts
      totalRebate: calcResults.totalRebates || 0,
      
      // Water savings
      annualWaterSaved_m3: calcResults.totalWaterSavingsM3 || 0,
      peakPeriodSavings_m3: calcResults.peakSavingsM3 || 0,
      
      // Financial impact
      annualCostSavings: calcResults.totalCostSavings || 0,
      environmentalValue: calcResults.totalTrueSavings - calcResults.totalCostSavings || 0,
      totalAnnualValue: calcResults.totalTrueSavings || 0,
      
      // ROI metrics
      paybackPeriod: calcResults.paybackYears || 0,
      tenYearSavings: calcResults.environmentalImpact?.lifetimeCostSavings || 0,
      
      // Selected upgrades
      upgrades: calcResults.upgrades?.map(upgrade => ({
        name: getUpgradeName(upgrade.type),
        selected: true,
        rebateAmount: upgrade.rebate,
        waterSavings: upgrade.waterSavingsM3,
        cost: upgrade.cost,
        netCost: upgrade.netCost
      })) || []
    },
    
    // Property Information
    property: {
      irrigatedArea_sqft: formData.irrigatedArea || 0,
      currentUsage_m3: waterBaseline?.annualUsageM3 || 0,
      irrigationMonths: formData.irrigationMonths || 6,
      irrigationSystem: formData.irrigationSystem || '',
      propertyType: formData.propertyType || 'single',
      hasSmartController: selectedRebates?.includes('smartController') || false,
      hasRainSensor: selectedRebates?.includes('rainSensor') || false,
      hasDripIrrigation: selectedRebates?.includes('dripConversion') || false
    },
    
    // Lead Scoring & Segmentation
    scoring: {
      rebateTier: categorizeRebateAmount(calcResults.totalRebates),
      projectType: determineProjectType(calcResults.upgrades),
      readinessScore: assessProjectReadiness(),
      environmentalMotivation: calcResults.totalTrueSavings > 500 ? 'high' : 'moderate',
      seasonalUrgency: isInPeakSeason() ? 'high' : 'low'
    },
    
    // Metadata
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'rainwise-calculator',
      version: '2.0',
      pageUrl: window.location.href,
      referrer: document.referrer || 'direct',
      device: getDeviceType(),
      ...engagementData
    },
    
    // Marketing Preferences
    preferences: {
      emailConsent: document.getElementById('email-consent')?.checked || true,
      smsConsent: document.getElementById('sms-consent')?.checked || false,
      contractorMatching: document.getElementById('need-contractor')?.checked || true,
      projectTimeline: document.getElementById('leadTiming')?.value || 'exploring'
    }
  };
}

/**
 * Send data to webhook endpoint
 */
async function sendToWebhook(leadData) {
  try {
    const response = await fetch(WEBHOOK_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'RainWise-Calculator',
        'X-Version': '2.0'
      },
      body: JSON.stringify(leadData)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }
    
    // Get response data if webhook returns an ID
    const responseData = await response.text();
    if (responseData) {
      leadData.webhookId = responseData;
    }
    
    return true;
    
  } catch (error) {
    console.error('Webhook send failed:', error);
    return false;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check rate limiting
 */
function checkRateLimit(email) {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(WEBHOOK_CONFIG.ATTEMPTS_KEY) || '{}');
  
  if (!attempts[email]) {
    attempts[email] = [];
  }
  
  // Remove attempts older than 1 hour
  attempts[email] = attempts[email].filter(time => now - time < 3600000);
  
  // Check if under limit
  if (attempts[email].length >= WEBHOOK_CONFIG.MAX_ATTEMPTS_PER_HOUR) {
    return false;
  }
  
  // Add current attempt
  attempts[email].push(now);
  localStorage.setItem(WEBHOOK_CONFIG.ATTEMPTS_KEY, JSON.stringify(attempts));
  
  return true;
}

/**
 * Calculate user engagement metrics
 */
function calculateEngagement() {
  const sessionStart = window.pageLoadTime || Date.now() - 60000;
  const timeOnPage = Math.round((Date.now() - sessionStart) / 1000);
  
  const allInputs = document.querySelectorAll('input, select, textarea');
  const filledInputs = Array.from(allInputs).filter(input => input.value).length;
  
  return {
    timeOnPage_seconds: timeOnPage,
    fieldsCompleted: filledInputs,
    totalFields: allInputs.length,
    completionRate: Math.round((filledInputs / allInputs.length) * 100),
    calculationsPerformed: window.calculationCount || 1,
    scrollDepth: window.maxScrollDepth || 100
  };
}

/**
 * Categorize rebate amount for segmentation
 */
function categorizeRebateAmount(amount) {
  if (amount >= 700) return 'high-value';
  if (amount >= 400) return 'medium-value';
  if (amount >= 100) return 'low-value';
  return 'exploring';
}

/**
 * Determine project type from selected upgrades
 */
function determineProjectType(upgrades) {
  if (!upgrades || upgrades.length === 0) return 'none';
  
  const hasSmartController = upgrades.some(u => u.type === 'smartController');
  const hasDrip = upgrades.some(u => u.type === 'dripConversion');
  const hasRainSensor = upgrades.some(u => u.type === 'rainSensor');
  const hasRainwater = upgrades.some(u => u.type === 'rainwaterHarvesting');
  
  if (hasRainwater) return 'rainwater-harvesting';
  if (hasSmartController && hasDrip) return 'comprehensive';
  if (hasSmartController) return 'smart-upgrade';
  if (hasDrip) return 'drip-conversion';
  if (hasRainSensor) return 'basic-efficiency';
  
  return 'mixed';
}

/**
 * Assess project readiness
 */
function assessProjectReadiness() {
  const timeline = document.getElementById('leadTiming')?.value || document.getElementById('premiumTiming')?.value;
  const hasEmail = document.getElementById('email')?.value;
  const hasPhone = document.getElementById('phoneMain')?.value;
  
  let score = 0;
  
  if (timeline === 'asap') score += 3;
  else if (timeline === '1month') score += 2;
  else if (timeline === '3months') score += 1;
  
  if (hasEmail) score += 2;
  if (hasPhone) score += 1;
  
  if (score >= 5) return 'hot-lead';
  if (score >= 3) return 'warm-lead';
  if (score >= 1) return 'cool-lead';
  return 'cold-lead';
}

/**
 * Check if currently in peak water season
 */
function isInPeakSeason() {
  const month = new Date().getMonth() + 1;
  return month >= 6 && month <= 9; // June to September
}

/**
 * Get device type
 */
function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ============================================
// UI FUNCTIONS
// ============================================

/**
 * Show loading state
 */
function showLoadingState(isLoading) {
  const buttons = document.querySelectorAll('.save-results-btn');
  buttons.forEach(button => {
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 
      '<span class="spinner"></span> Saving...' : 
      button.getAttribute('data-original-text') || 'Save My Results';
  });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.webhook-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `webhook-notification webhook-notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => notification.remove(), 5000);
}

/**
 * Get notification icon
 */
function getNotificationIcon(type) {
  switch(type) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    default: return 'ℹ';
  }
}

/**
 * Show success modal
 */
function showSuccessModal(calcResults, userEmail) {
  const modal = document.createElement('div');
  modal.className = 'webhook-success-modal-overlay';
  modal.innerHTML = `
    <div class="webhook-success-modal">
      <button class="modal-close" onclick="closeWebhookModal()">×</button>
      
      <div class="success-header">
        <div class="success-icon">✓</div>
        <h2>Report Sent Successfully!</h2>
        <p>We've captured your water savings calculation</p>
        <p class="email-display">${userEmail}</p>
      </div>
      
      <div class="next-steps">
        <h3>What Happens Next:</h3>
        <div class="timeline">
          <div class="timeline-item active">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <strong>Within 5 Minutes</strong>
              <p>Check your email for your personalized report</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <strong>Within 24 Hours</strong>
              <p>Receive your complete rebate application checklist</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <strong>This Week</strong>
              <p>Get matched with verified contractors (if requested)</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="upgrade-section">
        <h3>💡 Want Guaranteed Rebate Approval?</h3>
        <p>Our concierge service handles everything for just $35:</p>
        <ul class="benefits-list">
          <li>✓ Complete application preparation</li>
          <li>✓ Document review & verification</li>
          <li>✓ Direct submission to RDN</li>
          <li>✓ Application tracking until approval</li>
          <li>✓ 100% approval rate to date</li>
        </ul>
        
        <div class="modal-actions">
          <button class="btn-primary" onclick="upgradeToConcierge('${calcResults.calculationId || ''}')">
            Yes, Handle Everything for Me →
          </button>
          <button class="btn-secondary" onclick="closeWebhookModal()">
            I'll Do It Myself
          </button>
        </div>
      </div>
      
      <div class="modal-footer">
        <p class="savings-highlight">
          💰 You could save <strong>$${Math.round(calcResults.totalTrueSavings || 0)}</strong> annually
          <br>
          💧 That's <strong>${Math.round(calcResults.totalWaterSavingsM3 || 0)}m³</strong> of water saved
          <br>
          🐟 Including <strong>${Math.round(calcResults.peakSavingsM3 || 0)}m³</strong> during peak salmon periods
        </p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Track modal view
  trackEvent('success_modal_shown', {
    rebate_amount: calcResults.totalRebates,
    water_savings: calcResults.totalWaterSavingsM3
  });
}

/**
 * Close webhook modal
 */
function closeWebhookModal() {
  const modal = document.querySelector('.webhook-success-modal-overlay');
  if (modal) modal.remove();
}

/**
 * Upgrade to concierge service
 */
function upgradeToConcierge(calculationId) {
  // Track upgrade intent
  trackEvent('concierge_upgrade_clicked', {
    calculation_id: calculationId
  });
  
  // Redirect to concierge signup (you can customize this URL)
  window.location.href = `https://aiforester.com/concierge-signup?calc=${calculationId}`;
}

// ============================================
// LOCAL QUEUE MANAGEMENT
// ============================================

/**
 * Save to local queue for retry
 */
function saveToLocalQueue(leadData) {
  try {
    const queue = JSON.parse(localStorage.getItem(WEBHOOK_CONFIG.QUEUE_KEY) || '[]');
    queue.push({
      ...leadData,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(WEBHOOK_CONFIG.QUEUE_KEY, JSON.stringify(queue));
    
    // Try to process queue after delay
    setTimeout(processLocalQueue, 5000);
  } catch (error) {
    console.error('Failed to save to local queue:', error);
  }
}

/**
 * Process queued leads
 */
async function processLocalQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(WEBHOOK_CONFIG.QUEUE_KEY) || '[]');
    if (queue.length === 0) return;
    
    console.log(`Processing ${queue.length} queued leads...`);
    
    const remaining = [];
    
    for (const leadData of queue) {
      const success = await sendToWebhook(leadData);
      
      if (!success) {
        // Keep in queue if still failing
        remaining.push(leadData);
      } else {
        console.log('Successfully sent queued lead:', leadData.contact.email);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update queue with remaining items
    localStorage.setItem(WEBHOOK_CONFIG.QUEUE_KEY, JSON.stringify(remaining));
    
    // If still items remaining, try again later
    if (remaining.length > 0) {
      setTimeout(processLocalQueue, 30000); // Try again in 30 seconds
    }
    
  } catch (error) {
    console.error('Queue processing error:', error);
  }
}

// ============================================
// ANALYTICS TRACKING
// ============================================

/**
 * Track events (integrate with your analytics)
 */
function trackEvent(eventName, eventData) {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
  
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', eventName, eventData);
  }
  
  // Custom analytics
  console.log('Event tracked:', eventName, eventData);
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize webhook integration
 */
function initializeWebhookIntegration() {
  console.log('RainWise Webhook Integration initialized');
  
  // Track page load time for engagement metrics
  window.pageLoadTime = Date.now();
  window.calculationCount = 0;
  
  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    maxScroll = Math.max(maxScroll, scrollPercentage);
    window.maxScrollDepth = maxScroll;
  });
  
  // Process any queued leads on page load
  setTimeout(processLocalQueue, 2000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebhookIntegration);
} else {
  initializeWebhookIntegration();
}
