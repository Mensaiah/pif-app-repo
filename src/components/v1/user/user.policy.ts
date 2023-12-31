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
  marketplaces: z
    .array(
      z.string().length(2, {
        message: 'max-length should be 2 for each marketplace.',
      })
    )
    .optional(),
  partnerId: z.string().optional(),
  cityId: z.string().optional(),
  posId: z.string().optional(),
});

export const createPlatformInviteSchema: any = User.refine(
  (data) => {
    if (data.role !== 'admin' && !data.marketplaces) return false;

    // Define who can invite which userType and role
    if (data.userType === 'platform-admin') {
      if (data.role === 'admin') return true;
      if (data.role === 'country-admin' && data.marketplaces?.length)
        return true;
    }
    if (
      data.userType === 'partner-admin' &&
      data.partnerId &&
      data.marketplaces?.length
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
    message:
      'Invalid combination of role, marketplace, and partnerId. Except role is admin, marketplace is required',
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

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  phonePrefix: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  sex: z.enum(['male', 'female', 'others', 'prefer-not-to-say']).optional(),
  userType: z.enum(['customer', 'platform-admin', 'partner-admin']).optional(),
  pifId: z.string().optional(),
  dob: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: 'DOB must be a valid date string generated by new Date()',
    })
    .optional(),
  occupation: z.string().optional(),
  email: z.string().email().optional(),
  relationship: z
    .enum(['married', 'single', 'divorced', 'prefer-not-to-say'])
    .optional(),
  hasChildren: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  street: z.string().optional(),
  country: z.string().optional(),
  social: z
    .array(
      z.object({
        platformName: z.string(),
        socialUserId: z.string(),
      })
    )
    .optional(),
});
