import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getBrands_OP_Report } from '../../../../types/types';

interface props {
  label: string;
  orderLength: number;
  setSearchText: (txt: string) => void;
  searchText: string;
  filterDataByDate: (
    fromDate: string,
    toDate: string,
    brandIds: string[],
  ) => void;
  onClearFilterPress: () => void;
  brandFilterData?: getBrands_OP_Report[];
  isFilterDateModalActive?: boolean;
}

const OrderFilterUI = ({
  label,
  orderLength,
  setSearchText,
  searchText,
  filterDataByDate,
  onClearFilterPress,
  brandFilterData = [],
  isFilterDateModalActive = false,
}: props) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {orderLength} {t('Common.Orders')}
        </Typography>
      </Box>
      <TextField
        fullWidth
        placeholder={t('Common.Search')}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ mb: 2 }}
      />
    </Box>
  );
};

export default OrderFilterUI;

