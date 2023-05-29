import { z } from 'zod';

const Role = z.enum([
  'admin',
  'country-admin',
  'partner-admin',
  'local-partner',
]);

const User = z.object({
  email: z.string().email(),
  role: Role,
  marketplace: z.string().optional(),
  partnerId: z.string().optional(),
});

export const inviteUserSchema = User.refine(
  (data) => {
    if (data.role === 'admin' && data.email) return true;
    if (data.role === 'country-admin' && data.partnerId && data.email)
      return true;

    if (
      (data.role === 'partner-admin' || data.role === 'local-partner') &&
      data.marketplace &&
      data.partnerId &&
      data.email
    )
      return true;

    return false;
  },
  {
    message: 'Invalid combination of role, marketplace, and partnerId',
  }
);

export const verifyInviteSchema = z.object({
  code: z.string(),
});

export const acceptUserInviteSchema = z.object({
  code: z.string(),
  email: z.string(),
  name: z.string(),
  phonePrefix: z.string(),
  phone: z.string(),
  password: z.string(),
});
