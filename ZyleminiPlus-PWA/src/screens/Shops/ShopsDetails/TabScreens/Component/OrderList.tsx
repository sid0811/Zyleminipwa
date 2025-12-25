import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { Colors } from '../../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface OrderListProps {
  orderId: string;
  totalAmt: string;
  checkDate: string;
  salesman: string;
  sync_flag: string;
  ExpectedDeliveryDate: string;
  onPress?: (orderId: string) => void;
}

const OrderList = (props: OrderListProps) => {
  const { t } = useTranslation();

  const {
    orderId,
    totalAmt,
    checkDate,
    salesman,
    sync_flag,
    ExpectedDeliveryDate,
    onPress = () => {},
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
          backgroundColor: Colors.mainBackground,
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
          {t('Order.OrderOrder')} {orderId}
        </Typography>
        <Typography
          sx={{
            color: Colors.white,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          {totalAmt} {t('Order.OrderInr')}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, backgroundColor: '#fff' }}>
        {/* Order Date and Salesman */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 12,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {t('Order.OrderOrderDate')}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 14,
              }}
            >
              {checkDate}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 12,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {t('Order.OrderSalesman')}
            </Typography>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 14,
              }}
            >
              {salesman}
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            borderTop: `1px solid ${Colors.border}`,
            my: 2,
          }}
        />

        {/* Delivery Status */}
        {sync_flag === 'N' ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: Colors.DarkBrown,
                  fontSize: 12,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                {t('Order.OrderDelivery')}
              </Typography>
              <Chip
                label={t('Order.OrderInProgress')}
                size="small"
                sx={{
                  backgroundColor: '#CC1167',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 11,
                }}
              />
            </Box>
            <Button
              onClick={() => onPress(orderId)}
              endIcon={<ChevronRight />}
              sx={{
                color: '#3955CB',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {t('Order.OrderViewDetails')}
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: Colors.DarkBrown,
                  fontSize: 12,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                {t('Order.OrderDelivered')}
              </Typography>
              <Typography
                sx={{
                  color: '#2FC36E',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                {ExpectedDeliveryDate}
              </Typography>
            </Box>
            <Button
              onClick={() => onPress(orderId)}
              endIcon={<ChevronRight />}
              sx={{
                color: '#3955CB',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              {t('Order.OrderViewDetails')}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default OrderList;

