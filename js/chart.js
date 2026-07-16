// High performance TradingView Lightweight Charts execution module [3]
export class SignalChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = LightweightCharts.createChart(this.container, {
            layout: {
                backgroundColor: '#0f1524',
                textColor: '#9ca3af',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.02)' },
                horzLines: { color: 'rgba(255,255,255,0.02)' }
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.08)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.08)',
                timeVisible: true,
                secondsVisible: false
            }
        });

        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#f43f5e',
            borderUpColor: '#10b981',
            borderDownColor: '#f43f5e',
            wickUpColor: '#10b981',
            wickDownColor: '#f43f5e'
        });

        this.resizeChart();
        window.addEventListener('resize', () => this.resizeChart());
    }

    resizeChart() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.chart.resize(width, height);
    }

    updateData(candles) {
        // Maps candle inputs to standard chart formats
        const formatted = candles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
        }));
        this.candleSeries.setData(formatted);
    }

    updateTick(candle) {
        this.candleSeries.update({
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
        });
    }
}
