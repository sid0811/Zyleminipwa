import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../../../../theme/colors';
import HeaderOrderSales from './HeaderOrderSales';

interface ListProps {
  listData: any;
  headerData: any;
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
}

export default function LastOrderOnList(props: ListProps) {
  const { t } = useTranslation();
  const { listData = [], headerData = [], isModalOpen, onPress } = props;

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => onPress(!isModalOpen)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <HeaderOrderSales
          VhrNo=""
          ChalanNumber=""
          distributorName={headerData[0]?.Distributor || ''}
          expectedDelivery=""
          outletName=""
          startdate={headerData[0]?.OrderTakenDatetime || ''}
          storeId=""
          totalDiscount={0}
          totalOrders={headerData[0]?.TotalAmount || 0}
          isSalesOn={false}
          onPressClose={(val) => onPress(val)}
        />

        <Box sx={{ p: 2 }}>
          {listData?.length > 0 ? (
            listData?.map((item: any, index: number) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  mb: 1,
                  backgroundColor: '#362828',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                  }}
                >
                  {/* Item Name */}
                  <Box sx={{ flex: 2.6 }}>
                    <Typography
                      sx={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {item.ItemAlias}
                    </Typography>
                  </Box>

                  {/* Quantity and Amount */}
                  <Box
                    sx={{
                      flex: 1.7,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box>
                        <Typography
                          sx={{
                            color: '#CC1167',
                            fontSize: 13,
                            fontWeight: 'bold',
                          }}
                        >
                          {item?.largeUnit}C {item?.SmallUnit}B
                        </Typography>
                        <Typography
                          sx={{
                            color: '#0ddb90',
                            fontSize: 13,
                            fontWeight: 'bold',
                          }}
                        >
                          {item?.FreeLargeUnit}C {item?.FreeSmallUnit}B
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          color: '#CC1167',
                          fontSize: 13,
                          fontWeight: 'bold',
                          alignSelf: 'center',
                        }}
                      >
                        ₹{item?.Amount}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
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
        </Box>
      </DialogContent>
    </Dialog>
  );
}

