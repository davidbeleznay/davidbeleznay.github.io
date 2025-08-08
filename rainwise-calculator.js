// RainWise Calculator JavaScript - Water Savings & Rebate Focus
let currentStep = 1;
let formData = {};
let selectedRebates = [];
let waterBaseline = {};
let savingsResults = {};

// Conversion factor: 1 gallon = 3.78541 litres
const GALLON_TO_LITRE = 3.78541;

const waterRates = { 
  baseRate: 1.06, 
  tiers: [
    { min: 0, max: 110, rate: 0.00223 }, 
    { min: 110, max: 220, rate: 0.00555 }, 
    { min: 220, max: 330, rate: 0.00971 }, 
    { min: 330, max: Infinity, rate: 0.01703 }
  ] 
};

const rebateInfo = {
  rainSensor: { name: 'Rain Sensor', rebate: 75, savingsRange: '10-15%' },
  smartController: { name: 'Smart Controller', rebate: 100, savingsRange: '20-40%' },
  dripConversion: { name: 'Drip Irrigation', rebate: 400, savingsRange: '30-50%' },
  mpRotators: { name: 'MP Rotators', rebate: 100, savingsRange: '20-30%' },
  soilImprovements: { name: 'Soil Improvements', rebate: 'varies', savingsRange: '25% less water' },
  rainwaterHarvesting: { name: 'Rainwater Harvesting', rebate: 750, savingsRange: '100% outdoor water' }
};

// Property defaults based on type
function updatePropertyDefaults() {
  const type = document.getElementById('propertyType').value;
  const areaField = document.getElementById('irrigatedArea');
  const defaults = {
    'single': 2500,
    'townhouse': 1200,
    'condo': 500,
    'large': 5000
  };
  areaField.value = defaults[type] || 2500;
}

// Navigation functions
function nextStep(step) {
  if (!validateStep(step)) return;
  
  if (step === 2) updateUsageAnalysis();
  
  document.getElementById(`step${step}`).classList.add('completed');
  document.getElementById(`step${step + 1}`).classList.add('active');
  document.getElementById(`section${step}`).classList.remove('active');
  document.getElementById(`section${step + 1}`).classList.add('active');
  currentStep = step + 1;
}

function previousStep(step) {
  document.getElementById(`step${step}`).classList.remove('active');
  document.getElementById(`step${step - 1}`).classList.remove('completed');
  document.getElementById(`section${step}`).classList.remove('active');
  document.getElementById(`section${step - 1}`).classList.add('active');
  currentStep = step - 1;
}

