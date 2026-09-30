import axios from 'axios';
import { config } from '../../config/index.js';
import { marketScanner } from '../signals/marketScanner.js';

/**
 * Institutional Telegram Alert Service (Phase 9)
 * - Real-time Telegram Bot notifications for deterministic signals and TP/SL lifecycle events
 * - Formatted HTML templates with emojis, risk metrics, and trade management mandates
 * - Queueing, cooldown deduplication, and non-fatal fallback logging
 * - Real-time subscription to Phase 8 marketScanner.onEvent()
 */
class TelegramService {
  constructor() {
    this.botToken = config.telegram.botToken;
    this.chatId = config.telegram.chatId;
    this.apiUrl = this.botToken ? `https://api.telegram.org/bot${this.botToken}/sendMessage` : null;

    // Alert preferences
    this.preferences = {
      enabled: true,
      notifyNewSignals: true,
      notifyTp1: true,
      notifyTp2: true,
      notifyTp3: true,
      notifyStopLoss: true,
    };

    // Cooldown store to prevent duplicate alerts (key -> timestamp)
    this.cooldowns = new Map();
    this.cooldownMs = 60 * 1000; // 60-second cooldown per pair+event

    // In-memory alert dispatch history (retains latest 50 alerts)
    this.dispatchedHistory = [];

    // Automatically bind to Phase 8 scanner lifecycle events
    this.bindToScanner();
  }

  /**
   * Bind to Phase 8 Market Scanner lifecycle events
   */
  bindToScanner() {
    marketScanner.onEvent(async (event, signal) => {
      try {
        await this.handleScannerEvent(event, signal);
      } catch (err) {
        console.error('[Telegram] Error dispatching scanner event alert:', err.message);
      }
    });
    console.log('[Telegram] Successfully subscribed to MarketScanner lifecycle events.');
  }

  /**
   * Handle incoming event from market scanner
   */
  async handleScannerEvent(event, signal) {
    if (!this.preferences.enabled) return;

    const { eventType, pair } = event;
    const cooldownKey = `${pair}_${eventType}`;
    const now = Date.now();

    // Check cooldown to prevent duplicate alert spam
    if (this.cooldowns.has(cooldownKey) && now - this.cooldowns.get(cooldownKey) < this.cooldownMs) {
      return;
    }
    this.cooldowns.set(cooldownKey, now);

    let messageHtml = '';

    switch (eventType) {
      case 'CREATED':
        if (!this.preferences.notifyNewSignals) return;
        messageHtml = this.formatNewSignalMessage(signal, event.price);
        break;

      case 'TP1_HIT':
        if (!this.preferences.notifyTp1) return;
        messageHtml = this.formatTpHitMessage(signal, event.price, 1);
        break;

      case 'TP2_HIT':
        if (!this.preferences.notifyTp2) return;
        messageHtml = this.formatTpHitMessage(signal, event.price, 2);
        break;

      case 'TP3_HIT':
        if (!this.preferences.notifyTp3) return;
        messageHtml = this.formatTpHitMessage(signal, event.price, 3);
        break;

      case 'SL_HIT':
        if (!this.preferences.notifyStopLoss) return;
        messageHtml = this.formatStopLossMessage(signal, event.price);
        break;

      default:
        return;
    }

    if (messageHtml) {
      await this.sendAlert(messageHtml, { pair, eventType, price: event.price });
    }
  }

