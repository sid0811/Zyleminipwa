import { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Colors } from '../../theme/colors';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import { ScreenName, AccessControlKeyConstants } from '../../constants/screenConstants';
import { writeErrorLog, writeReportsLog, MyReportListData, isAccessControlProvided } from '../../utility/utils';
import { getClassificationfromDBReport1, getClassificationfromDBReport2 } from '../../database/WebDatabaseHelpers';
import { SideMenuIcon } from '../../constants/AllImages';

interface ReportItem {
  LabelName: string;
  IsActive: string;
}

const MyReportList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();

  const [report1Data, setReport1Data] = useState<ReportItem[]>([]);
  const [report2Data, setReport2Data] = useState<ReportItem[]>([]);

  useEffect(() => {
    takeReportListFromDB();
  }, []);

  const takeReportListFromDB = async () => {
    try {
      writeReportsLog('My Activity Party');
      const rep1 = await getClassificationfromDBReport1();
      setReport1Data(rep1 as ReportItem[]);
    } catch (error) {
      writeErrorLog('MyReportList', error);
    }
    try {
      const rep2 = await getClassificationfromDBReport2();
      setReport2Data(rep2 as ReportItem[]);
    } catch (error) {
      writeErrorLog('getClassificationfromDBReport2', error);
    }
  };

  const MyReportListCard = ({ img, title, duration, nav }: any) => {
    return (
      <Box
        onClick={nav}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.white,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: Colors.lightGray,
          },
        }}
      >
        <img src={img} alt={title} style={{ width: 48, height: 48, marginRight: 16 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: Colors.black }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: Colors.TexthintColor }}>
            {duration}
          </Typography>
        </Box>
      </Box>
    );
  };

  const RenderItemForReport1 = ({ item }: { item: ReportItem }) => {
    return (
      <MyReportListCard
        img={SideMenuIcon.brandWiseSale}
        title={item.LabelName}
        duration={'Last 3 Months'}
        nav={() => {
          if (report1Data[0]?.IsActive.trim() === 'True') {
            navigate(`/${ScreenName.BRAND_SALE_REPORT}`);
          } else {
            alert(t('Alerts.AlertPleaseContactOrganizationTitle'));
          }
        }}
      />
    );
  };

  const RenderItemForReport2 = ({ item }: { item: ReportItem }) => {
    return (
      <MyReportListCard
        img={SideMenuIcon.targetVsAch}
        title={item.LabelName}
        duration={'Monthly'}
        nav={() => {
          if (report2Data[0]?.IsActive.trim() === 'True') {
            navigate(`/${ScreenName.TARGET_VS_ACHI_REP}`);
          } else {
            alert(t('Alerts.AlertPleaseContactOrganizationTitle'));
          }
        }}
      />
    );
  };

  const RenderItem = ({ item }: { item: any }) => {
    return (
      <MyReportListCard
        img={item.img}
        title={item.title}
        duration={item.duration}
        nav={item.nav}
      />
    );
  };

  return (
    <CustomSafeView>
      <Box sx={{ flex: 1, backgroundColor: Colors.white, padding: 2 }}>
        {report1Data?.map((item, index) => {
          return isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.REPORT_BRAND_WISE_SALES,
          ) ? (
            <RenderItemForReport1 item={item} key={index} />
          ) : null;
        })}

        {report2Data?.map((item, index) => {
          return isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.REPORT_TVA,
          ) ? (
            <RenderItemForReport2 item={item} key={index} />
          ) : null;
        })}

        {MyReportListData(t, { navigate })?.map((item, index) => {
          return isAccessControlProvided(
            getAccessControlSettings,
            item.accessKeyValue,
          ) ? (
            <RenderItem item={item} key={index} />
          ) : null;
        })}
        <Box sx={{ paddingBottom: '100px' }} />
      </Box>
    </CustomSafeView>
  );
};

export default MyReportList;
