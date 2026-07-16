// DOM manipulation and premium theme UI coordinator
export function updateMetrics(analysis, activeSignal, historyManager) {
    // Dynamic Active Signal Card Updating
    const dirPanel = document.getElementById('signalDirPanel');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceText = document.getElementById('confidenceText');
    const entryRangeVal = document.getElementById('entryRangeVal');

    if (activeSignal) {
        dirPanel.className = `signal-direction-panel ${activeSignal.direction.toLowerCase()}`;
        dirPanel.querySelector('.dir-icon').textContent = activeSignal.direction === 'UP' ? '↗️' : '↘️';
        dirPanel.querySelector('.dir-text').textContent = activeSignal.direction === 'UP' ? 'CALL (UP)' : 'PUT (DOWN)';
        dirPanel.querySelector('.dir-meta').textContent = `Convergence limit reached: ${activeSignal.timestamp}`;

        confidenceBar.style.width = `${activeSignal.confidence}%`;
        confidenceBar.style.backgroundColor = activeSignal.direction === 'UP' ? '#10b981' : '#f43f5e';
        confidenceText.textContent = `${activeSignal.confidence}%`;
        entryRangeVal.textContent = activeSignal.entryRange;
    } else {
        dirPanel.className = 'signal-direction-panel';
        dirPanel.querySelector('.dir-icon').textContent = '⌛';
        dirPanel.querySelector('.dir-text').textContent = 'ANALYZING';
        dirPanel.querySelector('.dir-meta').textContent = 'Searching for predictive alignment...';
        
        confidenceBar.style.width = '0%';
        confidenceText.textContent = '0%';
        entryRangeVal.textContent = '--.--';
    }

    // Dynamic Header Stats Updates
    const stats = historyManager.getStats();
    document.getElementById('valWinRate').textContent = stats.total > 0 ? `${stats.winRate}%` : '--%';
    document.getElementById('valTotalSessions').textContent = stats.total;

    // Consensus Dial (SVG Gauge) Gauge updating
    const gaugeProgress = document.getElementById('gaugeProgress');
    const gaugePercent = document.getElementById('gaugePercent');
    const gaugeBias = document.getElementById('gaugeBias');

    if (analysis.status === 'READY') {
        const offset = 125.6 - (125.6 * analysis.confidence) / 100;
        gaugeProgress.style.strokeDashoffset = offset;
        gaugeProgress.style.stroke = analysis.direction === 'UP' ? '#10b981' : analysis.direction === 'DOWN' ? '#f43f5e' : '#3b82f6';
        gaugePercent.textContent = `${analysis.confidence}%`;
        gaugeBias.textContent = `${analysis.direction} CONSENSUS`;

        // Update indicators tag summary list
        document.getElementById('tagRsi').querySelector('.val').textContent = analysis.rsiVal;
        document.getElementById('tagMacd').querySelector('.val').textContent = analysis.macdVal;
        document.getElementById('tagBollinger').querySelector('.val').textContent = analysis.bbState;
        document.getElementById('tagPatterns').querySelector('.val').textContent = analysis.pattern;

        // Security Volatility Box Elements
        const vector = document.getElementById('trendVector');
        vector.textContent = analysis.trend;
        vector.className = `val badge ${analysis.trend === 'BULLISH' ? 'success' : 'danger'}`;

        document.getElementById('valAtr').textContent = analysis.atr.toFixed(5);
        document.getElementById('volEnvelope').textContent = analysis.volatility;
        
        const risk = document.getElementById('riskRating');
        risk.textContent = analysis.risk;
        risk.className = `val font-semibold ${analysis.risk === 'HIGH' ? 'danger' : analysis.risk === 'LOW' ? 'success' : 'warning'}`;
    }
}

// Renders the 6-Candle Probability table panel
export function renderForecast(list) {
    const container = document.getElementById('forecastList');
    container.innerHTML = '';

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'forecast-item';
        div.innerHTML = `
            <span class="forecast-index">${item.candleIndex} Forecast</span>
            <span class="forecast-bias ${item.direction.toLowerCase()} font-bold">${item.direction === 'UP' ? 'CALL ↗' : 'PUT ↘'}</span>
            <span class="forecast-probability font-mono">${item.probability}%</span>
        `;
        container.appendChild(div);
    });
}

// Redraws past historical performance inside table logs
export function renderHistory(records) {
    const body = document.getElementById('historyLogBody');
    if (records.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="empty-placeholder">Waiting for execution cycles...</td></tr>`;
        return;
    }

    body.innerHTML = '';
    records.forEach(r => {
        const tr = document.createElement('tr');
        const outcomeClass = r.outcome === 'WIN' ? 'success' : r.outcome === 'LOSS' ? 'danger' : 'text-muted';
        tr.innerHTML = `
            <td class="font-semibold">${r.asset}</td>
            <td class="font-mono text-xs">${r.time}</td>
            <td class="${r.direction === 'UP' ? 'success' : 'danger'} font-bold">${r.direction}</td>
            <td class="font-mono">${r.entryPrice.toFixed(2)}</td>
            <td class="font-mono">${r.closePrice ? r.closePrice.toFixed(2) : '--.--'}</td>
            <td><span class="badge ${outcomeClass}">${r.outcome}</span></td>
        `;
        body.appendChild(tr);
    });
}
