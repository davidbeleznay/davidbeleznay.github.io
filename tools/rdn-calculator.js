let selectedUpgrades=new Set(),formData={},waterRates={base:1.06,tiers:[{limit:110,rate:0.00223},{limit:220,rate:0.00555},{limit:330,rate:0.00971},{limit:Infinity,rate:0.01703}]};function updatePropertyDefaults(){const e=document.getElementById("propertyType").value,t={single:2e3,townhouse:1500,condo:800,large:5e3};document.getElementById("irrigatedArea").value=t[e]||2e3,updateUsageAnalysis()}function updateUsageAnalysis(){const e=parseFloat(document.getElementById("irrigatedArea").value)||0,t=parseFloat(document.getElementById("irrigationMonths").value)||6,a=document.getElementById("irrigationSystem").value,n=["usage1","usage2","usage3","usage4"].map(e=>parseFloat(document.getElementById(e).value)||0).filter(e=>e>0);if(e>0||n.length>0){document.getElementById("usageAnalysis").style.display="block";let r=0,o=0,l=0;if(n.length>0){r=n.reduce((e,t)=>e+t,0)/n.length,o=30*r/365;const e=n[2]||Math.max(...n),t=n[0]||Math.min(...n);l=Math.max(0,(e-t)/e*100)}else{const n={manual:.5,timer:.45,inground:.4,mixed:.45}[a]||.45;r=e*n*t*30,o=r/365,l=40}const i=calculateWaterCost(o),s=calculateWaterCost(o*(1-.3)),c=365*(i-s),d=getTierForUsage(o);document.getElementById("avgDailyUsage").textContent=`${Math.round(o)} gal`,document.getElementById("outdoorUsage").textContent=`${Math.round(l)}%`,document.getElementById("currentTier").textContent=d,document.getElementById("annualCost").textContent=`$${Math.round(365*i)}`,document.getElementById("savingsPotential").textContent=l>20?`High potential! Could save $${Math.round(c)}/year with smart upgrades`:"Moderate savings potential with targeted improvements"}}function calculateWaterCost(e){let t=waterRates.base,a=e;for(const e of waterRates.tiers){const n=Math.min(a,e.limit);t+=n*e.rate,a-=n;if(a<=0)break}return t}function getTierForUsage(e){return e<=110?"Tier 1":e<=220?"Tier 2":e<=330?"Tier 3":"Tier 4"}function selectUpgrade(e){document.querySelectorAll(".upgrade-detail-content").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".upgrade-card").forEach(e=>e.classList.remove("selected")),document.getElementById("detailsPlaceholder").style.display="none";const t=document.getElementById(`detail-${e}`);t&&(t.classList.add("active"),document.getElementById(`card-${e}`).classList.add("selected"),selectedUpgrades.has(e)?selectedUpgrades.delete(e):selectedUpgrades.add(e))}function updateControllerCost(){const e={4:350,8:450,12:550,16:650}[document.getElementById("controllerZones").value]||450;document.getElementById("controllerCost").value=e,document.getElementById("controllerAvgCost").textContent=`$${e}`}function updateDripCost(){const e=parseFloat(document.getElementById("dripArea").value)||0,t=Math.round(1.25*e);document.getElementById("dripCost").value=t,document.getElementById("dripTotalEstimate").textContent=`$${t}`}function nextStep(e){if(1===e){const e=["fullName","email","phoneMain","propertyAddress","city","postalCode"];for(const t of e){const e=document.getElementById(t).value.trim();if(!e)return void alert(`Please fill in ${t.replace(/([A-Z])/g," $1").toLowerCase()}`);formData[t]=e}formData.propertyType=document.getElementById("propertyType").value}else if(2===e){const e=parseFloat(document.getElementById("irrigatedArea").value);if(!e||e<=0)return void alert("Please enter your irrigated area");formData.irrigatedArea=e,formData.irrigationMonths=parseFloat(document.getElementById("irrigationMonths").value)||6,formData.irrigationSystem=document.getElementById("irrigationSystem").value,["usage1","usage2","usage3","usage4"].forEach((e,t)=>{formData[`usage${t+1}`]=parseFloat(document.getElementById(e).value)||0})}else if(3===e){if(0===selectedUpgrades.size)return void alert("Please select at least one upgrade");if(formData.selectedUpgrades={},selectedUpgrades.has("rainSensor")&&(formData.selectedUpgrades.rainSensor={cost:parseFloat(document.getElementById("rainSensorCost").value)||150,savings:parseFloat(document.getElementById("rainSensorSavings").value)||15,rebate:75}),selectedUpgrades.has("smartController")&&(formData.selectedUpgrades.smartController={cost:parseFloat(document.getElementById("controllerCost").value)||450,savings:parseFloat(document.getElementById("controllerSavings").value)||30,rebate:100,zones:document.getElementById("controllerZones").value}),selectedUpgrades.has("dripConversion")){const e=parseFloat(document.getElementById("dripArea").value);if(!e||e<=0)return void alert("Please enter the area for drip conversion");formData.selectedUpgrades.dripConversion={cost:parseFloat(document.getElementById("dripCost").value)||1200,savings:parseFloat(document.getElementById("dripSavings").value)||40,rebate:400,area:e,description:document.getElementById("irrigationDescription").value}}selectedUpgrades.has("mpRotators")&&(formData.selectedUpgrades.mpRotators={cost:parseFloat(document.getElementById("mpRotatorsCost").value)||300,savings:parseFloat(document.getElementById("mpRotatorsSavings").value)||25,rebate:100,heads:parseFloat(document.getElementById("mpRotatorsHeads").value)||15}),selectedUpgrades.has("soilImprovements")&&(formData.selectedUpgrades.soilImprovements={cost:parseFloat(document.getElementById("soilCost").value)||200,savings:parseFloat(document.getElementById("soilSavings").value)||25,rebate:Math.min(100,.5*parseFloat(document.getElementById("soilCost").value)||100)}),calculateROI()}document.getElementById(`section${e}`).classList.remove("active"),document.getElementById(`section${e+1}`).classList.add("active"),document.getElementById(`step${e}`).classList.add("completed"),document.getElementById(`step${e+1}`).classList.add("active")}function previousStep(e){document.getElementById(`section${e}`).classList.remove("active"),document.getElementById(`section${e-1}`).classList.add("active"),document.getElementById(`step${e}`).classList.remove("active")}function calculateROI(){const e=formData.usage2&&formData.usage3?Math.max(formData.usage2,formData.usage3):formData.irrigatedArea*(.45*(formData.irrigationMonths||6)*30),t=formData.usage1||8e3,a=(e+3*t)/4/365;let n=0,r=0,o=0,l=[];for(const[e,t]of Object.entries(formData.selectedUpgrades))n+=t.cost,r+=t.rebate,o=Math.max(o,t.savings/100),l.push({name:e.replace(/([A-Z])/g," $1").replace(/^./,e=>e.toUpperCase()),cost:t.cost,rebate:t.rebate,savings:t.savings});const i=n-r,s=a*(1-o),c=calculateWaterCost(a),d=calculateWaterCost(s),u=365*(c-d),g=u>0?i/u:999,m=[];for(let e=0;e<=10;e++)m.push({year:e,savings:Math.round(u*e),netBenefit:Math.round(u*e-i)});const p=`
    <div class="roi-results">
      <div class="roi-summary">
        <h3>Your Water Conservation ROI Analysis</h3>
        <div class="key-metrics">
          <div class="key-metric">
            <div class="value">$${n.toLocaleString()}</div>
            <div class="label">Total Investment</div>
          </div>
          <div class="key-metric">
            <div class="value">$${r.toLocaleString()}</div>
            <div class="label">Total Rebates</div>
          </div>
          <div class="key-metric">
            <div class="value">$${i.toLocaleString()}</div>
            <div class="label">Net Cost</div>
          </div>
          <div class="key-metric">
            <div class="value">${g<20?g.toFixed(1):"20+"} years</div>
            <div class="label">Payback Period</div>
          </div>
        </div>
      </div>
      
      <div class="roi-details">
        <h3>Upgrade Summary</h3>
        <div class="upgrade-summary">
          ${l.map(e=>`
            <div class="upgrade-item">
              <span>${e.name}</span>
              <span>$${e.cost} (Rebate: $${e.rebate})</span>
            </div>
          `).join("")}
        </div>
        
        <h3>Water Savings Analysis</h3>
        <table class="financial-table">
          <tr>
            <th>Metric</th>
            <th>Current</th>
            <th>After Upgrades</th>
            <th>Savings</th>
          </tr>
          <tr>
            <td>Daily Water Use</td>
            <td>${Math.round(a)} gal</td>
            <td>${Math.round(s)} gal</td>
            <td>${Math.round(a-s)} gal</td>
          </tr>
          <tr>
            <td>Annual Water Use</td>
            <td>${Math.round(365*a).toLocaleString()} gal</td>
            <td>${Math.round(365*s).toLocaleString()} gal</td>
            <td>${Math.round(365*(a-s)).toLocaleString()} gal</td>
          </tr>
          <tr>
            <td>Annual Water Cost</td>
            <td>$${Math.round(365*c)}</td>
            <td>$${Math.round(365*d)}</td>
            <td>$${Math.round(u)}</td>
          </tr>
        </table>
        
        <h3>10-Year Financial Projection</h3>
        <table class="financial-table">
          <tr>
            <th>Year</th>
            <th>Cumulative Savings</th>
            <th>Net Benefit</th>
          </tr>
          ${m.map(e=>`
            <tr class="${e.netBenefit>0?"positive":""}">
              <td>Year ${e.year}</td>
              <td>$${e.savings.toLocaleString()}</td>
              <td>${e.netBenefit>=0?"+":""}$${e.netBenefit.toLocaleString()}</td>
            </tr>
          `).join("")}
        </table>
      </div>
      
      <div class="environmental-impact">
        <h3>🌍 Environmental Impact</h3>
        <div class="impact-metrics">
          <div class="impact-item">
            <div class="impact-value">${Math.round(365*(a-s)/1e3).toLocaleString()}k</div>
            <div class="impact-label">Gallons Saved Annually</div>
          </div>
          <div class="impact-item">
            <div class="impact-value">${Math.round(10*365*(a-s)/1e3).toLocaleString()}k</div>
            <div class="impact-label">10-Year Water Savings</div>
          </div>
          <div class="impact-item">
            <div class="impact-value">${Math.round(.00295*365*(a-s)).toLocaleString()}</div>
            <div class="impact-label">kWh Energy Saved/Year</div>
          </div>
        </div>
      </div>
    </div>
  `;document.getElementById("roiResults").innerHTML=p,formData.roiAnalysis={totalCost:n,totalRebates:r,netCost:i,annualSavings:u,paybackPeriod:g,currentDailyUsage:a,projectedDailyUsage:s,gallonsSavedAnnually:365*(a-s)}}function generatePDF(){const{jsPDF:e}=window.jspdf,t=new e,a=formData.roiAnalysis;t.setFontSize(20),t.text("RDN Water Conservation ROI Report",20,20),t.setFontSize(12),t.text(`Property Owner: ${formData.fullName}`,20,35),t.text(`Property Address: ${formData.propertyAddress}, ${formData.city} ${formData.postalCode}`,20,42),t.text(`Date: ${(new Date).toLocaleDateString()}`,20,49),t.setFontSize(16),t.text("ROI Summary",20,65),t.setFontSize(12),t.text(`Total Investment: $${a.totalCost.toLocaleString()}`,20,75),t.text(`Total Rebates: $${a.totalRebates.toLocaleString()}`,20,82),t.text(`Net Cost After Rebates: $${a.netCost.toLocaleString()}`,20,89),t.text(`Annual Water Savings: $${Math.round(a.annualSavings).toLocaleString()}`,20,96),t.text(`Payback Period: ${a.paybackPeriod<20?a.paybackPeriod.toFixed(1):"20+"} years`,20,103),t.setFontSize(16),t.text("Selected Upgrades",20,120);let n=130;for(const[e,r]of Object.entries(formData.selectedUpgrades))t.setFontSize(12),t.text(`• ${e.replace(/([A-Z])/g," $1").replace(/^./,e=>e.toUpperCase())}: $${r.cost} (Rebate: $${r.rebate})`,25,n),n+=7;t.setFontSize(16),t.text("Water Savings",20,n+10),n+=20,t.setFontSize(12),t.text(`Current Daily Usage: ${Math.round(a.currentDailyUsage)} gallons`,20,n),t.text(`Projected Daily Usage: ${Math.round(a.projectedDailyUsage)} gallons`,20,n+7),t.text(`Annual Water Savings: ${Math.round(a.gallonsSavedAnnually).toLocaleString()} gallons`,20,n+14),t.setFontSize(16),t.text("Environmental Impact",20,n+30),t.setFontSize(12),t.text(`• ${Math.round(a.gallonsSavedAnnually/1e3).toLocaleString()}k gallons saved annually`,25,n+40),t.text(`• ${Math.round(.00295*a.gallonsSavedAnnually).toLocaleString()} kWh energy saved annually`,25,n+47),t.text(`• Equivalent to ${Math.round(a.gallonsSavedAnnually/15e3)} average swimming pools per year`,25,n+54),t.save("RDN_Water_Conservation_ROI_Report.pdf")}document.addEventListener("DOMContentLoaded",function(){const e=`
    <!-- Rain Sensor Details -->
    <div class="upgrade-detail-content" id="detail-rainSensor">
      <div class="detail-header">
        <h3 class="detail-title">Rain Sensor Configuration</h3>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">Rebate:</span>
            <span class="summary-value">$75</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Typical ROI:</span>
            <span class="summary-value">1-2 years</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Installation:</span>
            <span class="summary-value">Professional</span>
          </div>
        </div>
      </div>
      
      <div class="cost-breakdown">
        <h4>💰 Cost Breakdown</h4>
        <div class="cost-items">
          <div class="cost-box">
            <div class="cost-box-value">$50-80</div>
            <div class="cost-box-label">Equipment</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$75-100</div>
            <div class="cost-box-label">Installation</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$150</div>
            <div class="cost-box-label">Average Total</div>
          </div>
        </div>
      </div>
      
      <div class="detail-form">
        <div class="form-row">
          <div class="form-group">
            <label for="rainSensorCost">Your Cost Estimate ($)</label>
            <input type="number" id="rainSensorCost" value="150">
            <p class="help-text">Adjust based on your quotes</p>
          </div>
          <div class="form-group">
            <label for="rainSensorSavings">Expected Savings (%)</label>
            <input type="number" id="rainSensorSavings" value="15" min="10" max="20">
            <p class="help-text">10-15% is typical</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Smart Controller Details -->
    <div class="upgrade-detail-content" id="detail-smartController">
      <div class="detail-header">
        <h3 class="detail-title">Smart Controller Configuration</h3>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">Rebate:</span>
            <span class="summary-value">$100</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Typical ROI:</span>
            <span class="summary-value">2-3 years</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Installation:</span>
            <span class="summary-value">IIABC Required</span>
          </div>
        </div>
      </div>
      
      <div class="cost-breakdown">
        <h4>💰 Cost Breakdown by Zone Count</h4>
        <div class="cost-items">
          <div class="cost-box">
            <div class="cost-box-value">$200-400</div>
            <div class="cost-box-label">Controller Unit</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$150-250</div>
            <div class="cost-box-label">Installation</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value" id="controllerAvgCost">$450</div>
            <div class="cost-box-label">Your Total</div>
          </div>
        </div>
      </div>
      
      <div class="detail-form">
        <div class="form-row">
          <div class="form-group">
            <label for="controllerZones">Number of Zones</label>
            <select id="controllerZones" onchange="updateControllerCost()">
              <option value="4">4 zones</option>
              <option value="8" selected>8 zones</option>
              <option value="12">12 zones</option>
              <option value="16">16 zones</option>
            </select>
          </div>
          <div class="form-group">
            <label for="controllerCost">Total Cost ($)</label>
            <input type="number" id="controllerCost" value="450">
          </div>
        </div>
        <div class="form-group">
          <label for="controllerSavings">Expected Water Savings (%)</label>
          <input type="number" id="controllerSavings" value="30" min="20" max="40">
          <p class="help-text">Weather-based controllers typically save 20-40%</p>
        </div>
      </div>
    </div>
    
    <!-- Drip Irrigation Details -->
    <div class="upgrade-detail-content" id="detail-dripConversion">
      <div class="detail-header">
        <h3 class="detail-title">Drip Irrigation Conversion</h3>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">Rebate:</span>
            <span class="summary-value">$400</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Typical ROI:</span>
            <span class="summary-value">2-4 years</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Best For:</span>
            <span class="summary-value">Garden Beds</span>
          </div>
        </div>
      </div>
      
      <div class="cost-breakdown">
        <h4>💰 Cost Estimate: $1.00-1.50 per sq ft</h4>
        <div class="cost-items">
          <div class="cost-box">
            <div class="cost-box-value">$0.40-0.60</div>
            <div class="cost-box-label">Materials/sq ft</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$0.60-0.90</div>
            <div class="cost-box-label">Labor/sq ft</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value" id="dripTotalEstimate">$1,200</div>
            <div class="cost-box-label">Your Estimate</div>
          </div>
        </div>
      </div>
      
      <div class="detail-form">
        <div class="form-row">
          <div class="form-group">
            <label for="dripArea">Area to Convert (sq ft)</label>
            <input type="number" id="dripArea" placeholder="1000" onchange="updateDripCost()">
            <p class="help-text">Garden beds and shrub areas</p>
          </div>
          <div class="form-group">
            <label for="dripCost">Total Cost Estimate ($)</label>
            <input type="number" id="dripCost" value="1200">
          </div>
        </div>
        <div class="form-group">
          <label for="dripSavings">Expected Water Savings (%)</label>
          <input type="number" id="dripSavings" value="40" min="30" max="50">
          <p class="help-text">30-50% typical for drip conversion</p>
        </div>
        <div class="form-group">
          <label for="irrigationDescription">Project Description</label>
          <textarea id="irrigationDescription" placeholder="Describe conversion plans (e.g., 'Convert 1000 sq ft of garden beds from spray heads to drip irrigation with pressure compensating emitters')"></textarea>
        </div>
      </div>
    </div>
    
    <!-- MP Rotators Details -->
    <div class="upgrade-detail-content" id="detail-mpRotators">
      <div class="detail-header">
        <h3 class="detail-title">MP Rotator Nozzles</h3>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">Rebate:</span>
            <span class="summary-value">$100</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Typical ROI:</span>
            <span class="summary-value">1-3 years</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Best For:</span>
            <span class="summary-value">Lawn Areas</span>
          </div>
        </div>
      </div>
      
      <div class="cost-breakdown">
        <h4>💰 Typical Cost Breakdown</h4>
        <div class="cost-items">
          <div class="cost-box">
            <div class="cost-box-value">$10-15</div>
            <div class="cost-box-label">Per Nozzle</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$10-15</div>
            <div class="cost-box-label">Labor/Head</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$20-30</div>
            <div class="cost-box-label">Total/Head</div>
          </div>
        </div>
      </div>
      
      <div class="detail-form">
        <div class="form-row">
          <div class="form-group">
            <label for="mpRotatorsHeads">Number of Heads to Replace</label>
            <input type="number" id="mpRotatorsHeads" value="15" onchange="updateMPRotatorsCost()">
            <p class="help-text">Count existing spray heads</p>
          </div>
          <div class="form-group">
            <label for="mpRotatorsCost">Total Cost Estimate ($)</label>
            <input type="number" id="mpRotatorsCost" value="375">
          </div>
        </div>
        <div class="form-group">
          <label for="mpRotatorsSavings">Expected Water Savings (%)</label>
          <input type="number" id="mpRotatorsSavings" value="25" min="20" max="30">
          <p class="help-text">20-30% typical for MP Rotators</p>
        </div>
      </div>
    </div>
    
    <!-- Soil Improvements Details -->
    <div class="upgrade-detail-content" id="detail-soilImprovements">
      <div class="detail-header">
        <h3 class="detail-title">Soil & Mulch Improvements</h3>
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">Rebate:</span>
            <span class="summary-value">50% up to $100</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Typical ROI:</span>
            <span class="summary-value">1-2 years</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">DIY Friendly:</span>
            <span class="summary-value">Yes</span>
          </div>
        </div>
      </div>
      
      <div class="cost-breakdown">
        <h4>💰 Typical Materials</h4>
        <div class="cost-items">
          <div class="cost-box">
            <div class="cost-box-value">$30-50</div>
            <div class="cost-box-label">Per Yard Mulch</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$40-60</div>
            <div class="cost-box-label">Per Yard Compost</div>
          </div>
          <div class="cost-box">
            <div class="cost-box-value">$50-100</div>
            <div class="cost-box-label">Delivery</div>
          </div>
        </div>
      </div>
      
      <div class="detail-form">
        <div class="form-group">
          <label for="soilCost">Total Project Cost ($)</label>
          <input type="number" id="soilCost" value="200">
          <p class="help-text">Include materials and delivery</p>
        </div>
        <div class="form-group">
          <label for="soilSavings">Expected Water Savings (%)</label>
          <input type="number" id="soilSavings" value="25" min="20" max="30">
          <p class="help-text">20-30% with proper mulching</p>
        </div>
      </div>
    </div>
  `;document.querySelector(".upgrade-details-panel").insertAdjacentHTML("beforeend",e)});window.updateMPRotatorsCost=function(){const e=parseFloat(document.getElementById("mpRotatorsHeads").value)||15;document.getElementById("mpRotatorsCost").value=25*e};