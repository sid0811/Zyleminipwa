import { useCallback, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import {
  getAllOrders,
  getBrands,
  getItemIDFromBrandId,
  getOrderIdFromItemId,
} from '../../../database/WebDatabaseHelpers';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { getAllOrdersType, getBrands_OP_Report } from '../../../types/types';
import OrderList from './components/OrderList';
import OrderFilterUI from './components/OrderFilterUI';

interface OrderHistoryProps {
  navigation?: any;
}

function OrderHistory(props: OrderHistoryProps): React.ReactElement {
  const navigate = useNavigate();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  
  const [allOrder, setAllOrder] = useState<getAllOrdersType[]>([]);
  const [filteredOrder, setFilteredOrder] = useState<getAllOrdersType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [brands, setBrands] = useState<getBrands_OP_Report[]>([]);
  const [isBrandFilter, setIsBrandFilter] = useState(false);

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async (): Promise<void> => {
    getAllOrders('Y', userId).then(data => {
      setAllOrder(data);
    });

    getBrands(userId).then(data => {
      setBrands(data);
    });
  };

  const filterDataByDate1 = (
    fromDate: string,
    toDate: string,
    brandIds: string[],
  ): void => {
    if (brandIds.length > 0) {
      getItemIDFromBrandId(brandIds).then((d: any) => {
        getOrderIdFromItemId([...d.map((item: any) => item.ItemId)]).then(
          (data: any) => {
            const matchedData = allOrder.filter(item => {
              for (let item1 of data) {
                if (item1.orderId == item.id) {
                  return true;
                }
              }
              return false;
            });
            setFilterArray(fromDate, toDate, matchedData);
          },
        );
      });
    } else {
      setFilterArray(fromDate, toDate, []);
    }
  };

  function setFilterArray(
    fromDate: string,
    toDate: string,
    filteredArray: getAllOrdersType[] = [],
  ): void {
    if (filteredArray.length > 0) {
      if (fromDate.length === 5 && toDate.length === 5) {
        setIsBrandFilter(false);
        setFilteredOrder(filteredArray);
      } else {
        const filtered = filteredArray.filter(item => {
          const fromDate1 = moment(item?.from_date, 'DD-MMM-YYYY').startOf('day');
          const fromDateParsed = moment(fromDate, 'DD-MMM-YYYY').startOf('day');
          const toDateParsed = moment(toDate, 'DD-MMM-YYYY').endOf('day');

          return fromDate1.isBetween(fromDateParsed, toDateParsed, 'day', '[]');
        });
        setIsBrandFilter(filtered.length === 0);
        setFilteredOrder(filtered);
      }
    } else {
      const filtered = allOrder.filter(item => {
        const fromDate1 = moment(item?.from_date, 'DD-MMM-YYYY').startOf('day');
        const fromDateParsed = moment(fromDate, 'DD-MMM-YYYY').startOf('day');
        const toDateParsed = moment(toDate, 'DD-MMM-YYYY').endOf('day');

        return fromDate1.isBetween(fromDateParsed, toDateParsed, 'day', '[]');
      });
      setIsBrandFilter(filtered.length === 0);
      setFilteredOrder(filtered);
    }
  }

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
        filterDataByDate={(fromDate: string, toDate: string, brandIds: string[]) =>
          filterDataByDate1(fromDate, toDate, brandIds)
        }
        onClearFilterPress={() => {
          setFilteredOrder([]);
          setIsBrandFilter(false);
        }}
        orderLength={
          filteredOrder.length > 0 ? filteredOrder.length : allOrder.length
        }
        brandFilterData={brands}
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
              AREA={item.AREA}
              Current_date_time={item.Current_date_time}
              ExpectedDeliveryDate={item.ExpectedDeliveryDate}
              Party={item.Party}
              entity_id={item.entity_id}
              id={item.id}
              total_amount={item.total_amount}
              navigation={{ navigate }}
              isInProcessOrder={false}
              distributorname={item.Distributor}
              OrderPriority={item.OrderPriority}
            />
          ))}
        </Box>
      )}
    </CustomSafeView>
  );
}

export default OrderHistory;
