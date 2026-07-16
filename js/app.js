// Core Engine coordinator, state buffers, and streaming interface pipeline
import { requireAuth } from './auth.js';
import { runAIPipeline } from './analysis.js';
import { computeMultiForecast } from './forecast.js';
import { evaluateSignals } from './signal.js';
import { HistoryManager } from './history.js';
import { SignalChart } from './chart.js';
import * as ui from './ui.js';

// Route guards checks session before dashboard boots
requireAuth();

class CoreEngine {
    constructor() {
        this.history = new HistoryManager();
        this.chart = new SignalChart('chartView');
        this.currentAsset = 'BTCUSDT';
        this.candles = [];
        this.ws = null;
        this.simInterval = null;
        this.activeSignal = null;
        this.lastCheckedMinute = null;

        this.initEventListeners();
        this.loadAssetStream(this.currentAsset);
        ui.renderHistory(this.history.records);
    }

    initEventListeners() {
        document.getElementById('assetSelect').addEventListener('change', (e) => {
            this.loadAssetStream(e.target.value);
        });
    }

    loadAssetStream(asset) {
        this.currentAsset = asset;
        this.candles = [];
        this.activeSignal = null;
        
        // Terminate any existing connections
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.simInterval) {
            clearInterval(this.simInterval);
            this.simInterval = null;
        }

        const statusEl = document.getElementById('connectionStatus');
        statusEl.textContent = 'Acquiring Feed...';
        statusEl.parentElement.querySelector('.status-indicator').className = 'status-indicator connecting';

        // Connects dynamically to live cryptos or simulates OTC market feeds
        if (asset === 'BTCUSDT' || asset === 'ETHUSDT') {
            this.connectBinance(asset);
        } else {
            this.startSimulation(asset);
        }
    }

    // Connects to Binance public real-time WebSockets directly [3]
    connectBinance(symbol) {
        const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            const statusEl = document.getElementById('connectionStatus');
            statusEl.textContent = 'Active Realtime Feed';
            statusEl.parentElement.querySelector('.status-indicator').className = 'status-indicator online';
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const k = data.k;
            const candle = {
                time: k.t / 1000,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
                isClosed: k.x
            };

            this.handleTick(candle);
        };
    }

    // High fidelity synthetic OTC market simulator (generates real indicators patterns)
    startSimulation(asset) {
        const statusEl = document.getElementById('connectionStatus');
        statusEl.textContent = 'Active Simulated Feed';
        statusEl.parentElement.querySelector('.status-indicator').className = 'status-indicator online';

        let basePrice = asset === 'EURUSD' ? 1.08500 : 1.26400;
        let currentTime = Math.floor(Date.now() / 1000) - 300 * 60; // Start historical padding

        // Generate baseline historical records
        for (let i = 0; i < 150; i++) {
            const change = (Math.random() - 0.495) * (basePrice * 0.0003); // Slight upward trend model bias
            const open = basePrice;
            const close = basePrice + change;
            const high = Math.max(open, close) + (Math.random() * basePrice * 0.0002);
            const low = Math.min(open, close) - (Math.random() * basePrice * 0.0002);

            this.candles.push({ time: currentTime, open, high, low, close });
            basePrice = close;
            currentTime += 60;
        }
        this.chart.updateData(this.candles);

        // Run interval ticker transitions simulating 1m candle formation
        let activeCandle = { 
            time: Math.floor(Date.now() / 1000), 
            open: basePrice, 
            high: basePrice, 
            low: basePrice, 
            close: basePrice 
        };

        this.simInterval = setInterval(() => {
            const nowSec = Math.floor(Date.now() / 1000);
            const roundTime = nowSec - (nowSec % 60);

            if (roundTime > activeCandle.time) {
                // Finalize candle state and append
                this.candles.push({ ...activeCandle, isClosed: true });
                if (this.candles.length > 500) this.candles.shift();
                
                this.handleTick({ ...activeCandle, isClosed: true });

                // Construct next active index
                activeCandle = {
                    time: roundTime,
                    open: activeCandle.close,
                    high: activeCandle.close,
                    low: activeCandle.close,
                    close: activeCandle.close
                };
            } else {
                const tickChange = (Math.random() - 0.5) * (activeCandle.close * 0.0001);
                activeCandle.close += tickChange;
                activeCandle.high = Math.max(activeCandle.high, activeCandle.close);
                activeCandle.low = Math.min(activeCandle.low, activeCandle.close);
                
                this.handleTick({ ...activeCandle, isClosed: false });
            }
        }, 1000); // 1-second ticks
    }

    handleTick(candle) {
        // Handle loading transition states
        if (this.candles.length === 0 && !candle.isClosed) {
            // Buffer historical data queries if WebSocket was initialized bare
            this.fetchHistoricalData(this.currentAsset).then(() => {
                this.candles.push(candle);
                this.processUpdates(candle);
            });
            return;
        }

        const last = this.candles[this.candles.length - 1];
        if (last && last.time === candle.time) {
            this.candles[this.candles.length - 1] = candle;
        } else {
            this.candles.push(candle);
            if (this.candles.length > 500) this.candles.shift();
        }

        this.processUpdates(candle);
    }

    async fetchHistoricalData(symbol) {
        try {
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
            const data = await res.json();
            this.candles = data.map(k => ({
                time: k[0] / 1000,
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5]),
                isClosed: true
            }));
            this.chart.updateData(this.candles);
        } catch (err) {
            console.error("Historical load fail. Constructing baseline local data fallback series.", err);
        }
    }

    processUpdates(currentCandle) {
        this.chart.updateTick(currentCandle);
        document.getElementById('assetPriceBadge').textContent = `$ ${currentCandle.close.toFixed(this.currentAsset.includes('USD') && !this.currentAsset.includes('USDT') ? 5 : 2)}`;

        // Process analytical pipelines
        const analysis = runAIPipeline(this.candles);
        const forecasts = computeMultiForecast(analysis, currentCandle.close);
        
        // Evaluate possible signals triggers
        const triggered = evaluateSignals(analysis, currentCandle.close);
        if (triggered && !this.activeSignal) {
            this.activeSignal = triggered;
            
            // Add to session verification record stack
            this.history.addRecord({
                asset: this.currentAsset,
                time: triggered.timestamp,
                direction: triggered.direction,
                entryPrice: currentCandle.close,
                closePrice: null,
                outcome: 'PENDING'
            });
            ui.renderHistory(this.history.records);
        }

        // On finished intervals check previous trade outcome records
        if (currentCandle.isClosed) {
            const currentMinute = Math.floor(currentCandle.time / 60);
            if (currentMinute !== this.lastCheckedMinute) {
                this.lastCheckedMinute = currentMinute;
                const updated = this.history.verifyPending(currentCandle.close);
                if (updated) {
                    ui.renderHistory(this.history.records);
                    this.activeSignal = null; // Flush single active signal scope
                }
            }
        }

        // Redraw rendering components
        ui.updateMetrics(analysis, this.activeSignal, this.history);
        ui.renderForecast(forecasts);
    }
}

// Initialise core app execution thread
document.addEventListener('DOMContentLoaded', () => {
    new CoreEngine();
});
