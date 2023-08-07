import { sendMail } from '../../../../services/emailServices';

export const sendPlatformInviteMail = ({
  to,
  url,
}: {
  to: string;
  url: string;
}) =>
  sendMail({
    to,
    subject: 'PIF Invitation',
    content: `Hello,
    <br>
    <br>
You've been invited to join the PIF Platform as an admin. Click the link below to join <br>
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
