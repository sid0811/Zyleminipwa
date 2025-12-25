import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../../../../theme/colors';

interface PDCDetail {
  Allocated: string;
  Date: string;
}

interface Invoice {
  BillNo: string;
  BillDate: string;
  Outstanding: string;
  Details: PDCDetail[];
}

interface PDCDetailsProps {
  partyName: string;
  PDC_Details: { Invoice: Invoice[] }[];
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
}

export default function PDCDetails({
  partyName,
  PDC_Details,
  isModalOpen,
  onPress,
}: PDCDetailsProps) {
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
              color: Colors.white,
              fontWeight: 'bold',
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            {t('Shops.PDCDetails')}
          </Typography>
        </Box>

        {PDC_Details?.length > 0 && PDC_Details[0]?.Invoice?.length > 0 ? (
          <List sx={{ p: 0 }}>
            {PDC_Details[0].Invoice.map((invoice, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${Colors.borderColor}`,
                }}
              >
                {/* Invoice Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}
                    >
                      {t('Shops.BillNo')}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {invoice.BillNo}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}
                    >
                      {t('Shops.BillDate')}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {invoice.BillDate}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}
                    >
                      {t('Shops.OutstandingAmt')}
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 'bold', color: Colors.primary }}
                    >
                      ₹{invoice.Outstanding}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* PDC Details Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: '#f5f5f5',
                    p: 1,
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
                    {t('Shops.AllocatedAmt')}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
                    {t('Shops.PDCDate')}
                  </Typography>
                </Box>

                {/* PDC Details Rows */}
                {invoice.Details?.map((detail, detailIndex) => (
                  <Box
                    key={detailIndex}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 1,
                      backgroundColor:
                        detailIndex % 2 === 0 ? '#fafafa' : 'transparent',
                    }}
                  >
                    <Typography sx={{ fontSize: 14, color: Colors.primary }}>
                      ₹{detail.Allocated}
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>{detail.Date}</Typography>
                  </Box>
                ))}
              </Paper>
            ))}
          </List>
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

