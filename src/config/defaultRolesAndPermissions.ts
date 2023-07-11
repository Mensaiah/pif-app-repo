const defaultUserTypesRolesAndPermissions = [
  {
    userType: 'customer',
    roles: [
      {
        name: 'customer',
      },
    ],
  },
  {
    userType: 'platform-admin',
    roles: [
      { name: 'super-admin', permissions: ['supreme'] },
      {
        name: 'admin',
        permissions: [
          'socials.view',
          'socials.add',
          'socials.edit',
          'socials.delete',
          'faq.view',
          'faq.add',
          'faq.edit',
          'faq.delete',
          'category.view',
          'category.add',
          'category.edit',
          'category.delete',
          'partner.view',
          'partner.add',
          'partner.edit',
          'partner.delete',
          'platform-accounts.view',
          'platform-accounts.add',
          'platform-accounts.edit',
          'platform-accounts.delete',
          'product.view',
          'product.add',
          'product.edit',
          'product.delete',
          'role.view',
          'role.add',
          'role.edit',
          'role.delete',
          'transactions.view',
          'statistics.view',
          'settlements.view',
          'settlements.add',
          'settlements.edit',
          'settlements.delete',
          'drive.view',
          'drive.folder.add',
          'drive.folder.edit',
          'drive.folder.delete',
          'drive.file.view',
          'drive.file.add',
          'drive.file.edit',
          'drive.file.delete',
          'sms.view',
          'cities.view',
          'cities.add',
          'cities.edit',
          'cities.delete',
          'settings.translations_app',
          'internal-category.view',
          'internal-category.add',
          'internal-category.edit',
          'internal-category.delete',
          'info-box.view',
          'info-box.add',
          'info-box.edit',
          'info-box.delete',
          'terms.view',
          'terms.add',
          'terms.edit',
          'terms.delete',
          'category-icons.view',
          'category-icons.add',
          'category-icons.edit',
          'category-icons.delete',
          'pos.view',
          'pos.add',
          'pos.edit',
          'pos.delete',
          'policy.view',
          'policy.add',
          'policy.edit',
          'policy.delete',
          'push-messages.view',
          'push-messages.add',
          'marketplaces.view',
          'marketplaces.add',
          'marketplaces.edit',
          'faq.view',
          'faq.add',
          'faq.edit',
          'faq.delete',
        ],
      },
      {
        name: 'country-admin',
        permissions: [
          'socials.view',
          'socials.add',
          'socials.edit',
          'socials.delete',
          'faq.view',
          'faq.add',
          'faq.edit',
          'faq.delete',
          'category-icons.add',
          'category-icons.delete',
          'category-icons.edit',
          'category-icons.view',
          'category.add',
          'category.delete',
          'category.edit',
          'category.view',
          'cities.add',
          'cities.delete',
          'cities.edit',
          'cities.view',
          'drive.file.add',
          'drive.file.delete',
          'drive.file.edit',
          'drive.file.view',
          'drive.folder.add',
          'drive.folder.delete',
          'drive.folder.edit',
          'drive.view',
          'info-box.add',
          'info-box.delete',
          'info-box.edit',
          'info-box.view',
          'internal-category.add',
          'internal-category.delete',
          'internal-category.edit',
          'internal-category.view',
          'partner.add',
          'partner.delete',
          'partner.edit',
          'partner.view',
          'platform-accounts.view',
          'pos.add',
          'pos.delete',
          'pos.edit',
          'pos.view',
          'policy.add',
          'policy.delete',
          'policy.edit',
          'policy.view',
          'product.add',
          'product.delete',
          'product.edit',
          'product.view',
          'push-messages.add',
          'push-messages.view',
          'partner-role.add',
          'partner-role.delete',
          'partner-role.edit',
          'partner-role.view',
          'settings.translations_app',
          'settlements.add',
          'settlements.delete',
          'settlements.edit',
          'settlements.view',
          'sms.view',
          'statistics.view',
          'terms.add',
          'terms.delete',
          'terms.edit',
          'terms.view',
          'transactions.view',
          'faq.view',
          'faq.add',
          'faq.edit',
          'faq.delete',
        ],
      },
    ],
  },
  {
    userType: 'partner-admin',
    roles: [
      {
        name: 'partner-admin',
        permissions: [
          'product.view',
          'product.add',
          'product.edit',
          'product.delete',
          'user.view',
          'user.add',
          'user.edit',
          'user.delete',
          'transactions.view',
          'statistics.view',
          'settlements.view',
          'settlements.add',
          'settlements.edit',
          'settlements.delete',
          'drive.view',
          'drive.folder.add',
          'drive.folder.edit',
          'drive.folder.delete',
          'drive.file.view',
          'drive.file.add',
          'drive.file.edit',
          'drive.file.delete',
          'pos.view',
          'pos.add',
          'pos.edit',
          'pos.delete',
        ],
      },
      {
        name: 'local-partner',
        permissions: [
          'product.view',
          'product.add',
          'product.edit',
          'product.delete',
          'user.view',
          'transactions.view',
          'statistics.view',
          'settlements.view',
          'drive.view',
          'drive.folder.add',
          'drive.folder.edit',
          'drive.folder.delete',
          'drive.file.view',
          'drive.file.add',
          'drive.file.edit',
          'drive.file.delete',
          'pos.view',
          'pos.add',
          'pos.edit',
          'pos.delete',
        ],
      },
      { name: 'pos-user', permissions: [] },
    ],
  },
];

export default defaultUserTypesRolesAndPermissions;