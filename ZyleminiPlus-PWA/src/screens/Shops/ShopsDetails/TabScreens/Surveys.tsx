// Web-adapted Surveys TabScreen - Structured placeholder
// TODO: Complete implementation with database functions and component integration
import React, { useCallback, useState, useEffect } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import useLocation from '../../../../hooks/useLocation';
import { useNetInfo } from '../../../../hooks/useNetInfo';
import { useNavigate } from 'react-router-dom';
import { ScreenName } from '../../../../constants/screenConstants';
import {
  getAppOrderId,
  getCurrentDate,
  getCurrentDateTime,
  writeErrorLog,
} from '../../../../utility/utils';
// TODO: Import database functions when available
// import { ActivitySavedForShop, getAvailableServey, getAvailableServey1, getDbURLSurvey, insertOrderMastersss } from '../../../../database/WebDatabaseHelpers';
// TODO: Import component when available
// import SurveyList1 from './Component/SurveyList1';
// import SurveyList2 from './Component/SurveyList2';

interface OrderProps {
  navigation?: any;
  route?: {
    params?: any;
  };
}

const Surveys = (props: OrderProps) => {
  const navigate = useNavigate();
  const { isDarkMode } = useGlobleAction();
  const { selectedShopData } = useShopAction();
  const { userId } = useLoginAction();
  const { latitude, longitude } = useLocation();
  const { t } = useTranslation();
  const { isNetConnected } = useNetInfo();

  const [surveyList1, setSurveyList1] = useState<any[]>([]);
  const [surveyList2, setSurveyList2] = useState<any[]>([]);
  const [distId, setDistID] = useState('');
  const [DbUrl, setDbUrl] = useState('');

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async () => {
    try {
      // TODO: Implement database calls
      // getAvailableServey().then(data => setSurveyList1(data));
      // getAvailableServey1().then(data => setSurveyList2(data));
      // ActivitySavedForShop(selectedShopData?.shopId, userId).then(data => setDistID(data[0]?.DefaultDistributorId));
      // getDbURLSurvey().then(data2 => setDbUrl(data2[0]?.Value));
      console.log('Surveys: takeDataFromDB - TODO: Implement database calls');
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
    }
  };

  const takeSurveyBtn = async () => {
    if (!isNetConnected) {
      window.alert(
        `${t('Alerts.InternetConnectionUnavailable')}\n${t('Alerts.IntenetConnectionUnavailableMsg')}`
      );
      return;
    }

    const curDateTime = await getCurrentDateTime();
    const curDate = await getCurrentDate();
    const app_order_id = await getAppOrderId(userId);

    let concatUrl =
      DbUrl +
      `&EvaluationMasterID=${1}&OutletId=${selectedShopData?.shopId}&OrderId=${app_order_id}`;

    // TODO: Implement insertOrderMastersss
    // await insertOrderMastersss(...);

    // TODO: Navigate to survey webview
    // navigate(ScreenName.SURVEYWEBVIEW, { state: { url: concatUrl, partyName: selectedShopData?.party } });
    console.log('Surveys: takeSurveyBtn - TODO: Implement survey navigation');
  };

  return (
    <CustomSafeView isScrollView={true}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '2vh',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: Colors.mainBackground,
              fontSize: '18px',
              fontWeight: 'bold',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {surveyList2.length}
          </Typography>
          <Typography
            sx={{
              color: '#8C7878',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '0.5vh',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {t('Survey.SurveyTaken') || 'Survey Taken'}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              color: Colors.mainBackground,
              fontSize: '18px',
              fontWeight: 'bold',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {surveyList1.length}
          </Typography>
          <Typography
            sx={{
              color: '#8C7878',
              fontSize: '12px',
              fontWeight: 'bold',
              marginTop: '0.5vh',
              alignSelf: 'center',
              fontFamily: 'Proxima Nova, sans-serif',
            }}
          >
            {t('Survey.SurveyAvailableSurvey') || 'Available Survey'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginTop: '10px', backgroundColor: Colors.border }} />

      {/* TODO: Render SurveyList1 components */}
      {surveyList1?.map((item, index: number) => (
        <Box key={index} sx={{ marginTop: '2vh' }}>
          {/* TODO: <SurveyList1 CompanyName={item.CompanyName} PublishedDate={item.PublishedDate} SurveyName={item.SurveyName} /> */}
          <Typography>{item.SurveyName || 'Survey Item'}</Typography>
        </Box>
      ))}

      <Box
        sx={{
          marginTop: '0.8vh',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#E6DFDF',
            height: '10vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: '2vh',
          }}
        >
          <Typography
            sx={{
              flex: 6,
              marginLeft: '10vw',
              color: '#362828',
              fontWeight: 'bold',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '12px',
            }}
          >
            {t('Survey.SurveyPastSurvey') || 'Past Survey'}
          </Typography>
          <Typography
            sx={{
              flex: 1,
              color: Colors.mainBackground,
              fontWeight: 'bold',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '12px',
            }}
          >
            {surveyList2.length}
          </Typography>
        </Box>
      </Box>

      {/* TODO: Render SurveyList2 components */}
      {surveyList2?.map((item, index: number) => (
        <Box key={index} sx={{ marginTop: '2vh' }}>
          {/* TODO: <SurveyList2 CompanyName={item.CompanyName} PublishedDate={item.PublishedDate} SurveyName={item.SurveyName} /> */}
          <Typography>{item.SurveyName || 'Past Survey Item'}</Typography>
        </Box>
      ))}

      {DbUrl && (
        <Button
          onClick={takeSurveyBtn}
          sx={{
            marginTop: '10vh',
            alignSelf: 'center',
            backgroundColor: '#362828',
            height: '45px',
            width: '40%',
            borderRadius: '10px',
            borderWidth: '1px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#362828',
              opacity: 0.9,
            },
          }}
        >
          <Typography
            sx={{
              color: '#ffffff',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '18px',
              fontWeight: '500',
            }}
          >
            {t('Survey.SurveyTakeSurvey') || 'Take Survey'}
          </Typography>
        </Button>
      )}

      <Box sx={{ paddingBottom: '100px' }} />
    </CustomSafeView>
  );
};

export default Surveys;


