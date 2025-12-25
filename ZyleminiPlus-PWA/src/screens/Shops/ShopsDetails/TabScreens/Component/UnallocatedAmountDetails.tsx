import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../../../../theme/colors';

interface DetailItem {
  'Voucher No': string;
  Date: string;
  Unallocated: string;
}

interface VoucherItem {
  Total: string;
  Details: DetailItem[];
}

interface UnallocatedDetails {
  PartyName: string;
  Voucher: VoucherItem[];
}

interface UnallocatedDetailsProps {
  partyName: string;
  Unallocated_Details: UnallocatedDetails[];
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
}

export default function UnallocatedAmountDetails({
  partyName,
  Unallocated_Details,
  isModalOpen,
  onPress,
}: UnallocatedDetailsProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => onPress(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: Colors.loginBackgrnd,
          color: Colors.FABColor,
        }}
      >
        <Typography variant="h6">{partyName}</Typography>
        <IconButton onClick={() => onPress(false)} sx={{ color: Colors.FABColor }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2 }}>
        {/* Section Header */}
        <Box
          sx={{
            backgroundColor: '#333',
            p: 1.5,
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            {t('Shops.UnallocatedAmtDetails')}
          </Typography>
        </Box>

        {Unallocated_Details?.length > 0 &&
        Unallocated_Details[0]?.Voucher?.length > 0 ? (
          Unallocated_Details[0].Voucher.map((voucher, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <TableContainer component={Paper} elevation={2}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: Colors.primary }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '40%' }}>
                        {t('Shops.VoucherNo')}
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>
                        {t('Shops.VoucherDate')}
                      </TableCell>
                      <TableCell
                        sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}
                        align="right"
                      >
                        {t('Shops.UnallocatedAmt')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {voucher.Details?.map((detail, detailIndex) => (
                      <TableRow
                        key={detailIndex}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: '#f9f9f9',
                          },
                        }}
                      >
                        <TableCell>{detail['Voucher No']}</TableCell>
                        <TableCell>{detail.Date}</TableCell>
                        <TableCell align="right">
                          ₹{parseFloat(detail.Unallocated || '0').toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow
                      sx={{
                        backgroundColor: '#e3f2fd',
                        '& td': { fontWeight: 'bold' },
                      }}
                    >
                      <TableCell>{t('Common.Total')}</TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right" sx={{ color: Colors.primary, fontSize: 16 }}>
                        ₹{parseFloat(voucher.Total || '0').toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fc5c65',
              height: 50,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 16 }}>
              {t('VistBaseMap.VistBaseMapNoData')}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

