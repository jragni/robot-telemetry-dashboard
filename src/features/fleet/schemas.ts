import { z } from 'zod';
import { normalizeRosbridgeUrl } from './helpers';

/** addRobotSchema
 * @description Zod schema for the Add Robot form. Validates robot name length
 *  and URL format, including a refinement that checks normalizeRosbridgeUrl
 *  produces a valid WebSocket address.
 */
export const addRobotSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Robot name is required')
    .max(50, 'Robot name must be 50 characters or fewer'),
  url: z
    .string()
    .trim()
    .min(1, 'Rosbridge URL is required')
    .refine((val) => normalizeRosbridgeUrl(val) !== '', {
      message: 'Invalid URL — enter an IP, hostname, or WebSocket URL',
    }),
});

export type AddRobotInput = z.infer<typeof addRobotSchema>;
