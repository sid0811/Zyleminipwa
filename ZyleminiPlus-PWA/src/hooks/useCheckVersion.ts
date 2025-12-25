import {useTranslation} from 'react-i18next';
import {useLoginAction} from '../redux/actionHooks/useLoginAction';
import {checkVersionCore, Pair} from '../core/checkVersionCore';
import {APP_VERSION_CHECK} from '../constants/screenConstants';

export const useCheckVersion = () => {
  const {t} = useTranslation();
  const {token} = useLoginAction();
  const headers1 = {
    authheader: token,
  };

  const checkVersionForUpdateAlert = async (callBackParentUi: (pair : Pair)=> void) => {
    await checkVersionCore({
      token,
      minVersion: APP_VERSION_CHECK,
      callBack : (pair: Pair)=>{
        if (pair.isVersionUpdate) {
          if (window.confirm(t('Alerts.AlertUpdateMsg'))) {
            pair.platfromUrl && window.open(pair.platfromUrl, '_blank');
          }
        }

        callBackParentUi(pair)

      }
    });
  };

  return {checkVersionForUpdateAlert};
};