// Validation
function validateStep(step) {
  if (step === 1) {
    const required = ['fullName', 'email', 'phoneMain', 'propertyAddress', 'city', 'postalCode'];
    for (let field of required) {
      if (!document.getElementById(field).value.trim()) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    // Pre-fill lead form with contact info
    document.getElementById('leadName').value = document.getElementById('fullName').value;
    document.getElementById('leadEmail').value = document.getElementById('email').value;
    document.getElementById('leadPhone').value = document.getElementById('phoneMain').value;
  }
  
  if (step === 2) {
    if (!document.getElementById('irrigatedArea').value || !document.getElementById('irrigationMonths').value) {
      alert('Please fill in irrigation area and months');
      return false;
    }
  }
  
  if (step === 3) {
    if (document.querySelectorAll('input[type="checkbox"]:checked').length === 0) {
      alert('Please select at least one upgrade');
      return false;
    }
  }
  
  return true;
}

// Water usage analysis - now showing litres
function updateUsageAnalysis() {
  const area = parseFloat(document.getElementById('irrigatedArea').value) || 0;
  const months = parseFloat(document.getElementById('irrigationMonths').value) || 6;
  const system = document.getElementById('irrigationSystem').value;
  
  // Convert water bills from litres to gallons for internal calculations
  const usageInputs = [
    (parseFloat(document.getElementById('usage1').value) || 0) / GALLON_TO_LITRE,
    (parseFloat(document.getElementById('usage2').value) || 0) / GALLON_TO_LITRE,
    (parseFloat(document.getElementById('usage3').value) || 0) / GALLON_TO_LITRE,
    (parseFloat(document.getElementById('usage4').value) || 0) / GALLON_TO_LITRE
  ];
  
  const hasActualData = usageInputs.some(u => u > 0);
  
  let avgDailyUsage, outdoorPercentage, annualUsageLitres;
  
  if (hasActualData) {
    // Use actual water bill data
    const totalUsage = usageInputs.reduce((sum, usage) => sum + usage, 0);
    const periodsWithData = usageInputs.filter(u => u > 0).length;
    avgDailyUsage = Math.round((totalUsage / periodsWithData) / 90);
    
    const summerUsage = usageInputs[2] || avgDailyUsage * 90;
    const winterUsage = usageInputs[0] || avgDailyUsage * 90;
    const seasonalIncrease = summerUsage - winterUsage;
    outdoorPercentage = seasonalIncrease > 0 ? Math.round((seasonalIncrease / summerUsage) * 100) : 35;
  } else {
    // Estimate based on property characteristics
    const baseIndoor = 60; // gallons/day indoor use
    let irrigationEfficiency = 0.04; // Base gallons per sq ft per day
    
    switch(system) {
      case 'manual': irrigationEfficiency = 0.06; break;
      case 'timer': irrigationEfficiency = 0.045; break;
      case 'inground': irrigationEfficiency = 0.035; break;
      case 'mixed': irrigationEfficiency = 0.04; break;
    }
    
    const outdoorRate = area * irrigationEfficiency * (months / 12);
    avgDailyUsage = Math.round(baseIndoor + outdoorRate);
    outdoorPercentage = Math.round((outdoorRate / avgDailyUsage) * 100);
  }
  
  // Convert to litres for display
  const avgDailyLitres = Math.round(avgDailyUsage * GALLON_TO_LITRE);
  annualUsageLitres = Math.round(avgDailyUsage * 365 * GALLON_TO_LITRE);
  
  // Calculate savings potential in litres
  const potentialSavingsLitres = Math.round(annualUsageLitres * outdoorPercentage / 100 * 0.35);
  
  // Update display with litres
  document.getElementById('avgDailyUsage').textContent = `${avgDailyLitres.toLocaleString()} L/day`;
  document.getElementById('annualUsage').textContent = `${annualUsageLitres.toLocaleString()} L`;
  document.getElementById('outdoorUsage').textContent = `${outdoorPercentage}%`;
  document.getElementById('savingsPotential').textContent = `${potentialSavingsLitres.toLocaleString()} L/year`;
  
  // Store baseline data (keep in gallons internally for calculations)
  waterBaseline = { 
    dailyUsage: avgDailyUsage,
    dailyUsageLitres: avgDailyLitres,
    annualUsage: avgDailyUsage * 365,
    annualUsageLitres: annualUsageLitres,
    outdoorPortion: outdoorPercentage / 100,
    irrigatedArea: area,
    irrigationMonths: months,
    system: system
  };
  
  document.getElementById('usageAnalysis').style.display = 'block';
}

// Toggle upgrade details
function toggleUpgradeDetails(upgrade) {
  selectedRebates = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  const details = document.getElementById(upgrade + 'Details');
  const checkbox = document.getElementById(upgrade);
  
  details.style.display = checkbox.checked ? 'block' : 'none';
  
  // Initialize values for specific upgrades
  if (upgrade === 'dripConversion' && checkbox.checked) {
    const area = document.getElementById('dripArea');
    if (!area.value) area.value = Math.round(waterBaseline.irrigatedArea * 0.5);
    updateDripCost();
  }
}

// Update cost estimates
function updateControllerCost() {
  const zones = parseInt(document.getElementById('controllerZones').value);
  const baseCost = zones <= 4 ? 300 : zones <= 8 ? 450 : zones <= 12 ? 600 : 750;
  document.getElementById('controllerCost').value = baseCost;
}

function updateRotatorCost() {
  const heads = parseInt(document.getElementById('rotatorHeads').value) || 20;
  document.getElementById('rotatorCost').value = heads * 20;
}

function updateDripCost() {
  const area = parseFloat(document.getElementById('dripArea').value) || 0;
  const costPerSqFt = 1.2;
  const totalCost = Math.round(area * costPerSqFt);
  document.getElementById('dripCost').value = totalCost;
  document.getElementById('dripTotalEstimate').textContent = `$${totalCost}`;
}

function updateHarvestingCost() {
  const type = document.getElementById('harvestingType').value;
  const costs = {
    'barrel': 300,
    'tank1000': 800,
    'tank2500': 1500,
    'tank5000': 3000
  };
  const savingsLitres = {
    'barrel': 5000,
    'tank1000': 15000,
    'tank2500': 30000,
    'tank5000': 50000
  };
  document.getElementById('harvestingCost').value = costs[type] || 500;
  document.getElementById('harvestingSavings').value = savingsLitres[type] || 10000;
}

function calculateSoilAmounts() {
  const area = parseFloat(document.getElementById('applicationArea').value) || 0;
  const depthType = document.getElementById('applicationDepth').value;
  
  if (!area || !depthType) return;
  
  let bags, cubicYards, minCost, maxCost;
  
  if (depthType === 'garden') {
    bags = Math.ceil((area / 400) * 67);
    cubicYards = (area / 400) * 2.4;
  } else {
    bags = Math.ceil((area / 400) * 10);
    cubicYards = (area / 400) * 0.32;
  }
  
  minCost = bags * 8;
  maxCost = bags * 12;
  
  document.getElementById('bagsNeeded').textContent = `${bags} bags`;
  document.getElementById('cubicYards').textContent = `${cubicYards.toFixed(1)} yards`;
  document.getElementById('estimatedSoilCost').textContent = `$${minCost}-$${maxCost}`;
  document.getElementById('soilCalculator').style.display = 'block';
  document.getElementById('soilCost').value = Math.round((minCost + maxCost) / 2);
}

// Calculate Water Savings (replacing ROI focus)
function calculateSavings() {
  collectFormData();
  
  savingsResults = { 
    upgrades: [], 
    totalCost: 0, 
    totalRebates: 0, 
    totalWaterSavingsGallons: 0,
    totalWaterSavingsLitres: 0,
    totalCostSavings: 0, 
    netCost: 0, 
    paybackYears: 0,
    percentReduction: 0,
    environmentalImpact: {} 
  };
  
  const baselineUsage = waterBaseline.annualUsage;
  const outdoorUsage = baselineUsage * waterBaseline.outdoorPortion;
  
  // Calculate each upgrade's impact
  selectedRebates.forEach(rebate => {
    const upgrade = calculateUpgradeSavings(rebate, outdoorUsage);
    savingsResults.upgrades.push(upgrade);
    savingsResults.totalCost += upgrade.cost;
    savingsResults.totalRebates += upgrade.rebate;
    savingsResults.totalWaterSavingsGallons += upgrade.waterSavingsGallons;
    savingsResults.totalWaterSavingsLitres += upgrade.waterSavingsLitres;
  });
  
  // Check for combo bonus
  const hasIrrigation = selectedRebates.some(r => ['rainSensor', 'smartController', 'dripConversion', 'mpRotators'].includes(r));
  const hasSoil = selectedRebates.includes('soilImprovements');
  if (hasIrrigation && hasSoil) {
    savingsResults.totalRebates += 100;
    savingsResults.comboBonus = true;
  }
  
  // Calculate financial metrics
  const currentAnnualCost = calculateWaterCost(baselineUsage);
  const newAnnualCost = calculateWaterCost(baselineUsage - savingsResults.totalWaterSavingsGallons);
  savingsResults.totalCostSavings = currentAnnualCost - newAnnualCost;
  savingsResults.netCost = savingsResults.totalCost - savingsResults.totalRebates;
  savingsResults.paybackYears = savingsResults.totalCostSavings > 0 ? savingsResults.netCost / savingsResults.totalCostSavings : 999;
  savingsResults.percentReduction = Math.round((savingsResults.totalWaterSavingsGallons / baselineUsage) * 100);
  
  // Environmental impact (10 year)
  savingsResults.environmentalImpact = {
    lifetimeWaterSavingsLitres: savingsResults.totalWaterSavingsLitres * 10,
    lifetimeWaterSavingsGallons: savingsResults.totalWaterSavingsGallons * 10,
    co2Savings: Math.round(savingsResults.totalWaterSavingsGallons * 0.006 * 10),
    lifetimeCostSavings: savingsResults.totalCostSavings * 10
  };
  
  displayResults();
}

// Calculate water cost based on tiered rates
function calculateWaterCost(annualGallons) {
  const dailyGallons = annualGallons / 365;
  let totalCost = waterRates.baseRate * 365;
  
  for (let tier of waterRates.tiers) {
    if (dailyGallons > tier.min) {
      const tierUsage = Math.min(dailyGallons, tier.max) - tier.min;
      totalCost += tierUsage * tier.rate * 365;
    }
  }
  
  return totalCost;
}

// Calculate individual upgrade savings
function calculateUpgradeSavings(upgradeType, outdoorUsage) {
  let cost = 0, rebate = 0, waterSavingsGallons = 0, savingsPercent = 0;
  
  switch (upgradeType) {
    case 'rainSensor':
      cost = parseFloat(document.getElementById('rainSensorCost').value) || 150;
      rebate = 75;
      savingsPercent = parseFloat(document.getElementById('rainSensorSavings').value) || 15;
      waterSavingsGallons = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'smartController':
      cost = parseFloat(document.getElementById('controllerCost').value) || 450;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('controllerSavings').value) || 30;
      waterSavingsGallons = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'dripConversion':
      cost = parseFloat(document.getElementById('dripCost').value) || 1200;
      rebate = 400;
      const dripArea = parseFloat(document.getElementById('dripArea').value) || waterBaseline.irrigatedArea;
      const areaFraction = dripArea / waterBaseline.irrigatedArea;
      savingsPercent = parseFloat(document.getElementById('dripSavings').value) || 40;
      waterSavingsGallons = outdoorUsage * areaFraction * (savingsPercent / 100);
      break;
      
    case 'mpRotators':
      cost = parseFloat(document.getElementById('rotatorCost').value) || 400;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('rotatorSavings').value) || 25;
      waterSavingsGallons = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'soilImprovements':
      cost = parseFloat(document.getElementById('soilCost').value) || 200;
      rebate = Math.min(cost * 0.5, 100);
      savingsPercent = 25;
      waterSavingsGallons = outdoorUsage * 0.25;
      break;
      
    case 'rainwaterHarvesting':
      cost = parseFloat(document.getElementById('harvestingCost').value) || 1500;
      rebate = Math.min(cost * 0.5, 750);
      // Water savings from input (already in litres)
      const savingsLitres = parseFloat(document.getElementById('harvestingSavings').value) || 10000;
      waterSavingsGallons = savingsLitres / GALLON_TO_LITRE;
      savingsPercent = Math.min(100, (waterSavingsGallons / outdoorUsage) * 100);
      break;
  }
  
  return { 
    type: upgradeType, 
    cost, 
    rebate, 
    waterSavingsGallons,
    waterSavingsLitres: Math.round(waterSavingsGallons * GALLON_TO_LITRE),
    savingsPercent, 
    netCost: cost - rebate 
  };
}

