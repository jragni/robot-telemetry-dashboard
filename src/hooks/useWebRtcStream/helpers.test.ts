import { describe, expect, it } from 'vitest';

import { applyBandwidthConstraint } from './helpers';

describe('applyBandwidthConstraint', () => {
  const baseSdp =
    [
      'v=0',
      'o=- 123 2 IN IP4 127.0.0.1',
      's=-',
      'm=video 9 UDP/TLS/RTP/SAVPF 96',
      'a=rtpmap:96 VP8/90000',
    ].join('\r\n') + '\r\n';

  it('inserts b=AS line after m=video', () => {
    const result = applyBandwidthConstraint(baseSdp, 1500);

    expect(result).toContain('m=video 9 UDP/TLS/RTP/SAVPF 96\r\nb=AS:1500\r\n');
  });

  it('returns SDP unchanged when no m=video line is present', () => {
    const audioOnly = 'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n';

    const result = applyBandwidthConstraint(audioOnly, 1500);

    expect(result).toBe(audioOnly);
  });

  it('uses correct kbps value from MAX_VIDEO_BITRATE conversion', () => {
    const maxBitrateBps = 1_500_000;
    const expectedKbps = Math.round(maxBitrateBps / 1000);

    const result = applyBandwidthConstraint(baseSdp, expectedKbps);

    expect(result).toContain('b=AS:1500\r\n');
  });

  it('handles LF-only line endings (no \\r)', () => {
    const lfSdp =
      ['v=0', 'm=video 9 UDP/TLS/RTP/SAVPF 96', 'a=rtpmap:96 VP8/90000'].join('\n') + '\n';

    const result = applyBandwidthConstraint(lfSdp, 2000);

    expect(result).toContain('m=video 9 UDP/TLS/RTP/SAVPF 96\r\nb=AS:2000\r\n');
  });
});
