import { Box, Typography, Paper, Avatar } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { Colors } from '../../../../../theme/colors';

interface List2Props {
  SurveyName: string;
  CompanyName: string;
  PublishedDate: string;
}

export default function SurveyList2(props: List2Props) {
  const { SurveyName, CompanyName, PublishedDate } = props;

  return (
    <Paper
      elevation={2}
      sx={{
        mt: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6DFDF',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          p: 2,
          alignItems: 'center',
          minHeight: 120,
        }}
      >
        {/* Survey Icon */}
        <Box sx={{ mr: 3 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              backgroundColor: '#f0f0f0',
            }}
          >
            <Assignment sx={{ fontSize: 32, color: 'grey' }} />
          </Avatar>
        </Box>

        {/* Survey Details */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              color: Colors.DarkBrown,
              fontWeight: 'bold',
              fontSize: 14,
              mb: 1,
            }}
          >
            {SurveyName}
          </Typography>
          <Typography
            sx={{
              color: Colors.DarkBrown,
              fontSize: 10,
              mb: 0.5,
            }}
          >
            {CompanyName}
          </Typography>
          <Typography
            sx={{
              color: Colors.DarkBrown,
              fontSize: 10,
            }}
          >
            {PublishedDate}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

