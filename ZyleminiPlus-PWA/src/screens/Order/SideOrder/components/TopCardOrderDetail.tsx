import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CalendarToday, Edit, Delete, Share } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';

interface TopcardProps {
  totalOrders: string | number;
  totalDiscount: string | number;
  gstAmount?: string | number;
  GrossAmount?: string | number;
  gstRate?: string | number;
  startdate: string;
  outletName: string;
  storeId: string;
  distributorName: string;
  distID: string;
  entityType: string;
  expectedDelivery: string;
  onCalendarPress: () => void;
  onEditPress: () => void;
  deletePress: () => void;
  generateAndShare: () => void;
  isAddDiscountShown: boolean;
}

const TopCardOrderDetail = (props: TopcardProps) => {
  const {
    totalOrders = 0,
    totalDiscount = 0,
    gstAmount = 0,
    gstRate = 0,
    GrossAmount = 0,
    startdate = '',
    outletName = '',
    storeId = '',
    distributorName = '',
    distID = '',
    entityType = '1',
    expectedDelivery = '',
    onCalendarPress,
    onEditPress,
    deletePress,
    generateAndShare,
    isAddDiscountShown,
  } = props;

  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, backgroundColor: Colors.mainBackground, color: 'white', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {outletName}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {distributorName}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Box>
          <Typography variant="body2">Total: ₹{parseFloat(String(totalOrders || 0)).toFixed(2)}</Typography>
          <Typography variant="body2">Discount: ₹{parseFloat(String(totalDiscount || 0)).toFixed(2)}</Typography>
          {gstAmount && (
            <Typography variant="body2">GST: ₹{parseFloat(String(gstAmount || 0)).toFixed(2)}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={onCalendarPress} size="small" sx={{ color: 'white' }}>
            <CalendarToday />
          </IconButton>
          <IconButton onClick={onEditPress} size="small" sx={{ color: 'white' }}>
            <Edit />
          </IconButton>
          <IconButton onClick={deletePress} size="small" sx={{ color: 'white' }}>
            <Delete />
          </IconButton>
          <IconButton onClick={generateAndShare} size="small" sx={{ color: 'white' }}>
            <Share />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default TopCardOrderDetail;