// Display results
function displayResults() {
  // Update primary results
  document.getElementById('totalRebates').textContent = `$${savingsResults.totalRebates}`;
  document.getElementById('waterSavings').textContent = `${savingsResults.totalWaterSavingsLitres.toLocaleString()} L`;
  document.getElementById('percentReduction').textContent = `${savingsResults.percentReduction}%`;
  document.getElementById('environmentalImpact').textContent = `${Math.round(savingsResults.environmentalImpact.lifetimeWaterSavingsLitres / 1000).toLocaleString()}k L saved`;
  
  // Update annual savings (shown but not emphasized)
  document.getElementById('annualSavings').textContent = `$${Math.round(savingsResults.totalCostSavings)}`;
  
  // Build savings table
  const tableBody = document.getElementById('savingsTableBody');
  tableBody.innerHTML = '';
  
  savingsResults.upgrades.forEach(upgrade => {
    const row = tableBody.insertRow();
    const upgradeName = getUpgradeName(upgrade.type);
    
    row.innerHTML = `
      <td>${upgradeName}</td>
      <td>$${upgrade.rebate}</td>
      <td>${upgrade.waterSavingsLitres.toLocaleString()} L</td>
      <td>${Math.round(upgrade.savingsPercent)}%</td>
    `;
  });
  
  // Add totals row
  const totalRow = tableBody.insertRow();
  totalRow.style.background = '#e8f5ea';
  totalRow.style.fontWeight = 'bold';
  
  totalRow.innerHTML = `
    <td>TOTALS</td>
    <td>$${savingsResults.totalRebates}</td>
    <td>${savingsResults.totalWaterSavingsLitres.toLocaleString()} L</td>
    <td>${savingsResults.percentReduction}%</td>
  `;
  
  // Build ROI table (hidden by default)
  const roiTableBody = document.getElementById('roiTableBody');
  roiTableBody.innerHTML = '';
  
  savingsResults.upgrades.forEach(upgrade => {
    const row = roiTableBody.insertRow();
    const upgradeName = getUpgradeName(upgrade.type);
    const annualSavings = Math.round((savingsResults.totalCostSavings * (upgrade.waterSavingsGallons / savingsResults.totalWaterSavingsGallons)));
    const payback = upgrade.netCost > 0 && annualSavings > 0 ? (upgrade.netCost / annualSavings).toFixed(1) + ' years' : 'Immediate';
    const tenYearNet = (annualSavings * 10) - upgrade.netCost;
    
    row.innerHTML = `
      <td>${upgradeName}</td>
      <td>$${upgrade.cost}</td>
      <td>$${upgrade.netCost}</td>
      <td>${payback}</td>
      <td style="color:${tenYearNet > 0 ? 'green' : 'red'}">$${tenYearNet}</td>
    `;
  });
  
  document.getElementById('resultsSection').classList.add('active');
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  
  setupPDFDownload();
}

