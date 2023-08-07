import { sendMail } from '../../../../services/emailServices';

export const sendForgotPasswordCodeMail = ({
  to,
  code,
}: {
  to: string;
  code: string;
}) =>
  sendMail({
    to,
    subject: 'Reset your PIF password',
    content: `<div style="max-width: 600px; margin: 0 auto;">
      <h2 style="color: #444;">Hello,</h2>
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please use the following verification code to proceed:</p>
      <div style="background: #eee; padding: 10px; text-align: center;">
        <strong style="font-size: 1.5rem;">${code}</strong>
      </div>
      <p>This code is only valid for 15 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged. If you find this strange, please report to PIF support.</p>
      <p>Best,</p>
      <p>PIF Team</p>
    </div>
  `,
  });
