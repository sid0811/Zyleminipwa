import { Box, Typography, Paper, Divider } from '@mui/material';
import { Colors } from '../../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface List1Props {
  Party: string;
  check_date: string;
  id: string;
  item_Name: string;
  quantity_one: string;
  quantity_two: string;
  from_date: string;
  to_date: string;
}

export default function DataCList1(props: List1Props) {
  const { t } = useTranslation();
  const {
    Party,
    check_date,
    id,
    item_Name,
    quantity_one,
    quantity_two,
    from_date,
    to_date,
  } = props;

  return (
    <Paper
      elevation={2}
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#d3d3d3',
          p: 1.5,
        }}
      >
        <Typography
          sx={{
            color: '#333333',
            fontWeight: 'bold',
            fontSize: 15,
          }}
        >
          {t('ColectionCard.ColectionCardShopName')} {Party}
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6DFDF',
          borderTop: 'none',
          p: 2,
        }}
      >
        {/* Collection Date & ID Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: '#666666',
                fontSize: 12,
                mb: 0.5,
              }}
            >
              {t('ColectionCard.ColectionCardCollectionDate')}
            </Typography>
            <Typography
              sx={{
                color: '#333333',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {check_date}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: '#666666',
                fontSize: 12,
                mb: 0.5,
              }}
            >
              {t('ColectionCard.ColectionCardCollectionId')}
            </Typography>
            <Typography
              sx={{
                color: '#333333',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {id}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Product Section */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              color: '#666666',
              fontSize: 12,
              mb: 0.5,
            }}
          >
            {t('ColectionCard.ColectionCardProduct')}
          </Typography>
          <Typography
            sx={{
              color: '#333333',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {item_Name}
          </Typography>
        </Box>

        {/* Quantity Section */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              color: '#666666',
              fontSize: 12,
              mb: 0.5,
            }}
          >
            {t('ColectionCard.ColectionCardQuantity')}
          </Typography>
          <Typography
            sx={{
              color: '#333333',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t('ColectionCard.ColectionCardCase')} {quantity_one}{' '}
            {t('ColectionCard.ColectionCardAndBottle')} {quantity_two}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Sales Period Section */}
        <Box>
          <Typography
            sx={{
              color: '#CC1167',
              fontSize: 12,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {t('ColectionCard.ColectionCardSales')}
          </Typography>
          <Typography
            sx={{
              color: '#333333',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t('ColectionCard.ColectionCardFrom')} {from_date}{' '}
            {t('ColectionCard.ColectionCardTo')} {to_date}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

