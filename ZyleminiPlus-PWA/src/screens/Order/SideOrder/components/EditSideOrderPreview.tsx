import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  uid: string;
  OID: string;
  dId: string;
  itemID: string;
  Ptr: string;
  bpc: string;
  onChangeInOrder: () => void;
  onChangeInUnits: () => void;
  onDeletePress: (val: any) => void;
}

function EditSideOrderPreview({
  uid,
  OID,
  dId,
  itemID,
  Ptr,
  bpc,
  onChangeInOrder,
  onChangeInUnits,
  onDeletePress,
}: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState('0');

  return (
    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('Orders.EditOrder')}
      </Typography>
      <TextField
        label={t('Orders.Quantity')}
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={onChangeInOrder}>
          {t('Common.Update')}
        </Button>
        <Button variant="outlined" color="error" onClick={() => onDeletePress([])}>
          {t('Common.Delete')}
        </Button>
      </Box>
    </Box>
  );
}

export default EditSideOrderPreview;

