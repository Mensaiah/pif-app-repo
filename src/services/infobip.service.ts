import axios from 'axios';

import appConfig from '../config';
import { consoleLog } from '../utils/helpers';

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
    const response = await axios.post(url, data, { headers });
    consoleLog(response.data);
    consoleLog(
      `SMS sent to ${data.to}. Message ID: ${response.data.messages[0].messageId}`
    );
  } catch (error) {
    consoleLog('Error sending SMS:', error);
  }
}
