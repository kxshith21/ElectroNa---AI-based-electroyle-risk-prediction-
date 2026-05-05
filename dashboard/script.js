let gaugeChart;
let factorsChart;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Gauge Chart for Current Risk with empty state
    const gaugeCtx = document.getElementById('riskGauge').getContext('2d');
    
    // Gradient for Gauge
    const gradientDanger = gaugeCtx.createLinearGradient(0, 0, 0, 200);
    gradientDanger.addColorStop(0, '#ef233c');
    gradientDanger.addColorStop(1, '#8d0801');

    gaugeChart = new Chart(gaugeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Risk', 'Safe'],
            datasets: [{
                data: [0, 100],
                backgroundColor: [
                    gradientDanger,
                    'rgba(255, 255, 255, 0.05)'
                ],
                borderWidth: 0,
                cutout: '80%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });

    const factorsCtx = document.getElementById('factorsChart').getContext('2d');
    factorsCtx.canvas.height = 220;
    factorsChart = new Chart(factorsCtx, {
        type: 'bar',
        data: {
            labels: ['Creatinine', 'BUN/Cr Ratio', 'Sodium Risk', 'WBC Shift', 'Anaemia'],
            datasets: [{
                label: 'Severity Index (0–100)',
                data: [30, 20, 16, 8, 30],   // soft placeholder — replaces on first predict
                backgroundColor: ['rgba(67,97,238,0.35)','rgba(67,97,238,0.35)',
                                   'rgba(67,97,238,0.35)','rgba(67,97,238,0.35)','rgba(67,97,238,0.35)'],
                borderColor:     ['#4361ee','#4361ee','#4361ee','#4361ee','#4361ee'],
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#adb5bd', font: { size: 11 } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#adb5bd', font: { size: 12 } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Severity: ${ctx.parsed.x.toFixed(0)}/100`
                    }
                }
            },
            animation: { duration: 800, easing: 'easeInOutQuart' }
        }
    });


    // Run an initial predict
    predictRisk();
});

