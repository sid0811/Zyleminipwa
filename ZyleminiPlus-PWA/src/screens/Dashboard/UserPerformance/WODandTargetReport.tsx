import React, {useEffect, useState} from 'react';
import {Box, Typography, IconButton, List, ListItem} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate, useLocation} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {userPerformanceReport} from '../../../api/DashboardAPICalls';
import {useLoginAction} from '../../../redux/actionHooks/useLoginAction';

import {fontsSize} from '../../../theme/typography';
import {ReportCategories, writeReportsLog} from '../../../utility/utils';
import Loader from '../../../components/Loader/Loader';
import {Colors} from '../../../theme/colors';

import DonutChart from '../Component/Graphs/DonutChart';
import BarChartGraph from '../Component/Graphs/BarChartGraph';

interface TargetVsPerformance {
  MTD: string;
  NAME: string;
  YTD: string;
}

interface TransformedData {
  color: string;
  label: string;
  value: number;
}

type DataFrom = 'TvA' | 'WOD';

const WODandTargetReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {CommandType} = location.state as {CommandType: string};
  const {t} = useTranslation();
  const {userId} = useLoginAction();

  const [data, setData] = useState<TargetVsPerformance[]>([]);
  const [TvAChartData, setTvAChartData] = useState<{
    YTD: TransformedData[];
    MTD: TransformedData[];
  }>({YTD: [], MTD: []});

  const [wodChartData, setWodChartData] = useState<{
    YTD: TransformedData[];
    MTD: TransformedData[];
  }>({YTD: [], MTD: []});

  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'YTD' | 'MTD'>(
    'YTD',
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [CommandType, userId]);

  async function fetchData() {
    setIsLoading(true);

    try {
      const ddata = await userPerformanceReport(userId, CommandType, '');
      if (CommandType === ReportCategories[0].CommandType) {
        writeReportsLog('Target_Vs_Performance');
        setData(ddata?.Target_Vs_Performance);
        transformDataForChart(ddata?.Target_Vs_Performance, 'TvA');
      } else {
        setData(ddata?.WOD_Performance);
        writeReportsLog('WOD_Performance');
        transformDataForChart(ddata?.WOD_Performance, 'WOD');
      }
    } catch (error: any) {
      window.alert(error.message || t('Alerts.AnErrorOccurred'));
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function transformDataForChart(
    data: TargetVsPerformance[],
    dataFrom: DataFrom,
  ) {
    const result: {
      [key in keyof Omit<TargetVsPerformance, 'NAME'>]: {
        color: string;
        label: string;
        value: number;
      }[];
    } = {
      YTD: [],
      MTD: [],
    };

    const colorPalettes = {
      TvA: ['#003f5c', '#ffa600', '#bc5090'],
      WOD: ['#22a7f0', '#58508d', '#bc5090', '#ffa600'],
    };

    const validNames = {
      TvA: ['PLAN', 'ACHIV', 'BTG'],
      WOD: ['Total Outlets', 'Visited', 'Ordered', 'Billed'],
    };

    const selectedColors = colorPalettes[dataFrom];
    const selectedNames = validNames[dataFrom];

    (['YTD', 'MTD'] as Array<keyof Omit<TargetVsPerformance, 'NAME'>>).forEach(
      timeframe => {
        let colorIndex = 0;
        data &&
          data.forEach(item => {
            if (selectedNames.includes(item.NAME)) {
              result[timeframe].push({
                color: selectedColors[colorIndex],
                label: item.NAME,
                value: parseFloat(item[timeframe].replace(' %', '')),
              });
              colorIndex = (colorIndex + 1) % selectedColors.length;
            }
          });
      },
    );

    if (dataFrom === 'TvA') {
      setTvAChartData(result);
    } else {
      setWodChartData(result);
    }
  }

  return (
    <>
      <Loader visible={isLoading} />
      <Box sx={{flex: 1}}>
        <Box
          sx={{
            height: 80,
            width: '100%',
            bgcolor: Colors.mainBackground,
            p: 0.125,
          }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
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
              {ReportCategories[0].CommandType === CommandType
                ? t('Dashboard.TargetVsAchievement')
                : t('Dashboard.WODPerformance')}
            </Typography>
          </Box>
        </Box>
        {ReportCategories[0].CommandType === CommandType && (
          <Typography
            sx={{
              textAlign: 'center',
              my: 2,
              fontSize: fontsSize.large,
              fontWeight: 'bold',
              fontFamily: 'Proxima Nova',
              color: Colors.black,
            }}>
            {t('Dashboard.SecondaryPerformance')}
          </Typography>
        )}

        {data?.length > 0 ? (
          <List
            sx={{
              mt:
                ReportCategories[0].CommandType === CommandType ? 0 : 2,
            }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                bgcolor: '#333',
                borderBottom: '1px solid #ccc',
              }}>
              <Typography sx={{flex: 1, p: 1.25, fontWeight: 'bold', color: 'white'}}>
                {' '}
              </Typography>
              <Box
                onClick={() => setSelectedTimeFrame('YTD')}
                sx={{flex: 1, p: 1.25, cursor: 'pointer'}}>
                <Typography sx={{fontWeight: 'bold', textAlign: 'center', color: 'white'}}>
                  YTD
                </Typography>
              </Box>
              <Box
                onClick={() => setSelectedTimeFrame('MTD')}
                sx={{flex: 1, p: 1.25, cursor: 'pointer'}}>
                <Typography sx={{fontWeight: 'bold', textAlign: 'center', color: 'white'}}>
                  MTD
                </Typography>
              </Box>
            </Box>

            {data.map((item) => (
              <ListItem
                key={item.NAME}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  borderBottom: '1px solid #ccc',
                  p: 0,
                }}>
                <Typography
                  sx={{
                    flex: 1,
                    p: 1.25,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: fontsSize.smallDefault,
                    fontFamily: 'Proxima Nova',
                    color: Colors.black,
                  }}>
                  {item['NAME']}
                </Typography>
                <Typography sx={{flex: 1, p: 1.25, textAlign: 'center'}}>
                  {item.YTD}
                </Typography>
                <Typography sx={{flex: 1, p: 1.25, textAlign: 'center'}}>
                  {item.MTD}
                </Typography>
              </ListItem>
            ))}

            <Box
              sx={{
                my: 2.5,
                mx: 2.5,
                bgcolor: Colors.white,
                borderRadius: '8px',
                p: 1.25,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
              }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: 'auto',
                  px: 1.25,
                  py: 0.125,
                  right: 15,
                  top: 10,
                  border: `1px solid ${Colors.primary}`,
                }}>
                <Typography sx={{color: Colors.FABColor, fontSize: fontsSize.smallDefault}}>
                  {selectedTimeFrame}
                </Typography>
              </Box>
              {ReportCategories[0].CommandType === CommandType ? (
                <DonutChart
                  dataa={
                    selectedTimeFrame === 'YTD' ? TvAChartData.YTD : TvAChartData.MTD
                  }
                />
              ) : (
                <BarChartGraph
                  data={
                    selectedTimeFrame === 'YTD' ? wodChartData.YTD : wodChartData.MTD
                  }
                />
              )}
            </Box>
          </List>
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

export default WODandTargetReport;

