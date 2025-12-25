import React, {useEffect, useState} from 'react';
import {Box, Typography, List, ListItem} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate, useLocation} from 'react-router-dom';

import {userPerformanceReport} from '../../../api/DashboardAPICalls';
import {useLoginAction} from '../../../redux/actionHooks/useLoginAction';

import {fontsSize} from '../../../theme/typography';
import {DashboardImg, MyReportImgs} from '../../../constants/AllImages';
import {ReportCategories, writeReportsLog} from '../../../utility/utils';
import Loader from '../../../components/Loader/Loader';
import {Colors} from '../../../theme/colors';
import UserPerformanceHeader from '../Component/UserPerformanceHeader';

const UserNegativePerfReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {CommandType} = location.state as {CommandType: string};
  const {t} = useTranslation();
  const {userId} = useLoginAction();

  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [CommandType, userId]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const ddata = await userPerformanceReport(userId, CommandType, '');

      if (CommandType === ReportCategories[5].CommandType) {
        setData(ddata?.Not_Visited_Outlets);
        writeReportsLog('Not_Visited_Outlets');
      } else if (CommandType === ReportCategories[3].CommandType) {
        setData(ddata?.Unbilled_Outlets);
        writeReportsLog('Unbilled_Outlets');
      } else {
        setData(ddata?.Unbilled_Items);
        writeReportsLog('Unbilled_Products');
      }
    } catch (error: any) {
      window.alert(error.message || t('Alerts.AnErrorOccurred'));
      console.log('error-->', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Loader visible={isLoading} />
      <Box sx={{flex: 1, bgcolor: '#F0F0F0'}}>
        <UserPerformanceHeader
          headerText={
            CommandType === ReportCategories[5].CommandType
              ? t('Dashboard.NotVisitedOutlets')
              : `${t('Dashboard.UnBilled')} ${
                  ReportCategories[4].CommandType === CommandType
                    ? t('Dashboard.Products')
                    : t('Dashboard.Outlets')
                }`
          }
          textInputPlaceHolder={
            ReportCategories[4].CommandType === CommandType
              ? t('Dashboard.SearchProduct')
              : t('Orders.SearchOutlet')
          }
          searchText={searchText}
          setSearchText={val => setSearchText(val)}
          dataLength={data?.length}
          totalCountText={
            CommandType === ReportCategories[5].CommandType
              ? t('Dashboard.NotVisitedOutlets') + ' - '
              : `${t('Dashboard.UnBilled')} ${
                  ReportCategories[4].CommandType === CommandType
                    ? t('Dashboard.Products') + ' - '
                    : t('Dashboard.Outlets') + ' - '
                }`
          }
        />
        {data?.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              mt: 1.2,
              px: 2.5,
            }}>
            <List sx={{width: '100%', pb: 37.5}}>
              {(ReportCategories[4].CommandType === CommandType
                ? data.filter((item: any) =>
                    item?.Item.toLowerCase().includes(
                      searchText.toLowerCase(),
                    ),
                  )
                : data.filter((item: any) =>
                    item?.Outlet.toLowerCase().includes(
                      searchText.toLowerCase(),
                    ),
                  )
              ).map((item: any, index: number) => (
                <ListItem
                  key={index}
                  sx={{
                    width: '100%',
                    height: '16vh',
                    minHeight: 120,
                    p: 1.875,
                    bgcolor: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    mb: 2.5,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}>
                  <Box sx={{flex: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {ReportCategories[4].CommandType === CommandType ? (
                      <Box
                        component="img"
                        src={DashboardImg.productDelivery}
                        sx={{height: 50, width: 50}}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={MyReportImgs.outlet_map_icon}
                        sx={{height: 50, width: 50}}
                      />
                    )}
                  </Box>
                  <Box sx={{flex: 0.8}}>
                    <Typography
                      sx={{
                        fontSize: fontsSize.medium,
                        color: '#272D33',
                        fontFamily: 'Proxima Nova',
                        fontWeight: '700',
                      }}>
                      {item.Outlet || item.Item || ''}
                    </Typography>
                    <Box>
                      {ReportCategories[4].CommandType !== CommandType && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            mb: 0.25,
                          }}>
                          <Typography
                            sx={{
                              fontSize: fontsSize.smallDefault,
                              color: '#333',
                              fontFamily: 'Proxima Nova',
                              fontWeight: '700',
                            }}>
                            {t('Dashboard.Area') + ': '}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: fontsSize.smallDefault,
                              color: '#333',
                              fontFamily: 'Proxima Nova',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                            {item.Area}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          mb: 0.25,
                        }}>
                        <Typography
                          sx={{
                            fontSize: fontsSize.smallDefault,
                            color: '#333',
                            fontFamily: 'Proxima Nova',
                            fontWeight: '700',
                          }}>
                          {CommandType === ReportCategories[5].CommandType
                            ? t('Dashboard.Route') + ': '
                            : t('Collections.LastInvoiceDate') + ': '}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: fontsSize.smallDefault,
                            color: '#333',
                            fontFamily: 'Proxima Nova',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {item.Route || item.LastInvDate}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
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

export default UserNegativePerfReport;

