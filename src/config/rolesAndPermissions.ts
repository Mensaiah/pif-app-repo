export const defaultPlatformRoles: string[] = [
  'super admin',
  'admin',
  'country admin',
  'partner admin',
  'local partner',
];

export const permissions = [
  {
    space: 'users',
    capabilities: ['view users', 'add users', 'moderate users'],
  },
  {
    space: 'transactions',
    capabilities: ['view transactions'],
  },
] as const;

export type PermissionSpaces = (typeof permissions)[number]['space'];
export type PermissionCapabilities =
  | (typeof permissions)[number]['capabilities'][number]
  | 'supreme';
