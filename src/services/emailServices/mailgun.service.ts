import { Buffer } from 'buffer';

import axios from 'axios';
import qs from 'qs';

import appConfig from '../../config';

const authToken = Buffer.from(
  `api:${appConfig.mailgunConfigs.apiKey}`,
  'utf8'
).toString('base64');

type SendMailArgs = {
  to: string;
  subject?: string;
  content: string;
};

export async function sendMail({ to, subject, content }: SendMailArgs) {
  try {
    const { data } = await axios.post(
      'https://api.mailgun.net/v3/auto-dev.codevillage.ng/messages',
      qs.stringify({
        from: 'pif@auto-dev.codevillage.ng',
        to,
        subject,
        html: content,
      }),
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authToken}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
}

// sendMail({
//   to: 'kgasta@gmail.com, jimohafeez738@gmail.com',
//   subject: 'final test email',
//   content: `Hello,
//     <br>
//     <br>
// You've been invited to join the PIF Platform as an admin. Click the link below to join <br>
// https://pif-dashboard.web.app/auth/invitations/{uuid} <br><br>
// If you think this is a mistake, please ignore this email.
// <br>
// <br>
// <br>
// Regards,
// <br>
// Pif Team.
//   `,
// });
