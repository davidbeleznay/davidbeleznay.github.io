// RainWise Calculator JavaScript - Enhanced with True Water Value
let currentStep = 1;
let formData = {};
let selectedRebates = [];
let waterBaseline = {};
let roiResults = {};

// Water value configuration - NEW!
const waterValueConfig = {
  // Utility rate (what you pay on your bill)
  utilityValue: 0.00555, // Average $/gallon based on Tier 2
  
  // True societal/environmental value of water
  trueValue: 0.015, // $0.015/gallon - reflects environmental, infrastructure, and scarcity costs
  
  // Multiplier for environmental benefits
  environmentalMultiplier: 2.7, // True value is 2.7x the utility rate
  
  // Display settings
  showTrueValue: true,
  defaultToTrueValue: false // Set to true to use true value in primary calculations
};

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
  rainwaterHarvesting: { name: 'Rainwater Harvesting', rebate: 750, savingsRange: '30-50%' }
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

// Toggle between utility and true water value - NEW!
function toggleWaterValue() {
  const toggle = document.getElementById('waterValueToggle');
  if (toggle) {
    waterValueConfig.defaultToTrueValue = toggle.checked;
    
    // Update display labels
    const label = document.getElementById('waterValueLabel');
    if (label) {
      label.textContent = toggle.checked ? 
        'Using True Water Value (Environmental + Societal Costs)' : 
        'Using Utility Bill Value Only';
    }
    
    // Recalculate if we have baseline data
    if (waterBaseline.annualUsage) {
      updateUsageAnalysis();
      if (roiResults.upgrades && roiResults.upgrades.length > 0) {
        calculateROI();
      }
    }
  }
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

// Water usage analysis with true value calculation - ENHANCED!
function updateUsageAnalysis() {
  const area = parseFloat(document.getElementById('irrigatedArea').value) || 0;
  const months = parseFloat(document.getElementById('irrigationMonths').value) || 6;
  const system = document.getElementById('irrigationSystem').value;
  
  const usageInputs = [
    parseFloat(document.getElementById('usage1').value) || 0,
    parseFloat(document.getElementById('usage2').value) || 0,
    parseFloat(document.getElementById('usage3').value) || 0,
    parseFloat(document.getElementById('usage4').value) || 0
  ];
  
  const hasActualData = usageInputs.some(u => u > 0);
  
  let avgDailyUsage, outdoorPercentage, currentTier, annualCost, trueAnnualValue;
  
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
  
  // Determine tier and cost
  currentTier = avgDailyUsage > 330 ? 'Tier 4 ⚠️' : 
                avgDailyUsage > 220 ? 'Tier 3' : 
                avgDailyUsage > 110 ? 'Tier 2' : 'Tier 1';
  
  // Calculate both utility cost and true value - NEW!
  annualCost = calculateWaterCost(avgDailyUsage * 365);
  trueAnnualValue = calculateTrueWaterValue(avgDailyUsage * 365);
  
  // Savings potential message - ENHANCED!
  let potential = '';
  const valueToUse = waterValueConfig.defaultToTrueValue ? trueAnnualValue : annualCost;
  
  if (avgDailyUsage > 200) {
    potential = `Very High - You're in ${currentTier}. Smart upgrades could save $${Math.round(valueToUse * 0.35)}/year in ${waterValueConfig.defaultToTrueValue ? 'true water value' : 'utility bills'}!`;
  } else if (avgDailyUsage > 120) {
    potential = `High - Currently in ${currentTier}. Upgrades could reduce ${waterValueConfig.defaultToTrueValue ? 'water impact' : 'bills'} by 25-40% ($${Math.round(valueToUse * 0.3)}/year)`;
  } else if (avgDailyUsage < 80) {
    potential = 'Limited - Already efficient! Focus on soil improvements for best ROI';
  } else {
    potential = `Moderate - Good opportunities. Potential savings of $${Math.round(valueToUse * 0.25)}/year`;
  }
  
  // Update display - ENHANCED!
  document.getElementById('avgDailyUsage').textContent = `${avgDailyUsage} gal/day`;
  document.getElementById('outdoorUsage').textContent = `${outdoorPercentage}%`;
  document.getElementById('currentTier').textContent = currentTier;
  document.getElementById('annualCost').textContent = `$${Math.round(annualCost)}`;
  
  // Add true value display if element exists
  const trueValueElement = document.getElementById('trueAnnualValue');
  if (trueValueElement) {
    trueValueElement.textContent = `$${Math.round(trueAnnualValue)}`;
  }
  
  document.getElementById('savingsPotential').textContent = potential;
  
  // Store baseline data - ENHANCED!
  waterBaseline = { 
    dailyUsage: avgDailyUsage, 
    annualUsage: avgDailyUsage * 365, 
    outdoorPortion: outdoorPercentage / 100, 
    currentTier, 
    annualCost, 
    trueAnnualValue, // NEW!
    irrigatedArea: area, 
    irrigationMonths: months,
    system: system
  };
  
  document.getElementById('usageAnalysis').style.display = 'block';
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

// Calculate true water value - NEW!
function calculateTrueWaterValue(annualGallons) {
  return annualGallons * waterValueConfig.trueValue;
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
  
  // Handle delivery toggle for soil improvements
  if (upgrade === 'soilImprovements' && checkbox.checked) {
    const deliveryToggle = document.getElementById('includeDelivery');
    if (deliveryToggle) {
      updateSoilCostWithDelivery();
    }
  }
}

// Update soil cost with delivery option - ENHANCED!
function updateSoilCostWithDelivery() {
  const area = parseFloat(document.getElementById('applicationArea').value) || 0;
  const depthType = document.getElementById('applicationDepth').value;
  const includeDelivery = document.getElementById('includeDelivery')?.checked || false;
  
  if (!area || !depthType) return;
  
  let bags, cubicYards, materialCost, deliveryFee = 0, totalCost;
  
  if (depthType === 'garden') {
    bags = Math.ceil((area / 400) * 67);
    cubicYards = (area / 400) * 2.4;
  } else {
    bags = Math.ceil((area / 400) * 10);
    cubicYards = (area / 400) * 0.32;
  }
  
  // Material cost calculation
  const bulkCostPerYard = 48; // Average of $34-62
  
  // Use bulk pricing for pickup
  materialCost = Math.round(cubicYards * bulkCostPerYard);
  
  // Delivery fee logic
  if (includeDelivery) {
    if (cubicYards >= 4) {
      deliveryFee = 0; // Free delivery for 4+ yards
    } else if (cubicYards < 3) {
      deliveryFee = 85; // Higher fee for small loads
    } else {
      deliveryFee = 65; // Standard delivery fee
    }
    totalCost = materialCost + deliveryFee;
  } else {
    totalCost = materialCost;
  }
  
  // Update display
  document.getElementById('bagsNeeded').textContent = `${bags} bags`;
  document.getElementById('cubicYards').textContent = `${cubicYards.toFixed(1)} yards`;
  
  // Show cost comparison
  const costComparison = document.getElementById('costComparison');
  if (costComparison) {
    costComparison.innerHTML = `
      <div class="cost-option">
        <div class="cost-option-header">💪 Pickup Cost</div>
        <div class="cost-breakdown">
          <div>Material: $${materialCost}</div>
          <div><strong>Total: $${materialCost}</strong></div>
        </div>
      </div>
      ${includeDelivery ? `
        <div class="cost-option">
          <div class="cost-option-header">🚚 Delivered Cost</div>
          <div class="cost-breakdown">
            <div>Material: $${materialCost}</div>
            <div>Delivery: $${deliveryFee}</div>
            <div><strong>Total: $${totalCost}</strong></div>
          </div>
          ${deliveryFee === 0 ? '<div class="delivery-note">✅ Free delivery for 4+ yards!</div>' : ''}
          ${cubicYards < 3 ? '<div class="rebate-reminder">⚠️ Small load surcharge applies for orders under 3 yards</div>' : ''}
        </div>
      ` : ''}
    `;
    costComparison.style.display = 'block';
  }
  
  document.getElementById('soilCalculator').style.display = 'block';
  document.getElementById('soilCost').value = totalCost;
}

// Calculate soil amounts (wrapper for backward compatibility)
function calculateSoilAmounts() {
  updateSoilCostWithDelivery();
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

// Calculate ROI with true water value - ENHANCED!
function calculateROI() {
  collectFormData();
  
  roiResults = { 
    upgrades: [], 
    totalCost: 0, 
    totalRebates: 0, 
    totalWaterSavings: 0, 
    totalCostSavings: 0,
    totalTrueValueSavings: 0, // NEW!
    netCost: 0, 
    paybackYears: 0,
    trueValuePaybackYears: 0, // NEW!
    roiPercentage: 0,
    trueValueROI: 0, // NEW!
    environmentalImpact: {} 
  };
  
  const baselineUsage = waterBaseline.annualUsage;
  const outdoorUsage = baselineUsage * waterBaseline.outdoorPortion;
  
  // Calculate each upgrade's impact
  selectedRebates.forEach(rebate => {
    const upgrade = calculateUpgradeROI(rebate, outdoorUsage);
    roiResults.upgrades.push(upgrade);
    roiResults.totalCost += upgrade.cost;
    roiResults.totalRebates += upgrade.rebate;
    roiResults.totalWaterSavings += upgrade.waterSavings;
  });
  
  // Check for combo bonus
  const hasIrrigation = selectedRebates.some(r => ['rainSensor', 'smartController', 'dripConversion', 'mpRotators'].includes(r));
  const hasSoil = selectedRebates.includes('soilImprovements');
  if (hasIrrigation && hasSoil) {
    roiResults.totalRebates += 100;
    roiResults.comboBonus = true;
  }
  
  // Calculate both utility and true value metrics - ENHANCED!
  const currentAnnualCost = calculateWaterCost(baselineUsage);
  const newAnnualCost = calculateWaterCost(baselineUsage - roiResults.totalWaterSavings);
  roiResults.totalCostSavings = currentAnnualCost - newAnnualCost;
  
  // True value calculations - NEW!
  const currentTrueValue = calculateTrueWaterValue(baselineUsage);
  const newTrueValue = calculateTrueWaterValue(baselineUsage - roiResults.totalWaterSavings);
  roiResults.totalTrueValueSavings = currentTrueValue - newTrueValue;
  
  roiResults.netCost = roiResults.totalCost - roiResults.totalRebates;
  
  // Calculate payback for both values - ENHANCED!
  roiResults.paybackYears = roiResults.totalCostSavings > 0 ? 
    roiResults.netCost / roiResults.totalCostSavings : 999;
  roiResults.trueValuePaybackYears = roiResults.totalTrueValueSavings > 0 ? 
    roiResults.netCost / roiResults.totalTrueValueSavings : 999;
  
  // Calculate ROI for both values - ENHANCED!
  roiResults.roiPercentage = roiResults.netCost > 0 ? 
    ((roiResults.totalCostSavings * 5 - roiResults.netCost) / roiResults.netCost) * 100 : 0;
  roiResults.trueValueROI = roiResults.netCost > 0 ? 
    ((roiResults.totalTrueValueSavings * 5 - roiResults.netCost) / roiResults.netCost) * 100 : 0;
  
  // Environmental impact - ENHANCED!
  roiResults.environmentalImpact = {
    lifetimeWaterSavings: roiResults.totalWaterSavings * 10,
    waterReduction: Math.round((roiResults.totalWaterSavings / baselineUsage) * 100),
    co2Savings: Math.round(roiResults.totalWaterSavings * 0.006),
    lifetimeCostSavings: roiResults.totalCostSavings * 10,
    lifetimeTrueValueSavings: roiResults.totalTrueValueSavings * 10, // NEW!
    propertyValueIncrease: Math.round(roiResults.netCost * 1.5),
    ecosystemBenefit: Math.round(roiResults.totalTrueValueSavings * 10 * 0.3) // NEW! 30% of true value goes to ecosystem
  };
  
  displayResults();
  generateApplication();
}

// Calculate individual upgrade ROI
function calculateUpgradeROI(upgradeType, outdoorUsage) {
  let cost = 0, rebate = 0, waterSavings = 0, savingsPercent = 0;
  
  switch (upgradeType) {
    case 'rainSensor':
      cost = parseFloat(document.getElementById('rainSensorCost').value) || 150;
      rebate = 75;
      savingsPercent = parseFloat(document.getElementById('rainSensorSavings').value) || 15;
      waterSavings = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'smartController':
      cost = parseFloat(document.getElementById('controllerCost').value) || 450;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('controllerSavings').value) || 30;
      waterSavings = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'dripConversion':
      cost = parseFloat(document.getElementById('dripCost').value) || 1200;
      rebate = 400;
      const dripArea = parseFloat(document.getElementById('dripArea').value) || waterBaseline.irrigatedArea;
      const areaFraction = dripArea / waterBaseline.irrigatedArea;
      savingsPercent = parseFloat(document.getElementById('dripSavings').value) || 40;
      waterSavings = outdoorUsage * areaFraction * (savingsPercent / 100);
      break;
      
    case 'mpRotators':
      cost = parseFloat(document.getElementById('rotatorCost').value) || 400;
      rebate = 100;
      savingsPercent = parseFloat(document.getElementById('rotatorSavings').value) || 25;
      waterSavings = outdoorUsage * (savingsPercent / 100);
      break;
      
    case 'soilImprovements':
      cost = parseFloat(document.getElementById('soilCost').value) || 200;
      rebate = Math.min(cost * 0.5, 100);
      savingsPercent = 25;
      waterSavings = outdoorUsage * 0.25;
      break;
      
    case 'rainwaterHarvesting':
      cost = parseFloat(document.getElementById('rainwaterCost')?.value) || 1500;
      rebate = Math.min(cost * 0.5, 750);
      savingsPercent = parseFloat(document.getElementById('rainwaterSavings')?.value) || 40;
      waterSavings = outdoorUsage * (savingsPercent / 100);
      break;
  }
  
  return { 
    type: upgradeType, 
    cost, 
    rebate, 
    waterSavings, 
    savingsPercent, 
    netCost: cost - rebate 
  };
}

// Display results with true water value - ENHANCED!
function displayResults() {
  // Determine which values to display prominently
  const primarySavings = waterValueConfig.defaultToTrueValue ? 
    roiResults.totalTrueValueSavings : roiResults.totalCostSavings;
  const primaryPayback = waterValueConfig.defaultToTrueValue ? 
    roiResults.trueValuePaybackYears : roiResults.paybackYears;
  const primaryROI = waterValueConfig.defaultToTrueValue ? 
    roiResults.trueValueROI : roiResults.roiPercentage;
  
  // Convert water savings to litres (1 gallon = 3.78541 litres)
  const litresSaved = Math.round(roiResults.totalWaterSavings * 3.78541);
  
  // Update summary cards
  document.getElementById('waterSavings').textContent = litresSaved.toLocaleString();
  document.getElementById('costSavings').textContent = `$${Math.round(primarySavings)}`;
  document.getElementById('totalRebates').textContent = `$${roiResults.totalRebates}`;
  document.getElementById('paybackPeriod').textContent = 
    primaryPayback < 20 ? `${primaryPayback.toFixed(1)} years` : '20+ years';
  document.getElementById('roiPercentage').textContent = `${Math.round(primaryROI)}%`;
  document.getElementById('propertyValue').textContent = `+$${roiResults.environmentalImpact.propertyValueIncrease}`;
  
  // Update environmental impact
  const lifetimeLitres = Math.round(roiResults.environmentalImpact.lifetimeWaterSavings * 3.78541);
  document.getElementById('lifetimeWaterSavings').textContent = lifetimeLitres.toLocaleString();
  document.getElementById('waterReduction').textContent = `${roiResults.environmentalImpact.waterReduction}%`;
  document.getElementById('co2Savings').textContent = roiResults.environmentalImpact.co2Savings.toLocaleString();
  
  // Show appropriate lifetime savings based on toggle
  const lifetimeSavingsValue = waterValueConfig.defaultToTrueValue ? 
    roiResults.environmentalImpact.lifetimeTrueValueSavings : 
    roiResults.environmentalImpact.lifetimeCostSavings;
  document.getElementById('lifetimeSavings').textContent = `$${Math.round(lifetimeSavingsValue).toLocaleString()}`;
  
  // Add comparison section if both values are available - NEW!
  const comparisonSection = document.getElementById('valueComparison');
  if (comparisonSection && waterValueConfig.showTrueValue) {
    comparisonSection.innerHTML = `
      <div class="value-comparison-box">
        <h4>💧 Water Value Comparison</h4>
        <div class="comparison-grid">
          <div class="comparison-item">
            <div class="comparison-label">Utility Bill Savings</div>
            <div class="comparison-value">$${Math.round(roiResults.totalCostSavings)}/year</div>
            <div class="comparison-metric">Payback: ${roiResults.paybackYears.toFixed(1)} years</div>
          </div>
          <div class="comparison-item highlight">
            <div class="comparison-label">True Water Value Savings</div>
            <div class="comparison-value">$${Math.round(roiResults.totalTrueValueSavings)}/year</div>
            <div class="comparison-metric">Payback: ${roiResults.trueValuePaybackYears.toFixed(1)} years</div>
          </div>
          <div class="comparison-item">
            <div class="comparison-label">10-Year Bill Savings</div>
            <div class="comparison-value">$${Math.round(roiResults.totalCostSavings * 10).toLocaleString()}</div>
          </div>
          <div class="comparison-item highlight">
            <div class="comparison-label">10-Year True Value</div>
            <div class="comparison-value">$${Math.round(roiResults.totalTrueValueSavings * 10).toLocaleString()}</div>
          </div>
        </div>
        <p class="value-explanation">
          <strong>Why True Water Value?</strong> The true cost of water includes environmental impacts, 
          infrastructure maintenance, water scarcity, and ecosystem services. This reflects the real 
          value of your conservation efforts to society and the environment.
        </p>
      </div>
    `;
    comparisonSection.style.display = 'block';
  }
  
  // Build payback table with both values - ENHANCED!
  const tableBody = document.getElementById('paybackTableBody');
  tableBody.innerHTML = '';
  
  roiResults.upgrades.forEach(upgrade => {
    const row = tableBody.insertRow();
    const upgradeName = getUpgradeName(upgrade.type);
    const annualSavings = Math.round((roiResults.totalCostSavings * (upgrade.waterSavings / roiResults.totalWaterSavings)));
    const trueSavings = Math.round((roiResults.totalTrueValueSavings * (upgrade.waterSavings / roiResults.totalWaterSavings)));
    const payback = upgrade.netCost > 0 && annualSavings > 0 ? 
      (upgrade.netCost / annualSavings).toFixed(1) + ' years' : 'Immediate';
    const truePayback = upgrade.netCost > 0 && trueSavings > 0 ? 
      (upgrade.netCost / trueSavings).toFixed(1) + ' years' : 'Immediate';
    const tenYearNet = (annualSavings * 10) - upgrade.netCost;
    
    row.innerHTML = `
      <td>${upgradeName}</td>
      <td>$${upgrade.cost}</td>
      <td>$${upgrade.rebate}</td>
      <td>$${upgrade.netCost}</td>
      <td>$${annualSavings} ${waterValueConfig.showTrueValue ? `<br><span class="true-value">($${trueSavings} true)</span>` : ''}</td>
      <td>${payback} ${waterValueConfig.showTrueValue ? `<br><span class="true-value">(${truePayback} true)</span>` : ''}</td>
      <td style="color:${tenYearNet > 0 ? 'green' : 'red'}">$${tenYearNet}</td>
    `;
  });
  
  // Add totals row
  const totalRow = tableBody.insertRow();
  totalRow.style.background = '#e8f5ea';
  totalRow.style.fontWeight = 'bold';
  const tenYearNetTotal = (roiResults.totalCostSavings * 10) - roiResults.netCost;
  const trueTenYearNet = (roiResults.totalTrueValueSavings * 10) - roiResults.netCost;
  
  totalRow.innerHTML = `
    <td>TOTALS</td>
    <td>$${roiResults.totalCost}</td>
    <td>$${roiResults.totalRebates}</td>
    <td>$${roiResults.netCost}</td>
    <td>$${Math.round(roiResults.totalCostSavings)} ${waterValueConfig.showTrueValue ? `<br><span class="true-value">($${Math.round(roiResults.totalTrueValueSavings)} true)</span>` : ''}</td>
    <td>${roiResults.paybackYears < 20 ? roiResults.paybackYears.toFixed(1) + ' years' : '20+ years'} ${waterValueConfig.showTrueValue ? `<br><span class="true-value">(${roiResults.trueValuePaybackYears.toFixed(1)} years true)</span>` : ''}</td>
    <td style="color:green">$${tenYearNetTotal} ${waterValueConfig.showTrueValue ? `<br><span class="true-value">($${trueTenYearNet} true)</span>` : ''}</td>
  `;
  
  document.getElementById('resultsSection').classList.add('active');
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
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

// Generate application text with true water value - ENHANCED!
function generateApplication() {
  const today = new Date().toLocaleDateString('en-CA');
  let selectedUpgrades = '';
  
  roiResults.upgrades.forEach(upgrade => {
    const annualSavings = Math.round((roiResults.totalCostSavings * (upgrade.waterSavings / roiResults.totalWaterSavings)));
    const trueSavings = Math.round((roiResults.totalTrueValueSavings * (upgrade.waterSavings / roiResults.totalWaterSavings)));
    selectedUpgrades += `• ${getUpgradeName(upgrade.type)} - Cost: $${upgrade.cost}, Rebate: $${upgrade.rebate}, Est. Savings: $${annualSavings}/yr (True Value: $${trueSavings}/yr)\n`;
  });
  
  const litresSaved = Math.round(roiResults.totalWaterSavings * 3.78541);
  const lifetimeLitres = Math.round(roiResults.environmentalImpact.lifetimeWaterSavings * 3.78541);
  
  const applicationText = `RDN WATER SAVINGS & REBATE REPORT
Generated: ${today}

FINANCIAL SUMMARY:
Total Investment: $${roiResults.totalCost}
Total Rebates: $${roiResults.totalRebates} ${roiResults.comboBonus ? '(includes $100 combo bonus)' : ''}
Net Cost: $${roiResults.netCost}

SAVINGS COMPARISON:
Annual Water Bill Savings: $${Math.round(roiResults.totalCostSavings)}
Annual True Water Value: $${Math.round(roiResults.totalTrueValueSavings)}
Utility Payback: ${roiResults.paybackYears < 20 ? roiResults.paybackYears.toFixed(1) + ' years' : '20+ years'}
True Value Payback: ${roiResults.trueValuePaybackYears < 20 ? roiResults.trueValuePaybackYears.toFixed(1) + ' years' : '20+ years'}
10-Year Net Benefit (Bills): $${(roiResults.totalCostSavings * 10) - roiResults.netCost}
10-Year Net Benefit (True): $${(roiResults.totalTrueValueSavings * 10) - roiResults.netCost}

APPLICANT:
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phoneMain}
Address: ${formData.propertyAddress}, ${formData.city} ${formData.postalCode}

PROPERTY:
Type: ${formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1).replace(/([A-Z])/g, ' $1')}
Irrigated Area: ${formData.irrigatedArea} sq ft
Current System: ${formData.irrigationSystem.replace(/([A-Z])/g, ' $1')}
Irrigation Season: ${formData.irrigationMonths} months
Current Usage: ${Math.round(waterBaseline.dailyUsage)} gal/day (${waterBaseline.currentTier})
Annual Water Cost: $${Math.round(waterBaseline.annualCost)}
Annual True Water Value: $${Math.round(waterBaseline.trueAnnualValue)}

UPGRADES:
${selectedUpgrades}

WATER SAVINGS ANALYSIS:
Current Annual Usage: ${Math.round(waterBaseline.annualUsage).toLocaleString()} gallons (${Math.round(waterBaseline.annualUsage * 3.78541).toLocaleString()} litres)
Projected Annual Savings: ${Math.round(roiResults.totalWaterSavings).toLocaleString()} gallons (${litresSaved.toLocaleString()} litres)
Water Reduction: ${roiResults.environmentalImpact.waterReduction}%
10-Year Water Savings: ${Math.round(roiResults.environmentalImpact.lifetimeWaterSavings).toLocaleString()} gallons (${lifetimeLitres.toLocaleString()} litres)
CO₂ Reduction: ${roiResults.environmentalImpact.co2Savings} lbs/year
Ecosystem Value Created: $${roiResults.environmentalImpact.ecosystemBenefit}

Note: True water value reflects the full environmental and societal cost of water,
including infrastructure, treatment, scarcity, and ecosystem services.

Declaration: Work must be completed by December 15, 2025.
Signature: _________________________ Date: _____________`;
  
  document.getElementById('applicationPreview').textContent = applicationText;
  
  // Implementation checklist
  const checklist = [
    'Review application and ROI analysis',
    'Get quotes from IIABC certified professionals',
    'Take before photos of all upgrade areas',
    'Submit application for pre-approval',
    'Complete work within 90 days of approval',
    'Document installation with photos',
    'Keep all receipts and invoices',
    'Submit final claim with documentation',
    'Monitor water bills to verify savings'
  ];
  
  document.getElementById('submissionChecklist').innerHTML = checklist.map(item => `<div style="margin:5px 0;">☐ ${item}</div>`).join('');
  
  setupPDFDownload(applicationText);
}

// Setup PDF download
function setupPDFDownload(applicationText) {
  document.getElementById('downloadApplication').onclick = function() {
    if (typeof window.jsPDF === 'undefined') {
      alert('PDF generation not available. Please copy the text manually.');
      return;
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('RDN Water Savings & Rebate Report', 20, 20);
    
    doc.setFontSize(10);
    const lines = applicationText.split('\n');
    let y = 40;
    
    lines.forEach(line => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 6;
    });
    
    doc.save(`RDN_Water_Report_${formData.fullName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
}