const data = `
admin	category.view	View categories
admin	category.add	Add categories
admin	category.edit	Edit categories
admin	category.delete	Delete categories
admin	partner.view	View partners
admin	partner.add	Add partners
admin	partner.edit	Edit partners
admin	partner.delete	Delete partners
admin	platform-accounts.view	View platform accounts
admin	platform-accounts.add	Add platform accounts
admin	platform-accounts.edit	Edit platform accounts
admin	platform-accounts.delete	Delete platform accounts
admin	product.view	View products
partner	product.view	View products
admin	product.add	Add products
partner	product.add	Add products
admin	product.edit	Edit products
partner	product.edit	Edit products
admin	product.delete	Delete products
partner	product.delete	Delete products
admin	role.view	View role
admin	role.add	Add role
admin	role.edit	Edit role
admin	role.delete	Delete role
partner	user.view	View user
partner	user.add	Add user
partner	user.edit	Edit user
partner	user.delete	Delete user
admin	transactions.view	View transactions
partner	transactions.view	View transactions
admin	statistics.view	View statistics
partner	statistics.view	View statistics
admin	settlements.view	View settlements
partner	settlements.view	View settlements
admin	settlements.add	Add settlements
partner	settlements.add	Add settlements
admin	settlements.edit	Edit settlements
partner	settlements.edit	Edit settlements
admin	settlements.delete	Delete settlements
partner	settlements.delete	Delete settlements
admin	drive.view	View documents repository
partner	drive.view	View documents repository
admin	drive.folder.add	Add folders
partner	drive.folder.add	Add folders
admin	drive.folder.edit	Edit folders
partner	drive.folder.edit	Edit folders
admin	drive.folder.delete	Delete folders
partner	drive.folder.delete	Delete folders
admin	drive.file.view	Download files
partner	drive.file.view	Download files
admin	drive.file.add	Add files
partner	drive.file.add	Add files
admin	drive.file.edit	Edit files
partner	drive.file.edit	Edit files
admin	drive.file.delete	Delete files
partner	drive.file.delete	Delete files
admin	sms.view	View SMS log
admin	cities.view	View Cities
admin	cities.add	Add city
admin	cities.edit	Edit city
admin	cities.delete	Delete city
admin	settings.translations_app	Upload translations to application
admin	internal-category.view	View internal categories
admin	internal-category.add	Add internal categories
admin	internal-category.edit	Edit internal categories
admin	internal-category.delete	Delete internal categories
admin	info-box.view	View info box
admin	info-box.add	Add info box
admin	info-box.edit	Edit info box
admin	info-box.delete	Delete info box
admin	terms.view	View terms
admin	terms.add	Add terms
admin	terms.edit	Edit terms
admin	terms.delete	Delete terms
admin	category-icons.view	View category icons
admin	category-icons.add	Add category icons
admin	category-icons.edit	Edit category icons
admin	category-icons.delete	Delete category icons
admin	pos.view	View POS
admin	pos.add	Add POS
admin	pos.edit	Edit POS
admin	pos.delete	Delete POS
partner	pos.view	View POS
partner	pos.add	Add POS
partner	pos.edit	Edit POS
partner	pos.delete	Delete POS
admin	privacy-policy.view	View Privacy policy
admin	privacy-policy.add	Add Privacy policy
admin	privacy-policy.edit	Edit Privacy policy
admin	privacy-policy.delete	Delete Privacy policy
admin	push-messages.view	View Push Messages
user	push-messages.view	View Push Messages
admin	push-messages.add	Add Push Messages
user	push-messages.add	Add Push Messages
country-admin	category-icons.add	Add category icons
country-admin	category-icons.delete	Delete category icons
country-admin	category-icons.edit	Edit category icons
country-admin	category-icons.view	View category icons
country-admin	category.add	Add categories
country-admin	category.delete	Delete categories
country-admin	category.edit	Edit categories
country-admin	category.view	View categories
country-admin	cities.add	Add city
country-admin	cities.delete	Delete city
country-admin	cities.edit	Edit city
country-admin	cities.view	View Cities
country-admin	drive.file.add	Add files
country-admin	drive.file.delete	Delete files
country-admin	drive.file.edit	Edit files
country-admin	drive.file.view	Download files
country-admin	drive.folder.add	Add folders
country-admin	drive.folder.delete	Delete folders
country-admin	drive.folder.edit	Edit folders
country-admin	drive.view	View documents repository
country-admin	info-box.add	Add info box
country-admin	info-box.delete	Delete info box
country-admin	info-box.edit	Edit info box
country-admin	info-box.view	View info box
country-admin	internal-category.add	Add internal categories
country-admin	internal-category.delete	Delete internal categories
country-admin	internal-category.edit	Edit internal categories
country-admin	internal-category.view	View internal categories
country-admin	partner.add	Add partners
country-admin	partner.delete	Delete partners
country-admin	partner.edit	Edit partners
country-admin	partner.view	View partners
country-admin	platform-accounts.add	Add platform accounts
country-admin	platform-accounts.delete	Delete platform accounts
country-admin	platform-accounts.edit	Edit platform accounts
country-admin	platform-accounts.view	View platform accounts
country-admin	pos.add	Add POS
country-admin	pos.delete	Delete POS
country-admin	pos.edit	Edit POS
country-admin	pos.view	View POS
country-admin	privacy-policy.add	Add Privacy policy
country-admin	privacy-policy.delete	Delete Privacy policy
country-admin	privacy-policy.edit	Edit Privacy policy
country-admin	privacy-policy.view	View Privacy policy
country-admin	product.add	Add products
country-admin	product.delete	Delete products
country-admin	product.edit	Edit products
country-admin	product.view	View products
country-admin	push-messages.add	Add Push Messages
country-admin	push-messages.view	View Push Messages
country-admin	role.add	Add role
country-admin	role.delete	Delete role
country-admin	role.edit	Edit role
country-admin	role.view	View role
country-admin	settings.translations_app	Upload translations to application
country-admin	settlements.add	Add settlements
country-admin	settlements.delete	Delete settlements
country-admin	settlements.edit	Edit settlements
country-admin	settlements.view	View settlements
country-admin	sms.view	View SMS log
country-admin	statistics.view	View statistics
country-admin	terms.add	Add terms
country-admin	terms.delete	Delete terms
country-admin	terms.edit	Edit terms
country-admin	terms.view	View terms
country-admin	transactions.view	View transactions`
  .trim()
  .split('\n');

const permissions = data.map((row) => {
  const [role, permission, description] = row.split('\t');
  return {
    role,
    permission,
    description,
  };
});

// extract permissions and descriptions into an array and make them unique like so [{ value: 'category.view', description: 'View categories' }, { value: 'category.add', description: 'Add categories' }, ...]
const allPermissions = permissions.reduce((acc, curr) => {
  const { permission, description } = curr;
  const permissionIndex = acc.findIndex((p) => p.value === permission);
  if (permissionIndex === -1) {
    acc.push({
      value: permission,
      description,
    });

    return acc;
  }

  return acc;
}, []);

const roles = permissions.reduce((acc, curr) => {
  const { role, permission } = curr;
  const roleIndex = acc.findIndex((r) => r.role === role);
  if (roleIndex === -1) {
    acc.push({
      role,
      permissions: [permission],
    });
  } else {
    acc[roleIndex].permissions.push(permission);
  }
  return acc;
}, []);
