import React, {useState} from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import moment from 'moment';

// components
import VisitDetails from './components/VisitDetails';
import OrderDetails from './components/OrderDetails';
import DataCollectionDetails from './components/DataCollectionDetails';
import ReceiptDetails from './components/ReceiptDetails';
import ImageDetails from './components/ImageDetails';
import MeetingDetails from './components/MeetingDetails';

// api
import {getTeamActivityReport} from '../../../api/DashboardAPICalls';

// hooks
import {useLoginAction} from '../../../redux/actionHooks/useLoginAction';

// utils and constant
import {SideMenuImg} from '../../../constants/AllImages';

// types
import {Activity, TeamActivityReport} from './TeamPerfTypes';

interface ExecutiveDashboardProps {
  data: TeamActivityReport[];
  selectedDate: string;
}

interface ExecutiveCardProps {
  executive: TeamActivityReport;
  selectedDate: string;
}

const ActivityCard = ({
  type,
  count,
  color,
  total,
  isSelected,
  onPress,
}: Activity & {
  isSelected: boolean;
  onPress: () => void;
}) => (
  <Box
    onClick={onPress}
    sx={{
      p: 1,
      borderRadius: '8px',
      bgcolor: color || '#FFFFFF',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 90,
      cursor: 'pointer',
      border: isSelected ? '2px solid #2196F3' : 'none',
      '&:hover': {
        opacity: 0.9,
      },
    }}>
    <Typography sx={{fontSize: 20, fontWeight: '600', color: '#333333', mb: 0.5}}>
      {count}
    </Typography>
    <Typography sx={{fontSize: 12, color: '#666666', textAlign: 'center'}}>
      {type}
    </Typography>
    {(type === 'Order Booked' || type === 'Collections') && total != null ? (
      <Typography sx={{fontSize: 12, color: '#666666', textAlign: 'center'}}>
        {`₹${total.toLocaleString()}`}
      </Typography>
    ) : null}
  </Box>
);

const ActivityDetails = ({
  details,
  activityType,
  userId,
  loading,
}: {
  details: any;
  activityType: Activity['type'];
  userId: number;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Box sx={{p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <CircularProgress />
      </Box>
    );
  }

  switch (activityType) {
    case 'Visited':
      return <VisitDetails details={details?.visitDetails} userId={userId} />;
    case 'Order Booked':
      return <OrderDetails details={details?.orderDetails} userId={userId} />;
    case 'Data Collection':
      return (
        <DataCollectionDetails
          details={details?.dataCollectionDetails}
          userId={userId}
        />
      );
    case 'Collections':
      return (
        <ReceiptDetails details={details?.receiptDetails} userId={userId} />
      );
    case 'Images':
      return <ImageDetails details={details?.imageDetails} />;
    case 'Activity':
      return (
        <MeetingDetails details={details?.meetingDetails} userId={userId} />
      );
    default:
      return null;
  }
};

const ExecutiveCard = ({executive, selectedDate}: ExecutiveCardProps) => {
  const {userId} = useLoginAction();

  const [selectedActivity, setSelectedActivity] = useState<
    Activity['type'] | null
  >(null);
  const [activityDetails, setActivityDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleActivitySelect = async (activity: Activity) => {
    const newSelectedActivity =
      selectedActivity === activity.type ? null : activity.type;
    setSelectedActivity(newSelectedActivity);

    if (newSelectedActivity) {
      setLoading(true);
      try {
        const response = await getTeamActivityReport({
          ParentUserID: userId,
          Date: moment(selectedDate, 'DD MMM YYYY').format('DD-MM-YYYY'),
          CommandType: '2',
          UserID: String(executive?.userId),
          CollectionType: String(activity?.collectionType),
        });
        console.log('response -->', JSON.stringify(response, null, 2));

        setActivityDetails(response);
      } catch (error) {
        console.error('Error fetching activity details:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setActivityDetails(null);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: '8px',
        p: 2,
        mb: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
      <Box
        sx={{
          mb: 2,
          borderBottom: '1px solid #E5E7EB',
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Box
            component="img"
            src={
              executive.profilePicURL
                ? executive.profilePicURL
                : SideMenuImg.userProfile
            }
            sx={{
              width: 48,
              height: 48,
              borderRadius: '24px',
              bgcolor: '#E0E0E0',
            }}
          />
          <Box sx={{ml: 1.25, flex: 1}}>
            <Typography sx={{fontSize: 16, fontWeight: '600', color: '#333333'}}>
              {executive.name}
            </Typography>
            <Typography sx={{fontSize: 14, color: '#666666', mt: 0.5}}>
              {executive.outlets} Outlets • {executive.totalActivities}{' '}
              Activities
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          mx: -1,
        }}>
        {executive.activities.map((activity: any) => (
          <Box
            key={activity.type}
            sx={{
              width: '33.33%',
              p: 0.625,
            }}>
            <ActivityCard
              {...activity}
              isSelected={selectedActivity === activity.type}
              onPress={() => handleActivitySelect(activity)}
            />
          </Box>
        ))}
      </Box>

      {selectedActivity && (
        <Box
          sx={{
            mt: 2,
            p: 1.25,
            bgcolor: '#F8F8F8',
            borderRadius: '8px',
          }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: '600',
              color: '#333333',
              mb: 1.5,
            }}>
            {selectedActivity} Details
          </Typography>
          <ActivityDetails
            details={activityDetails}
            activityType={selectedActivity}
            userId={executive.userId}
            loading={loading}
          />
        </Box>
      )}
    </Box>
  );
};

const ExecutiveDashboard = ({data, selectedDate}: ExecutiveDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data?.filter(executive =>
    executive.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box sx={{flex: 1, bgcolor: '#F5F5F5'}}>
      {data.length > 0 && (
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            m: 2,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            px: 1.5,
            py: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
          <TextField
            placeholder="Search executive name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{fontSize: 22}} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& input': {
                fontSize: 16,
                color: '#333',
                ml: 1,
              },
              '& input::placeholder': {
                color: '#999',
              },
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}>
        {filteredData?.map(executive => (
          <ExecutiveCard
            key={executive.userId}
            executive={executive}
            selectedDate={selectedDate}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ExecutiveDashboard;

