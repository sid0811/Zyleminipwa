import { Box, Typography } from '@mui/material';
import { Colors } from '../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface HeaderProp {
  brandCount: string;
  distributorsCount?: string;
  UOMName: string;
  isBrandWiseSale: boolean;
}

const SalesHeader = ({
  brandCount,
  distributorsCount,
  UOMName,
  isBrandWiseSale,
}: HeaderProp) => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        backgroundColor: '#221818',
        display: 'flex',
        flexDirection: 'row',
        p: 2,
      }}
    >
      <Box
        sx={{
          flex: 1.5,
          display: 'flex',
          flexDirection: 'column',
          ml: 2,
        }}
      >
        <Typography
          sx={{
            color: '#796A6A',
            fontSize: 10,
            fontWeight: 'bold',
          }}
        >
          {t('Sales.SalesHeader')}
        </Typography>
        <Typography
          sx={{
            color: 'white',
            fontSize: 12,
          }}
        >
          {t('Sales.SalesHeaderAll')}({brandCount})
        </Typography>
      </Box>
      
      {isBrandWiseSale && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            ml: 2,
          }}
        >
          <Typography
            sx={{
              color: '#796A6A',
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {t('Sales.SalesDistributors')}
          </Typography>
          <Typography
            sx={{
              color: 'white',
              fontSize: 12,
            }}
          >
            {t('Sales.SalesHeaderAll')}({distributorsCount})
          </Typography>
        </Box>
      )}
      
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: 2,
        }}
      >
        <Typography
          sx={{
            color: '#796A6A',
            fontSize: 10,
            fontWeight: 'bold',
          }}
        >
          {t('Sales.SalesUOM')}
        </Typography>
        <Typography
          sx={{
            color: 'white',
            fontSize: 12,
          }}
        >
          {UOMName}
        </Typography>
      </Box>
    </Box>
  );
};

export default SalesHeader;