// Helper function to get upgrade names
function getUpgradeName(type) {
  const names = { 
    'rainSensor': 'Rain Sensor', 
    'smartController': 'Smart Controller', 
    'dripConversion': 'Drip Irrigation', 
    'mpRotators': 'MP Rotators', 
    'soilImprovements': 'Soil Improvements',
    'rainwaterHarvesting': 'Rainwater Harvesting'
  };
  return names[type] || type;
}

// Collect form data
function collectFormData() {
  formData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phoneMain: document.getElementById('phoneMain').value,
    phoneAlt: document.getElementById('phoneAlt').value || 'N/A',
    propertyAddress: document.getElementById('propertyAddress').value,
    city: document.getElementById('city').value,
    postalCode: document.getElementById('postalCode').value,
    propertyType: document.getElementById('propertyType').value,
    irrigatedArea: document.getElementById('irrigatedArea').value,
    irrigationMonths: document.getElementById('irrigationMonths').value,
    irrigationSystem: document.getElementById('irrigationSystem').value,
    irrigationDescription: document.getElementById('irrigationDescription')?.value || '',
    soilDescription: document.getElementById('soilDescription')?.value || ''
  };
}

// Toggle ROI details
function toggleROI() {
  const roiDetails = document.getElementById('roiDetails');
  roiDetails.style.display = roiDetails.style.display === 'none' ? 'block' : 'none';
  return false;
}