function switchTab(tab) {
    // Hide all views & deactivate all nav items
    ['view-risk','view-clinical','view-history','view-ai'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    ['nav-risk','nav-clinical','nav-history','nav-ai'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    if (tab === 'risk') {
        document.getElementById('view-risk').style.display = 'block';
        document.getElementById('nav-risk').classList.add('active');
    } else if (tab === 'clinical') {
        document.getElementById('view-clinical').style.display = 'block';
        document.getElementById('nav-clinical').classList.add('active');
        fetchPatients();
    } else if (tab === 'history') {
        document.getElementById('view-history').style.display = 'block';
        document.getElementById('nav-history').classList.add('active');
        fetchHistory();
    } else if (tab === 'ai') {
        document.getElementById('view-ai').style.display = 'block';
        document.getElementById('nav-ai').classList.add('active');
    }
}

async function fetchPatients() {
    const tbody = document.getElementById('patients-table-body');
    tbody.innerHTML = '<tr><td colspan="8">Querying database table...</td></tr>';
    try {
        const res = await fetch('/api/patients');
        if(!res.ok) throw new Error("API Network failure.");
        const json = await res.json();
        
        if(json.status === "error") throw new Error(json.message);

        let html = '';
        json.data.forEach(p => {
             // Safe stringification
             const pString = encodeURIComponent(JSON.stringify(p));
             html += `
                <tr>
                    <td><strong>${p.subject_id}</strong><br><small style="color:var(--text-muted)">HADM: ${p.hadm_id}</small></td>
                    <td>${p.anchor_age}<br><small style="color:var(--text-muted)">${p.anchor_year_group}</small></td>
                    <td>${p.gender}</td>
                    <td class="${p.Creatinine > 1.2 ? 'text-danger' : 'text-normal'}">${parseFloat(p.Creatinine).toFixed(2)}</td>
                    <td>${parseFloat(p["Urea Nitrogen"]).toFixed(1)}</td>
                    <td class="${parseFloat(p.Sodium) < 135 ? 'text-warning' : 'text-normal'}">${parseFloat(p.Sodium).toFixed(1)}</td>
                    <td>${parseFloat(p.Hemoglobin).toFixed(1)} / ${parseFloat(p.WBC).toFixed(1)}</td>
                    <td>
                        <button class="load-btn" onclick="loadPatient('${pString}')">Load to Predictor</button>
                    </td>
                </tr>
             `;
        });
        tbody.innerHTML = html;
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Failed to load: ${err.message}</td></tr>`;
    }
}

function loadPatient(encodedStr) {
    const p = JSON.parse(decodeURIComponent(encodedStr));
    
    // Switch to risk tab
    switchTab('risk');
    
    // Fill predictive form
    document.getElementById('inp-age').value = p.anchor_age;
    document.getElementById('inp-gender').value = p.gender;
    document.getElementById('inp-creat').value = parseFloat(p.Creatinine).toFixed(2);
    document.getElementById('inp-hemo').value = parseFloat(p.Hemoglobin).toFixed(2);
    document.getElementById('inp-sodium').value = parseFloat(p.Sodium).toFixed(1);
    document.getElementById('inp-urea').value = parseFloat(p["Urea Nitrogen"]).toFixed(1);
    document.getElementById('inp-wbc').value = parseFloat(p.WBC).toFixed(1);
    
    document.getElementById('current-patient-name').textContent = `Patient ${p.subject_id}`;
    document.getElementById('current-patient-id').textContent = `HADM: #${p.hadm_id}`;

    // Auto-predict
    predictRisk();
}

async function predictRisk() {
    const errorEl = document.getElementById('api-error');
    errorEl.style.display = 'none';
    document.getElementById('api-status').innerHTML = "⌛";

    const payload = {
        anchor_age: parseFloat(document.getElementById('inp-age').value),
        gender: document.getElementById('inp-gender').value,
        Creatinine: parseFloat(document.getElementById('inp-creat').value),
        Hemoglobin: parseFloat(document.getElementById('inp-hemo').value),
        Sodium: parseFloat(document.getElementById('inp-sodium').value),
        "Urea Nitrogen": parseFloat(document.getElementById('inp-urea').value),
        WBC: parseFloat(document.getElementById('inp-wbc').value),
        patient_label: document.getElementById('current-patient-name').textContent || 'Manual Entry'
    };

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("API request failed. Is the server running?");
        
        const data = await res.json();
        if (data.status === "error") throw new Error(data.message);

        document.getElementById('api-status').innerHTML = "🟢";
        updateDashboard(data.mortality_probability, data.prediction_class, payload);
    } catch(err) {
        console.error(err);
        errorEl.textContent = "Error: " + err.message;
        errorEl.style.display = 'block';
        document.getElementById('api-status').innerHTML = "🔴";
    }
}

function updateDashboard(prob, predClass, payload) {
    gaugeChart.data.datasets[0].data = [prob, 100 - prob];
    
    const isCritical = prob >= 70;
    const isWarning = prob >= 30 && prob < 70;
    
    let chartColorContext = gaugeChart.ctx;
    // Create a horizontal gradient from left to right (0 to 300px approx width)
    let gradient = chartColorContext.createLinearGradient(0, 0, 300, 0);
    
    if (isCritical) {
        gradient.addColorStop(0, '#ef233c');
        gradient.addColorStop(1, '#8d0801');
    } else if (isWarning) {
        gradient.addColorStop(0, '#fca311');
        gradient.addColorStop(1, '#d48a0c');
    } else {
        gradient.addColorStop(0, '#06d6a0');
        gradient.addColorStop(1, '#04a178');
    }
    
    gaugeChart.data.datasets[0].backgroundColor[0] = gradient;
    gaugeChart.update();

    const scoreEl = document.getElementById('risk-score');
    const statusEl = document.getElementById('risk-status');
    const topStatusBadgeEl = document.getElementById('status-badge');

    scoreEl.textContent = prob.toFixed(1) + "%";
    scoreEl.style.color = isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--normal)';

    if (isCritical) {
        statusEl.textContent = "HIGH RISK";
        statusEl.className = "status text-danger";
        topStatusBadgeEl.textContent = "Critical - Needs Action";
        topStatusBadgeEl.className = "value critical";
    } else if (isWarning) {
        statusEl.textContent = "MODERATE RISK";
        statusEl.className = "status text-warning";
        topStatusBadgeEl.textContent = "Warning - Monitor";
        topStatusBadgeEl.className = "value text-warning";
    } else {
        statusEl.textContent = "LOW RISK";
        statusEl.className = "status text-normal";
        topStatusBadgeEl.textContent = "Stable";
        topStatusBadgeEl.className = "value text-normal";
    }

    const creatPct = Math.min((payload.Creatinine / 5) * 100, 100);
    const bunCrRatio = payload["Urea Nitrogen"] / (payload.Creatinine || 1);
    const bunPct = Math.min((bunCrRatio / 40) * 100, 100);
    const sodRisk = Math.min((Math.abs(payload.Sodium - 140) * 8), 100);
    const wbcPct = Math.min(Math.abs(payload.WBC - 7) * 8, 100);
    const hemoPct = payload.Hemoglobin < 13 ? Math.min((13 - payload.Hemoglobin) * 15, 100) : 0;
    
    factorsChart.data.datasets[0].data = [creatPct, bunPct, sodRisk, wbcPct, hemoPct];
    factorsChart.data.datasets[0].backgroundColor = factorsChart.data.datasets[0].data.map(val => 
        val > 70 ? 'rgba(239, 35, 60, 0.6)' : val > 40 ? 'rgba(252, 163, 17, 0.6)' : 'rgba(6, 214, 160, 0.4)'
    );
    factorsChart.data.datasets[0].borderColor = factorsChart.data.datasets[0].data.map(val => 
        val > 70 ? '#ef233c' : val > 40 ? '#fca311' : '#06d6a0'
    );
    factorsChart.update();
}

function resetVitals() {
    document.getElementById('inp-age').value = 65;
    document.getElementById('inp-gender').value = 'M';
    document.getElementById('inp-creat').value = 1.5;
    document.getElementById('inp-hemo').value = 10.5;
    document.getElementById('inp-sodium').value = 138.0;
    document.getElementById('inp-urea').value = 25.0;
    document.getElementById('inp-wbc').value = 8.0;
    
    document.getElementById('current-patient-name').textContent = 'Test Subject';
    document.getElementById('current-patient-id').textContent = 'ID: #SG-LIVE';

    predictRisk();
}

function downloadReport() {
    // Legacy fallback — use AI tab for full PDF
    window.print();
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Clinical Insight
// ─────────────────────────────────────────────────────────────────────────────

/** Cached report payload from last generateInsight() call */
let _lastReport = null;

async function generateInsight() {
    // Pull current lab values from the Risk Overview form
    const payload = {
        anchor_age: parseFloat(document.getElementById('inp-age').value) || 60,
        gender:     document.getElementById('inp-gender').value || 'M',
        mortality_probability: parseFloat(document.getElementById('risk-score').textContent) || 0,
        Sodium:           parseFloat(document.getElementById('inp-sodium').value) || 140,
        Creatinine:       parseFloat(document.getElementById('inp-creat').value)  || 1.0,
        Bilirubin:        parseFloat(document.getElementById('inp-bili') ? document.getElementById('inp-bili').value : 1.2) || 1.2,
        INR:              parseFloat(document.getElementById('inp-inr') ? document.getElementById('inp-inr').value : 1.1) || 1.1,
        'Urea Nitrogen':  parseFloat(document.getElementById('inp-urea').value)   || 15,
        Hemoglobin:       parseFloat(document.getElementById('inp-hemo').value)   || 12,
        WBC:              parseFloat(document.getElementById('inp-wbc').value)    || 7,
        patient_id:   document.getElementById('current-patient-id').textContent.replace('ID: #','').replace('HADM: #','') || 'SG-LIVE',
        patient_name: document.getElementById('current-patient-name').textContent || 'Anonymous',
    };

    // Sanitise — risk score might still be '--'
    if (isNaN(payload.mortality_probability)) payload.mortality_probability = 0;

    // Show loader, hide empty state + content
    document.getElementById('ai-empty').style.display   = 'none';
    document.getElementById('ai-content').style.display = 'none';
    document.getElementById('ai-loader').style.display  = 'flex';
    document.getElementById('btn-download-pdf').style.display = 'none';

    try {
        const res  = await fetch('/api/ai-insight', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Server error ' + res.status);
        const json = await res.json();
        if (json.status === 'error') throw new Error(json.message);

        _lastReport = json.report;
        renderInsight(json.insight, json.report);
    } catch (err) {
        document.getElementById('ai-loader').style.display  = 'none';
        document.getElementById('ai-empty').style.display   = 'flex';
        document.getElementById('ai-empty').querySelector('p').textContent =
            'Failed to generate insight: ' + err.message;
    }
}

function renderInsight(ins, rpt) {
    document.getElementById('ai-loader').style.display = 'none';

    // ── ❶ Alerts ──────────────────────────────────────────────────────────────
    const alertsEl = document.getElementById('ai-alerts');
    if (ins.alerts && ins.alerts.length) {
        alertsEl.innerHTML = ins.alerts.map(a =>
            `<div class="ai-alert-banner ai-alert-${a.level}">
                <div class="ai-alert-top"><span class="ai-alert-icon">${a.icon}</span><strong>${a.message}</strong></div>
                <div class="ai-alert-urgency">${a.urgency}</div>
            </div>`
        ).join('');
        alertsEl.style.display = 'flex';
    } else {
        alertsEl.style.display = 'none';
    }

    // ── ❷ Risk badge ──────────────────────────────────────────────────────────
    const chip  = document.getElementById('ai-risk-chip');
    const panel = document.getElementById('ai-risk-badge-panel');
    chip.textContent = ins.risk_level;
    chip.className   = 'ai-risk-chip chip-' + ins.risk_color;
    document.getElementById('ai-risk-pct').textContent    = ins.risk_percentage.toFixed(1) + '%';
    document.getElementById('ai-risk-pct').className      = 'ai-risk-pct text-' + ins.risk_color;
    document.getElementById('ai-risk-interp').textContent = ins.risk_interpretation;
    panel.style.borderLeftColor = ins.risk_color === 'danger' ? 'var(--danger)' :
                                  ins.risk_color === 'warning' ? 'var(--warning)' : 'var(--normal)';
                                  
    // ── ❷.5 MELD Score ────────────────────────────────────────────────────────
    const meldChip = document.getElementById('ai-meld-chip');
    meldChip.textContent = ins.meld_severity;
    meldChip.className   = 'ai-risk-chip chip-' + (ins.meld_score >= 20 ? 'danger' : ins.meld_score >= 10 ? 'warning' : 'normal');
    
    document.getElementById('ai-meld-score').textContent = ins.meld_score;
    document.getElementById('ai-meld-score').className   = 'ai-risk-pct text-' + (ins.meld_score >= 20 ? 'danger' : ins.meld_score >= 10 ? 'warning' : 'normal');
    
    document.getElementById('ai-meld-interp').textContent = ins.meld_comparison;

    // ── ❷ Confidence ring ─────────────────────────────────────────────────────
    const conf   = ins.confidence;
    const circle = document.getElementById('ai-conf-circle');
    circle.style.strokeDashoffset = 314 - (314 * conf / 100);
    circle.style.stroke = conf >= 85 ? '#06d6a0' : conf >= 70 ? '#fca311' : '#ef233c';
    circle.style.transition = 'stroke-dashoffset 1.2s ease, stroke 0.5s';
    document.getElementById('ai-conf-pct').textContent = conf + '%';

    // ── ❷ Urgency chip ────────────────────────────────────────────────────────
    const urgChip = document.getElementById('ai-urgency-chip');
    urgChip.textContent = ins.urgency;
    urgChip.className   = 'ai-urgency-chip chip-' + (ins.urgency === 'Critical' ? 'danger' : ins.urgency === 'Moderate' ? 'warning' : 'normal');
    document.getElementById('ai-urgency-reason').textContent = ins.urgency_reason;

    // ── ❷ Risk Trend ──────────────────────────────────────────────────────────
    const trendEl = document.getElementById('ai-trend-timeline');
    if (ins.trend && ins.trend.length) {
        const dirIcon = ins.trend_direction === 'worsening' ? '📈' :
                        ins.trend_direction === 'improving'  ? '📉' : '➡️';
        trendEl.innerHTML = ins.trend.map((t, i) => {
            const color = t.risk >= 70 ? 'var(--danger)' : t.risk >= 30 ? 'var(--warning)' : 'var(--normal)';
            return `<div class="ai-trend-node">
                <div class="ai-trend-dot" style="background:${color}; box-shadow:0 0 8px ${color};"></div>
                <div class="ai-trend-val" style="color:${color}">${t.risk}%</div>
                <div class="ai-trend-label">${t.label}</div>
            </div>${i < ins.trend.length - 1 ? '<div class="ai-trend-line"></div>' : ''}`;
        }).join('');
        document.getElementById('ai-trend-interp').textContent = dirIcon + ' ' + ins.trend_interpretation;
    } else {
        trendEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;margin-top:16px;">No history yet — run more predictions.</p>';
        document.getElementById('ai-trend-interp').textContent = ins.trend_interpretation || '';
    }

    // ── ❸ Abnormal Value Highlighting ────────────────────────────────────────
    document.getElementById('ai-abnormal-grid').innerHTML = ins.abnormal_labs.map(lab => `
        <div class="ai-abnormal-card ai-abnormal-${lab.severity}" title="${lab.tooltip}">
            <div class="ai-abnormal-top">
                <span class="ai-abnormal-icon">${lab.icon}</span>
                <span class="ai-abnormal-name">${lab.name}</span>
                <span class="ai-abnormal-chip chip-${lab.severity}">${lab.status}</span>
            </div>
            <div class="ai-abnormal-val">${lab.value} <span class="ai-abnormal-unit">${lab.unit}</span></div>
            <div class="ai-abnormal-range">Ref: ${lab.normal_range}</div>
            <div class="ai-abnormal-tooltip">${lab.tooltip}</div>
        </div>`).join('');

    // ── ❹ Risk Contribution / Explainability ─────────────────────────────────
    document.getElementById('ai-contrib-list').innerHTML = ins.contributions.map(c => {
        const barColor = c.severity === 'danger' ? 'var(--danger)' : c.severity === 'warning' ? 'var(--warning)' : 'var(--normal)';
        return `<div class="ai-contrib-row">
            <div class="ai-contrib-header">
                <span class="ai-contrib-param">${c.param}</span>
                <span class="ai-contrib-pct" style="color:${barColor}">${c.pct}%</span>
            </div>
            <div class="ai-contrib-bar-bg">
                <div class="ai-contrib-bar-fill" style="width:${c.pct}%; background:${barColor};
                    box-shadow: 0 0 8px ${barColor}40;
                    transition: width 1.2s cubic-bezier(.4,0,.2,1);"></div>
            </div>
            <div class="ai-contrib-explain">${c.explanation}</div>
        </div>`;
    }).join('');

    // ── ❺ Differential Diagnosis ──────────────────────────────────────────────
    document.getElementById('ai-diff-grid').innerHTML = ins.differential.map(d => {
        const probColor = d.probability === 'High' ? 'chip-danger' : 'chip-warning';
        return `<div class="ai-diff-card">
            <div class="ai-diff-top">
                <span class="ai-diff-condition">${d.condition}</span>
                <span class="ai-diff-prob ${probColor}">${d.probability}</span>
            </div>
            <div class="ai-diff-basis">${d.basis}</div>
        </div>`;
    }).join('');

    // ── ❻ Key Findings ────────────────────────────────────────────────────────
    document.getElementById('ai-findings').innerHTML = ins.findings.map(f => {
        const isAbn = f.includes('—');
        const parts = f.split('—');
        return `<li class="ai-list-item ${isAbn ? 'ai-list-warn' : ''}">
            <span class="ai-list-icon">${isAbn ? '⚠' : '✓'}</span>
            <span><strong>${parts[0].trim()}</strong>${parts[1] ? ' — ' + parts[1].trim() : ''}</span>
        </li>`;
    }).join('');

    // ── ❻ Complications ───────────────────────────────────────────────────────
    document.getElementById('ai-complications').innerHTML = ins.complications.map(c => {
        const parts = c.split('—');
        return `<li class="ai-list-item ai-list-danger">
            <span class="ai-list-icon">⚡</span>
            <span><strong>${parts[0].trim()}</strong>${parts[1] ? ' — ' + parts[1].trim() : ''}</span>
        </li>`;
    }).join('');

    // ── ❼ Actions ─────────────────────────────────────────────────────────────
    document.getElementById('ai-actions').innerHTML = ins.actions.map((a, i) =>
        `<li class="ai-action-item"><span class="ai-action-num">${i+1}</span><span>${a}</span></li>`
    ).join('');

    // ── ❽ Quick Summary ───────────────────────────────────────────────────────
    if (ins.quick_summary && ins.quick_summary.length >= 2) {
        document.getElementById('ai-quick-line1').textContent = ins.quick_summary[0];
        document.getElementById('ai-quick-line2').textContent = ins.quick_summary[1];
    }

    // ── ❽ What-If ─────────────────────────────────────────────────────────────
    if (ins.whatif) {
        document.getElementById('ai-whatif-list').innerHTML = ins.whatif.map(w =>
            `<li class="ai-whatif-item"><span class="ai-whatif-icon">💡</span><span>${w}</span></li>`
        ).join('');
    }

    // ── ❾ Report ──────────────────────────────────────────────────────────────
    document.getElementById('ai-report-meta').textContent  = `Report ID: SG-${Date.now().toString(36).toUpperCase()}`;
    document.getElementById('rpt-timestamp').textContent   = rpt.generated_at;
    document.getElementById('rpt-risk-pct').textContent    = rpt.risk_percentage + '%';
    document.getElementById('rpt-risk-level').textContent  = rpt.risk_level;
    document.getElementById('rpt-risk-level').className    = 'ai-report-risk-val text-' + ins.risk_color;
    document.getElementById('rpt-risk-interp').textContent = rpt.risk_interpretation;
    document.getElementById('ai-doctor-notes').textContent = rpt.doctor_notes;

    document.getElementById('ai-report-patient').innerHTML = [
        ['Patient ID', rpt.patient_id], ['Name', rpt.patient_name],
        ['Age', rpt.age + ' years'],    ['Gender', rpt.gender],
        ['Report Date', rpt.generated_at],
    ].map(([k,v]) => `<tr><td class="rpt-key">${k}</td><td class="rpt-val">${v}</td></tr>`).join('');

    document.getElementById('ai-report-labs').innerHTML = [
        ['Sodium',              rpt.lab.sodium.value     + ' mEq/L', rpt.lab.sodium.status,     rpt.lab.sodium.severity],
        ['Creatinine',          rpt.lab.creatinine.value + ' mg/dL', rpt.lab.creatinine.status, rpt.lab.creatinine.severity],
        ['Urea Nitrogen (BUN)', rpt.lab.urea.value       + ' mg/dL', rpt.lab.urea.status,       rpt.lab.urea.severity],
        ['Hemoglobin',          rpt.lab.hemoglobin.value + ' g/dL',  rpt.lab.hemoglobin.status, rpt.lab.hemoglobin.severity],
        ['WBC Count',           rpt.lab.wbc.value        + ' K/µL',  rpt.lab.wbc.status,        rpt.lab.wbc.severity],
    ].map(([name, val, status, sev]) => `<tr>
        <td class="rpt-key">${name}</td>
        <td class="rpt-val">${val}</td>
        <td><span class="rpt-status-chip chip-${sev}">${status}</span></td>
    </tr>`).join('');

    document.getElementById('ai-content').style.display = 'flex';
    document.getElementById('btn-download-pdf').style.display = 'inline-block';
    document.getElementById('btn-export-text').style.display = 'inline-block';
    document.getElementById('btn-copy-summary').style.display = 'inline-block';
}

function downloadPDFReport() {
    if (!_lastReport) return;
    const rpt = _lastReport;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const PAGE_W = 210, MARGIN = 18, COL = PAGE_W - MARGIN * 2;
    let y = 20;
    const accent = [67, 97, 238], danger = [239, 35, 60], warn = [252, 163, 17];
    const good = [6, 214, 160], dark = [15, 20, 40], muted = [130, 145, 165];
    const riskColor = rpt.risk_level === 'High' ? danger : rpt.risk_level === 'Moderate' ? warn : good;

    // Header
    doc.setFillColor(...dark); doc.rect(0, 0, PAGE_W, 38, 'F');
    doc.setFillColor(...accent); doc.rect(0, 0, 6, 38, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(255,255,255);
    doc.text('SaltGuard — Patient Medical Report', MARGIN+2, 14);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...muted);
    doc.text('Clinical Decision Support System  |  AI Engine v2.0', MARGIN+2, 21);
    doc.text('Generated: ' + rpt.generated_at, MARGIN+2, 27);
    doc.text('Report ID: SG-' + Date.now().toString(36).toUpperCase(), MARGIN+2, 33);
    y = 48;

    function section(title, color = accent) {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor(...color);
        doc.text(title, MARGIN, y);
        doc.setDrawColor(...color); doc.setLineWidth(0.4);
        doc.line(MARGIN, y+2, MARGIN+COL, y+2);
        y += 8; doc.setTextColor(30,30,30);
    }
    function row(label, value, vc = null) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(70,70,80);
        doc.text(label + ':', MARGIN, y);
        doc.setFont('helvetica','normal');
        if (vc) doc.setTextColor(...vc); else doc.setTextColor(20,20,20);
        doc.text(String(value), MARGIN+52, y); doc.setTextColor(20,20,20); y += 7;
    }
    function bullet(text, icon = '•', color = null) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica','normal'); doc.setFontSize(9.5);
        if (color) doc.setTextColor(...color); else doc.setTextColor(40,40,50);
        const lines = doc.splitTextToSize(icon + '  ' + text, COL - 4);
        doc.text(lines, MARGIN+2, y); y += lines.length * 5.5 + 1;
        doc.setTextColor(40,40,50);
    }

    // Patient Information
    section('PATIENT INFORMATION');
    row('Patient ID', rpt.patient_id); row('Name', rpt.patient_name);
    row('Age', rpt.age + ' years'); row('Gender', rpt.gender); y += 4;

    // Risk Trend
    if (rpt.trend && rpt.trend.length) {
        section('RISK TREND / PATIENT HISTORY', accent);
        rpt.trend.forEach(t => row(t.label, t.risk + '%', t.risk >= 70 ? danger : t.risk >= 30 ? warn : good));
        const tLines = doc.splitTextToSize('Interpretation: ' + rpt.trend_interpretation, COL);
        doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.setTextColor(...muted);
        doc.text(tLines, MARGIN, y); y += tLines.length * 5 + 6;
        doc.setFont('helvetica','normal'); doc.setTextColor(30,30,30);
    }

    // Risk Assessment
    section('RISK ASSESSMENT', riskColor);
    row('AI Severity Risk', rpt.risk_percentage + '%', riskColor);
    row('AI Category', rpt.risk_level, riskColor);
    row('MELD Score', rpt.meld_score + ' (' + rpt.meld_severity + ')');
    
    const interpLines = doc.splitTextToSize('Interpretation: ' + rpt.risk_interpretation, COL);
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(20,20,20);
    doc.text(interpLines, MARGIN, y); y += interpLines.length * 5.5 + 2;
    
    const meldLines = doc.splitTextToSize('MELD Comparison: ' + rpt.meld_comparison, COL);
    doc.setFont('helvetica','italic'); doc.setTextColor(70,70,80);
    doc.text(meldLines, MARGIN, y); y += meldLines.length * 5.5 + 8;

    // Laboratory Findings
    section('LABORATORY FINDINGS');
    const labMap = [
        ['Sodium (mEq/L)', rpt.lab.sodium], ['Creatinine (mg/dL)', rpt.lab.creatinine],
        ['Urea Nitrogen / BUN (mg/dL)', rpt.lab.urea],
        ['Hemoglobin (g/dL)', rpt.lab.hemoglobin], ['WBC Count (K/µL)', rpt.lab.wbc],
    ];
    labMap.forEach(([name, lab]) => {
        const sc = lab.severity === 'danger' ? danger : lab.severity === 'warning' ? warn : good;
        row(name, lab.value + '    [' + lab.status + ']', sc);
    }); y += 4;

    // Key Findings
    section('KEY FINDINGS');
    rpt.findings.forEach(f => bullet(f, '-', [60,60,70])); y += 4;

    // Differential Diagnosis
    if (rpt.differential && rpt.differential.length) {
        section('DIFFERENTIAL DIAGNOSIS', [100,80,200]);
        rpt.differential.forEach(d => {
            const pColor = d.probability === 'High' ? danger : warn;
            bullet(`${d.condition} [${d.probability}] - ${d.basis}`, '>', pColor);
        }); y += 4;
    }

    // Possible Complications
    section('POSSIBLE COMPLICATIONS', danger);
    rpt.complications.forEach(c => bullet(c, '!', [150,40,40])); y += 4;

    // Recommended Actions
    section('RECOMMENDED CLINICAL ACTIONS', good);
    rpt.actions.forEach((a,i) => bullet(a, (i+1)+'.', [10,120,100])); y += 4;

    // What-If Simulation
    if (rpt.whatif && rpt.whatif.length) {
        section('WHAT-IF SIMULATION', [80,160,240]);
        rpt.whatif.forEach(w => bullet(w, '?', [60,100,160])); y += 4;
    }

    // Quick Doctor Summary
    if (rpt.quick_summary && rpt.quick_summary.length) {
        section('QUICK DOCTOR SUMMARY');
        rpt.quick_summary.forEach(s => {
            const lines = doc.splitTextToSize(s, COL);
            doc.setFont('helvetica','italic'); doc.setFontSize(9.5); doc.setTextColor(40,40,50);
            doc.text(lines, MARGIN, y); y += lines.length * 5.5 + 3;
        }); y += 4;
    }

    // Doctor Notes
    section('DOCTOR NOTES');
    doc.setFont('helvetica','italic'); doc.setFontSize(9.5); doc.setTextColor(40,40,50);
    const noteLines = doc.splitTextToSize(rpt.doctor_notes, COL);
    doc.text(noteLines, MARGIN, y); y += noteLines.length * 5.5 + 6;

    // System Note
    section('SYSTEM NOTE', muted);
    bullet('This system can be integrated with hospital EHR systems for real-time patient monitoring.', 'i', [100,130,160]);

    // Footer on every page
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...dark); doc.rect(0, 285, PAGE_W, 12, 'F');
        doc.text('SaltGuard Clinical AI v2  |  For clinical use only — not a substitute for professional medical judgement.', MARGIN, 291);
        doc.text('Page ' + p + ' of ' + totalPages, PAGE_W - MARGIN - 10, 291);
    }
    // Open the PDF in a new browser tab so it can be viewed immediately
    window.open(URL.createObjectURL(doc.output('blob')));
    
    // Also trigger the download with a completely safe, hardcoded filename
    doc.save("SaltGuard_Clinical_Report.pdf");
}



