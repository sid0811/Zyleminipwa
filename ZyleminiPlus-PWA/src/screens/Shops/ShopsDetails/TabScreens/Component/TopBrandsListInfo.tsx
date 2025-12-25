import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { Colors } from '../../../../../theme/colors';

interface listData {
  BrandName: string;
  Sales: number;
  SalesYTD: number;
}

interface ListProps {
  listData: listData[];
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
}

export default function TopBrandsListInfo(props: ListProps) {
  const { t } = useTranslation();
  const { listData = [], isModalOpen, onPress } = props;

  const RenderItem = (props: { item: any; index: number }) => {
    const { item } = props;

    // Exclude "BrandName" key from Object.keys
    const keysWithoutBrand = Object.keys(item).filter(
      (key) => key !== 'BrandName'
    );

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 1,
          borderRadius: 2,
          border: `1px solid ${Colors.borderColor}`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 'bold',
            fontSize: 14,
            color: '#221818',
            mb: 1,
          }}
        >
          {item?.BrandName}
        </Typography>
        
        <Divider sx={{ my: 1 }} />

        {/* Month keys */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          {keysWithoutBrand?.map((title) => (
            <Typography
              key={title}
              sx={{
                color: '#221818',
                fontSize: 10,
                fontWeight: 'bold',
                mx: 2,
              }}
            >
              {title}
            </Typography>
          ))}
        </Box>

        {/* Month values */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {keysWithoutBrand?.map((title) => (
            <Typography
              key={title}
              sx={{
                color: '#362828',
                fontSize: 15,
                mx: 2,
              }}
            >
              {item[title]}
            </Typography>
          ))}
        </Box>
      </Paper>
    );
  };

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
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: Colors.loginBackgrnd,
          color: Colors.FABColor,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {t('Shops.TopPerformingBrands')}
        <IconButton
          onClick={() => onPress(!isModalOpen)}
          sx={{ color: Colors.FABColor }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2 }}>
        {listData?.length > 0 ? (
          listData?.map((item, index: number) => (
            <RenderItem item={item} index={index} key={index} />
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

