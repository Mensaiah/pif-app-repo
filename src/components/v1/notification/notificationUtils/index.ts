import { sendMail } from '../../../../services/emailServices';

export { sendPartnerOrderNotification } from './sendPartnerOrderNotification';
export { sendPlatformInviteMail } from './sendPlatformInviteMail';
export { sendPartnerAdminInviteMail } from './sendPartnerAdminInviteMail';
export { sendForgotPasswordCodeMail } from './sendForgotPasswordCodeMail';

export const sendOtpEmail = async (email: string, otpCode: string) => {
  try {
    await sendMail({
      to: email,
      subject: 'PIF - OTP Code',
      content: `Your OTP code is ${otpCode} and will expire in 10 minutes. Please, do not share this code with anyone.`,
    });
  } catch (err) {
    throw err;
  }
};
