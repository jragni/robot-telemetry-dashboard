import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { offerResponseSchema } from '../signaling';

type OfferResponse = z.infer<typeof offerResponseSchema>;

describe('offerResponseSchema SDP type validation', () => {
  const validSdpTypes = ['offer', 'answer', 'pranswer', 'rollback'] as const;

  it.each(validSdpTypes)('accepts valid SDP type "%s"', (sdpType) => {
    const result = offerResponseSchema.safeParse({ sdp: 'v=0\r\n', type: sdpType });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe(sdpType);
    }
  });

  it('rejects an invalid SDP type string', () => {
    const result = offerResponseSchema.safeParse({ sdp: 'v=0\r\n', type: 'invalid' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing type field', () => {
    const result = offerResponseSchema.safeParse({ sdp: 'v=0\r\n' });

    expect(result.success).toBe(false);
  });

  it('schema output type is assignable to RTCSdpType', () => {
    // Compile-time check: OfferResponse.type must be assignable to RTCSdpType.
    // If the z.enum values drift from RTCSdpType, this will cause a TypeScript error.
    const parsed: OfferResponse = { sdp: '', type: 'offer' };
    const sdpType: RTCSdpType = parsed.type;

    expect(sdpType).toBe('offer');
  });
});
