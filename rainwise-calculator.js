// RainWise Calculator JavaScript - Enhanced with Accurate Nanaimo Water Billing
let currentStep = 1;
let formData = {};
let selectedRebates = [];
let waterBaseline = {};
let savingsResults = {};

// Nanaimo Water Rate Structure (2024-2025)
const nanaimoWaterRates = {
  2024: {
    baseCharge: 0.99517, // per day
    tiers: [
      { min: 0, max: 110, rate: 0.00223 },      // Step 1
      { min: 110, max: 220, rate: 0.00555 },    // Step 2  
      { min: 220, max: 330, rate: 0.00971 },    // Step 3
      { min: 330, max: Infinity, rate: 0.01703 } // Step 4
    ]
  },
  2025: {
    baseCharge: 1.04778, // per day (5.3% increase)
    tiers: [
      { min: 0, max: 110, rate: 0.00235 },      // Step 1
      { min: 110, max: 220, rate: 0.00584 },    // Step 2
      { min: 220, max: 330, rate: 0.01022 },    // Step 3
      { min: 330, max: Infinity, rate: 0.01793 } // Step 4
    ]
  }
};

// Intrinsic "Peak Salmon" water value (environmental impact)
const intrinsicWaterValue = {
  peakSalmon: 1.00,  // $/m³ during Jun-Sep (critical salmon period)
  offPeak: 0.20       // $/m³ during Oct-May
};

// Conversion factors
const GALLONS_PER_M3 = 219.969; // Imperial gallons per cubic meter
const LITRES_PER_M3 = 1000;

const rebateInfo = {
  rainSensor: { name: 'Rain Sensor', rebate: 75, savingsRange: '10-15%' },
  smartController: { name: 'Smart Controller', rebate: 100, savingsRange: '20-40%' },
  dripConversion: { name: 'Drip Irrigation', rebate: 400, savingsRange: '30-50%' },
  mpRotators: { name: 'MP Rotators', rebate: 100, savingsRange: '20-30%' },
  soilImprovements: { name: 'Soil Improvements', rebate: 'varies', savingsRange: '25% less water' },
  rainwaterHarvesting: { name: 'Rainwater Harvesting', rebate: 750, savingsRange: '100% outdoor water' }
};

// Calculate accurate Nanaimo water bill
function calculateNanaimoBill(consumption_m3, billingDays, startDate) {
  const startYear = new Date(startDate).getFullYear();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + billingDays);
  const endYear = endDate.getFullYear();
  
  let totalCharge = 0;
  
  // Handle year transition (split billing if crosses Jan 1)
  if (endYear > startYear) {
    const daysIn2024 = Math.max(0, (new Date(2025, 0, 1) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const daysIn2025 = billingDays - daysIn2024;
    
    // Split consumption proportionally
    const consumption2024 = consumption_m3 * (daysIn2024 / billingDays);
    const consumption2025 = consumption_m3 * (daysIn2025 / billingDays);
    
    // Calculate each year's portion
    if (daysIn2024 > 0) {
      totalCharge += calculateYearPortion(consumption2024, daysIn2024, 2024);
    }
    if (daysIn2025 > 0) {
      totalCharge += calculateYearPortion(consumption2025, daysIn2025, 2025);
    }
  } else {
    // Single year billing
    const year = startYear >= 2025 ? 2025 : 2024;
    totalCharge = calculateYearPortion(consumption_m3, billingDays, year);
  }
  
  return totalCharge;
}

function calculateYearPortion(consumption_m3, days, year) {
  const rates = nanaimoWaterRates[year] || nanaimoWaterRates[2024];
  
  // Base charge
  let charge = rates.baseCharge * days;
  
  // Convert m³ to Imperial gallons
  const totalGallons = consumption_m3 * GALLONS_PER_M3;
  const avgGPD = totalGallons / days;
  
  // Calculate tiered volumetric charges
  for (let tier of rates.tiers) {
    if (avgGPD > tier.min) {
      const tierGallons = Math.min(avgGPD - tier.min, tier.max - tier.min);
      charge += tierGallons * tier.rate * days;
    }
  }
  
  return charge;
}

// Calculate intrinsic water value based on season
function calculateIntrinsicValue(consumption_m3, startDate, billingDays) {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + billingDays);
  
  let peakDays = 0;
  let offPeakDays = 0;
  
  // Count days in peak salmon period (Jun 1 - Sep 30)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const month = d.getMonth();
    if (month >= 5 && month <= 8) { // June (5) through September (8)
      peakDays++;
    } else {
      offPeakDays++;
    }
  }
  
  // Calculate weighted intrinsic value
  const peakPortion = peakDays / billingDays;
  const offPeakPortion = offPeakDays / billingDays;
  
  const peakValue = consumption_m3 * peakPortion * intrinsicWaterValue.peakSalmon;
  const offPeakValue = consumption_m3 * offPeakPortion * intrinsicWaterValue.offPeak;
  
  return {
    total: peakValue + offPeakValue,
    peakDays: peakDays,
    peakConsumption: consumption_m3 * peakPortion
  };
}

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
    // Pre-fill lead forms
    document.getElementById('leadName').value = document.getElementById('fullName').value;
    document.getElementById('leadEmail').value = document.getElementById('email').value;
    document.getElementById('leadPhone').value = document.getElementById('phoneMain').value;
    document.getElementById('premiumName').value = document.getElementById('fullName').value;
    document.getElementById('premiumEmail').value = document.getElementById('email').value;
    document.getElementById('premiumPhone').value = document.getElementById('phoneMain').value;
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

