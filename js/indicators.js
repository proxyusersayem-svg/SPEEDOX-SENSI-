// Technical Indicator Logic Modules

// Calculates Exponential Moving Average
export function calculateEMA(data, period) {
    if (data.length < period) return Array(data.length).fill(0);
    const ema = [];
    let sum = 0;
    
    for (let i = 0; i < period; i++) {
        sum += data[i].close;
    }
    let sma = sum / period;
    
    for (let i = 0; i < period - 1; i++) {
        ema.push(0);
    }
    ema.push(sma);
    
    const multiplier = 2 / (period + 1);
    for (let i = period; i < data.length; i++) {
        const val = (data[i].close - ema[i - 1]) * multiplier + ema[i - 1];
        ema.push(val);
    }
    return ema;
}

// Calculates Relative Strength Index (RSI)
export function calculateRSI(data, period = 14) {
    if (data.length < period + 1) return Array(data.length).fill(50);
    const rsi = Array(period).fill(50);
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
        const diff = data[i].close - data[i - 1].close;
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss))));
    
    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i].close - data[i - 1].close;
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        
        rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss))));
    }
    return rsi;
}

// Calculates Moving Average Convergence Divergence (MACD)
export function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
    const emaShort = calculateEMA(data, shortPeriod);
    const emaLong = calculateEMA(data, longPeriod);
    const macdLine = [];
    
    for (let i = 0; i < data.length; i++) {
        macdLine.push(emaShort[i] - emaLong[i]);
    }
    
    // Calculate signal line via EMA of macdLine
    const signalLine = [];
    if (macdLine.length < signalPeriod) {
        return { macd: macdLine, signal: Array(data.length).fill(0), histogram: macdLine };
    }
    
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) sum += macdLine[i];
    let sma = sum / signalPeriod;
    
    for (let i = 0; i < signalPeriod - 1; i++) signalLine.push(0);
    signalLine.push(sma);
    
    const multiplier = 2 / (signalPeriod + 1);
    for (let i = signalPeriod; i < macdLine.length; i++) {
        const val = (macdLine[i] - signalLine[i - 1]) * multiplier + signalLine[i - 1];
        signalLine.push(val);
    }
    
    const histogram = macdLine.map((val, idx) => val - signalLine[idx]);
    return { macd: macdLine, signal: signalLine, histogram };
}

// Calculates Bollinger Bands
export function calculateBollingerBands(data, period = 20, multiplier = 2) {
    const bands = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            bands.push({ upper: data[i].close, middle: data[i].close, lower: data[i].close });
            continue;
        }
        
        const slice = data.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, c) => acc + c.close, 0);
        const mean = sum / period;
        const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        bands.push({
            upper: mean + (multiplier * stdDev),
            middle: mean,
            lower: mean - (multiplier * stdDev)
        });
    }
    return bands;
}

// Calculates Average True Range (ATR)
export function calculateATR(data, period = 14) {
    if (data.length < 2) return Array(data.length).fill(0);
    const tr = [data[0].high - data[0].low];
    
    for (let i = 1; i < data.length; i++) {
        const c1 = data[i].high - data[i].low;
        const c2 = Math.abs(data[i].high - data[i - 1].close);
        const c3 = Math.abs(data[i].low - data[i - 1].close);
        tr.push(Math.max(c1, c2, c3));
    }
    
    const atr = Array(period - 1).fill(tr[0]);
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);
    
    for (let i = period; i < tr.length; i++) {
        const val = (atr[i - 1] * (period - 1) + tr[i]) / period;
        atr.push(val);
    }
    return atr;
}

// Detects Support & Resistance Levels
export function detectSupportResistance(data, period = 15) {
    if (data.length < period * 2) {
        return { support: data[0]?.low || 0, resistance: data[0]?.high || 0 };
    }
    
    let support = Infinity;
    let resistance = -Infinity;
    
    // Slice current scope to compute bounds
    const scope = data.slice(-period);
    scope.forEach(candle => {
        if (candle.low < support) support = candle.low;
        if (candle.high > resistance) resistance = candle.high;
    });
    
    return { support, resistance };
}

// Candlestick Pattern Recognition
export function recognizePatterns(data) {
    if (data.length < 3) return "None";
    
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    
    const lastBody = Math.abs(last.close - last.open);
    const lastRange = last.high - last.low;
    const isHammer = (lastBody / lastRange < 0.3) && (Math.min(last.open, last.close) - last.low > lastBody * 1.5) && (last.high - Math.max(last.open, last.close) < lastBody * 0.2);
    
    const isDoji = (lastBody / lastRange < 0.1);
    const isBullishEngulfing = (prev.close < prev.open) && (last.close > last.open) && (last.close >= prev.open) && (last.open <= prev.close);
    const isBearishEngulfing = (prev.close > prev.open) && (last.close < last.open) && (last.close <= prev.open) && (last.open >= prev.close);

    if (isDoji) return "Doji Reversal";
    if (isHammer) return "Hammer";
    if (isBullishEngulfing) return "Bullish Engulfing";
    if (isBearishEngulfing) return "Bearish Engulfing";
    
    return "Neutral Range";
}
