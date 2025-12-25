import React, {memo} from 'react';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import BarChartGraph from './Graphs/BarChartGraph';
import LineChartGraph from './Graphs/LineChartGraph';
import DonutChart from './Graphs/DonutChart';
import {UserDetails, SalesTrend, DashGraphData} from '../../../types/types';

interface props {
  navigation?: any;
  UserDetails?: UserDetails;
  CollectionStatus?: any;
  CollectionVisible?: number;
  MarketCalls?: any;
  SalesTrend?: any;
  Target?: any;
}

function BottomCard(props: props) {
  const {
    UserDetails,
    CollectionStatus,
    CollectionVisible,
    MarketCalls,
    SalesTrend,
    Target,
  } = props;

  const {t} = useTranslation();

  return (
    <Box sx={{px: 2.5}}>
      <Box sx={{
        overflow: 'hidden',
        borderRadius: '15px',
        border: '0.7px solid #b5a7a7',
        borderTopColor: 'white',
        bgcolor: '#382928',
        mb: 1.25,
        height: 'auto',
        p: 1,
        width: '100%',
        boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
        mt: 1,
      }}>
        <Typography sx={{
          fontSize: '3%',
          fontFamily: 'Proxima Nova',
          mt: 0.5,
          ml: 2,
          color: '#fff',
          fontWeight: '400',
        }}>
          {t('Dashboard.ShopCovered')} - {UserDetails?.Shops_Covered}
        </Typography>
        <Typography sx={{
          fontSize: '3%',
          fontFamily: 'Proxima Nova',
          mt: 1.2,
          mb: 1,
          ml: 2,
          color: '#fff',
          fontWeight: '400',
        }}>
          {t('Dashboard.LastShopVisit')} - {UserDetails?.Last_shop_Visit}
        </Typography>
      </Box>

      {CollectionVisible != 0 && CollectionStatus?.length > 0 && (
        <Box>
          <Box sx={{width: '100%'}}>
            <Typography sx={{
              fontSize: 16,
              textAlign: 'center',
              fontWeight: '400',
              bgcolor: '#fff',
              fontFamily: 'Proxima Nova',
              color: '#785f5d',
              mt: 1.2,
              zIndex: 99,
              borderBottomColor: 'white',
              borderTopRightRadius: '15px',
              borderTopLeftRadius: '15px',
              mb: -2.5,
              boxShadow: '0px 0px 8px rgba(0,0,0,0.2)',
              p: 0.875,
              border: '0.7px solid #b5a7a7',
            }}>
              {t('Dashboard.CollectionStatus')}
            </Typography>
          </Box>
          <Box sx={{
            overflow: 'hidden',
            borderRadius: '15px',
            border: '0.7px solid #b5a7a7',
            borderTopColor: 'white',
            bgcolor: '#fff',
            mb: 1.25,
            height: 200,
            p: 0.625,
            width: '100%',
            boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
            mt: 1.5,
          }}>
            <Box sx={{mt: 2.5}}>
              <BarChartGraph
                data={CollectionStatus}
                title={'COLLECTION STATUS'}
              />
            </Box>
          </Box>
        </Box>
      )}

      {MarketCalls?.length > 0 && (
        <Box>
          <Box sx={{width: '100%'}}>
            <Typography sx={{
              fontSize: 16,
              textAlign: 'center',
              fontWeight: '400',
              bgcolor: '#fff',
              fontFamily: 'Proxima Nova',
              color: '#785f5d',
              mt: 1.2,
              zIndex: 99,
              borderBottomColor: 'white',
              borderTopRightRadius: '15px',
              borderTopLeftRadius: '15px',
              mb: -2.5,
              boxShadow: '0px 0px 8px rgba(0,0,0,0.2)',
              p: 0.875,
              border: '0.7px solid #b5a7a7',
            }}>
              {t('Dashboard.MarketCalls')}
            </Typography>
          </Box>
          <Box sx={{
            overflow: 'hidden',
            borderRadius: '15px',
            border: '0.7px solid #b5a7a7',
            borderTopColor: 'white',
            bgcolor: '#fff',
            mb: 1.25,
            height: 200,
            p: 0.625,
            width: '100%',
            boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
            mt: 1.5,
          }}>
            <Box sx={{mt: 2.5}}>
              <BarChartGraph data={MarketCalls} title={'MARKET CALLS'} />
            </Box>
          </Box>
        </Box>
      )}

      {SalesTrend?.length > 0 && <LineChartGraph data={SalesTrend} t={t} />}

      {Target?.length > 0 && (
        <Box>
          <Box sx={{width: '100%'}}>
            <Typography sx={{
              fontSize: 16,
              textAlign: 'center',
              fontWeight: '400',
              bgcolor: '#fff',
              fontFamily: 'Proxima Nova',
              color: '#785f5d',
              mt: 1.2,
              zIndex: 99,
              borderBottomColor: 'white',
              borderTopRightRadius: '15px',
              borderTopLeftRadius: '15px',
              mb: -2.5,
              boxShadow: '0px 0px 8px rgba(0,0,0,0.2)',
              p: 0.875,
              border: '0.7px solid #b5a7a7',
            }}>
              {t('Dashboard.TVA')}
            </Typography>
          </Box>
          <Box sx={{
            overflow: 'hidden',
            borderRadius: '15px',
            border: '0.7px solid #b5a7a7',
            borderTopColor: 'white',
            bgcolor: '#fff',
            mb: 1.25,
            height: 200,
            p: 0.625,
            width: '100%',
            boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
            mt: 1.5,
          }}>
            <DonutChart dataa={Target} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default memo(BottomCard);

