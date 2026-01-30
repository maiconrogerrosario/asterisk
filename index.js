// =========================
// IMPORTS
// =========================
const ari = require('ari-client');
const WebSocket = require('ws');
const dgram = require('dgram');
const winston = require('winston');
const async = require('async');
require('dotenv').config();

// =========================
// CONFIG
// =========================
const ARI_URL = 'http://127.0.0.1:8088';
const ARI_USER = 'asterisk';
const ARI_PASS = 'asterisk';
const ARI_APP  = 'stasis_app';

const RTP_PORT = 12000;
const WS_AUDIO_PORT = 9001;
const RTP_QUEUE_CONCURRENCY = 50;

// =========================
// LOGGER
// =========================
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) =>
      `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()]
});

// =========================
// STATE
// =========================
const sipMap = new Map();   // channelId -> { bridge, rtpSource, streamHandler }
const extMap = new Map();   // extChannelId -> { bridgeId, channelId }

const rtpSender   = dgram.createSocket('udp4');
const rtpReceiver = dgram.createSocket('udp4');

let ariClient;

// =========================
// μ-law utils
// =========================
function muLawToPcm16(muLaw) {
  muLaw = ~muLaw & 0xff;
  const sign = muLaw & 0x80 ? -1 : 1;
  const exponent = (muLaw >> 4) & 0x07;
  const mantissa = muLaw & 0x0f;
  let sample =
    exponent === 0
      ? (mantissa << 3) + 16
      : ((mantissa + 16) << (exponent + 3)) - 128;
  return Math.max(-32768, Math.min(32767, sign * sample));
}

function muLawToPcm24kHz(muLawBuffer) {
  const pcm8 = Buffer.alloc(muLawBuffer.length * 2);
  for (let i = 0; i < muLawBuffer.length; i++) {
    pcm8.writeInt16LE(muLawToPcm16(muLawBuffer[i]), i * 2);
  }

  const pcm24 = Buffer.alloc(muLawBuffer.length * 3 * 2);
  for (let i = 0; i < muLawBuffer.length; i++) {
    const s = pcm8.readInt16LE(i * 2);
    pcm24.writeInt16LE(s, (i * 3) * 2);
    pcm24.writeInt16LE(s, (i * 3 + 1) * 2);
    pcm24.writeInt16LE(s, (i * 3 + 2) * 2);
  }
  return pcm24;
}

// =========================
// RTP RECEIVER
// =========================
function startRTPReceiver() {
  rtpReceiver.on('message', (msg, rinfo) => {
    const channelId = [...sipMap.entries()].find(
      ([_, d]) =>
        d.rtpSource &&
        d.rtpSource.address === rinfo.address &&
        d.rtpSource.port === rinfo.port
    )?.[0];

    if (!channelId) return;

    const muLaw = msg.slice(12);
    const pcm24 = muLawToPcm24kHz(muLaw);

    const data = sipMap.get(channelId);
    if (data.ws && data.ws.readyState === WebSocket.OPEN) {
      data.ws.send(pcm24);
    }
  });

  rtpReceiver.bind(RTP_PORT, '127.0.0.1', () => {
    logger.info(`🎧 RTP listening on 127.0.0.1:${RTP_PORT}`);
  });
}

// =========================
// RTP SENDER
// =========================
function pcm16ToMuLaw(sample) {
  const MU = 255;
  const MAX = 32767;
  sample = Math.max(-MAX, Math.min(MAX, sample));
  const sign = sample < 0 ? 0x80 : 0;
  sample = Math.abs(sample) + 33;
  const log = Math.log(1 + MU * sample / MAX) / Math.log(1 + MU);
  const quant = Math.floor(log * 128);
  const exp = (quant >> 4) & 7;
  const mant = quant & 0xf;
  return ~(sign | (exp << 4) | mant) & 0xff;
}

function pcm24kToMuLaw(pcm) {
  const out = Buffer.alloc(pcm.length / 6);
  let o = 0;
  for (let i = 0; i < pcm.length; i += 6) {
    out[o++] = pcm16ToMuLaw(pcm.readInt16LE(i));
  }
  return out;
}

function buildRTP(seq, ts, ssrc, payload) {
  const h = Buffer.alloc(12);
  h[0] = 0x80;
  h[1] = 0x00;
  h.writeUInt16BE(seq, 2);
  h.writeUInt32BE(ts, 4);
  h.writeUInt32BE(ssrc, 8);
  return Buffer.concat([h, payload]);
}

const rtpQueue = async.queue((task, cb) => {
  rtpSender.send(task.pkt, task.port, task.addr, cb);
}, RTP_QUEUE_CONCURRENCY);

async function streamAudio(channelId, rtpSource) {
  let seq = Math.floor(Math.random() * 65535);
  let ts = 0;
  const ssrc = Math.floor(Math.random() * 0xffffffff);
  let buffer = Buffer.alloc(0);

  const write = async (pcm24) => {
    buffer = Buffer.concat([buffer, pcm24kToMuLaw(pcm24)]);
    while (buffer.length >= 80) {
      const payload = buffer.slice(0, 80);
      buffer = buffer.slice(80);
      const pkt = buildRTP(seq++, ts, ssrc, payload);
      ts += 80;
      rtpQueue.push({ pkt, addr: rtpSource.address, port: rtpSource.port });
    }
  };

  const stop = async () => {
    buffer = Buffer.alloc(0);
  };

  return { write, stop };
}

// =========================
// WEBSOCKET AUDIO
// =========================
const wss = new WebSocket.Server({ port: WS_AUDIO_PORT });
logger.info(`🌐 WS audio on ws://0.0.0.0:${WS_AUDIO_PORT}`);