  /**
   * Send alert via Telegram Bot API or fallback log
   */
  async sendAlert(htmlMessage, metadata = {}) {
    const isConfigured = Boolean(
      this.botToken &&
      this.chatId &&
      !this.botToken.includes('your_') &&
      !this.chatId.includes('your_')
    );

    const alertRecord = {
      id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      delivered: false,
      channel: isConfigured ? 'Telegram Live' : 'Simulated Console Log',
      metadata,
      preview: htmlMessage.replace(/<[^>]+>/g, '').substring(0, 160) + '...',
      html: htmlMessage,
    };

    if (isConfigured) {
      try {
        const response = await axios.post(
          `https://api.telegram.org/bot${this.botToken}/sendMessage`,
          {
            chat_id: this.chatId,
            text: htmlMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          },
          { timeout: 8000 }
        );

        if (response.data?.ok) {
          alertRecord.delivered = true;
          console.log(`[Telegram Bot] Alert sent successfully to chat ${this.chatId}: ${metadata.pair} [${metadata.eventType}]`);
        }
      } catch (err) {
        alertRecord.error = err.response?.data?.description || err.message;
        console.warn(`[Telegram Bot] API send failed (${alertRecord.error}). Logged in-memory.`);
      }
    } else {
      // Offline / Simulation fallback mode
      alertRecord.delivered = true;
      console.log(`[Telegram Simulation] Alert generated for ${metadata.pair || 'Forex'}: [${metadata.eventType || 'TEST'}]`);
    }

    this.dispatchedHistory.unshift(alertRecord);
    if (this.dispatchedHistory.length > 50) {
      this.dispatchedHistory.pop();
    }

    return alertRecord;
  }

  /**
   * Format New Signal Alert HTML Template
   */
  formatNewSignalMessage(signal, currentPrice) {
    const isBuy = signal.direction === 'BUY';
    const dirEmoji = isBuy ? '🟢' : '🔴';
    const cleanPair = signal.pair.replace('/', '');
    const isJPY = signal.pair.includes('JPY');
    const decimals = isJPY ? 2 : 5;

    const reasonsList = (signal.reasons || [])
      .slice(0, 4)
      .map((r) => `• <i>${r}</i>`)
      .join('\n');

    return `🚨 <b>FOREXAI ANALYZER — NEW SIGNAL</b> 🚨

📊 <b>Pair:</b> #${cleanPair} (${signal.timeframe || '1H'})
⚡ <b>Direction:</b> ${dirEmoji} <b>${signal.direction}</b>
🏆 <b>Setup Score:</b> <b>${signal.score}/100</b> (${signal.confidence} Confidence)
⚖️ <b>Consensus:</b> <code>${signal.timeframeConsensus || 'ALIGNED'}</code>

📌 <b>Entry Anchor:</b> <code>${parseFloat(signal.entry || currentPrice).toFixed(decimals)}</code>
🎯 <b>TP1 (1:1):</b> <code>${parseFloat(signal.tp1 || 0).toFixed(decimals)}</code>
🎯 <b>TP2 (1:2):</b> <code>${parseFloat(signal.tp2 || 0).toFixed(decimals)}</code>
🎯 <b>TP3 (1:3):</b> <code>${parseFloat(signal.tp3 || 0).toFixed(decimals)}</code>
🛑 <b>Stop Loss:</b> <code>${parseFloat(signal.stopLoss || 0).toFixed(decimals)}</code>
📐 <b>Risk/Reward:</b> 1:1.0 / 1:2.0 / 1:3.0

🔍 <b>Algorithmic Triggers:</b>
${reasonsList || '• Multi-timeframe trend and momentum confluence confirmed'}

⚠️ <i>Notice: Algorithmic analysis only. Not financial advice. Always risk &le; 1-2% capital per trade.</i>`;
  }

