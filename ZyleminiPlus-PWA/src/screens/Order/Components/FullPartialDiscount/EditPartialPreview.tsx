import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { getTableDiscount } from '../../../../database/WebDatabaseHelpers';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ScreenName } from '../../../../constants/screenConstants';

interface Props {
  orderID1: string;
  entityid?: string;
  fromCreateNOrder: boolean;
  onChangeInItem?: any;
  SideFlag?: any;
  navigation: any;
}

function EditPartialPreview({
  orderID1,
  entityid = '',
  fromCreateNOrder,
  onChangeInItem = undefined,
  SideFlag = undefined,
  navigation,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    NEWdislist();
  }, [SideFlag, onChangeInItem]);

  const NEWdislist = async () => {
    try {
      const discountData = (await getTableDiscount(orderID1) as any[]);
      const filtered = discountData.filter((disc: any) => disc.BrandCode != '');
      setData(filtered);
    } catch (error) {
      console.error('Error fetching discount data:', error);
    }
  };

  const EditAlertHandler = (item: any, index: number) => {
    if (window.confirm(t('Alerts.AlertEditOrderMsg'))) {
      if (fromCreateNOrder) {
        navigate(`/${ScreenName.EDIT_PARTIAL_DISCOUNT}`, {
          state: { orderID: orderID1, id: item.id },
        });
      } else {
        navigate(`/${ScreenName.EDIT_PARTIAL_SIDE_DISCOUNT}`, {
          state: { orderID: orderID1, id: item.id, entityid: entityid },
        });
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {data.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No partial order discounts
        </Typography>
      ) : (
        data.map((item: any, index: number) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1 }}>
            <Typography variant="body2">
              {item.BrandCode} - {item.DiscountType}: {item.DiscountValue}
            </Typography>
            <Button
              size="small"
              onClick={() => EditAlertHandler(item, index)}
              sx={{ mt: 1 }}
            >
              Edit
            </Button>
          </Box>
        ))
      )}
    </Box>
  );
}

export default EditPartialPreview;