// Enhanced water usage analysis with m³ and true cost
function updateUsageAnalysis() {
  const area = parseFloat(document.getElementById('irrigatedArea').value) || 0;
  const months = parseFloat(document.getElementById('irrigationMonths').value) || 6;
  const system = document.getElementById('irrigationSystem').value;
  
  // Get water usage in m³ (directly from bills)
  const winterUsage = parseFloat(document.getElementById('usage1').value) || 0;
  const springUsage = parseFloat(document.getElementById('usage2').value) || 0;
  const summerUsage = parseFloat(document.getElementById('usage3').value) || 0;
  const fallUsage = parseFloat(document.getElementById('usage4').value) || 0;
  
  const hasActualData = winterUsage > 0 || springUsage > 0 || summerUsage > 0 || fallUsage > 0;
  
  let totalAnnualM3, avgDailyLitres, outdoorPercentage, peakUsageM3;
  
  if (hasActualData) {
    // Calculate from actual bills
    totalAnnualM3 = winterUsage + springUsage + summerUsage + fallUsage;
    avgDailyLitres = (totalAnnualM3 * LITRES_PER_M3) / 365;
    
    // Estimate outdoor usage (difference between summer and winter)
    const baselineUsage = Math.min(winterUsage, springUsage, fallUsage);
    const outdoorM3 = Math.max(0, summerUsage - baselineUsage);
    outdoorPercentage = totalAnnualM3 > 0 ? Math.round((outdoorM3 / totalAnnualM3) * 100) : 0;
    peakUsageM3 = summerUsage; // Summer is peak salmon period
    
    // Calculate costs
    const winterBill = calculateNanaimoBill(winterUsage, 90, '2024-12-01');
    const springBill = calculateNanaimoBill(springUsage, 92, '2025-03-01');
    const summerBill = calculateNanaimoBill(summerUsage, 92, '2024-06-01');
    const fallBill = calculateNanaimoBill(fallUsage, 91, '2024-09-01');
    
    const totalCityBill = winterBill + springBill + summerBill + fallBill;
    
    // Calculate intrinsic values
    const winterIntrinsic = calculateIntrinsicValue(winterUsage, '2024-12-01', 90);
    const springIntrinsic = calculateIntrinsicValue(springUsage, '2025-03-01', 92);
    const summerIntrinsic = calculateIntrinsicValue(summerUsage, '2024-06-01', 92);
    const fallIntrinsic = calculateIntrinsicValue(fallUsage, '2024-09-01', 91);
    
    const totalIntrinsicValue = winterIntrinsic.total + springIntrinsic.total + 
                                summerIntrinsic.total + fallIntrinsic.total;
    const totalTrueValue = totalCityBill + totalIntrinsicValue;
    
    // Update display
    document.getElementById('cityBillAmount').textContent = `$${totalCityBill.toFixed(2)}`;
    document.getElementById('trueValueAmount').textContent = `$${totalTrueValue.toFixed(2)}`;
    document.getElementById('hiddenSubsidy').textContent = `$${totalIntrinsicValue.toFixed(2)}`;
    document.getElementById('waterCostBreakdown').style.display = 'block';
    
  } else {
    // Estimate based on property characteristics
    const baseIndoorM3 = 50; // m³/year indoor use
    let irrigationEfficiency = 0.15; // m³ per sq ft per year
    
    switch(system) {
      case 'manual': irrigationEfficiency = 0.20; break;
      case 'timer': irrigationEfficiency = 0.16; break;
      case 'inground': irrigationEfficiency = 0.12; break;
      case 'mixed': irrigationEfficiency = 0.15; break;
    }
    
    const outdoorM3 = (area / 100) * irrigationEfficiency * months;
    totalAnnualM3 = baseIndoorM3 + outdoorM3;
    avgDailyLitres = (totalAnnualM3 * LITRES_PER_M3) / 365;
    outdoorPercentage = Math.round((outdoorM3 / totalAnnualM3) * 100);
    peakUsageM3 = outdoorM3 * 0.6; // Assume 60% of outdoor use is in peak period
  }
  
  // Calculate savings potential
  const potentialSavingsM3 = totalAnnualM3 * (outdoorPercentage / 100) * 0.35;
  
  // Update display
  document.getElementById('avgDailyUsage').textContent = `${Math.round(avgDailyLitres).toLocaleString()} L/day`;
  document.getElementById('annualUsage').textContent = `${totalAnnualM3.toFixed(1)} m³`;
  document.getElementById('peakUsage').textContent = `${peakUsageM3.toFixed(1)} m³`;
  document.getElementById('savingsPotential').textContent = `${potentialSavingsM3.toFixed(1)} m³/year`;
  
  // Store baseline data
  waterBaseline = {
    annualUsageM3: totalAnnualM3,
    avgDailyLitres: avgDailyLitres,
    outdoorPortion: outdoorPercentage / 100,
    peakUsageM3: peakUsageM3,
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

// Calculate Water Savings with true environmental value
function calculateSavings() {
  collectFormData();
  
  savingsResults = {
    upgrades: [],
    totalCost: 0,
    totalRebates: 0,
    totalWaterSavingsM3: 0,
    peakSavingsM3: 0,
    totalCostSavings: 0,
    totalTrueSavings: 0,
    netCost: 0,
    paybackYears: 0,
    percentReduction: 0,
    environmentalImpact: {}
  };
  
  const baselineUsageM3 = waterBaseline.annualUsageM3;
  const outdoorUsageM3 = baselineUsageM3 * waterBaseline.outdoorPortion;
  
  // Calculate each upgrade's impact
  selectedRebates.forEach(rebate => {
    const upgrade = calculateUpgradeSavings(rebate, outdoorUsageM3);
    savingsResults.upgrades.push(upgrade);
    savingsResults.totalCost += upgrade.cost;
    savingsResults.totalRebates += upgrade.rebate;
    savingsResults.totalWaterSavingsM3 += upgrade.waterSavingsM3;
    savingsResults.peakSavingsM3 += upgrade.peakSavingsM3;
  });
  
  // Check for combo bonus
  const hasIrrigation = selectedRebates.some(r => ['rainSensor', 'smartController', 'dripConversion', 'mpRotators'].includes(r));
  const hasSoil = selectedRebates.includes('soilImprovements');
  if (hasIrrigation && hasSoil) {
    savingsResults.totalRebates += 100;
    savingsResults.comboBonus = true;
  }
  
  // Calculate financial metrics
  const currentAnnualCost = calculateNanaimoBill(baselineUsageM3, 365, new Date().toISOString());
  const newAnnualCost = calculateNanaimoBill(baselineUsageM3 - savingsResults.totalWaterSavingsM3, 365, new Date().toISOString());
  savingsResults.totalCostSavings = currentAnnualCost - newAnnualCost;
  
  // Calculate true environmental value savings
  const peakIntrinsicSaved = savingsResults.peakSavingsM3 * intrinsicWaterValue.peakSalmon;
  const offPeakIntrinsicSaved = (savingsResults.totalWaterSavingsM3 - savingsResults.peakSavingsM3) * intrinsicWaterValue.offPeak;
  savingsResults.totalTrueSavings = savingsResults.totalCostSavings + peakIntrinsicSaved + offPeakIntrinsicSaved;
  
  savingsResults.netCost = savingsResults.totalCost - savingsResults.totalRebates;
  savingsResults.paybackYears = savingsResults.totalTrueSavings > 0 ? savingsResults.netCost / savingsResults.totalTrueSavings : 999;
  savingsResults.percentReduction = Math.round((savingsResults.totalWaterSavingsM3 / baselineUsageM3) * 100);
  
  // Environmental impact (10 year)
  savingsResults.environmentalImpact = {
    lifetimeWaterSavingsM3: savingsResults.totalWaterSavingsM3 * 10,
    lifetimePeakSavingsM3: savingsResults.peakSavingsM3 * 10,
    co2Savings: Math.round(savingsResults.totalWaterSavingsM3 * 0.3 * 10),
    lifetimeCostSavings: savingsResults.totalCostSavings * 10,
    lifetimeTrueSavings: savingsResults.totalTrueSavings * 10
  };
  
  displayResults();
}

// Calculate individual upgrade savings
function calculateUpgradeSavings(upgradeType, outdoorUsageM3) {
  let cost = 0, rebate = 0, waterSavingsM3 = 0, savingsPercent = 0, peakSavingsM3 = 0;
  
  switch (upgradeType) {
    case 'rainSensor':
      cost = parseFloat(document.getElementById('rainSensorCost').value) || 150;
      rebate = 75;
      savingsPercent = parseFloat(document.getElementById('rainSensorSavings').value) || 15;
      waterSavingsM3 = outdoorUsageM3 * (savingsPercent / 100);
      peakSavingsM3 = waterSavingsM3 * 0.6; // 60% of savings in peak period
      break;
      
    case 'smartController':
      cost = parseFloat(document.getElementById('controllerCost').value) || 450;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('controllerSavings').value) || 30;
      waterSavingsM3 = outdoorUsageM3 * (savingsPercent / 100);
      peakSavingsM3 = waterSavingsM3 * 0.7; // Smart controllers optimize peak usage more
      break;
      
    case 'dripConversion':
      cost = parseFloat(document.getElementById('dripCost').value) || 1200;
      rebate = 400;
      const dripArea = parseFloat(document.getElementById('dripArea').value) || waterBaseline.irrigatedArea;
      const areaFraction = dripArea / waterBaseline.irrigatedArea;
      savingsPercent = parseFloat(document.getElementById('dripSavings').value) || 40;
      waterSavingsM3 = outdoorUsageM3 * areaFraction * (savingsPercent / 100);
      peakSavingsM3 = waterSavingsM3 * 0.6;
      break;
      
    case 'mpRotators':
      cost = parseFloat(document.getElementById('rotatorCost').value) || 400;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('rotatorSavings').value) || 25;
      waterSavingsM3 = outdoorUsageM3 * (savingsPercent / 100);
      peakSavingsM3 = waterSavingsM3 * 0.6;
      break;
      
    case 'soilImprovements':
      cost = parseFloat(document.getElementById('soilCost').value) || 200;
      rebate = Math.min(cost * 0.5, 100);
      savingsPercent = 25;
      waterSavingsM3 = outdoorUsageM3 * 0.25;
      peakSavingsM3 = waterSavingsM3 * 0.6;
      break;
      
    case 'rainwaterHarvesting':
      cost = parseFloat(document.getElementById('harvestingCost').value) || 1500;
      rebate = Math.min(cost * 0.5, 750);
      const savingsLitres = parseFloat(document.getElementById('harvestingSavings').value) || 10000;
      waterSavingsM3 = savingsLitres / LITRES_PER_M3;
      savingsPercent = Math.min(100, (waterSavingsM3 / outdoorUsageM3) * 100);
      peakSavingsM3 = waterSavingsM3 * 0.8; // Rainwater most valuable in peak period
      break;
  }
  
  return {
    type: upgradeType,
    cost,
    rebate,
    waterSavingsM3,
    peakSavingsM3,
    savingsPercent,
    netCost: cost - rebate
  };
}

