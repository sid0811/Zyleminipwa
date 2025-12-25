import { Box, Typography, Paper, Button, Avatar } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import { Colors } from '../../../../../theme/colors';
import { useTranslation } from 'react-i18next';

interface List1Props {
  SurveyName: string;
  CompanyName: string;
  PublishedDate: string;
  onPress?: () => void;
}

export default function SurveyList1(props: List1Props) {
  const { t } = useTranslation();
  const { SurveyName, CompanyName, PublishedDate, onPress } = props;

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
        }}
      >
        {/* Survey Icon/Avatar */}
        <Box sx={{ mr: 3 }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              backgroundColor: '#f0f0f0',
              color: 'grey',
              fontSize: 25,
            }}
          >
            {SurveyName[0]}
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
              mb: 1.5,
            }}
          >
            {PublishedDate}
          </Typography>

          {/* Divider */}
          <Box
            sx={{
              borderTop: `1px solid ${Colors.border}`,
              mb: 1.5,
            }}
          />

          {/* Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={onPress}
            sx={{
              backgroundColor: '#2FC36E',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: 10,
              borderRadius: 7,
              py: 1,
              '&:hover': {
                backgroundColor: '#28a85e',
              },
            }}
          >
            {t('Survey.SurveyTakeSurvey')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

