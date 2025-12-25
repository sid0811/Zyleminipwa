import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

interface DataCollectionStep2Props {
  isPreview?: boolean;
  uid: string;
  OID: string;
  dId: string;
  itemID: string;
  itemName: string;
  Ptr: string;
  bpc: string;
  brand: string;
  flavour: string;
  division: string;
  brandId?: string;
  onChangeInUnits: (val: string) => void;
  latitude?: number;
  longitude?: number;
}

const DataCollectionStep2: React.FC<DataCollectionStep2Props> = ({
  itemName,
  onChangeInUnits,
}) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {itemName}
      </Typography>
      <TextField
        label="Units"
        type="number"
        onChange={(e) => onChangeInUnits(e.target.value)}
        fullWidth
        sx={{ mt: 1 }}
      />
    </Box>
  );
};

export default DataCollectionStep2;

