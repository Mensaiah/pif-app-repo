import { sendMail } from '../../../../services/emailServices';
import { capitalize } from '../../../../utils/helpers';

export const sendPartnerAdminInviteMail = ({
  to,
  url,
  adminName,
  partnerName,
}: {
  to: string;
  url: string;
  adminName: string;
  partnerName: string;
}) =>
  sendMail({
    to,
    subject: 'PIF Invitation',
    content: `Hi ${capitalize(adminName)},
    <br>
    <br>
You've been invited as an admin of ${capitalize(
      partnerName
    )} on PIF Platform. Please click on this link below to accept the invitation. <br>
${url} <br><br>
<small>This link expires in 24 hrs</small>
<br><br>
If you think this is a mistake, please ignore this email.
<br>
<br>
<br>
Regards,
<br>
Pif Team.
  `,
  });
