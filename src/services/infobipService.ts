import { consoleLog } from 'src/utils/helpers';
import appConfig from '../config';
import axios from 'axios';

const sendSms = async () => {
  try {
    const response = await axios.post(
      'https://9ry5jr.api.infobip.com/sms/2/text/advanced',
      {
        body: JSON.stringify({
          messages: [
            {
              destinations: [
                {
                  to: 2348103498784,
                },
              ],
              from: 'Aweds',
              text: 'Hello Sir, If you get this it is from Aweds, it means infobip is working',
            },
          ],
        }),
        headers: {
          Authorization: `Basic ${appConfig.infoBipApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const res = await response.data;
    consoleLog(res);
  } catch (err) {
    consoleLog(err);
  }
};

//working
async function sendSms2() {
  const url = 'https://9ry5jr.api.infobip.com/sms/2/text/single';
  const headers = {
    Authorization: `App ${appConfig.infoBipApiKey}`,
    'Content-Type': 'application/json',
  };
  const data = {
    from: 'Aweds',
    to: 2348103498784,
    text: 'Hello Sir, If you get this it is from Aweds, it means infobip is working',
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
sendSms2();
