import {Box, Typography} from '@mui/material';
import {TeamPerformanceStyles} from '../TeamPerformance.style';

interface DataCollectionDetailsProps {
  details?: {
    [userId: string]: {
      outletName: string;
      items: {
        SKU: string;
        items: string;
      }[];
    }[];
  };
  userId: number;
}

const DataCollectionDetails = ({
  details,
  userId,
}: DataCollectionDetailsProps) => {
  if (!details || !details[userId]) {
    return <Typography>No data collection details available</Typography>;
  }

  const collections = details[userId];

  return (
    <Box sx={{...TeamPerformanceStyles().orderContainer, p: 0}}>
      {collections?.map((collection, index) => (
        <Box key={index} sx={TeamPerformanceStyles().outletSection}>
          <Typography sx={TeamPerformanceStyles().outletName}>
            {collection.outletName}
          </Typography>
          <Box sx={TeamPerformanceStyles().tableContainer}>
            <Box
              sx={{
                ...TeamPerformanceStyles().tableHeader,
                bgcolor: '#E8F5E9',
                justifyContent: 'space-between',
              }}>
              <Typography sx={{...TeamPerformanceStyles().headerCell, flex: 2.5}}>
                SKU
              </Typography>
              <Typography
                sx={{
                  ...TeamPerformanceStyles().headerCell,
                  flex: 1,
                  ml: 1.875,
                }}>
                Quantity
              </Typography>
            </Box>
            {collection.items.map((item, itemIndex) => (
              <Box key={itemIndex} sx={TeamPerformanceStyles().tableRow}>
                <Typography sx={{...TeamPerformanceStyles().cell, flex: 2.5}}>
                  {item.SKU}
                </Typography>
                <Typography
                  sx={{
                    ...TeamPerformanceStyles().cell,
                    flex: 1,
                    ml: 1.875,
                  }}>
                  {item.items}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default DataCollectionDetails;

