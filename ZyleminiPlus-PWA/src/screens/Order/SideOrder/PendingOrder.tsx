import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import Loader from '../../../components/Loader/Loader';
import {
  getPendingDiscount,
  getPendingOrders,
  getPendingOrdersdetails,
} from '../../../database/WebDatabaseHelpers';
import {
  pendingDiscount,
  pendingOrderDetail,
  pendingOrders,
} from '../../../types/types';
import { writeErrorLog } from '../../../utility/utils';

let selectedId = '';

export default function PendingOrders(props: any): React.ReactElement {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [dataOrder, setdataOrder] = useState<pendingOrders[]>([]);
  const [dataOrderdetail, setdataOrderdetail] = useState<pendingOrderDetail[]>([]);
  const [dataDiscount, setdataDiscount] = useState<pendingDiscount[]>([]);
  const [id, setid] = useState('');
  const [expandedId, setExpandedId] = useState<string>('');

  const { userId } = useLoginAction();

  useEffect(() => {
    try {
      setLoading(true);
      getPendingOrders(userId).then(data => {
        setdataOrder(data);
      });
      getPendingDiscount(userId).then(data2 => {
        setdataDiscount(data2);
      });
      getPendingOrdersdetails(userId).then(data1 => {
        setdataOrderdetail(data1);
      });
    } catch (error) {
      writeErrorLog('PendingOrders', error);
      console.log('error-->', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sumSQTY = (id: string): number => {
    return dataOrderdetail
      .filter(item => item.Id === id)
      .reduce((total, item) => total + parseInt(item.POD_SQTY || '0', 10), 0);
  };

  const resultfQTY = (id: string): number => {
    return dataOrderdetail
      .filter(item => item.Id === id)
      .reduce((total, item) => total + parseInt(item.POD_FQTY || '0', 10), 0);
  };

  const TotalDisc = dataDiscount?.map((item1: any) => {
    if (item1.Id == selectedId) {
      return parseInt(item1.POD_TOTALDISCOUNT);
    } else return 0;
  });
  
  const resultDiscount = TotalDisc.reduce((prev, cur) => {
    return prev + cur;
  }, 0);

  const ActivityUI = ({ item, index }: any): React.ReactElement => {
    const isOpen = expandedId === item.Id;

    return (
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          borderColor: '#00000029',
          border: '1px solid #00000029',
          borderRadius: 1.25,
          mt: 1,
          mx: 2.5,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 'bold', color: '#362828', fontSize: 14 }}>
              {item.Party}
            </Typography>
            <Typography
              onClick={() => {
                setExpandedId(isOpen ? '' : item.Id);
                setid(item.Id);
                selectedId = item.Id;
              }}
              sx={{ color: '#3955CB', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}
            >
              {t('PendingOrder.PendingOrderDetails')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderOrderNo')}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#362828', mt: 0.5 }}>
                {item.POM_DOC_NO}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderOrderDate')}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#362828', mt: 0.5 }}>
                {item.POM_DOC_DATE.slice(0, 10)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderOrderAmount')}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#362828', mt: 0.5 }}>
                {item.POM_DOC_AMOUNT}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Collapse in={isOpen}>
          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #00000029',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderProductName')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderLifCsBtl')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderFrCsBtl')}
              </Typography>
            </Box>

            {dataOrderdetail?.map((item1: any, index1: number) => {
              if (item1.Id == selectedId) {
                return (
                  <Box key={index1} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item1.POD_ITEM_NAME}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item1.POD_SQTY}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item1.POD_FQTY}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #E0E0E0' }}>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderTotalQty')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {sumSQTY(selectedId)}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {resultfQTY(selectedId)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #00000029',
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: 12, color: '#362828', mb: 1 }}>
              {t('PendingOrder.PendingOrderDiscountDetails')}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderName')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderType')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderRate')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderOn')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderAmount')}
              </Typography>
            </Box>

            {dataDiscount?.map((item2, index1) => {
              if (item2.id == selectedId) {
                return (
                  <Box key={index1} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item2.POD_LEDGER_NAME}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item2.POD_RNP}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item2.POD_RATE}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item2.POD_QUANTITY}
                    </Typography>
                    <Typography sx={{ flex: 1, fontSize: 12, color: '#362828' }}>
                      {item2.POD_TOTALDISCOUNT}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #E0E0E0' }}>
              <Typography sx={{ flex: 4, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {t('PendingOrder.PendingOrderTotalDiscount')}
              </Typography>
              <Typography sx={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#362828' }}>
                {resultDiscount}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <>
      <Loader visible={loading} />
      <Box sx={{ pb: 12.5 }}>
        {dataOrder.map((item, index) => (
          <ActivityUI key={index} item={item} index={index} />
        ))}
      </Box>
    </>
  );
}