wss.on('connection', (ws) => {
  logger.info('🔌 WS client connected');

  // associa WS ao primeiro canal SIP ativo (MVP)
  const channelId = [...sipMap.keys()][0];
  if (channelId) sipMap.get(channelId).ws = ws;

  ws.on('message', async (data) => {
    if (!channelId) return;
    const d = sipMap.get(channelId);
    if (d?.streamHandler) await d.streamHandler.write(data);
  });

  ws.on('close', () => logger.info('❌ WS client disconnected'));
});

// =========================
// ARI
// =========================
(async () => {
  ariClient = await ari.connect(ARI_URL, ARI_USER, ARI_PASS);
  await ariClient.start(ARI_APP);
  logger.info('✅ ARI connected');

  startRTPReceiver();

  ariClient.on('StasisStart', async (_, channel) => {
    if (channel.name.startsWith('UnicastRTP')) {
      const map = extMap.get(channel.id);
      if (!map) return;
      await ariClient.bridges.addChannel({
        bridgeId: map.bridgeId,
        channel: channel.id
      });
      rtpReceiver.once('message', (_, rinfo) => {
        sipMap.get(map.channelId).rtpSource = rinfo;
        logger.info(`📌 RTP source ${rinfo.address}:${rinfo.port}`);
      });
      return;
    }

    const bridge = await ariClient.bridges.create({ type: 'mixing' });
    await bridge.addChannel({ channel: channel.id });
    await channel.answer();

    const ext = await ariClient.channels.externalMedia({
      app: ARI_APP,
      external_host: `127.0.0.1:${RTP_PORT}`,
      format: 'ulaw',
      encapsulation: 'rtp',
      transport: 'udp',
      direction: 'both'
    });

    extMap.set(ext.id, { bridgeId: bridge.id, channelId: channel.id });
    sipMap.set(channel.id, { bridge, rtpSource: null, streamHandler: null, ws: null });

    sipMap.get(channel.id).streamHandler =
      await streamAudio(channel.id, { address: '0.0.0.0', port: 0 });
  });

  ariClient.on('StasisEnd', async (_, channel) => {
    const d = sipMap.get(channel.id);
    if (!d) return;
    if (d.streamHandler) await d.streamHandler.stop();
    await d.bridge.destroy();
    sipMap.delete(channel.id);
    logger.info(`📴 Channel ${channel.id} ended`);
  });
})();
