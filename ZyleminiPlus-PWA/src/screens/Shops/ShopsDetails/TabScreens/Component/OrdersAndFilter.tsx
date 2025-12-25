import { Box, Typography, IconButton } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { Colors } from '../../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface OrderAndFilterProps {
  outStandingOrder: number;
  TotalOutStandingAmount: number;
  VisibleDilog?: any;
}

export default function OrdersAndFilter(props: OrderAndFilterProps) {
  const { outStandingOrder, TotalOutStandingAmount, VisibleDilog } = props;
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        height: 65,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
      }}
    >
      {/* Invoice Count */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: Colors.PinkColor,
            fontSize: 20,
            mb: 1,
            textAlign: 'center',
          }}
        >
          {outStandingOrder}
        </Typography>
        <Typography
          sx={{
            color: Colors.DarkBrown,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          {t('Order.OrderInvoiceCount')}
        </Typography>
      </Box>

      {/* Total Outstanding */}
      <Box
        sx={{
          flex: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            color: Colors.PinkColor,
            fontSize: 20,
            mb: 1,
            textAlign: 'center',
          }}
        >
          ₹{TotalOutStandingAmount}
        </Typography>
        <Typography
          sx={{
            color: Colors.DarkBrown,
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          {t('Order.OrderTotalOutstanding')}
        </Typography>
      </Box>

      {/* Filter Button */}
      <Box
        sx={{
          flex: 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton
          onClick={() => {
            if (VisibleDilog) {
              VisibleDilog();
            }
          }}
          sx={{
            color: Colors.primary,
          }}
        >
          <FilterList sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

