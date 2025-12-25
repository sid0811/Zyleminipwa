import { Box, Typography, Button, Paper, IconButton, Divider } from '@mui/material';
import { CalendarToday, Clear, Share, Store, Business, Today } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';

interface TopCardCNO2Props {
  totalOrders: string | number;
  totalDiscount: string | number;
  GrossAmount?: string | number;
  gstAmount?: string | number;
  gstRate?: string | number;
  startdate: string;
  outletName: string;
  storeId: string;
  distributorName: string;
  distID: string;
  entityType: string;
  onCalendarPress: () => void;
  clearPress: () => void;
  isPreview: boolean;
  isDataCollection: boolean;
  isAnyFilterAccessGranted: boolean;
  generateAndShare?: () => void;
}

const TopCardCNO2 = (props: TopCardCNO2Props) => {
  const { t } = useTranslation();
  const { isDarkMode } = useGlobleAction();

  const {
    totalOrders = 0,
    totalDiscount = 0,
    gstAmount = 0,
    gstRate = 0,
    GrossAmount = 0,
    startdate = '',
    outletName = '',
    storeId = '',
    distributorName = '',
    distID = '',
    entityType = '',
    onCalendarPress,
    clearPress,
    isPreview,
    isDataCollection,
    isAnyFilterAccessGranted,
    generateAndShare,
  } = props;

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num || 0);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        mx: 2.5,
        backgroundColor: isDarkMode ? Colors.mainBackground : Colors.white,
        borderRadius: 2,
      }}
    >
      {/* Header - Outlet and Distributor Info */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Store sx={{ fontSize: 18, color: Colors.primary, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: Colors.textPrimary }}>
            {outletName}
          </Typography>
          {storeId && (
            <Typography variant="caption" sx={{ ml: 1, color: Colors.TexthintColor }}>
              ({storeId})
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Business sx={{ fontSize: 18, color: Colors.primary, mr: 1 }} />
          <Typography variant="body2" sx={{ color: Colors.textSecondary }}>
            {distributorName}
          </Typography>
          {distID && (
            <Typography variant="caption" sx={{ ml: 1, color: Colors.TexthintColor }}>
              ({distID})
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Today sx={{ fontSize: 18, color: Colors.primary, mr: 1 }} />
          <Typography variant="body2" sx={{ color: Colors.textSecondary }}>
            {startdate || t('Not Selected')}
          </Typography>
        </Box>
        
        {entityType && (
          <Typography variant="caption" sx={{ color: Colors.TexthintColor, mt: 0.5, display: 'block' }}>
            {t('Entity Type')}: {entityType}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Order Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5, color: Colors.textPrimary, fontWeight: 600 }}>
          {t('Order Summary')}
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: Colors.TexthintColor, display: 'block' }}>
              {isDataCollection ? t('Total Items') : t('Total Orders')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: Colors.primary }}>
              {totalOrders}
            </Typography>
          </Box>

          {!isDataCollection && (
            <>
              <Box>
                <Typography variant="caption" sx={{ color: Colors.TexthintColor, display: 'block' }}>
                  {t('Total Discount')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: Colors.success }}>
                  {formatCurrency(totalDiscount)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: Colors.TexthintColor, display: 'block' }}>
                  {t('Gross Amount')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: Colors.textPrimary }}>
                  {formatCurrency(GrossAmount)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: Colors.TexthintColor, display: 'block' }}>
                  {t('GST')} {gstRate ? `(${gstRate}%)` : ''}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: Colors.warning }}>
                  {formatCurrency(gstAmount)}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {isAnyFilterAccessGranted && (
          <Button 
            variant="outlined" 
            startIcon={<CalendarToday />}
            onClick={onCalendarPress}
            sx={{ flex: 1, minWidth: 120 }}
          >
            {t('Calendar')}
          </Button>
        )}
        
        <Button 
          variant="outlined" 
          startIcon={<Clear />}
          onClick={clearPress}
          color="error"
          sx={{ flex: 1, minWidth: 120 }}
        >
          {t('Clear')}
        </Button>
        
        {isPreview && generateAndShare && (
          <Button 
            variant="contained" 
            startIcon={<Share />}
            onClick={generateAndShare}
            sx={{ 
              flex: 1, 
              minWidth: 120,
              backgroundColor: Colors.primary,
              '&:hover': {
                backgroundColor: Colors.primaryDark,
              }
            }}
          >
            {t('Generate & Share')}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default TopCardCNO2;
