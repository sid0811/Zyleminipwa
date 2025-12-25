import { useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import OrderFilterUI from './components/OrderFilterUI';
import OrderList from './components/OrderList';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import {
  getAllOrders,
  getAllOrdersforNewParty,
} from '../../../database/WebDatabaseHelpers';
import { getAllOrdersType } from '../../../types/types';
import { writeErrorLog } from '../../../utility/utils';

interface InProcessOrderProps {
  navigation?: any;
}

function InProcessOrder(props: InProcessOrderProps): React.ReactElement {
  const navigate = useNavigate();
  const { userId } = useLoginAction();
  const { sideOrderProps } = useOrderAction();
  const { t } = useTranslation();
  
  const [allOrder, setAllOrder] = useState<getAllOrdersType[]>([]);
  const [filteredOrder, setFilteredOrder] = useState<getAllOrdersType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isBrandFilter, setIsBrandFilter] = useState(false);

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async (): Promise<void> => {
    try {
      const orders = await getAllOrders('N', userId);
      const newPartyOrders = await getAllOrdersforNewParty('N', userId);
      const mergedData = [...orders, ...newPartyOrders];
      
      setAllOrder(mergedData);
      console.log('\n Merged -->', mergedData);
    } catch (error) {
      console.log('takeDataFromDB inprocess order error -->', error);
      writeErrorLog('takeDataFromDB InProcessOrder', error);
    }
  };

  const filterDataByDate1 = (fromDate: string, toDate: string): void => {
    const filtered = allOrder.filter(item => {
      const fromDate1 = moment(item.from_date, 'YYYY-MM-DD HH:mm:ss').startOf('day');
      const fromDateParsed = moment(fromDate, 'DD-MMM-YYYY').startOf('day');
      const toDateParsed = moment(toDate, 'DD-MMM-YYYY').endOf('day');

      return fromDate1.isBetween(fromDateParsed, toDateParsed, 'day', '[]');
    });
    
    setIsBrandFilter(filtered.length === 0);
    setFilteredOrder(filtered);
  };

  const data =
    filteredOrder.length > 0
      ? filteredOrder.filter(item =>
          item.Party.toLowerCase().includes(searchText.toLowerCase()),
        )
      : allOrder.filter(item =>
          item.Party.toLowerCase().includes(searchText.toLowerCase()),
        );

  return (
    <CustomSafeView>
      <OrderFilterUI
        label={t('Orders.TotalOrders')}
        setSearchText={(txt: string) => setSearchText(txt)}
        searchText={searchText}
        filterDataByDate={(fromDate: string, toDate: string) =>
          filterDataByDate1(fromDate, toDate)
        }
        onClearFilterPress={() => setFilteredOrder([])}
        orderLength={
          filteredOrder.length > 0 ? filteredOrder.length : allOrder.length
        }
      />
      
      {isBrandFilter ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
            backgroundColor: '#fc5c65',
            height: 50,
            width: '50%',
            mx: 'auto',
            borderRadius: 1,
          }}
        >
          <Typography sx={{ color: '#fff', fontSize: 16 }}>
            {t('VistBaseMap.VistBaseMapNoData')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ pb: 12.5 }}>
          {data.map((item, index) => (
            <OrderList
              key={index}
              AREA={item.AREA || ''}
              Current_date_time={item.Current_date_time}
              ExpectedDeliveryDate={item.ExpectedDeliveryDate}
              Party={item.Party}
              entity_id={item.entity_id}
              id={item.id}
              total_amount={item.total_amount}
              navigation={{ navigate }}
              isInProcessOrder={true}
              distributorname={item.Distributor}
              isNewParty={item.isNewParty}
              OrderPriority={item.OrderPriority}
            />
          ))}
        </Box>
      )}
    </CustomSafeView>
  );
}

export default InProcessOrder;
