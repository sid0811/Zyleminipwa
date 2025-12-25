import moment from 'moment';
import {
  ActivitySavedForDist,
  ActivitySavedForOther,
  ActivitySavedForShop,
  checkMeetingInOrderMaster,
  deleteMJPMasterData,
  getMeetForSyncByVibha,
  getOrderIdForShop,
  InsertMeet,
  insertOrderMastersssForMeetingCancel,
  MeetDraftDetails,
  updateCheckoutOrderMasterWOStart,
  UpdateDraft,
} from '../../../../database/WebDatabaseHelpers';
import {
  calculateDaysDifference,
  COLLECTION_TYPE,
  currentTimeData,
  getAppOrderId,
  getCurrentDate,
  getCurrentDateTime,
  getCurrentDateTimeT,
  getSplittedPlannedDate,
  getSplittedTime,
  getTimeFormatWithT,
  writeErrorLog,
} from '../../../../utility/utils';

export const ShopCheckOutFunc = async (
  shopId: string,
  persistedStartTime: string,
  latitude: number | string,
  longitude: number | string,
  isRemark: string = '',
  setStateCallbacks: {
    setPersistStartTime: (time: string) => void;
    setBlockedShopDetail: (details: any) => void;
    setIsShopCheckIn: (isCheckedIn: boolean) => void;
  },
  currentIsShopCheckedIn: boolean,
  t: any,
) => {
  try {
    const curDateTime = await getCurrentDateTime();
    const curDate = await getCurrentDate();

    const appID = await getOrderIdForShop(
      shopId,
      moment(persistedStartTime).format('DD-MMM-YYYY'),
    );

    await updateCheckoutOrderMasterWOStart(
      appID[0].id,
      '4',
      shopId,
      curDate,
      curDateTime,
      latitude,
      longitude,
      isRemark,
    );

    // Update state
    setStateCallbacks.setPersistStartTime('');
    setStateCallbacks.setBlockedShopDetail({});
    setStateCallbacks.setIsShopCheckIn(!currentIsShopCheckedIn);

    // Show success message (web version)
    alert(t('Alerts.AlertSuccessfullyCheckOutMsg'));

    return { success: true };
  } catch (err) {
    writeErrorLog('ShopCheckOutFunc', err);
    console.log('ShopCheckOutFunc error', err);
    return { success: false, error: err };
  }
};

// Meeting End on Alert Button
const takeDefaultDistributorFromEntityType = async (
  EntityType: string,
  EntityTypeID: string,
  userId: string,
) => {
  if (EntityType === '1') {
    const data = await ActivitySavedForShop(EntityTypeID, userId);
    return data[0].DefaultDistributorId;
  } else if (EntityType === '2') {
    const data: any = await ActivitySavedForDist(EntityTypeID, userId);
    return data[0]?.DistributorID;
  } else if (EntityType === '3') {
    const data: any = await ActivitySavedForOther(EntityTypeID, userId);
    return data[0]?.DistributorID;
  }
};

// Meeting End on Alert Button
export const SaveMeetingForEndAndSubmitButton = async (
  Remarks = '',
  Meeting_Id: string,
  EntityTypeID: string,
  ActivityTitle: string,
  PlannedDate: string,
  IsActivityDone: string,
  EntityType: string,
  persistedStartTime: string,
  latitude: number | string,
  longitude: number | string,
  userId: string,
  setStateCallbacks: {
    setPersistStartTime: (time: string) => void;
    setBlockedShopDetail: (details: any) => void;
    setIsShopCheckIn: (isCheckedIn: boolean) => void;
  },
  t: any,
) => {
  const DistId: any = await takeDefaultDistributorFromEntityType(
    EntityType,
    EntityTypeID,
    userId,
  );

  const app_order_id = await getAppOrderId(userId);
  let diffInDays = calculateDaysDifference(PlannedDate); // check if the planneddate is previous date then current date to handle back dated flow

  try {
    const draftData = await MeetDraftDetails(Meeting_Id);
    
    if ((draftData as any[]).length !== 0) {
      await UpdateDraft(Remarks, Meeting_Id);
      await submitReport(
        app_order_id,
        Meeting_Id,
        DistId || '0',
        EntityType,
        persistedStartTime,
        PlannedDate,
        userId,
        setStateCallbacks,
        t,
        diffInDays,
      );
    } else {
      let datee = moment().format('DD-MMM-YYYY');
      const { _day, _monthAbbr, _year } = getSplittedPlannedDate(PlannedDate);
      if (diffInDays !== 0) {
        datee = PlannedDate;
      }
      const { splittedHour, splittedMinutes, splittedSeconds } = getSplittedTime(
        persistedStartTime!,
        getTimeFormatWithT,
      );
      
      await InsertMeet(
        app_order_id,
        Meeting_Id,
        EntityTypeID,
        ActivityTitle,
        PlannedDate,
        '',
        '',
        Remarks,
        IsActivityDone,
        EntityType,
        COLLECTION_TYPE.MEETING,
        latitude,
        longitude,
        '',
        userId,
        datee,
        DistId === undefined ? '0' : DistId,
        diffInDays !== 0
          ? _year +
            '-' +
            moment(_monthAbbr, 'MMM').format('MM') +
            '-' +
            _day +
            'T' +
            splittedHour +
            ':' +
            splittedMinutes +
            ':' +
            splittedSeconds
          : persistedStartTime,
        datee,
        '',
      );
      
      await submitReport(
        app_order_id,
        Meeting_Id,
        DistId || '0',
        EntityType,
        persistedStartTime,
        PlannedDate,
        userId,
        setStateCallbacks,
        t,
        diffInDays,
      );
    }
  } catch (error) {
    writeErrorLog('SaveMeetingForEndAndSubmitButton', error);
    console.error('SaveMeetingForEndAndSubmitButton Error:', error);
    return { success: false, error };
  }
};

