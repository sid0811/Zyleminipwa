import {useState} from 'react';
import {Box, Typography, Modal} from '@mui/material';

import {TeamPerformanceStyles} from '../TeamPerformance.style';

interface MeetingDetailsProps {
  details?: {
    [userId: string]: {
      outlet: string;
      meetingStart: string;
      meetingEnd: string;
      remarks: string;
    }[];
  };
  userId: number;
}

const MeetingDetails = ({details, userId}: MeetingDetailsProps) => {
  const [selectedRemarks, setSelectedRemarks] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!details || !details[userId]) {
    return <Typography>No meeting details available</Typography>;
  }

  const meetings = details[userId];

  return (
    <Box sx={{...TeamPerformanceStyles().orderContainer, p: 0}}>
      <Box sx={{...TeamPerformanceStyles().outletSection, mb: 2}}>
        <Box
          sx={{
            ...TeamPerformanceStyles().tableContainer,
            width: '100%',
            bgcolor: '#fff',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
          <Box>
            <Box
              sx={{
                ...TeamPerformanceStyles().tableHeader,
                bgcolor: '#E8EAF6',
                display: 'flex',
                flexDirection: 'row',
                py: 1.5,
                px: 2,
              }}>
              <Box
                sx={{
                  ...TeamPerformanceStyles().headerCellContainer,
                  flex: 4,
                }}>
                <Typography
                  sx={{
                    ...TeamPerformanceStyles().headerCell,
                    fontWeight: '500',
                    color: '#000',
                  }}>
                  Outlet
                </Typography>
              </Box>
              <Box
                sx={{
                  ...TeamPerformanceStyles().headerCellContainer,
                  flex: 2,
                }}>
                <Typography
                  sx={{
                    ...TeamPerformanceStyles().headerCell,
                    fontWeight: '500',
                    color: '#000',
                  }}>
                  Start Time
                </Typography>
              </Box>
              <Box
                sx={{
                  ...TeamPerformanceStyles().headerCellContainer,
                  flex: 2,
                  alignItems: 'flex-end',
                }}>
                <Typography
                  sx={{
                    ...TeamPerformanceStyles().headerCell,
                    fontWeight: '500',
                    color: '#000',
                  }}>
                  End Time
                </Typography>
              </Box>
              <Box
                sx={{
                  ...TeamPerformanceStyles().headerCellContainer,
                  flex: 2,
                  alignItems: 'flex-end',
                }}>
                <Typography
                  sx={{
                    ...TeamPerformanceStyles().headerCell,
                    fontWeight: '500',
                    color: '#000',
                  }}>
                  Remarks
                </Typography>
              </Box>
            </Box>
            {meetings.map((meeting, index) => (
              <Box
                key={index}
                sx={{
                  ...TeamPerformanceStyles().tableRow,
                  display: 'flex',
                  flexDirection: 'row',
                  py: 0.75,
                  px: 2,
                  borderBottom: '1px solid #E0E0E0',
                }}>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 4}}>
                  <Typography sx={{...TeamPerformanceStyles().cell, color: '#666'}}>
                    {meeting.outlet}
                  </Typography>
                </Box>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                  <Typography sx={{...TeamPerformanceStyles().cell, color: '#666'}}>
                    {meeting.meetingStart}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...TeamPerformanceStyles().cellContainer,
                    flex: 2,
                    alignItems: 'flex-end',
                  }}>
                  <Typography sx={{...TeamPerformanceStyles().cell, color: '#666'}}>
                    {meeting.meetingEnd}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...TeamPerformanceStyles().cellContainer,
                    flex: 2,
                    alignItems: 'flex-end',
                  }}>
                  <Box
                    onClick={() => {
                      setSelectedRemarks(meeting.remarks);
                      setIsModalVisible(true);
                    }}
                    sx={{cursor: 'pointer'}}>
                    <Typography
                      sx={{
                        ...TeamPerformanceStyles().cell,
                        color: '#007AFF',
                      }}>
                      View
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Modal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            p: 2.5,
            borderRadius: '8px',
            width: '80%',
            maxHeight: '80%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
          <Typography
            sx={{
              fontSize: 16,
              mb: 2,
              bgcolor: '#E8EAF6',
              p: 1.25,
              borderRadius: '4px',
              fontWeight: '600',
            }}>
            Remarks
          </Typography>
          <Typography sx={{mb: 2.5}}>{selectedRemarks}</Typography>
          <Box
            onClick={() => setIsModalVisible(false)}
            sx={{
              alignSelf: 'flex-end',
              py: 1,
              px: 2,
              bgcolor: '#007AFF',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-block',
              float: 'right',
            }}>
            <Typography sx={{color: 'white'}}>Close</Typography>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MeetingDetails;

