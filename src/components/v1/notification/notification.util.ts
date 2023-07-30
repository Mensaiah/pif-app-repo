import { sendMail } from '../../../services/emailServices';

/**
 * Notification for Supplier after a successful order is made (email)
 *
 * Hi (supplier name),
 *
 * An order has been made for your product <a href="https://pif-dashboard.web.app/products/(productId)">(product name )</a> (x quantity) by (customer name). The receiver (receiver name) will pick up the product from you on (date) at (time). Please ensure you are available to deliver the product to the receiver at the specified time. His contact is (receiver phone number).
 *
 * Thank you for using our platform.
 *
 * Regards,
 * The PIF Team
 *
 *
 * Notification for Receiver after a successful order is made (sms)
 *
 * Hi (receiver name | buddy),
 *
 * I just sent a gift to you via PIF. Please pick it up from (supplier name) on (date) at (time) using this redemption code: (redemption code).(supplier name) contact is (supplier phone number).
 *
 */
export const sendPartnerOrderNotification = async ({
  productName,
  productId,
  supplierEmail,
  supplierName,
  receiverName,
  receiverPhone,
  deliveryAt,
  senderName,
}: {
  productName: string;
  productId: string;
  quantity: number;
  supplierEmail: string;
  supplierName: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAt: Date;
  senderName: string;
}) => {
  try {
    await sendMail({
      to: supplierEmail,
      subject: 'New Order on PIF',
      content: `Hi ${supplierName},<br><br>
      
      An order has been made for your product <a href="https://pif-dashboard.web.app/products/${productId}">${productName}</a> by ${senderName}. The receiver ${
        receiverName ? ', ' + receiverName : ''
      } will pick up the product from you on ${deliveryAt.toDateString()} at ${deliveryAt.toLocaleTimeString()}. Please ensure you are available to deliver the product to the receiver at the specified time. His contact is +${receiverPhone}.<br><br>

      Thank you for using our platform.<br><br>

      Regards,<br>
      The PIF Team
      `,
    });
  } catch (err) {
    throw err;
  }
};