// Submit lead form
function submitLead() {
  const leadData = {
    name: document.getElementById('leadName').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    timing: document.getElementById('leadTiming').value,
    notes: document.getElementById('leadNotes').value,
    propertyAddress: formData.propertyAddress,
    city: formData.city,
    totalRebates: savingsResults.totalRebates,
    waterSavings: savingsResults.totalWaterSavingsLitres,
    selectedUpgrades: savingsResults.upgrades.map(u => getUpgradeName(u.type)).join(', ')
  };
  
  // In a real implementation, this would send to a server
  console.log('Lead data:', leadData);
  alert('Thank you! A certified irrigation specialist will contact you within 48 hours to provide a custom quote and help with your rebate applications.');
  
  // Could also trigger email notification to contractor here
}

// Setup PDF download
function setupPDFDownload() {
  document.getElementById('downloadReport').onclick = function() {
    if (typeof window.jsPDF === 'undefined') {
      alert('PDF generation not available. Please copy the text manually.');
      return;
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(58, 127, 66); // Green
    doc.text('Water Savings & Rebate Report', 20, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Highlight Box
    doc.setFillColor(255, 243, 205); // Light yellow
    doc.rect(15, 40, 180, 30, 'F');
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Your Water Conservation Summary', 20, 50);
    doc.setFontSize(16);
    doc.setTextColor(231, 76, 60); // Red accent
    doc.text(`Total Rebates Available: $${savingsResults.totalRebates}`, 20, 62);
    
    // Key Metrics
    doc.setTextColor(0);
    doc.setFontSize(12);
    let y = 85;
    doc.text(`Annual Water Savings: ${savingsResults.totalWaterSavingsLitres.toLocaleString()} litres`, 20, y);
    y += 10;
    doc.text(`Water Use Reduction: ${savingsResults.percentReduction}%`, 20, y);
    y += 10;
    doc.text(`10-Year Environmental Impact: ${Math.round(savingsResults.environmentalImpact.lifetimeWaterSavingsLitres / 1000).toLocaleString()}k litres saved`, 20, y);
    y += 10;
    doc.text(`Annual Bill Savings: $${Math.round(savingsResults.totalCostSavings)}`, 20, y);
    
    // Selected Upgrades
    y += 20;
    doc.setFontSize(14);
    doc.text('Your Selected Upgrades:', 20, y);
    doc.setFontSize(10);
    y += 10;
    
    savingsResults.upgrades.forEach(upgrade => {
      doc.text(`• ${getUpgradeName(upgrade.type)}`, 25, y);
      doc.text(`Rebate: $${upgrade.rebate}`, 80, y);
      doc.text(`Saves: ${upgrade.waterSavingsLitres.toLocaleString()} L/year`, 120, y);
      y += 8;
    });
    
    // Contact Info
    y += 15;
    doc.setFontSize(12);
    doc.text('Property Information:', 20, y);
    doc.setFontSize(10);
    y += 10;
    doc.text(`${formData.fullName}`, 20, y);
    y += 6;
    doc.text(`${formData.propertyAddress}, ${formData.city} ${formData.postalCode}`, 20, y);
    y += 6;
    doc.text(`${formData.email} | ${formData.phoneMain}`, 20, y);
    
    // Next Steps
    if (y > 220) {
      doc.addPage();
      y = 20;
    } else {
      y += 20;
    }
    
    doc.setFontSize(12);
    doc.text('Next Steps:', 20, y);
    doc.setFontSize(10);
    y += 10;
    const steps = [
      '1. Contact a certified irrigation specialist for a detailed quote',
      '2. Take "before" photos of all areas to be upgraded',
      '3. Submit your rebate pre-approval application to RDN',
      '4. Complete upgrades within 90 days of approval',
      '5. Submit final documentation with receipts and "after" photos'
    ];
    
    steps.forEach(step => {
      doc.text(step, 25, y);
      y += 8;
    });
    
    // Footer
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text('This report is an estimate based on typical water usage patterns. Actual savings may vary.', 20, 280);
    
    doc.save(`Water_Savings_Report_${formData.fullName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
}