// ── Prediction History ───────────────────────────────────────────────────────
const RISK_CLASS = prob =>
    prob >= 70 ? 'text-danger' : prob >= 30 ? 'text-warning' : 'text-normal';
const RISK_LABEL = prob =>
    prob >= 70 ? 'HIGH' : prob >= 30 ? 'MOD' : 'LOW';

async function fetchHistory() {
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '<tr><td colspan="9">Loading...</td></tr>';
    try {
        const res = await fetch('/api/history');
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (json.status === 'error') throw new Error(json.message);

        if (!json.data.length) {
            tbody.innerHTML = '<tr><td colspan="9" style="color:var(--text-muted)">No predictions yet — run a prediction from the Risk Overview tab first.</td></tr>';
            return;
        }

        let html = '';
        json.data.forEach(h => {
            const prob = parseFloat(h.mortality_probability);
            const cls  = RISK_CLASS(prob);
            const lbl  = RISK_LABEL(prob);
            html += `
                <tr>
                    <td style="color:var(--text-muted)">#${h.id}</td>
                    <td style="font-size:12px">${h.timestamp}</td>
                    <td><strong>${h.patient_label}</strong></td>
                    <td>${h.anchor_age} / ${h.gender}</td>
                    <td class="${parseFloat(h.Creatinine) > 1.2 ? 'text-danger' : 'text-normal'}">${parseFloat(h.Creatinine).toFixed(2)}</td>
                    <td>${parseFloat(h['Urea Nitrogen']).toFixed(1)}</td>
                    <td class="${parseFloat(h.Sodium) < 135 ? 'text-warning' : 'text-normal'}">${parseFloat(h.Sodium).toFixed(1)}</td>
                    <td>${parseFloat(h.Hemoglobin).toFixed(1)} / ${parseFloat(h.WBC).toFixed(1)}</td>
                    <td><span class="${cls}" style="font-weight:600">${prob.toFixed(1)}% <small>${lbl}</small></span></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch(err) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-danger">Failed to load history: ${err.message}</td></tr>`;
    }
}

async function clearHistory() {
    if (!confirm('Clear all prediction history from the database?')) return;
    try {
        const res = await fetch('/api/history', { method: 'DELETE' });
        if (!res.ok) throw new Error('Network error');
        fetchHistory();
    } catch(err) {
        alert('Could not clear history: ' + err.message);
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

function exportTextReport() {
    if (!_lastReport) return;
    const rpt = _lastReport;
    
    let text = `ElectroNa AI System\nCirrhosis Severity Report\nDate: ${rpt.generated_at}\n\n`;
    text += `Patient Info:\n* ID: ${rpt.patient_id}\n* Age: ${rpt.age}\n* Gender: ${rpt.gender}\n\n`;
    text += `Scores:\n* AI Risk: ${rpt.risk_percentage}%\n* MELD Score: ${rpt.meld_score} (${rpt.meld_severity})\n\n`;
    
    text += `Assessment:\n${rpt.copy_summary}\n\n`;
    
    text += `Recommendations:\n`;
    rpt.actions.forEach(a => text += `* ${a}\n`);
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaltGuard_Report_${rpt.patient_id.replace(/[^a-zA-Z0-9-]/g, '')}_${rpt.generated_at.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyDoctorSummary() {
    if (!_lastReport) return;
    navigator.clipboard.writeText(_lastReport.copy_summary).then(() => {
        alert("Summary copied to clipboard:\n\n" + _lastReport.copy_summary);
    }).catch(err => {
        alert("Failed to copy text: " + err);
    });
}
