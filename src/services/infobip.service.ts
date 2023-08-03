import axios from 'axios';

import appConfig from '../config';

type SendSmsArgs = {
  to: string | number;
  text: string;
};
export async function sendSms({ to, text }: SendSmsArgs) {
  const url = 'https://9ry5jr.api.infobip.com/sms/2/text/single';
  const headers = {
    Authorization: `App ${appConfig.infoBipApiKey}`,
    'Content-Type': 'application/json',
  };
  const data = {
    from: 'PIF',
    to,
    text,
  };

  try {
    await axios.post(url, data, { headers });

    // consoleLog(
    //   `SMS sent to ${data.to}. Message ID: ${response.data.messages[0].messageId}`
    // );
  } catch (error) {
    throw error;
  }
}
