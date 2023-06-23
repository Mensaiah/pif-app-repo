export const permissionList = {
  platform: [
    'manage-marketplaces',
    'add-marketplace',
    'update-marketplace',
    'manage-socials',
    'add-social',
    'update-social',
  ],
  user: ['manage-users', 'view-users', 'add-user', 'update-user'],
  cms: [
    'manage-info',
    'add-info',
    'update-info',
    'manage-policies',
    'add-policy',
    'update-policy',
    'manage-faq',
    'add-faq',
    'update-faq',
  ],
};

export const allPermissions = Object.values(permissionList).flat();
