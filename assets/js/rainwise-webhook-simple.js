/**
 * Simplified Webhook Capture for RainWise Calculator
 */

// Simple function to capture lead with results
function captureLeadWithResults() {
  const emailInput = document.getElementById('user-email');
  
  if (!emailInput || !emailInput.value) {
    alert('Please enter your email address');
    return;
  }
  
  // Get the data from the page
  const webhookData = {
    // Use lowercase field names to match Make.com
    email: emailInput.value,
    name: document.getElementById('fullName')?.value || 'Not provided',
    phone: document.getElementById('phoneMain')?.value || 'Not provided',
    address: document.getElementById('propertyAddress')?.value || 'Not provided',
    
    // Get the values from the results display
    totalRebate: parseInt(document.getElementById('totalRebates')?.textContent.replace('$','').replace(',','')) || 0,
    waterSavings: parseFloat(document.getElementById('waterSavings')?.textContent) || 0,
    annualSavings: parseInt(document.getElementById('trueSavings')?.textContent.replace('$','').replace(',','')) || 0,
    
    // Simple upgrades list
    upgrades: Array.from(document.querySelectorAll('#savingsTableBody tr'))
      .map(row => row.cells[0]?.textContent)
      .filter(text => text && text !== 'TOTALS')
      .join(', ') || 'None selected',
    
    // Metadata
    timestamp: new Date().toISOString(),
    source: 'RainWise Calculator'
  };
  
  console.log('Sending data:', webhookData);
  
  // Send to webhook
  fetch('https://hook.us2.make.com/i2jxgrjhi5q1xuzaeewd5xtmdp8k5r5i', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookData)
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (response.ok) {
      // Show success modal
      showSuccessModal();
      // Clear email input
      emailInput.value = '';
    } else {
      throw new Error('Webhook failed');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error saving your results. Please try again.');
  });
}

// Simple success modal
function showSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'block';
  } else {
    alert('Success! Your results have been saved and will be emailed to you shortly.');
  }
}

// Close success modal
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

console.log('RainWise Webhook Simple - Loaded');
