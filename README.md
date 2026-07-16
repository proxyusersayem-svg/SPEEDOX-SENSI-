# AI-Powered Premium Trading Signal Dashboard

A responsive, high-fidelity technical analysis & probability forecasting dashboard designed for short-term candle forecasting (compatible with Binary Options/Quotex style analysis).

## Features
- **Secure Mock Login**: Elegant, protected entry gateway.
- **Live TradingView Candlestick Charting**: Renders real-time data using TradingView's Lightweight Charts.
- **Dual Stream Feeds**: Real-time Binance WebSocket streaming for crypto (BTC, ETH) and a high-accuracy, trend-aligned simulator for currency pairs (EUR/USD, GBP/USD).
- **AI Indicator Pipeline**: Native JS calculations for EMA, RSI, MACD, Bollinger Bands, ATR, Support & Resistance, and Trend strength.
- **Multi-Step Forecast**: Projects future directional probabilities for the next 5–6 candles based on mathematical decay and mean-reversion.
- **Dynamic Signals**: Automatic win/loss calculation logged directly into your session history.

## Getting Started

Because this application uses clean **ES6 Javascript Modules**, it must be run from a local web server (to prevent browser CORS limitations with file paths).

### Quick Options to Run:
1. **VS Code**: Install the **Live Server** extension, right-click `index.html`, and select *Open with Live Server*.
2. **Python**: Run `python -m http.server 8000` in the directory, then visit `http://localhost:8000`.
3. **NodeJS**: Run `npx serve` or install `http-server` globally (`npm install -g http-server`) and run `http-server` inside the directory.

## Credentials
- **Username**: `admin`
- **Password**: `admin123`
