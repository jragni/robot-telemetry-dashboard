import { z } from 'zod';

export const vector3Schema = z.object({ x: z.number(), y: z.number(), z: z.number() });