// Display results with m³ and true value
function displayResults() {
  // Update primary results
  document.getElementById('totalRebates').textContent = `$${savingsResults.totalRebates}`;
  document.getElementById('waterSavings').textContent = `${savingsResults.totalWaterSavingsM3.toFixed(1)} m³`;
  document.getElementById('peakSavings').textContent = `${savingsResults.peakSavingsM3.toFixed(1)} m³`;
  document.getElementById('trueSavings').textContent = `$${Math.round(savingsResults.totalTrueSavings)}`;
  
  // Update annual savings
  document.getElementById('annualSavings').textContent = `$${Math.round(savingsResults.totalCostSavings)}`;
  document.getElementById('trueValueSaved').textContent = `$${Math.round(savingsResults.totalTrueSavings)}`;
  
  // Build savings table
  const tableBody = document.getElementById('savingsTableBody');
  tableBody.innerHTML = '';
  
  savingsResults.upgrades.forEach(upgrade => {
    const row = tableBody.insertRow();
    const upgradeName = getUpgradeName(upgrade.type);
    
    row.innerHTML = `
      <td>${upgradeName}</td>
      <td>$${upgrade.rebate}</td>
      <td>${upgrade.waterSavingsM3.toFixed(1)} m³</td>
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
    <td>${savingsResults.totalWaterSavingsM3.toFixed(1)} m³</td>
    <td>${savingsResults.percentReduction}%</td>
  `;
  
  // Build ROI table (hidden by default)
  const roiTableBody = document.getElementById('roiTableBody');
  roiTableBody.innerHTML = '';
  
  savingsResults.upgrades.forEach(upgrade => {
    const row = roiTableBody.insertRow();
    const upgradeName = getUpgradeName(upgrade.type);
    const annualSavings = Math.round((savingsResults.totalTrueSavings * (upgrade.waterSavingsM3 / savingsResults.totalWaterSavingsM3)));
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

// Show free quote form
function showFreeQuote() {
  document.getElementById('freeQuoteForm').style.display = 'block';
  document.getElementById('premiumServiceForm').style.display = 'none';
  document.getElementById('freeQuoteForm').scrollIntoView({ behavior: 'smooth' });
}

// Show premium service form
function showPremiumService() {
  document.getElementById('premiumServiceForm').style.display = 'block';
  document.getElementById('freeQuoteForm').style.display = 'none';
  document.getElementById('premiumServiceForm').scrollIntoView({ behavior: 'smooth' });
}

// Submit lead form
function submitLead(type) {
  let leadData = {};
  
  if (type === 'free') {
    leadData = {
      type: 'free',
      name: document.getElementById('leadName').value,
      email: document.getElementById('leadEmail').value,
      phone: document.getElementById('leadPhone').value,
      timing: document.getElementById('leadTiming').value,
      notes: document.getElementById('leadNotes').value,
      propertyAddress: formData.propertyAddress,
      city: formData.city,
      totalRebates: savingsResults.totalRebates,
      waterSavings: savingsResults.totalWaterSavingsM3,
      selectedUpgrades: savingsResults.upgrades.map(u => getUpgradeName(u.type)).join(', ')
    };
    
    console.log('Free lead data:', leadData);
    alert('Thank you! A certified irrigation specialist will contact you within 48 hours to provide a custom quote.');
  } else if (type === 'premium') {
    leadData = {
      type: 'premium',
      name: document.getElementById('premiumName').value,
      email: document.getElementById('premiumEmail').value,
      phone: document.getElementById('premiumPhone').value,
      timing: document.getElementById('premiumTiming').value,
      notes: document.getElementById('premiumNotes').value,
      propertyAddress: formData.propertyAddress,
      city: formData.city,
      totalRebates: savingsResults.totalRebates,
      waterSavings: savingsResults.totalWaterSavingsM3,
      selectedUpgrades: savingsResults.upgrades.map(u => getUpgradeName(u.type)).join(', ')
    };
    
    console.log('Premium lead data:', leadData);
    alert('You will be redirected to secure payment. After payment, you\'ll receive your Application Concierge package within 24 hours and priority contractor response.');
  }
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
    doc.rect(15, 40, 180, 35, 'F');
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text('Your Water Conservation Summary', 20, 50);
    doc.setFontSize(16);
    doc.setTextColor(231, 76, 60); // Red accent
    doc.text(`Total Rebates Available: $${savingsResults.totalRebates}`, 20, 62);
    doc.setFontSize(12);
    doc.setTextColor(255, 152, 0); // Orange
    doc.text(`Peak Salmon Period Savings: ${savingsResults.peakSavingsM3.toFixed(1)} m³`, 20, 70);
    
    // Key Metrics
    doc.setTextColor(0);
    doc.setFontSize(12);
    let y = 85;
    doc.text(`Annual Water Savings: ${savingsResults.totalWaterSavingsM3.toFixed(1)} m³`, 20, y);
    y += 10;
    doc.text(`Water Use Reduction: ${savingsResults.percentReduction}%`, 20, y);
    y += 10;
    doc.text(`True Environmental Value Saved: $${Math.round(savingsResults.totalTrueSavings)}/year`, 20, y);
    y += 10;
    doc.text(`10-Year Environmental Impact: ${savingsResults.environmentalImpact.lifetimeWaterSavingsM3.toFixed(0)} m³ saved`, 20, y);
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
      doc.text(`Saves: ${upgrade.waterSavingsM3.toFixed(1)} m³/year`, 120, y);
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
    
    // Peak Salmon Note
    y += 10;
    doc.setTextColor(255, 152, 0);
    doc.setFontSize(11);
    doc.text('🐟 Remember: Every m³ saved during June-September has 10x the environmental benefit!', 20, y);
    
    // Footer
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text('This report includes the true environmental value of water during critical salmon periods.', 20, 280);
    doc.text('Actual savings may vary based on usage patterns and weather conditions.', 20, 285);
    
    doc.save(`Water_Savings_Report_${formData.fullName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
}
