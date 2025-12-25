// Web-adapted Validations - Alert handlers
import { useTranslation } from 'react-i18next';

export const weeklyOffShopAlertHandler = (
  onPressAction: (action: boolean) => void,
) => {
  const confirmed = window.confirm(
    'SHOP IS CLOSED TODAY\nDO YOU WANT TO CONTINUE YOUR ACTIVITY'
  );
  if (confirmed) {
    onPressAction(true);
  } else {
    onPressAction(false);
  }
};

export const ShopCheckOutAlertHandler = (
  partyName: string,
  fromShopCheckout: boolean,
  onPressAction: (onPress: boolean) => void,
) => {
  const confirmed = window.confirm(
    `You are currently checked in at ${partyName}. Do you want to checkout?`
  );
  if (confirmed) {
    onPressAction(true);
  } else {
    onPressAction(false);
  }
};

// Other validation functions can be added here as needed
export const limitReachedAlert = (t: any, alertKey: string) => {
  window.alert(alertKey + ' ' + (t('Alerts.AlertLimitReached') || 'Limit Reached'));
};

export const rateChangeAlert = (t: any, onPressAction: any) => {
  const confirmed = window.confirm(
    (t('Alerts.AlertValidationEditRateTitle') || 'Edit Rate') + '\n' +
    (t('Alerts.AlertValidationEditRateMsg') || 'Do you want to change the rate?')
  );
  if (confirmed) {
    onPressAction(true);
  } else {
    onPressAction(false);
  }
};

export const ORDER_BOXES_NAME = ['BOX', 'BTL', 'FREEBOX', 'FREEBTL'];

export const handleBackBtn = (t: any, onPressAction: any) => {
  const confirmed = window.confirm(
    t('Alerts.AlertDiscardOrderMsg') || 'Do you want to discard this order?'
  );
  if (confirmed) {
    onPressAction(true);
  }
};

export const orderSavePopUp = (
  t: any,
  isDataCollection: boolean,
  onPressAction: (action: boolean) => void,
) => {
  const title = (t('Alerts.AlertDoYouWantToSaveTitle1') || 'Do you want to save') +
    (isDataCollection
      ? (t('Alerts.AlertDoYouWantToSaveTitle2') || ' Data Collection')
      : (t('Alerts.AlertDoYouWantToSaveTitle3') || ' Order')) + '!';
  
  const confirmed = window.confirm(title);
  if (confirmed) {
    onPressAction(true);
  } else {
    onPressAction(false);
  }
};

export const discardPopUp = (
  t: any,
  isDiscardPress: (action: boolean) => void,
) => {
  const confirmed = window.confirm(
    t('Alerts.AlertDiscardOrderTitle2') || 'Do you want to discard?'
  );
  if (confirmed) {
    isDiscardPress(true);
  } else {
    isDiscardPress(false);
  }
};

export const weeklyOffOrderAlertHandler = (
  onPressAction: (action: boolean) => void,
) => {
  const confirmed = window.confirm(
    'SHOP IS CLOSED ON SELECTED DELIVERY DATE\nYOU WANT TO CONTINUE WITH THIS DATE ?'
  );
  if (confirmed) {
    onPressAction(true);
  } else {
    onPressAction(false);
  }
};

export const filterITEMSEQUENCEName = (ItemName: string): string => {
  const index = ItemName.indexOf('}');
  return index >= 0 ? ItemName.slice(index + 1) : ItemName;
};


