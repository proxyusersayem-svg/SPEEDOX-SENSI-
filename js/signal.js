// Emits signal ideas when high-confidence convergence triggers are reached
export function evaluateSignals(analysis, lastClose) {
    // Only trigger trade concepts above 75% confidence limit bounds
    if (analysis.status !== 'READY' || analysis.direction === 'NONE' || analysis.confidence < 75) {
        return null;
    }

    const direction = analysis.direction;
    const multiplier = lastClose > 1000 ? 5 : 0.0001; // Scaled buffers
    
    // Set Entry ranges
    const entryMin = lastClose - (multiplier * 0.5);
    const entryMax = lastClose + (multiplier * 0.5);

    return {
        direction,
        confidence: analysis.confidence,
        entryRange: `${entryMin.toFixed(2)} - ${entryMax.toFixed(2)}`,
        rawEntry: lastClose,
        timestamp: new Date().toLocaleTimeString()
    };
}
