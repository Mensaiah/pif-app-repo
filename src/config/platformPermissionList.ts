/* eslint-disable max-lines */
// export const permissionList = {
//   platform: [
//     'manage-marketplaces',
//     'add-marketplace',
//     'update-marketplace',
//     'manage-socials',
//     'add-social',
//     'update-social',
//   ],
//   user: ['manage-users', 'view-users', 'add-user', 'update-user'],
//   products: ['manage-products', 'view-products'],
//   cms: [
//     'manage-info',
//     'add-info',
//     'update-info',
//     'manage-policies',
//     'add-policy',
//     'update-policy',
//     'manage-faq',
//     'add-faq',
//     'update-faq',
//   ],
// };
export const permissionList = [
  {
    value: 'category.view',
    description: 'View categories',
  },
  {
    value: 'category.add',
    description: 'Add categories',
  },
  {
    value: 'category.edit',
    description: 'Edit categories',
  },
  {
    value: 'category.delete',
    description: 'Delete categories',
  },
  {
    value: 'partner.view',
    description: 'View partners',
  },
  {
    value: 'partner.add',
    description: 'Add partners',
  },
  {
    value: 'partner.edit',
    description: 'Edit partners',
  },
  {
    value: 'partner.delete',
    description: 'Delete partners',
  },
  {
    value: 'platform-accounts.view',
    description: 'View platform accounts',
  },
  {
    value: 'platform-accounts.add',
    description: 'Add platform accounts',
  },
  {
    value: 'platform-accounts.edit',
    description: 'Edit platform accounts',
  },
  {
    value: 'platform-accounts.delete',
    description: 'Delete platform accounts',
  },
  {
    value: 'product.view',
    description: 'View products',
  },
  {
    value: 'product.add',
    description: 'Add products',
  },
  {
    value: 'product.edit',
    description: 'Edit products',
  },
  {
    value: 'product.delete',
    description: 'Delete products',
  },
  {
    value: 'role.view',
    description: 'View role',
  },
  {
    value: 'role.add',
    description: 'Add role',
  },
  {
    value: 'role.edit',
    description: 'Edit role',
  },
  {
    value: 'role.delete',
    description: 'Delete role',
  },
  {
    value: 'partner-role.view',
    description: 'View partner role(s)',
  },
  {
    value: 'partner-role.add',
    description: 'Add partner role(s)',
  },
  {
    value: 'partner-role.edit',
    description: 'Edit partner role(s)',
  },
  {
    value: 'partner-role.delete',
    description: 'Delete partner role(s)',
  },
  {
    value: 'user.view',
    description: 'View user',
  },
  {
    value: 'user.add',
    description: 'Add user',
  },
  {
    value: 'user.edit',
    description: 'Edit user',
  },
  {
    value: 'user.delete',
    description: 'Delete user',
  },
  {
    value: 'transactions.view',
    description: 'View transactions',
  },
  {
    value: 'statistics.view',
    description: 'View statistics',
  },
  {
    value: 'settlements.view',
    description: 'View settlements',
  },
  {
    value: 'settlements.add',
    description: 'Add settlements',
  },
  {
    value: 'settlements.edit',
    description: 'Edit settlements',
  },
  {
    value: 'settlements.delete',
    description: 'Delete settlements',
  },
  {
    value: 'drive.view',
    description: 'View documents repository',
  },
  {
    value: 'drive.folder.add',
    description: 'Add folders',
  },
  {
    value: 'drive.folder.edit',
    description: 'Edit folders',
  },
  {
    value: 'drive.folder.delete',
    description: 'Delete folders',
  },
  {
    value: 'drive.file.view',
    description: 'Download files',
  },
  {
    value: 'drive.file.add',
    description: 'Add files',
  },
  {
    value: 'drive.file.edit',
    description: 'Edit files',
  },
  {
    value: 'drive.file.delete',
    description: 'Delete files',
  },
  {
    value: 'sms.view',
    description: 'View SMS log',
  },
  {
    value: 'cities.view',
    description: 'View Cities',
  },
  {
    value: 'cities.add',
    description: 'Add city',
  },
  {
    value: 'cities.edit',
    description: 'Edit city',
  },
  {
    value: 'cities.delete',
    description: 'Delete city',
  },
  {
    value: 'settings.translations_app',
    description: 'Upload translations to application',
  },
  {
    value: 'internal-category.view',
    description: 'View internal categories',
  },
  {
    value: 'internal-category.add',
    description: 'Add internal categories',
  },
  {
    value: 'internal-category.edit',
    description: 'Edit internal categories',
  },
  {
    value: 'internal-category.delete',
    description: 'Delete internal categories',
  },
  {
    value: 'info-box.view',
    description: 'View info box',
  },
  {
    value: 'info-box.add',
    description: 'Add info box',
  },
  {
    value: 'info-box.edit',
    description: 'Edit info box',
  },
  {
    value: 'info-box.delete',
    description: 'Delete info box',
  },
  {
    value: 'terms.view',
    description: 'View terms',
  },
  {
    value: 'terms.add',
    description: 'Add terms',
  },
  {
    value: 'terms.edit',
    description: 'Edit terms',
  },
  {
    value: 'terms.delete',
    description: 'Delete terms',
  },
  {
    value: 'category-icons.view',
    description: 'View category icons',
  },
  {
    value: 'category-icons.add',
    description: 'Add category icons',
  },
  {
    value: 'category-icons.edit',
    description: 'Edit category icons',
  },
  {
    value: 'category-icons.delete',
    description: 'Delete category icons',
  },
  {
    value: 'pos.view',
    description: 'View POS',
  },
  {
    value: 'pos.add',
    description: 'Add POS',
  },
  {
    value: 'pos.edit',
    description: 'Edit POS',
  },
  {
    value: 'pos.delete',
    description: 'Delete POS',
  },
  {
    value: 'policy.view',
    description: 'View Policy',
  },
  {
    value: 'policy.add',
    description: 'Add Policy',
  },
  {
    value: 'policy.edit',
    description: 'Edit Policy',
  },
  {
    value: 'policy.delete',
    description: 'Delete Policy',
  },
  {
    value: 'push-messages.view',
    description: 'View Push Messages',
  },
  {
    value: 'push-messages.add',
    description: 'Add Push Messages',
  },
  // additions
  {
    permission: 'marketplaces.view',
    description: 'View marketplaces',
  },
  {
    permission: 'marketplaces.add',
    description: 'Add marketplaces',
  },
  {
    permission: 'marketplaces.edit',
    description: 'Edit marketplaces',
  },
  {
    permission: 'faq.view',
    description: 'View FAQ',
  },
  {
    permission: 'faq.add',
    description: 'Add FAQ',
  },
  {
    permission: 'faq.edit',
    description: 'Edit FAQ',
  },
  {
    permission: 'faq.delete',
    description: 'Delete FAQ',
  },
  {
    permission: 'socials.view',
    description: 'View socials',
  },
  {
    permission: 'socials.add',
    description: 'Add socials',
  },
  {
    permission: 'socials.edit',
    description: 'Edit socials',
  },
  {
    permission: 'socials.delete',
    description: 'Delete socials',
  },
];

const partnerAdminPermissions = [];
const platformAdminPermissions = [];

export const allPermissions = permissionList.map((p) => p.value);
