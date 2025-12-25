import {Box, Typography} from '@mui/material';
import {TeamPerformanceStyles} from '../TeamPerformance.style';

interface VisitDetailsProps {
  details?: {
    [userId: string]: {
      outlet: string;
      checkIn: string;
      checkOut: string;
    }[];
  };
  userId: number;
}

const VisitDetails = ({details, userId}: VisitDetailsProps) => {
  if (!details || !details[userId]) {
    return <Typography>No visit details available</Typography>;
  }

  const visits = details[userId];

  return (
    <Box sx={TeamPerformanceStyles().tableContainer}>
      <Box
        sx={{
          ...TeamPerformanceStyles().tableHeader,
          bgcolor: '#E3F2FD',
        }}>
        <Typography sx={{...TeamPerformanceStyles().headerCell, flex: 2}}>
          Outlet
        </Typography>
        <Typography sx={{...TeamPerformanceStyles().headerCell, flex: 1}}>
          Check In
        </Typography>
        <Typography sx={{...TeamPerformanceStyles().headerCell, flex: 1}}>
          Check Out
        </Typography>
      </Box>
      {visits?.map((visit, index) => (
        <Box key={index} sx={TeamPerformanceStyles().tableRow}>
          <Typography sx={{...TeamPerformanceStyles().cell, flex: 2}}>
            {visit.outlet}
          </Typography>
          <Typography sx={{...TeamPerformanceStyles().cell, flex: 1}}>
            {visit.checkIn}
          </Typography>
          <Typography sx={{...TeamPerformanceStyles().cell, flex: 1}}>
            {visit.checkOut}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default VisitDetails;

