import appConfig from '../../config';

const NetsService = (() => {
  const authHeader = {
    headers: {
      Authorization: `Bearer ${appConfig.netsTestSecretKey}`,
    },
  };

  class _NetsService {
    // static createPaymentLink = async () => {};
  }

  return _NetsService;
})();

export default NetsService;
