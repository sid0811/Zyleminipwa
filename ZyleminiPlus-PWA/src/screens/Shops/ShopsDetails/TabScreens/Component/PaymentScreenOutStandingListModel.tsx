import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Colors } from '../../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface PaymentProps {
  PartyName: string;
  Location: string;
  Date: string;
  Amount: number | string;
  OSAmount: number | string;
  OnPressAcceptPayment?: () => void;
}

export default function PaymentScreenOutStandingListModel(props: PaymentProps) {
  const { t } = useTranslation();
  const {
    PartyName,
    Location,
    Date,
    Amount,
    OSAmount,
    OnPressAcceptPayment = () => {},
  } = props;

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 3,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: Colors.DarkBrown,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            color: Colors.white,
            fontWeight: 'bold',
            fontSize: 14,
          }}
        >
          {PartyName}
        </Typography>
        <Typography
          sx={{
            color: Colors.white,
            fontSize: 14,
          }}
        >
          {Location}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, backgroundColor: '#fff' }}>
        {/* Order Details Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 11,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {t('CollectionOutStanding.CollectionOutStandingLastInvoiceDate')}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 14,
              }}
            >
              {Date}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 11,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {t('CollectionOutStanding.CollectionOutStandingTotalBilling')}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ₹{Amount}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 11,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {t('CollectionOutStanding.CollectionOutStandingTotalOutstanding')}
            </Typography>
            <Typography
              sx={{
                color: Colors.primary,
                fontSize: 14,
                fontWeight: 'bold',
              }}
            >
              ₹{OSAmount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Accept Payment Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={OnPressAcceptPayment}
            sx={{
              backgroundColor: '#2FC36E',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1,
              px: 4,
              borderRadius: 3,
              '&:hover': {
                backgroundColor: '#28a85e',
              },
            }}
          >
            {t('CollectionOutStanding.CollectionOutStandingCtaAcceptCollection')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

