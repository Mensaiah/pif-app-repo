import { z } from 'zod';

const Role = z.enum([
  'admin',
  'country-admin',
  'partner-admin',
  'local-partner',
  'pos-user',
]);

const User = z.object({
  email: z.string().email(),
  role: Role,
  userType: z.enum(['platform-admin', 'partner-admin']),
  marketplaces: z.array(z.string()).optional(),
  partnerId: z.string().optional(),
  cityId: z.string().optional(),
  posId: z.string().optional(),
});

export const createPlatformInviteSchema: any = User.refine(
  (data) => {
    // Define who can invite which userType and role
    if (data.userType === 'platform-admin') {
      if (data.role === 'admin') return true;
      if (data.role === 'country-admin' && data.marketplaces.length)
        return true;
    }
    if (
      data.userType === 'partner-admin' &&
      data.partnerId &&
      data.marketplaces.length
    ) {
      if (data.role === 'partner-admin') return true;
      if (data.role === 'local-partner' && data.cityId) {
        return true;
      }
      if (data.role === 'pos-user' && data.posId) return true;
    }

    return false;
  },
  {
    message: 'Invalid combination of role, marketplace, and partnerId',
  }
);

export const verifyPlatformInviteSchema = z.object({
  code: z.string(),
});

export const acceptPlatformInviteSchema = z.object({
  code: z.string(),
  email: z.string(),
  name: z.string(),
  phonePrefix: z.string(),
  phone: z.string(),
  password: z.string(),
});