  /**
   * Format Take Profit Hit HTML Template
   */
  formatTpHitMessage(signal, currentPrice, tpNumber) {
    const isBuy = signal.direction === 'BUY';
    const cleanPair = signal.pair.replace('/', '');
    const isJPY = signal.pair.includes('JPY');
    const decimals = isJPY ? 2 : 5;

    let targetRatio = '1:1.0';
    let mandate = 'Lock in partial profit (+33%). Move Stop Loss to Entry price (Break-Even) to neutralize risk.';
    let header = '🎯 <b>TARGET 1 REACHED — TP1 HIT</b> 🎯';

    if (tpNumber === 2) {
      targetRatio = '1:2.0';
      mandate = 'Target 2 reached! Lock in secondary profits (+33%). Trail Stop Loss above TP1 level.';
      header = '🚀 <b>TARGET 2 REACHED — TP2 HIT</b> 🚀';
    } else if (tpNumber === 3) {
      targetRatio = '1:3.0';
      mandate = 'Full 1:3 structural runner potential completed! Close remaining runners or trail aggressively.';
      header = '🏆 <b>FULL TARGET ACHIEVED — TP3 HIT</b> 🏆';
    }

    return `${header}

📊 <b>Pair:</b> #${cleanPair} (${signal.timeframe || '1H'})
⚡ <b>Direction:</b> <b>${signal.direction}</b>
🏁 <b>Exit Price:</b> <code>${parseFloat(currentPrice).toFixed(decimals)}</code>
💰 <b>Reward Ratio:</b> <b>+${targetRatio} R:R</b>

🛡️ <b>Trade Management Mandate:</b>
${mandate}

📈 <i>ForexAI Analyzer Engine &bull; Continuous Lifecycle Monitor</i>`;
  }

  /**
   * Format Stop Loss Hit HTML Template
   */
  formatStopLossMessage(signal, currentPrice) {
    const cleanPair = signal.pair.replace('/', '');
    const isJPY = signal.pair.includes('JPY');
    const decimals = isJPY ? 2 : 5;

    return `🛑 <b>STOP LOSS TRIGGERED — CAPITAL PRESERVED</b> 🛑

📊 <b>Pair:</b> #${cleanPair} (${signal.timeframe || '1H'})
⚡ <b>Direction:</b> <b>${signal.direction}</b>
📍 <b>Exit Price:</b> <code>${parseFloat(currentPrice).toFixed(decimals)}</code>
🛡️ <b>Risk Status:</b> Capped at defined risk budget (&le; 1.0%)

💡 <b>Institutional Discipline:</b>
Losses are an inherent statistical component of trading probability. Risk was capped dynamically via structural ATR anchors. Prepare for next high-probability setup.`;
  }

  /**
   * Send Test Notification
   */
  async sendTestAlert() {
    const testHtml = `🤖 <b>FOREXAI ANALYZER — TELEGRAM ALERT TEST</b> 🤖

✅ <b>Bot Status:</b> Connected & Operational
📡 <b>Timestamp:</b> <code>${new Date().toISOString()}</code>
🌐 <b>Platform:</b> ForexAI Analyzer Engine v1.0
⚙️ <b>Notifications Active:</b> New Signals, TP1, TP2, TP3 & Stop Loss

<i>Your Telegram channel is successfully configured to receive real-time algorithmic trade alerts!</i>`;

    return this.sendAlert(testHtml, { pair: 'SYSTEM_TEST', eventType: 'TEST_ALERT', price: 1.0 });
  }

  /**
   * Get Telegram diagnostic status
   */
  getStatus() {
    const isConfigured = Boolean(
      this.botToken &&
      this.chatId &&
      !this.botToken.includes('your_') &&
      !this.chatId.includes('your_')
    );

    return {
      isConfigured,
      botTokenSet: Boolean(this.botToken),
      botTokenMasked: this.botToken ? `${this.botToken.substring(0, 5)}...${this.botToken.substring(this.botToken.length - 4)}` : null,
      chatIdSet: Boolean(this.chatId),
      chatId: this.chatId || null,
      preferences: this.preferences,
      totalDispatched: this.dispatchedHistory.length,
      recentAlerts: this.dispatchedHistory.slice(0, 15),
    };
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPrefs = {}) {
    this.preferences = {
      ...this.preferences,
      ...newPrefs,
    };
    return this.preferences;
  }
}

export const telegramService = new TelegramService();
export default telegramService;
