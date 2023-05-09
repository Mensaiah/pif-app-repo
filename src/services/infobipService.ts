import { consoleLog } from 'src/utils/helpers';
import appConfig from '../config';
// import { consoleLog } from '../utils/helpers';
import axios from 'axios';

export const sendSms = async () => {
  try {
    const { data } = await axios.post(
      'https://9ry5jr.api.infobip.com/sms/2/text/advanced',
      {
        body: {
          messages: [
            {
              destinations: [
                {
                  to: '2348168861541',
                },
              ],
              from: 'InfoSMS',
              text: 'This is a sample message',
            },
          ],
        },
        headers: {
          Authorization:
            'App 003026bbc133714df1834b8638bb496e-8f4b3d9a-e931-478d-a994-28a725159ab9',
        },
      }
    );
    consoleLog(data);
  } catch (err) {
    consoleLog(err.response.data);
  }
};
consoleLog(':::' + appConfig.infoBipApiKey);
sendSms();