const submitReport = async (
  app_order_id: string,
  Meeting_Id: string,
  DistId: string,
  EntityType: string,
  persistedStartTime: string,
  PlannedDate: string,
  userId: string,
  setStateCallbacks: {
    setPersistStartTime: (time: string) => void;
    setBlockedShopDetail: (details: any) => void;
    setIsShopCheckIn: (isCheckedIn: boolean) => void;
  },
  t: any,
  diffInDays: number,
) => {
  try {
    console.log('\n DistId submit rep -->', DistId);
    const dataMaster: any = await checkMeetingInOrderMaster(Meeting_Id);

    if (dataMaster.length === 0) {
      return;
    } else {
      let currentDateTime1 = await getCurrentDateTimeT();
      const { hours, min, sec } = currentTimeData();
      const { _day, _monthAbbr, _year } = getSplittedPlannedDate(PlannedDate);
      const data: any = await getMeetForSyncByVibha(Meeting_Id, PlannedDate);
      
      if (data !== 0) {
        const endDateTimeautomativ = await getCurrentDate();
        if (diffInDays !== 0) {
          currentDateTime1 =
            _year +
            '-' +
            moment(_monthAbbr, 'MMM').format('MM') +
            '-' +
            _day +
            'T' +
            hours +
            ':' +
            min +
            ':' +
            sec;
          console.log(
            'getMeetForSyncByVibha :  diffInDays' + currentDateTime1,
            diffInDays,
          );
        }
        const { splittedHour, splittedMinutes, splittedSeconds } = getSplittedTime(
          persistedStartTime!,
          getTimeFormatWithT,
        );
        let updatedStartDateTime =
          _year +
          '-' +
          moment(_monthAbbr, 'MMM').format('MM') +
          '-' +
          _day +
          'T' +
          splittedHour +
          ':' +
          splittedMinutes +
          ':' +
          splittedSeconds;
        console.log(
          'getMeetForSyncByVibha :  diffInDays' + currentDateTime1,
          diffInDays,
        );
        
        await insertOrderMastersssForMeetingCancel(
          app_order_id,
          currentDateTime1,
          data[0].Type_sync,
          data[0].Shop_Id,
          data[0].latitude,
          data[0].longitude,
          '0',
          data[0].FromDate,
          endDateTimeautomativ,
          COLLECTION_TYPE.MEETING,
          data[0].UserID,
          '',
          '1',
          'N',
          '',
          DistId || '0',
          currentDateTime1,
          EntityType,
          diffInDays !== 0 ? updatedStartDateTime : persistedStartTime,
          currentDateTime1,
          userId,
        );
        
        await deleteMJPMasterData();

        // Show success message (web version)
        alert(t('Alerts.AlertMeetingSubmittedSuccessfullyMsg'));
        
        setStateCallbacks.setIsShopCheckIn(false);
        setStateCallbacks.setPersistStartTime('');
        setStateCallbacks.setBlockedShopDetail({});
        
        return { success: true };
      }
    }
  } catch (error) {
    writeErrorLog('submitReport', error);
    console.error('Error:', error);
    return { success: false, error };
  }
};
