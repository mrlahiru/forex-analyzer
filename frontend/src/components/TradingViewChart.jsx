import React, { useEffect, useRef, useState } from 'react';
import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts';
import {
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const TradingViewChart = ({
  candles = [],
  pair = 'EUR/USD',
  timeframe = '1h',
  levels = {},
  indicators = {},
  height = 480,
}) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const ema200SeriesRef = useRef(null);
  const priceLinesRef = useRef([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showLevels, setShowLevels] = useState(true);
  const [hoverData, setHoverData] = useState(null);

  const isJPY = pair?.includes('JPY');
  const priceDecimals = isJPY ? 2 : 5;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create TradingView Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 80 : height,
      layout: {
        background: { type: 'solid', color: '#080B11' },
        textColor: '#94A3B8',
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#111726' },
        horzLines: { color: '#111726' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38BDF8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0F172A',
        },
        horzLine: {
          color: '#38BDF8',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0F172A',
        },
      },
      timeScale: {
        borderColor: '#1E293B',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1E293B',
        autoScale: true,
        scaleMargins: {
          top: 0.12,
          bottom: 0.18,
        },
      },
    });

    chartInstanceRef.current = chart;

    // 1. Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderUpColor: '#10B981',
      borderDownColor: '#F43F5E',
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: isJPY ? 0.01 : 0.00001,
      },
    });
    candleSeriesRef.current = candleSeries;

    // 2. Add Volume Series (subtle bottom histogram)
    const volumeSeries = chart.addHistogramSeries({
      color: '#334155',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // 3. Add EMA Overlays
    const ema20Series = chart.addLineSeries({
      color: '#06B6D4', // Cyan
      lineWidth: 2,
      title: 'EMA 20',
      priceLineVisible: false,
    });
    ema20SeriesRef.current = ema20Series;

    const ema50Series = chart.addLineSeries({
      color: '#3B82F6', // Blue
      lineWidth: 2,
      title: 'EMA 50',
      priceLineVisible: false,
    });
    ema50SeriesRef.current = ema50Series;

    const ema200Series = chart.addLineSeries({
      color: '#A855F7', // Purple
      lineWidth: 2,
      title: 'EMA 200',
      priceLineVisible: false,
    });
    ema200SeriesRef.current = ema200Series;

    // Subscribe to crosshair move for real-time legend inspect
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        setHoverData(null);
      } else {
        const candle = param.seriesData.get(candleSeries);
        const volume = param.seriesData.get(volumeSeries);
        const ema20 = param.seriesData.get(ema20Series);
        const ema50 = param.seriesData.get(ema50Series);
        const ema200 = param.seriesData.get(ema200Series);

        if (candle) {
          setHoverData({
            time: param.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: volume?.value || 0,
            ema20: ema20?.value,
            ema50: ema50?.value,
            ema200: ema200?.value,
          });
        }
      }
    });

    // Handle responsive resize
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 80 : height,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [isFullscreen, height, isJPY, priceDecimals]);

  // Update Candles and Volume Data
  useEffect(() => {
    if (!candleSeriesRef.current || !candles || candles.length === 0) return;

    // Sort ascending by UNIX time & eliminate duplicates
    const formattedCandles = [];
    const formattedVolumes = [];
    const seenTimes = new Set();

    const sorted = [...candles].sort((a, b) => (a.time || 0) - (b.time || 0));

    for (const c of sorted) {
      const timeVal = c.time || Math.floor(new Date(c.timestamp).getTime() / 1000);
      if (!seenTimes.has(timeVal)) {
        seenTimes.add(timeVal);

        formattedCandles.push({
          time: timeVal,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        });

        formattedVolumes.push({
          time: timeVal,
          value: c.volume || 100,
          color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
        });
      }
    }

    candleSeriesRef.current.setData(formattedCandles);
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(formattedVolumes);
    }

    // Compute and set EMA series
    const computeEMAData = (period) => {
      const result = [];
      const k = 2 / (period + 1);
      let ema = null;

      for (let i = 0; i < formattedCandles.length; i++) {
        const c = formattedCandles[i];
        if (i < period - 1) continue;
        if (ema === null) {
          let sum = 0;
          for (let j = i - period + 1; j <= i; j++) {
            sum += formattedCandles[j].close;
          }
          ema = sum / period;
        } else {
          ema = (c.close - ema) * k + ema;
        }

        result.push({
          time: c.time,
          value: parseFloat(ema.toFixed(priceDecimals)),
        });
      }
      return result;
    };

    if (ema20SeriesRef.current && showEMA20) {
      ema20SeriesRef.current.setData(computeEMAData(20));
    }
    if (ema50SeriesRef.current && showEMA50) {
      ema50SeriesRef.current.setData(computeEMAData(50));
    }
    if (ema200SeriesRef.current && showEMA200) {
      ema200SeriesRef.current.setData(computeEMAData(Math.min(200, formattedCandles.length > 30 ? Math.floor(formattedCandles.length * 0.8) : 50)));
    }

    // Set chart viewport to fit all bars
    chartInstanceRef.current?.timeScale().fitContent();
  }, [candles, showEMA20, showEMA50, showEMA200, priceDecimals]);

  // Update Horizontal Price Lines (Entry, TP1, TP2, TP3, SL, S/R)
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    // Remove existing price lines
    priceLinesRef.current.forEach((line) => {
      try {
        candleSeriesRef.current.removePriceLine(line);
      } catch (err) {
        // ignore
      }
    });
    priceLinesRef.current = [];

    if (!showLevels || !levels) return;

    const createLevel = (price, title, color, style = LineStyle.Dashed, width = 2) => {
      if (!price || isNaN(price)) return;
      try {
        const line = candleSeriesRef.current.createPriceLine({
          price: parseFloat(price),
          color,
          lineWidth: width,
          lineStyle: style,
          axisLabelVisible: true,
          title: `${title}: ${parseFloat(price).toFixed(priceDecimals)}`,
        });
        priceLinesRef.current.push(line);
      } catch (e) {
        // ignore
      }
    };

    // TP3 (Cyan)
    if (levels.tp3) createLevel(levels.tp3, 'TP3 (1:3)', '#06B6D4', LineStyle.Dashed, 2);
    // TP2 (Teal)
    if (levels.tp2) createLevel(levels.tp2, 'TP2 (1:2)', '#14B8A6', LineStyle.Dashed, 2);
    // TP1 (Emerald)
    if (levels.tp1) createLevel(levels.tp1, 'TP1 (1:1)', '#10B981', LineStyle.Dashed, 2);
    // ENTRY (Blue Solid)
    if (levels.entry) createLevel(levels.entry, 'ENTRY', '#3B82F6', LineStyle.Solid, 2);
    // STOP LOSS (Rose)
    if (levels.stopLoss || levels.sl) createLevel(levels.stopLoss || levels.sl, 'SL', '#F43F5E', LineStyle.Dashed, 2);

    // Support & Resistance Dotted Levels
    if (levels.nearestResistance) createLevel(levels.nearestResistance, 'RESISTANCE', '#F43F5E', LineStyle.Dotted, 1);
    if (levels.nearestSupport) createLevel(levels.nearestSupport, 'SUPPORT', '#10B981', LineStyle.Dotted, 1);
  }, [levels, showLevels, priceDecimals]);

  const latestCandle = candles[candles.length - 1];
  const display = hoverData || latestCandle || {};
  const isBullishCandle = display.close >= display.open;

  return (
    <div
      className={`relative rounded-2xl bg-[#080B11] border border-slate-800/90 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 bg-[#080B11]' : ''
      }`}
    >
      {/* Top Chart Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-[#0B0F19] gap-3">
        {/* Pair & Timeframe Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold font-mono tracking-tight text-white">
              {pair}
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {timeframe}
            </span>
          </div>

          {/* Real-time OHLCV Bar Readout */}
          <div className="hidden md:flex items-center space-x-3 text-xs font-mono text-slate-400 pl-3 border-l border-slate-800">
            <span>O: <b className="text-slate-200">{display.open?.toFixed(priceDecimals) || '—'}</b></span>
            <span>H: <b className="text-emerald-400">{display.high?.toFixed(priceDecimals) || '—'}</b></span>
            <span>L: <b className="text-rose-400">{display.low?.toFixed(priceDecimals) || '—'}</b></span>
            <span>C: <b className={isBullishCandle ? 'text-emerald-400' : 'text-rose-400'}>{display.close?.toFixed(priceDecimals) || '—'}</b></span>
            <span>Vol: <b className="text-slate-300">{display.volume?.toLocaleString() || '—'}</b></span>
          </div>
        </div>

        {/* Chart Overlays Controls */}
        <div className="flex items-center space-x-2">
          {/* EMA 20 Toggle */}
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition ${
              showEMA20
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle 20-period Exponential Moving Average"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>EMA 20</span>
          </button>

          {/* EMA 50 Toggle */}
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition ${
              showEMA50
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle 50-period Exponential Moving Average"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>EMA 50</span>
          </button>

          {/* EMA 200 Toggle */}
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition ${
              showEMA200
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle 200-period Exponential Moving Average"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>EMA 200</span>
          </button>

          {/* TP/SL Levels Overlay Toggle */}
          <button
            onClick={() => setShowLevels(!showLevels)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition ${
              showLevels
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle Entry, TP1, TP2, TP3 & Stop Loss horizontal rays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Levels</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div
        ref={chartContainerRef}
        className="w-full flex-1 min-h-[400px] relative"
      />

      {/* Bottom Chart Footer Legend */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0B0F19]/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-500"></span>
            <span>Entry Line</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-500"></span>
            <span>TP1 (1:1)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-teal-500"></span>
            <span>TP2 (1:2)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-cyan-500"></span>
            <span>TP3 (1:3)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-500"></span>
            <span>Stop Loss</span>
          </div>
        </div>

        <div className="text-slate-500">
          TradingView Lightweight Charts Engine &bull; Scroll to Zoom &bull; Drag to Pan
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;
