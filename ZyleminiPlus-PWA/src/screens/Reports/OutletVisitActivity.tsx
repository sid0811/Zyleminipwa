import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import { ExpandMore, AccessTime } from '@mui/icons-material';
import moment from 'moment';
import { useLocation as useRouterLocation } from 'react-router-dom';

import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { checkorderbookeddetails } from '../../database/WebDatabaseHelpers';
import Header from '../../components/Header/Header';
import { Colors } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader/Loader';
import { writeErrorLog, writeReportsLog } from '../../utility/utils';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';

const OutletVisitActivity = () => {
  const [dataOrder, setdataOrder] = useState([]);
  const [openIndex, setOpenIndex] = useState<number[]>([]);
  const { userId } = useLoginAction();
  const routerLocation = useRouterLocation();
  const params = routerLocation.state || {};
  const [isLoading, setisLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setisLoading(true);
    writeReportsLog('Outlet Visit Activity');
    try {
      checkorderbookeddetails(params.entity_id, userId).then((data: any) => {
        setdataOrder(data);
      });
    } catch (error) {
      writeErrorLog('checkorderbookeddetails', error);
      console.log('error-->', error);
    } finally {
      setisLoading(false);
    }
  }, []);

  const duplicateDate = dataOrder.map((e: any) => e.from_date);
  const withoutOutDupli = [...new Set(duplicateDate)];

  const getActivityTypeLabel = (collectionType: number) => {
    const types: { [key: number]: string } = {
      0: 'ORDER BOOKED',
      1: 'DATA COLLECTED',
      2: 'DATA COLLECTED',
      3: 'IMAGE TAKEN',
      4: 'CHECK IN',
      5: 'Asset Verified',
      6: 'ACTIVITY DONE',
      7: 'COLLECTION',
      8: 'USER DAY STARTED',
      9: 'USER DAY END',
    };
    return types[collectionType] || 'UNKNOWN';
  };

  const getActivityColor = (collectionType: number) => {
    const colors: { [key: number]: string } = {
      0: '#2196F3',
      1: '#4CAF50',
      2: '#4CAF50',
      3: '#FF9800',
      4: '#9C27B0',
      5: '#00BCD4',
      6: '#8BC34A',
      7: '#FFC107',
      8: '#3F51B5',
      9: '#F44336',
    };
    return colors[collectionType] || '#757575';
  };

  const ActivityUI = ({ item1 }: any) => {
    const Quantity = parseFloat(item1.quantity_one) || 0;
    const Quantity2 = parseFloat(item1.quantity_two) || 0;
    const Quantity3 = parseFloat(item1.small_Unit) || 0;
    const Quantity4 = parseFloat(item1.large_Unit) || 0;

    return (
      <Paper
        elevation={1}
        sx={{
          mb: 1,
          p: 2,
          borderLeft: `4px solid ${getActivityColor(item1.collection_type)}`,
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ fontSize: 16, mr: 1, color: Colors.textSecondary }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, mr: 2 }}>
            {moment(item1.ActivityStart).format('hh:mm A')}
          </Typography>
          <Chip
            label={getActivityTypeLabel(item1.collection_type)}
            size="small"
            sx={{
              backgroundColor: getActivityColor(item1.collection_type),
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 10,
            }}
          />
        </Box>

        {item1.collection_type === 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: Colors.black }}>
              Product: <Typography component="span" sx={{ fontWeight: 'normal' }}>{item1.Item}</Typography>
            </Typography>
            <Typography sx={{ fontSize: 12, mt: 0.5, color: Colors.black }}>
              <strong>Quantity (Cs):</strong> {Quantity} <strong>Quantity (Btl):</strong> {Quantity2}{' '}
              <strong>Free (Cs):</strong> {Quantity4} <strong>Free (Btl):</strong> {Quantity3}
            </Typography>
          </Box>
        )}

        {(item1.collection_type === 1 || item1.collection_type === 2) && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: Colors.black }}>
              Product: <Typography component="span" sx={{ fontWeight: 'normal' }}>{item1.Item}</Typography>
            </Typography>
            <Typography sx={{ fontSize: 12, mt: 0.5, color: Colors.black }}>
              <strong>Quantity (Cs):</strong> {Quantity} <strong>Quantity (Btl):</strong> {Quantity2}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const ActivityUI1 = ({ item1 }: any) => {
    return (
      <Paper
        elevation={1}
        sx={{
          mb: 1,
          p: 2,
          borderLeft: `4px solid ${getActivityColor(item1.collection_type)}`,
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime sx={{ fontSize: 16, mr: 1, color: Colors.textSecondary }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, mr: 2 }}>
            {moment(item1.ActivityStart).format('hh:mm A')}
          </Typography>
          <Chip
            label="CHECK OUT"
            size="small"
            sx={{
              backgroundColor: '#F44336',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 10,
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 12, color: Colors.textSecondary, mt: 1 }}>
          {moment(item1.ActivityEnd).format('hh:mm A')}
        </Typography>
      </Paper>
    );
  };

  const ActivityBox = ({ item, index }: any) => {
    const isOpen = openIndex.includes(index);

    return (
      <Accordion
        expanded={isOpen}
        onChange={() => {
          if (!isOpen) {
            setOpenIndex([index]);
          } else {
            setOpenIndex([]);
          }
        }}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: Colors.textPrimary }}>
            {item}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {dataOrder?.map((item1: any, index1: any) => {
              if (item1.from_date === item && item1.collection_type !== 4) {
                return <ActivityUI key={index1} item1={item1} />;
              }
              return null;
            })}

            {dataOrder?.map((item1: any, index1: any) => {
              if (item1.from_date === item && item1.collection_type === 4) {
                return <ActivityUI1 key={index1} item1={item1} />;
              }
              return null;
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <Loader visible={isLoading} />
      <CustomSafeView edges={['bottom']}>
        <Header
          title={t('OutletVisitActivities.OutletVisitActivitiesActionBarText')}
          navigation={{ back: () => window.history.back() }}
        />

        <Box sx={{ p: 2 }}>
          {withoutOutDupli.length > 0 ? (
            withoutOutDupli.map((item: any, index: number) => (
              <ActivityBox key={index} item={item} index={index} />
            ))
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
              }}
            >
              <Typography variant="body1" color="textSecondary">
                {t('No activities found')}
              </Typography>
            </Box>
          )}
        </Box>
      </CustomSafeView>
    </>
  );
};

export default OutletVisitActivity;
