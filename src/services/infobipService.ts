import { consoleLog } from 'src/utils/helpers';
import appConfig from '../config';
// import { consoleLog } from '../utils/helpers';
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
                  to: '41793026727',
                },
              ],
              from: 'InfoSMS',
              text: 'This is a sample message',
            },
          ],
        }),
        headers: {
          Authorization: `${appConfig.infoBipApiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    consoleLog(response);
  } catch (err) {
    consoleLog(err);
  }
};
sendSms();
