// Aggregates data and indicators to generate trading direction matrices
import { 
    calculateEMA, 
    calculateRSI, 
    calculateMACD, 
    calculateBollingerBands, 
    calculateATR, 
    detectSupportResistance,
    recognizePatterns 
} from './indicators.js';

export function runAIPipeline(candles) {
    if (candles.length < 30) {
        return {
            status: 'INITIALIZING',
            direction: 'NONE',
            confidence: 50,
            rsiVal: 50,
            macdVal: '0.00',
            bbState: 'CONSOLIDATION',
            pattern: 'None',
            trend: 'SIDEWAYS',
            atr: 0,
            volatility: 'LOW',
            risk: 'MEDIUM'
        };
    }

    // Compute indicators
    const emaShort = calculateEMA(candles, 9);
    const emaLong = calculateEMA(candles, 21);
    const rsi = calculateRSI(candles, 14);
    const macd = calculateMACD(candles, 12, 26, 9);
    const bb = calculateBollingerBands(candles, 20, 2);
    const atr = calculateATR(candles, 14);
    const sr = detectSupportResistance(candles, 15);
    const pattern = recognizePatterns(candles);

    const lastClose = candles[candles.length - 1].close;
    const lastRsi = rsi[rsi.length - 1];
    const lastMacdHist = macd.histogram[macd.histogram.length - 1];
    const lastBb = bb[bb.length - 1];
    const lastAtr = atr[atr.length - 1];

    let score = 0; // Negative = Bearish, Positive = Bullish

    // 1. Trend analysis (EMAs)
    const trend = emaShort[emaShort.length - 1] > emaLong[emaLong.length - 1] ? 'BULLISH' : 'BEARISH';
    score += trend === 'BULLISH' ? 2 : -2;

    // 2. Relative Strength Index (RSI)
    if (lastRsi > 70) score -= 2.5; // Overbought
    else if (lastRsi < 30) score += 2.5; // Oversold
    else if (lastRsi > 50) score += 1;
    else score -= 1;

    // 3. MACD Momentum
    if (lastMacdHist > 0) score += 1.5;
    else score -= 1.5;

    // 4. Bollinger Bands proximity
    const bbWidth = (lastBb.upper - lastBb.lower) / lastBb.middle;
    const volatility = bbWidth > 0.0015 ? 'HIGH' : bbWidth > 0.0006 ? 'NORMAL' : 'LOW';

    if (lastClose > lastBb.upper - (lastBb.upper - lastBb.middle) * 0.1) {
        score -= 2; // Approaching high channel bound
    } else if (lastClose < lastBb.lower + (lastBb.middle - lastBb.lower) * 0.1) {
        score += 2; // Approaching low channel bound
    }

    // 5. Pattern scoring modifiers
    if (pattern === 'Bullish Engulfing' || pattern === 'Hammer') score += 2;
    if (pattern === 'Bearish Engulfing') score -= 2;

    // Determine signal confidence & direction
    const rawBias = score;
    const absScore = Math.min(Math.abs(rawBias), 9);
    const confidence = Math.round(50 + (absScore / 9) * 45); // Limit base outputs between 50% and 95%
    const direction = rawBias > 0.5 ? 'UP' : rawBias < -0.5 ? 'DOWN' : 'NONE';

    // Risk profiling
    let risk = 'MEDIUM';
    if (volatility === 'HIGH' && lastRsi > 75) risk = 'HIGH';
    else if (volatility === 'LOW' && Math.abs(score) < 2) risk = 'LOW';

    return {
        status: 'READY',
        direction,
        confidence,
        rsiVal: Math.round(lastRsi),
        macdVal: lastMacdHist.toFixed(4),
        bbState: volatility === 'HIGH' ? 'EXPANDING' : 'STABLE',
        pattern,
        trend,
        atr: lastAtr,
        volatility,
        risk
    };
}
