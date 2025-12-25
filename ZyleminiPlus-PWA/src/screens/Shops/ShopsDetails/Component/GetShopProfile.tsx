import { Box, Typography, Divider, Button } from '@mui/material';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../../../../constants/screenConstants';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { isAccessControlProvided } from '../../../../utility/utils';
import { Colors } from '../../../../theme/colors';

interface props {
  profileData: any;
  navigation: any;
  shopId: string;
  isFromCNO: boolean;
  setIsOSShown: (val: boolean) => void;
  setIsLastSalesShown: (val: boolean) => void;
  setIsLastOrderShown: (val: boolean) => void;
  setIsTopBrandShown: (val: boolean) => void;
  setIsLedgerShown: (val: boolean) => void;
  setIsPDCShown: (val: boolean) => void;
  setIsUnallocatedShown: (val: boolean) => void;
}

const GetShopProfile = ({
  profileData,
  navigation,
  shopId,
  isFromCNO,
  setIsOSShown,
  setIsLastSalesShown,
  setIsLastOrderShown,
  setIsTopBrandShown,
  setIsLedgerShown,
  setIsPDCShown,
  setIsUnallocatedShown,
}: props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPDC_Unallocated_Enabled, getAccessControlSettings } =
    useGlobleAction();

  const ProfileItem = ({
    label,
    value,
    onPress,
    isButton = false,
    valueColor = Colors.primary,
  }: any) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        px: 2,
      }}
    >
      <Typography
        sx={{
          color: Colors.DarkBrown,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Button
        onClick={onPress}
        sx={{
          color: isButton ? '#3955CB' : valueColor,
          fontSize: isButton ? 16 : 14,
          fontWeight: isButton ? 800 : 600,
          textTransform: 'none',
          minWidth: 'auto',
          p: 0,
        }}
      >
        {value}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ px: 2, py: 1 }}>
      {!isFromCNO && <Divider sx={{ my: 1 }} />}

      {/* Total OS */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_TOTAL_OS
      ) && (
        <ProfileItem
          label={t('Shops.TotalOS')}
          value={`₹${profileData?.Outstanding_Total[0]?.Total || '0'}`}
          onPress={() => setIsOSShown(true)}
        />
      )}

      {/* View Ledger */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_VIEW_LEDGER
      ) && (
        <ProfileItem
          label=""
          value={t('Shops.ViewLedger')}
          onPress={() => setIsLedgerShown(true)}
          isButton={true}
        />
      )}

      {/* Last 3 Months Average Sales */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_LAST_3_MONTH_AVG
      ) && (
        <ProfileItem
          label={t('Shops.Last3MonthsAverageSales')}
          value={`₹${profileData?.AvgSale[0]?.AvgSale || '0'}`}
          onPress={() =>
            navigate(`/${ScreenName.BRAND_SALE_REPORT}`, {
              state: { shopId: shopId },
            })
          }
        />
      )}

      {/* Last Sales On */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_LAST_SALES_ON
      ) && (
        <ProfileItem
          label={t('Shops.LastSalesOn')}
          value={
            profileData?.SalesMaster_LastInvoiceDate[0]?.LastInvoiceDate ||
            '--/--/--'
          }
          onPress={() => setIsLastSalesShown(true)}
        />
      )}

      {/* Last Order On */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_LAST_ORDER_ON
      ) && (
        <ProfileItem
          label={t('Shops.LastOrderOn')}
          value={
            profileData?.OrderMaster_LastOrderDate[0]?.LastOrderDate ||
            '--/--/--'
          }
          onPress={() => setIsLastOrderShown(true)}
        />
      )}

      {/* Most Frequently Purchased Top Brands */}
      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.SHOP_DETAILS_MOST_FREQUENT_PURCHASE_BRAND
      ) && (
        <ProfileItem
          label={t('Shops.MostFrequentlyPurchasedTopBrands')}
          value={t('Common.View')}
          onPress={() => setIsTopBrandShown(true)}
          isButton={true}
          valueColor="#3955CB"
        />
      )}

      {/* PDC Details */}
      {isPDC_Unallocated_Enabled &&
        isAccessControlProvided(
          getAccessControlSettings,
          AccessControlKeyConstants.SHOP_DETAILS_PDC_DETAILS
        ) && (
          <ProfileItem
            label={t('Shops.PDCDetails')}
            value={`₹${profileData?.PDC_Total[0]?.Total || '0'}`}
            onPress={() => setIsPDCShown(true)}
          />
        )}

      {/* Unallocated Amount */}
      {isPDC_Unallocated_Enabled &&
        isAccessControlProvided(
          getAccessControlSettings,
          AccessControlKeyConstants.SHOP_DETAILS_UNALLOCATED_AMT
        ) && (
          <ProfileItem
            label={t('Shops.UnallocatedAmt')}
            value={`₹${profileData?.Unallocated_Total[0]?.Total || '0'}`}
            onPress={() => setIsUnallocatedShown(true)}
          />
        )}
    </Box>
  );
};

export default GetShopProfile;

