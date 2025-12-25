import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import { checkallordersinordermaster } from '../../database/WebDatabaseHelpers';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import Header from '../../components/Header/Header';
import Loader from '../../components/Loader/Loader';
import LoadingSkeleton from '../../components/Loading/LoadingSkeleton';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import { writeErrorLog, writeReportsLog } from '../../utility/utils';
import { Colors } from '../../theme/colors';

const MyActivityReport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const propsData = routerLocation.state?.propsData || {};
  
  const [loading, setLoading] = useState(false);
  const [dataOrder, setDataOrder] = useState<any>([]);
  const [openIndex, setOpenIndex] = useState<number[]>([]);
  const { userId } = useLoginAction();

  console.log('Propsfatareport', propsData);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      writeReportsLog('My Activity Report');
      
      const currentdate = moment().format('DD-MMM-YYYY');
      const yesterdaysdate = moment().subtract(1, 'day').format('DD-MMM-YYYY');
      const dayafteryesterdays = moment().subtract(2, 'day').format('DD-MMM-YYYY');

      const data = await checkallordersinordermaster(
        propsData.entity_id,
        currentdate,
        yesterdaysdate,
        dayafteryesterdays,
        propsData.date,
        userId,
      );
      
      setDataOrder(data);
    } catch (error) {
      writeErrorLog('MyActivityReport', error);
      console.log('error-->', error);
    } finally {
      setLoading(false);
    }
  };

  const duplicateDate = dataOrder.map((e: any) => e.from_date);
  const withoutOutDupli = [...new Set(duplicateDate)];

  const handleAccordionChange = (index: number) => {
    const isOpened = openIndex.includes(index);
    if (!isOpened) {
      setOpenIndex([index]);
    } else {
      setOpenIndex([]);
    }
  };

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
      0: '#2196F3', // Order - Blue
      1: '#4CAF50', // Data Collection - Green
      2: '#4CAF50',
      3: '#FF9800', // Image - Orange
      4: '#9C27B0', // Check In - Purple
      5: '#00BCD4', // Asset - Cyan
      6: '#795548', // Activity - Brown
      7: '#F44336', // Collection - Red
      8: '#8BC34A', // Day Start - Light Green
      9: '#607D8B', // Day End - Blue Grey
    };
    return colors[collectionType] || '#757575';
  };

  const ActivityUI = ({ item1, index1 }: any) => {
    const Quantity = parseFloat(item1.quantity_one || 0) + parseFloat(item1.quantity_two || 0);

    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 1,
          borderLeft: `4px solid ${getActivityColor(item1.collection_type)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mr: 2 }}>
            {moment(item1.ActivityStart).format('hh:mm A')}
          </Typography>
          <Chip
            label={getActivityTypeLabel(item1.collection_type)}
            size="small"
            sx={{
              backgroundColor: getActivityColor(item1.collection_type),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 11,
            }}
          />
        </Box>

        {item1.collection_type === 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: 13, mb: 0.5 }}>
              <strong>Product:</strong> {item1.Item}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13 }}>
                <strong>Quantity:</strong> {Quantity}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                <strong>Value:</strong> ₹{item1.Amount}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                <strong>Discount:</strong> {item1.Discount || 'N/A'}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    );
  };

  const ActivityUI1 = ({ item1, index1 }: any) => {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 1,
          borderLeft: `4px solid ${getActivityColor(item1.collection_type)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, mr: 2 }}>
            {item1.collection_type === 4
              ? moment(item1.ActivityEnd).format('hh:mm A')
              : ''}
          </Typography>
          {item1.collection_type === 4 && (
            <Chip
              label="CHECK OUT"
              size="small"
              sx={{
                backgroundColor: getActivityColor(4),
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          )}
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <CustomSafeView edges={['bottom']}>
        <Header
          title={t('MyActivityReport.MyActivityReportActionBarText')}
          navigation={{ goBack: () => navigate(-1) }}
        />
        <LoadingSkeleton variant="list" count={5} />
      </CustomSafeView>
    );
  }

  return (
    <>
      <Loader visible={loading} />
      <CustomSafeView edges={['bottom']}>
        <Header
          title={t('MyActivityReport.MyActivityReportActionBarText')}
          navigation={{ goBack: () => navigate(-1) }}
        />

        <Box sx={{ p: 2 }}>
          {withoutOutDupli.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {t('No activities found')}
              </Typography>
            </Paper>
          ) : (
            withoutOutDupli.map((dateItem: any, index: number) => (
              <Accordion
                key={index}
                expanded={openIndex.includes(index)}
                onChange={() => handleAccordionChange(index)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: Colors.primary,
                    color: Colors.white,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: Colors.primaryDark,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      pr: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                      {moment(dateItem).format('DD MMM YYYY')}
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>
                      {dataOrder.filter((item: any) => item.from_date === dateItem).length}{' '}
                      {t('activities')}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  {/* Regular Activities */}
                  {dataOrder
                    .filter((item1: any) => item1.from_date === dateItem)
                    .map((item1: any, index1: number) => (
                      <ActivityUI key={`activity-${index1}`} item1={item1} index1={index1} />
                    ))}

                  {/* Check Out Activities */}
                  {dataOrder
                    .filter(
                      (item1: any) =>
                        item1.from_date === dateItem && item1.collection_type === 4
                    )
                    .map((item1: any, index1: number) => (
                      <ActivityUI1 key={`checkout-${index1}`} item1={item1} index1={index1} />
                    ))}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </CustomSafeView>
    </>
  );
};

export default MyActivityReport;
