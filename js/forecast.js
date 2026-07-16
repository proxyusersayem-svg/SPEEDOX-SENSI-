// Probability Forecast Projection for upcoming intervals (next 5-6 candles)
export function computeMultiForecast(analysis, currentClose) {
    const list = [];
    const baseDirection = analysis.direction;
    const baseConfidence = analysis.confidence;
    const volatility = analysis.volatility;

    // Models continuous probability decay
    for (let step = 1; step <= 6; step++) {
        let prob = baseConfidence;
        let direction = baseDirection;

        if (direction === 'NONE') {
            prob = 50 + Math.round(Math.random() * 5);
            direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
        } else {
            // Decays prediction accuracy confidence over future steps
            prob = Math.max(51, Math.round(baseConfidence - (step * 4.5)));
            
            // Random fluctuation simulated due to noise
            prob += Math.floor(Math.sin(step) * 2);

            // Reversal condition on overextended predictions
            if (step >= 5 && baseConfidence > 80 && (analysis.rsiVal > 70 || analysis.rsiVal < 30)) {
                direction = baseDirection === 'UP' ? 'DOWN' : 'UP';
                prob = 52 + (100 - baseConfidence); // High probability of mean-reversion pullbacks
            }
        }

        list.push({
            candleIndex: `+${step}m`,
            direction,
            probability: prob
        });
    }
    return list;
}
