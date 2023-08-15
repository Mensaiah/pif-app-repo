import { Client } from 'onesignal-node';

import appConfig from '../config';
import { LanguageCode } from '../types/global';
import { consoleLog } from '../utils/helpers';

type NotificationMessage = Record<LanguageCode, string>;

const OneSignalService = (() => {
  const client = new Client(
    appConfig.oneSignalAppId,
    appConfig.oneSignalApiKey
  );

  class _OneSignalService {
    static async sendNotification({
      message,
      playerIds,
      marketplaces,
      options,
    }: {
      message: NotificationMessage;
      playerIds?: string[];
      marketplaces?: string[];
      options?: any;
    }) {
      const notification = {
        headings: {},
        contents: message, // Assuming message is an object like { en: 'English message', de: 'German message' }
        include_player_ids: playerIds,
        filters: marketplaces?.map((m) => ({
          field: 'tag',
          key: 'marketplace',
          relation: '=',
          value: m,
        })),
        ...options,
      };

      try {
        const response = await client.createNotification(notification);
        return response;
      } catch (e) {
        consoleLog('Error sending notification: ' + e);
        throw e;
      }
    }
  }

  return _OneSignalService;
})();

export default OneSignalService;
