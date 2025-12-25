import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ScreenName } from '../../../../constants/screenConstants';

interface ListProps {
  navigation: any;
  Party: string;
  AREA: string;
  Current_date_time: string;
  ExpectedDeliveryDate: string;
  id: string;
  entity_id: string;
  total_amount: string;
  isInProcessOrder: boolean;
  distributorname: string;
  isNewParty?: string | undefined | null;
  OrderPriority?: string | number;
}

const OrderList = ({
  Party,
  AREA,
  Current_date_time,
  ExpectedDeliveryDate,
  id,
  entity_id,
  total_amount,
  isInProcessOrder,
  distributorname,
  isNewParty,
  OrderPriority,
}: ListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPriorityColor = (priority?: string | number) => {
    const priorityNum = typeof priority === 'string' ? parseInt(priority) : priority;
    switch (priorityNum) {
      case 1:
        return '#4CAF50'; // Green
      case 2:
        return '#2196F3'; // Blue
      case 3:
        return '#FFC107'; // Yellow
      default:
        return 'transparent';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{Party}</Typography>
          {OrderPriority && (
            <Box
              sx={{
                backgroundColor: getPriorityColor(OrderPriority),
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              {OrderPriority === 1 ? 'HIGH' : OrderPriority === 2 ? 'MEDIUM' : 'LOW'}
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {AREA}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Orders.OrderDate')}: {moment(Current_date_time).format('DD-MMM-YYYY')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('Orders.ExpectedDeliveryDate')}: {ExpectedDeliveryDate || 'N/A'}
        </Typography>
        <Typography variant="h6" sx={{ mt: 1 }}>
          ₹{parseFloat(total_amount || '0').toFixed(2)}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => {
            navigate(`/${ScreenName.SIDEORDERDETAIL}`, {
              state: { orderid: id, entityid: entity_id },
            });
          }}
        >
          {t('Common.ViewDetails')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderList;

