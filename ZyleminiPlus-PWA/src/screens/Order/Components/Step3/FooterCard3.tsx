import React from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useOrderAction } from '../../../../redux/actionHooks/useOrderAction';
import { removeSpecialCharacters } from '../../../../utility/utils';
import DashLine from '../../../CollectionModule/Components/DashLine';

interface CNO3props {
  navigation?: any;
  onCalenderPress: () => void;
  expectedDate: string;
  remark: string;
  onChangeRemark: (remark: string) => void;
}

function FooterCard3(props: CNO3props) {
  const { navigation, onCalenderPress, expectedDate, remark, onChangeRemark } = props;
  const { t } = useTranslation();
  const { isDataCollection } = useOrderAction();

  return (
    <>
      {!isDataCollection && (
        <>
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('Orders.ExpectedDeliveryDate')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 1, p: 1 }}>
              <Typography sx={{ flex: 1 }}>{expectedDate || 'Select Date'}</Typography>
              <IconButton onClick={onCalenderPress} size="small">
                <CalendarToday fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </>
      )}

      <Box sx={{ my: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
          {t('DataCollection.remarkstext')}
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={remark}
          onChange={(e) => onChangeRemark(removeSpecialCharacters(e.target.value))}
          placeholder={t('DataCollection.remarkstext')}
          variant="outlined"
        />
      </Box>
    </>
  );
}

export default FooterCard3;

