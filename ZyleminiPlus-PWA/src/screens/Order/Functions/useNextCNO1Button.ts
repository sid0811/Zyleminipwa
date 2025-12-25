import { useNavigate } from 'react-router-dom';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import {
  entityTypes,
  getCurrentDate,
  getCurrentDateTime,
} from '../../../utility/utils';
import { ScreenName } from '../../../constants/screenConstants';
import { useTranslation } from 'react-i18next';

export const useNextCNO1Button = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    setEntityType,
    setSelectedBeat,
    setSelectedOutlet,
    setSelectedDist,
    setSavedStartTime,
    setIsDataCollection,
    setOrderDate,
    setExpectedOrderDate,
  } = useOrderAction();

  const onNextPress = async (
    entity: any,
    selectedBeat: any,
    OId: string,
    OName: string,
    selectedDist: any,
    isFromDataCollection: boolean,
    navigation?: any,
  ) => {
    const takeDateTime = await getCurrentDateTime();
    const currentDate = await getCurrentDate();

    if (entity.value == entityTypes[0].value) {
      if (OId && selectedBeat?.RouteID && selectedDist?.DistributorID) {
        setEntityType(entity);
        setSelectedBeat(selectedBeat);
        setSelectedOutlet({ OName, OId });
        setSelectedDist(selectedDist);
        setSavedStartTime(takeDateTime);
        setIsDataCollection(isFromDataCollection);
        setOrderDate(currentDate);
        setExpectedOrderDate(currentDate);

        setTimeout(() => {
          if (navigation?.navigate) {
            navigation.navigate(ScreenName.CREATENEWORDER2);
          } else {
            navigate(`/${ScreenName.CREATENEWORDER2}`);
          }
        }, 200);
      } else {
        if (OName === undefined) {
          window.alert(t('Alerts.AlertPleaseSelectOutletMsg'));
        } else {
          window.alert(t('Alerts.AlertPleaseSelectOutletMsg'));
        }
      }
    } else {
      if (selectedDist?.DistributorID) {
        setEntityType(entity);
        setSelectedBeat(selectedBeat);
        setSelectedOutlet({ OName, OId });
        setSelectedDist(selectedDist);
        setSavedStartTime(takeDateTime);
        setIsDataCollection(isFromDataCollection);
        setOrderDate(currentDate);
        setExpectedOrderDate(currentDate);

        setTimeout(() => {
          if (navigation?.navigate) {
            navigation.navigate(ScreenName.CREATENEWORDER2);
          } else {
            navigate(`/${ScreenName.CREATENEWORDER2}`);
          }
        }, 200);
      } else {
        window.alert(t('Alerts.AlertPleaseSelectOutletMsg'));
      }
    }
  };

  return { onNextPress };
};

