```TS
import { prop, Ref } from "@typegoose/typegoose";
import { Schema, Document, Model, Types } from "mongoose";

type timestampTypes = {
  deleted_at?: boolean | Date | null;
  created_at: boolean | Date;
  updated_at: boolean | Date;
};

interface Category {
  id: number;
  enabled: boolean;
  promoted: boolean;
  supplier_list: boolean;
  main: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  icon: string;
  is_functional: boolean;
  type: number;
  icon_id: number;
  is_birthday: boolean;
}

interface ICategoryIcons extends Document, timestampTypes {
    name: string;
    icon: string;
    enabled: boolean;
    promoted: boolean;
    supplier_list: boolean;
    main: boolean;
    getAllActive(): Promise<ICategoryIcons[]>;
    getAllActiveNotEmpty(): Promise<ICategoryIcons[]>;
    getAll(): Promise<ICategoryIcons[]>;
    getAllDataTable(data: any, columns: any, order: any): Promise<ICategoryIcons[]>;
    getIconById(iconId: string): Promise<ICategoryIcons | null>;
    getCountAllDataTable(): Promise<number>;
    getCountDataTable(data: any, column?: any): Promise<number>;
}

interface CategoryLang {
  id: number;
  category_id: number;
  lang: string;
  name: string;
}
interface CategoryMarketplace {
  id: number;
  category_id: number;
  marketplace: string;
}

interface Cities {
  id: number;
  enabled: boolean;
  x: number;
  y: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
interface CitiesLang {
  id: number;
  city_id: number;
  lang: string;
  name: string;
}
interface CitiesMarketplace {
  id: number;
  city_id: number;
  marketplace: string;
}

interface CustomerService {
  id: number;
  device_id: number;
  message: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DriveFile {
  id: number;
  folder_id: number;
  mime_type: string;
  extension: string;
  path_name: string;
  display_name: string;
  size: number;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: string | null;
  suffix: number;
}
interface DriveFolder {
  id: number;
  parent_id: number | null;
  protected: boolean;
  marketplace: string | null;
  partner_id: number | null;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: string | null;
  public: boolean;
  system: boolean;
  access_level: boolean;
}

interface GiftCriteriaHistory {
  id: number;
  criteria: string;
  created_at: Date;
  updated_at: Date;
}

interface InfoBox {
  id: number;
  type: number;
  title: string;
  content: string;
  is_published: boolean;
  deleted_at: string;
  created_at: Date;
  updated_at: Date;
}

interface InternalCategory {
  id: number;
  name: string;
  enabled: boolean;
  promoted: boolean;
  supplier_list: boolean;
  main: boolean;
  deleted_at: Date;
  created_at: Date;
  updated_at: Date;
  icon: string;
}

export enum PartnerType {
  BAR = 1,
  RESTAURANT,
  SPORTKLUB,
  HOTEL,
}

interface Partner {
  name: string;
  vat: string;
  country: string;
  marketplace: string;
  is_charity: boolean;
  city: string;
  zipcode: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  www: string;
  logo: string;
  payments_account_number: string;
  payments_recipient: string;
  status: number;
  redeem_app_confirm: boolean;
  redeem_auto: boolean;
  send_push: boolean;
  is_reward_system: boolean;
  redeem_type: boolean;
  ftp_host: string;
  ftp_login: string;
  ftp_pass: string;
  ftp_last_sync: string;
  api_login: string;
  api_pass: string;
  api_code_type: string;
  logo_crop_data: { scd: string; sd: string };
  type: PartnerType;
  order: number;
  favorites?: Ref<UserPifFavorite>[];
  settling?: Ref<PartnerSettlings>;
  contractDocuments?: Ref<PartnerContractDocuments>[];
  pos?: Ref<PartnerPOS>[];
  products?: Ref<Product>[];
  push_sented_at?: Date;
}
interface PartnerContractDocuments {
  _id: string;
  partner: Ref<Partner>;
  filename: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
interface PartnerPOS extends Document {
  partner_id: number;
  name: string;
  pos_id: string;
  lat: string;
  long: string;
  phone: string;
  description: string;
  geo_scanned: boolean;
  status: boolean;
  city_id: number;
  is_imported: boolean;
  import_status: number;
}
interface PartnerPosUser extends Document {
  partner_id: number;
  name: string;
  login: string;
  pin: string;
  is_active: boolean;
}
interface PartnerSettlings {
  partner_id: number;
  type: number;
  period_type: number;
  amount: number;
  currency: string;
  proportion_start: number;
  proportion_finish: number;
  proportion_pif: number;
  fixed_fee: number;
}
interface PartnerSlicePrices {
  partner_id: number;
  code: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface Permission {
  space: string;
  key: string;
  name: string;
  description: string;
  deleted_at?: Date;
}

export interface PrivacyPolicy extends Document {
  content_en: string;
  content_da: string;
  popup: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
  accepted_at?: Date;
}

interface Product extends Document {
  name: string;
  partner_id: number;
  price: number;
  status: boolean;
  acceptance_status: boolean;
  photo: string;
  redemption_type: boolean;
  redemption_valid_type: boolean;
  redemption_valid_value: string;
  valid_thru: Moment;
  quantity: number;
  qtySold: number;
  created_at: Moment;
  updated_at: Moment;
  deleted_at?: Moment;
  langs: IProductLang[];
  tags: ITag[];
  categories: ICategory[];
  partner: IPartner;
  version: number;
  is_current_version: boolean;
  origin_id: number;
  order: boolean;
  quantity_alert: number;
  extra_product: boolean;
  extra_photo: string;
  promoted_thru: string;
  free_gift: boolean;
  tax: number;
  cities: ICities[];
  send_push: boolean;
  push_sented_at?: Moment;
  is_counted_towards_the_reward: boolean;
  is_can_be_redeemed_as_rewards: boolean;
  is_bonus_product_only: boolean;
  slice_price: number;
  mandatory_age: boolean;
  internal_category_id: number;
  is_default_photo: boolean;
  favorites: IUserPifFavorite[];

  // Methods
  canBeBought(): boolean;
  canShowBarCodes(): boolean;
}

interface ProductBase extends Document, Favoriteable, ProductVersionable {
  name: string;
  partner_id: Types.ObjectId;
  price: number;
  status: boolean;
  acceptance_status: boolean;
  photo: string;
  redemption_type: boolean;
  redemption_valid_type: boolean;
  redemption_valid_value: string;
  valid_thru: Date;
  quantity: number;
  qtySold: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  langs: Types.DocumentArray<ProductLang>;
  tags: Types.DocumentArray<Tag>;
  categories: Types.DocumentArray<Category>;
  partner: Types.ObjectId | Partner;
  promotions: Types.DocumentArray<ProductPromotion>;
  sorting: Types.DocumentArray<ProductSortOrder>;
  codes: Types.DocumentArray<ProductCode>;
  send_push: boolean;
  push_sented_at?: Date;
  is_counted_towards_the_reward: boolean;
  is_can_be_redeemed_as_rewards: boolean;
  is_bonus_product_only: boolean;
  slice_price: number;
  mandatory_age: boolean;
  internal_category_id: number;
  quantity_alert: number;
  extra_product: boolean;
  extra_photo: string;
  promoted_thru: string;
  free_gift: boolean;
  tax: number;
  order: boolean;

  canBeBought(): boolean;
  canShowBarCodes(): boolean;
}

interface ProductCategory extends Document {
  product_id: number;
  category_id: number;
}

interface ProductCode {
  product_id: number;
  code: string;
  ean_code_source: number;
  code_type: string;
  purchase_id?: number;
  validate_at?: string;
}

interface IProductLang extends Document {
  product_id: number;
  lang: string;
  name: string;
  caption: string;
  description: string;
  disclaimer: string;
  extra_description: string;
  text_for_receiver: string;
}

interface ProductPromotion {
  product_id: number;
  begin_date: string;
  end_date: string;
  begin_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface ProductSortOrder extends Document {
  origin_id: number;
  regular: number;
  promotion: number;
}

interface ProductVouchers extends Document {
  product_id: number;
  platform: number;
  code: string;
  use_type: number;
  code_type: number;
  used_by_user_id: number;
  used_at: Date;
  expired_at: Date;
  available_uses: boolean;
  note: string;
}

interface ProductVouchersUses extends Document {
  voucher_id: Types.ObjectId;
  used_by_user_id: Types.ObjectId;
  purchase_id: Types.ObjectId;
  used_at: Date;
}

interface PushMessages extends Document {
  criteria: object;
  message: string;
  numberOfRecipients: number;
  createdAt: Date;
  updatedAt: Date;
  sender: string;
  partnerId: number;
}

interface RoleDocument extends Document {
  space: string;
  key: string;
  name: string;
  description: string;
  weight: boolean;
  deleted_at: Date;
}

interface Settlement extends Document {
  amount: number;
  marketplace: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
interface SettlementsDetails extends Document {
  settlements_id: number;
  partner_id: number;
  amount: number;
  currency: string;
  ec_imported: boolean;
  noriqq_imported: boolean;
  noriqq_sales_number: string;
  noriqq_purchase_number: string;
  created_at: Date;
  updated_at: Date;
}

interface Tag extends Document {
  lang: string;
  name: string;
}

interface TermsAndCondition extends Document {
  content_en: string;
  content_da: string;
  popup: boolean;
  terms_accepted_at?: Date;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface User extends Document {
  role_id: number;
  name: string;
  email: string;
  timezone: string;
  partner_id: number;
  password: string;
  remember_token: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  status: number;
  activation_code: string;
  marketplace: string;
  can_see_personal_data: boolean;
  import_mail_to_send: boolean;
  pif_notification: boolean;
  hasAccessToPersonalData(): boolean;
}

interface UserPif extends Document, HasFavorites {
  name: string;
  email: string;
  marketplace: string;
  devices: UserPifDevicesDocument[];
  contacts: UserPifContactsDocument[];
  payment_methods: UserPifPaymentMethodsDocument[];
  socials: UserPifSocialsDocument[];
  avatar: string;
  details: UserPifDetailsDocument;
  kickbackPoints: UserPifKickbackPointsDocument[];
  skip_sms: boolean;
  timezone: string;
  last_selected_partner_id: string;
  last_log_in_at: Date;
  rewardSystemPoints: UserPifRewardSystemPointsDocument[];
  terms_accepted_at: Date;
  deleted_at: Date;
  netaxeptPaymentMethods: UserPifNetAxeptPaymentMethodsDocument[];
  stripe_customer_id: string;
  stripeConnectCustomerId: string;
  custom_id: string;
}

interface IUserPifChats extends Document {
  sender_id: number;
  recipient_id: number;
  contact_id: number;
  pif_id: number;
  message: string;
  read_recipient: boolean;
  photo: string;
  is_delete_sender: boolean;
  is_delete_recipient: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  sender: UserPif["_id"];
  recipient: UserPif["_id"];
  contact: UserPifContact["_id"];
  pif: UserPifPurchase["_id"];
}

interface UserPifContact {
  user_id: number;
  app_user_id: number;
  name: string;
  phone_number: string;
  has_app: boolean;
  phone_number_display: string;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface UserPifDetails {
  user_id: number;
  sex: string;
  country: string;
  city: string;
  zip: string;
  street: string;
  day_of_birth: string;
  age: string;
  occupation: number;
  relationship: number;
  children: boolean;
  interests: string[];
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}


interface IUserPifDevices extends Document,Omit<timestampTypes, "deleted_at"> {
  user_id: number;
  phone_number_prefix: string;
  phone_number: string;
  country: string;
  pin: string;
  blocked: boolean;
  confirmed: boolean;
  sms_code: string;
  device_id: string;
  soft: string;
  uuid: string;
  registration_step: boolean;
  process_change_number: boolean;
  process_change_pin: boolean;
  last_log_in_at?: string;
  app_rated: boolean;
  locale?: string;
  os_user_id?: string;

  user: IUserPif;
}

export interface IUserPifFavorite extends Document, Omit<timestampTypes, "deleted_at"> {
  user_id: number;
  favoriteable_id: number;
  favoriteable_type: string;

  user: UserPif;
  partners: any;
  products: any;
}

interface IUserPifKickbackPoints extends Document,Omit<timestampTypes, "deleted_at"> {
  user_id: number;
  marketplace: string;
  points: number;
}

export interface IUserPifNetAxeptPaymentMethods extends Document, timestampTypes {
  user_id: number;
  name: string;
  issuer: string;
  expiry_date: string;
  pan_hash: string;

  user: UserPif;
  paymentMethod: IUserPifPaymentMethods;
}

interface IUserPifPaymentMethods extends Document, timestampTypes {
  name: string;
  user_id: number;
  token: string;
  driver: string;
  method: string;

  user?: UserPif;
}

export interface IUserPifProportions extends Document, timestampTypes {
  partner_id: number;
  purchase_id: number;
  proportion_start: number;
  proportion_finish: number;
  proportion_pif: number;
  fixed_fee: number;

  purchase: IUserPifPurchase;
  partner: IUserPifPurchase;

 //method
  purchase(): Promise<IUserPifPurchase>;
  partner(): Promise<IUserPifPurchase>;
  getProportionId(): number;
}

interface IUserPifPurchase extends Document, timestampTypes {
  user_id: number;
  product_id: number;
  contact_id: number;
  recipient_user_id: number;
  transaction_id: number;
  transaction_fee: number;
  reward_system_points: number;
  price: number;
  price_start: number;
  price_finish: number;
  message: string;
  code: string;
  code_type: string;
  share_message: boolean;
  settlements_details_start_id: number;
  settlements_details_finish_id: number;
  unwraped_at: string;
  redeemed_at: string;
  api_redeemed_process_at: string;
  api_redeemed_user_confirm_at: string;
  expired_at: string;
  hide_validation_code_at: Date;
  pos_id: number;
  share_networks: string;
  criteria_id: number;
  sent: boolean;
  fixed_fee: number;
  proportion_id: number;
  is_passon: boolean;
  is_delayed: boolean;
  delivery_at: string;
  is_charity: boolean;
  settlements_start_status: boolean;
  settlements_finish_status: boolean;
  expiry_notify_at: string;

  user: IUserPif;
  product: IProduct;
  productAlways: IProduct;
  contact: IUserPifContacts;
  recipient: IUserPif;
  transaction: IUserPifTransactions;
  pos: IPartnerPos;
}

interface IUserPifRequest extends Document, timestampTypes {
  user_id: number;
  product_id: number;
  contact_id: number;
  quantity: number;
  recipient_user_id: number;
  message: string;
  accepted_at: string;

  user: IUserPif;
  product: IProduct;
  contact: IUserPifContacts;
  recipient: IUserPif;
}

export interface IUserPifRewardSystemPoints extends Document, Omit<timestampTypes, "deleted_at"> {
  user_id: number;
  partner_id: number;
  points: number;
}

interface IUserPifSocials extends Document, timestampTypes {
  user_id: number;
  social_type: number;
  social_user_id: string;
  user: UserPif;
}

export interface IUserPifStripePaymentMethods extends Document, timestampTypes {
    user_id: number;
    name: string;
    issuer: string;
    expiry_date: string;
    pan_hash: string;
    user?: IUserPif;
    paymentMethod?: IUserPifPaymentMethods;
}

interface IUserPifTransactions extends Document, timestampTypes {
 user_id: number;
  price: number;
  currency: string;
  driver: string;
  method: string;
  marketplace: string;
  proportion_start: number;
  proportion_finish: number;
  proportion_pif: number;
  trans_id: string;
  payment_method_id: number;
  kickback_points: number;
  paid: boolean;
  payment_details: string[];
  payment_status: boolean;
  paid_at: string;
  transaction_fee: number;
  fixed_fee: number;
  save_payment: boolean;

  user: IUserPif;
  paymentMethod: IUserPifPaymentMethods;
  purchases: IUserPifPurchase[];
  purchasesAll: IUserPifPurchase[];

  calculateFeePurchases(): number[];
  getTransactionFee(type: string): number | false;
}
```