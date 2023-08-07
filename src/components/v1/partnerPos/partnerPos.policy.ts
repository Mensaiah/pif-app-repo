import { z } from 'zod';

import { isValidId } from '../../../utils/validators';

export const addPartnerPosSchema = z
  .object({
    name: z.string(),
    phone: z.string().min(4),
    phonePrefix: z.string().min(1),
    description: z.string().min(2),
    geoScanned: z.string().optional(),
    lat: z.number(),
    long: z.number(),
    city: z.string().optional(),
  })
  .refine(
    ({ city }) => {
      if (city && !isValidId(city)) return false;

      return true;
    },
    {
      message: 'You have supplied invalid city id',
    }
  );

export const updatePartnerPosSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    phonePrefix: z.string().optional(),
    description: z.string().optional(),
    geoScanned: z.string().optional(),
    lat: z.number().optional(),
    long: z.number().optional(),
    city: z.string().optional(),
  })
  .refine(
    ({ city }) => {
      if (city && !isValidId(city)) return false;

      return true;
    },
    {
      message: 'You have supplied invalid city id',
    }
  );
