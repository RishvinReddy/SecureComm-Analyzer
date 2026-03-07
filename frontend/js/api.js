const consoleEl = document.getElementById('console');
const domainInput = document.getElementById('domain');
const analyzeBtn = document.getElementById('analyzeBtn');
const scanTypeSelect = document.getElementById('scanType');

function addLog(msg, type = "info") {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logLine = document.createElement('div');
    logLine.className = 'log-line';

    // Convert newlines in the message to a `<br>` and preserve spacing for objects
    const formattedMsg = msg.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');

    logLine.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="log-msg log-${type}">${formattedMsg}</span>
    `;
    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function addCertDetails(data) {
    const details = document.createElement('div');
    details.className = 'cert-details';

    const fields = [
        { label: 'Status', val: data.status, color: data.status === 'Secure' ? '#4ade80' : '#f87171' },
        { label: 'Protocol', val: data.protocol_version },
        { label: 'Cipher Suite', val: `${data.cipher_suite} (${data.cipher_version})` },
        { label: 'Issuer', val: data.issuer },
        { label: 'Subject', val: data.subject },
        { label: 'Valid From', val: data.valid_from },
        { label: 'Valid Until', val: data.valid_to },
        { label: 'SANs', val: data.subject_alt_names?.join(', ') }
    ];

    let html = '';
    fields.forEach(f => {
        if (!f.val) return;
        const valStyle = f.color ? `style="color: ${f.color}; font-weight: bold;"` : '';
        html += `
            <div class="cert-line">
                <span class="cert-label">${f.label}:</span>
                <span class="cert-val" ${valStyle}>${f.val}</span>
            </div>
        `;
    });

    // Append integrated TLS Comparison if available
    if (data.tls_comparison) {
        const tls12 = data.tls_comparison.tls_1_2;
        const tls13 = data.tls_comparison.tls_1_3;

        html += `
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div style="color: #38bdf8; font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">TLS Version Comparison</div>
            <div style="display: grid; grid-template-columns: 140px 1fr 1fr; gap: 10px;">
                <div style="color: #94a3b8; font-weight: bold;">Parameter</div>
                <div style="color: #94a3b8; font-weight: bold;">TLS 1.2</div>
                <div style="color: #94a3b8; font-weight: bold;">TLS 1.3</div>

                <div class="cert-label">Supported</div>
                <div class="cert-val" style="color: ${tls12.supported ? '#4ade80' : '#f87171'}">${tls12.supported}</div>
                <div class="cert-val" style="color: ${tls13.supported ? '#4ade80' : '#f87171'}">${tls13.supported}</div>

                <div class="cert-label">Protocol</div>
                <div class="cert-val">${tls12.protocol || "-"}</div>
                <div class="cert-val">${tls13.protocol || "-"}</div>

                <div class="cert-label">Cipher Suite</div>
                <div class="cert-val">${tls12.cipher || "-"}</div>
                <div class="cert-val">${tls13.cipher || "-"}</div>

                <div class="cert-label">Handshake Time</div>
                <div class="cert-val">${tls12.handshake_time ? tls12.handshake_time + 's' : '-'}</div>
                <div class="cert-val">${tls13.handshake_time ? tls13.handshake_time + 's' : '-'}</div>
            </div>
            <div style="margin-top: 10px; font-size: 0.85em; color: #94a3b8;">
                Engine Mode: ${data.tls_comparison.mode}
            </div>
        `;
    }

    // Append integrated Insights if available
    if (data.tls_insights && data.tls_insights.length > 0) {
        html += `
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div style="color: #c084fc; font-weight: bold; margin-bottom: 5px; font-size: 1.1em;">Security Insights</div>
            <div style="color: #e2e8f0;">
                <ul style="margin: 0; padding-left: 20px;">
                    ${data.tls_insights.map(insight => `<li style="margin-bottom: 5px;">${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Append Handshake Analysis if available
    if (data.handshake_analysis) {
        html += `
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div style="color: #fca5a5; font-weight: bold; margin-bottom: 5px; font-size: 1.1em;">TLS Handshake Packet Analysis</div>
        `;

        if (data.handshake_analysis.supported) {
            // Placeholder for Linux Mode Success rendering
            html += `<div style="color: #4ade80;">${data.handshake_analysis.note || 'Parse Complete'}</div>`;
        } else {
            // Windows Mode / Not Installed rendering
            html += `<div style="color: #94a3b8; font-style: italic;">Module Disabled: ${data.handshake_analysis.reason}</div>`;
        }
    }

    details.innerHTML = html;
    consoleEl.appendChild(details);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Utility to create a delay
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function initiateScan() {
    let target = domainInput.value.trim();
    if (!target) return;

    // Clean up domain if user pasted full URL
    target = target.replace(/^https?:\/\//, '').split('/')[0];
    domainInput.value = target;

    domainInput.disabled = true;
    analyzeBtn.disabled = true;
    scanTypeSelect.disabled = true;

    // Remove the blinking cursor if it exists
    const cursor = consoleEl.querySelector('.blinking-cursor');
    if (cursor) cursor.remove();

    const scanType = scanTypeSelect.value;

    if (scanType === "https") {
        await checkDomain(target);
    } else if (scanType === "nmap") {
        await runNmapScan(target);
    }

    addLog(`<span class="blinking-cursor"></span>`, 'info');
    domainInput.disabled = false;
    analyzeBtn.disabled = false;
    scanTypeSelect.disabled = false;
    domainInput.focus();
}

async function runNmapScan(target) {
    addLog(`Initiating FAST PORT SCAN for TARGET: ${target}`, 'info');

    try {
        const fetchPromise = fetch("http://127.0.0.1:5000/api/scan/nmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target: target })
        });

        await sleep(500);
        addLog(`Executing local nmap binary...`, 'info');

        await sleep(800);
        addLog(`Scanning top 100 prominent TCP ports (-F)...`, 'info');

        await sleep(600);
        addLog(`Aggressive timing template (-T4) enabled...`, 'warn');

        const response = await fetchPromise;
        const data = await response.json();

        if (data.status === "Success") {
            addLog(`Scan complete. Formatting results...`, 'success');
            addNmapDetails(data);
        } else {
            addLog(`Nmap Scan aborted or failed.`, 'error');
            addLog(`ERROR: ${data.error}`, 'error');
        }

    } catch (error) {
        addLog(`System Error: Could not connect to backend engine.`, 'error');
        addLog(error.message, 'error');
    }
}

async function checkDomain(domain) {
    addLog(`Initiating HTTPS TLS scan for TARGET: ${domain}`, 'info');

    try {
        // Send request in background while simulating step-by-step logs
        const fetchPromise = fetch("http://127.0.0.1:5000/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain: domain })
        });

        await sleep(500);
        addLog(`Resolving IP address for ${domain}...`, 'info');

        await sleep(800);
        addLog(`Establishing TCP connection on port 443...`, 'info');

        await sleep(600);
        addLog(`Initiating TLS handshake...`, 'info');

        await sleep(700);
        addLog(`Retrieving X.509 Certificate chain...`, 'info');

        // Wait for actual response
        const response = await fetchPromise;
        const data = await response.json();

        if (data.status === "Secure") {
            addLog(`Analysis complete. Connection is secure.`, 'success');
            addCertDetails(data);
        } else {
            addLog(`Analysis failed or connection insecure.`, 'error');
            addLog(`ERROR: ${data.error}`, 'error');
        }

    } catch (error) {
        addLog(`System Error: Could not connect to backend engine.`, 'error');
        addLog(error.message, 'error');
    }
}

// Allow pressing Enter to scan
domainInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        initiateScan();
    }
});

// Attach initiateScan to the analyze button
analyzeBtn.addEventListener('click', initiateScan);
