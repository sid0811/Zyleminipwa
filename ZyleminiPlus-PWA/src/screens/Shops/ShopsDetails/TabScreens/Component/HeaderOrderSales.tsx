import { Box, Typography, IconButton, Divider } from '@mui/material';
import { Close, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGlobleAction } from '../../../../../redux/actionHooks/useGlobalAction';
import { Colors } from '../../../../../theme/colors';

interface TopcardProps {
  totalOrders: string | number;
  totalDiscount: string | number;
  startdate: string;
  outletName: string;
  storeId: string;
  distributorName: string;
  VhrNo: string;
  ChalanNumber: string;
  expectedDelivery: string;
  isSalesOn: boolean;
  onPressClose: (val: boolean) => void;
}

const HeaderOrderSales = (props: TopcardProps) => {
  const {
    totalOrders = 0,
    totalDiscount = 0,
    startdate = '',
    outletName = '',
    storeId = '',
    distributorName = '',
    VhrNo = '',
    ChalanNumber = '',
    expectedDelivery = '',
    isSalesOn,
    onPressClose,
  } = props;

  const { isDarkMode } = useGlobleAction();
  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{
          backgroundColor: Colors.mainBackground,
          p: 2,
          borderRadius: 1,
        }}
      >
        {/* Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton
            onClick={() => onPressClose(false)}
            sx={{ color: Colors.white }}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>

        {/* Total Order and Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 0.8 }}>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 12,
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {isSalesOn
                ? t('Shops.VoucherDate')
                : t('Orders.TotalOrderValue') + ' {INR}'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  color: Colors.white,
                  fontSize: 13,
                }}
              >
                {totalOrders}
              </Typography>
              {isSalesOn && <CalendarToday sx={{ fontSize: 16, color: Colors.white }} />}
            </Box>
          </Box>

          <Box sx={{ flex: 0.5, textAlign: 'right' }}>
            <Typography
              sx={{
                color: Colors.DarkBrown,
                fontSize: 12,
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              {isSalesOn ? t('Shops.ChalanDate') : t('Orders.OrderDate')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  color: Colors.white,
                  fontSize: 13,
                }}
              >
                {startdate}
              </Typography>
              <CalendarToday sx={{ fontSize: 16, color: Colors.white }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Distributor Info */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          sx={{
            color: Colors.DarkBrown,
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          {`${t('Orders.DistributorName')} ${distributorName}`}
        </Typography>
      </Box>

      {/* Sales Additional Info */}
      {isSalesOn && (
        <Box sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
            <Typography
              sx={{ color: Colors.DarkBrown, fontSize: 12, fontWeight: 'bold' }}
            >
              {t('Shops.VoucherNumber')} :
            </Typography>
            <Typography
              sx={{ color: Colors.DarkBrown, fontSize: 12, fontWeight: 'bold' }}
            >
              {VhrNo}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography
              sx={{ color: Colors.DarkBrown, fontSize: 12, fontWeight: 'bold' }}
            >
              {t('Shops.ChalanNumber')} :
            </Typography>
            <Typography
              sx={{ color: Colors.DarkBrown, fontSize: 12, fontWeight: 'bold' }}
            >
              {ChalanNumber}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ mt: 2, mb: 1 }} />
    </>
  );
};

export default HeaderOrderSales;

