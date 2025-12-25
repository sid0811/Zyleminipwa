import React, {useEffect, useState} from 'react';
import {Box, Typography, TextField, InputAdornment, IconButton, List, ListItem} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate, useLocation} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

import {userPerformanceReport} from '../../../api/DashboardAPICalls';
import {useLoginAction} from '../../../redux/actionHooks/useLoginAction';

import {fontsSize} from '../../../theme/typography';
import Loader from '../../../components/Loader/Loader';
import {Colors} from '../../../theme/colors';
import {writeReportsLog} from '../../../utility/utils';

const OutstandingAgeingReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {CommandType} = location.state as {CommandType: string};
  const {t} = useTranslation();
  const {userId} = useLoginAction();

  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [totals, setTotals] = useState<number[]>([0, 0, 0, 0, 0]);

  const headers = ['Party Name', '0-29', '30-59', '60-89', '90+', 'Total'];

  useEffect(() => {
    fetchData();
  }, [CommandType, userId]);

  async function fetchData() {
    setIsLoading(true);
    writeReportsLog('Outstanding Ageing');

    try {
      const ddata = await userPerformanceReport(userId, CommandType, '');
      setData(ddata?.Outstanding_Report);
      const totals = calculateTotals(ddata?.Outstanding_Report);
      setTotals(totals);
    } catch (error: any) {
      window.alert(error.message || t('Alerts.AnErrorOccurred'));
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const calculateTotals = (data: any[]) => {
    return data.reduce(
      (acc, item) => {
        acc[0] += parseFloat(item.Slot1) || 0;
        acc[1] += parseFloat(item.Slot2) || 0;
        acc[2] += parseFloat(item.Slot3) || 0;
        acc[3] += parseFloat(item.Slot4) || 0;
        acc[4] += parseFloat(item.Total) || 0;
        return acc;
      },
      [0, 0, 0, 0, 0],
    );
  };

  return (
    <>
      <Loader visible={isLoading} />
      <Box sx={{flex: 1}}>
        <Box
          sx={{
            height: 80,
            width: '100%',
            bgcolor: Colors.mainBackground,
            p: 0,
          }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                position: 'absolute',
                left: 8,
                color: Colors.white,
              }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: fontsSize.large,
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova',
                color: Colors.white,
              }}>
              {t('Dashboard.OutStandingReport')}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            px: 2.5,
            my: 0.8,
          }}>
          <Box sx={{flex: 2}}>
            <TextField
              placeholder={t('Orders.SearchOutlet')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{fontSize: 22}} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                bgcolor: Colors.white,
                borderRadius: '1.2%',
                '& .MuiOutlinedInput-root': {
                  height: '7vh',
                  borderColor: Colors.FABColor,
                  borderWidth: 0.8,
                },
              }}
            />
          </Box>
          <Box sx={{flex: 0.5, display: 'flex', alignItems: 'flex-end'}}>
            <Typography
              sx={{
                color: '#333',
                fontSize: fontsSize.smallDefault,
                my: 1,
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova',
              }}>
              {'Total Records' + ' - ' + data?.length || '0'}
            </Typography>
          </Box>
        </Box>

        {data?.length > 0 ? (
          <>
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                p: 1.875,
                mb: 1.875,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mx: 2.5,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  bgcolor: '#333',
                  p: 0.625,
                  mb: 1.25,
                  borderRadius: '6px',
                }}>
                {headers.map((header, index) => (
                  <Typography
                    key={index}
                    sx={{
                      flex: 1,
                      fontWeight: 'bold',
                      textAlign: index === 0 ? 'left' : 'center',
                      color: Colors.white,
                    }}>
                    {header}
                  </Typography>
                ))}
              </Box>

              <List sx={{overflowY: 'auto', maxHeight: 'calc(100vh - 400px)'}}>
                {data
                  ?.filter((item: any) =>
                    item?.PARTY.toLowerCase().includes(
                      searchText.toLowerCase(),
                    ),
                  )
                  .map((item: any) => (
                    <ListItem
                      key={item.PARTY}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        p: 0.625,
                        borderBottom: '1px solid #ccc',
                      }}>
                      {headers.map((row, index) => (
                        <Box key={index} sx={{flex: 1, display: 'flex'}}>
                          <Typography
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              color: Colors.black,
                              fontSize: fontsSize.smallDefault,
                            }}>
                            {row === 'Party Name'
                              ? item.PARTY || '-'
                              : row === '0-29'
                              ? item.Slot1 || '-'
                              : row === '30-59'
                              ? item.Slot2 || '-'
                              : row === '60-89'
                              ? item.Slot3 || '-'
                              : row === '90+'
                              ? item.Slot4 || '-'
                              : item.Total || '-'}
                          </Typography>
                        </Box>
                      ))}
                    </ListItem>
                  ))}
              </List>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                bgcolor: Colors.darkGreen,
                p: 0.625,
                borderRadius: '6px',
                position: 'fixed',
                bottom: 0,
                mx: 3.125,
                width: 'calc(100% - 50px)',
              }}>
              <Box sx={{display: 'flex', flexDirection: 'row', flex: 1, p: 0.5}}>
                <Typography sx={{flex: 1, fontWeight: 'bold', textAlign: 'center', color: Colors.white}}>
                  Total
                </Typography>
                {totals.map((total, index) => (
                  <Typography key={index} sx={{flex: 1, fontWeight: 'bold', textAlign: 'center', color: Colors.white}}>
                    {total.toFixed(2)}
                  </Typography>
                ))}
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              mt: 2,
              bgcolor: '#fc5c65',
              height: 50,
              width: '50%',
            }}>
            <Typography sx={{color: '#fff', fontSize: 16}}>
              {t('VistBaseMap.VistBaseMapNoData')}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default OutstandingAgeingReport;

