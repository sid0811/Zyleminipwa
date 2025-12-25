import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

// hooks
import {useDashAction} from '../../../redux/actionHooks/useDashAction';

// Components
import Header from '../../../components/Header/Header';
import LineChartGraph from '../Component/Graphs/LineChartGraph';
import React from 'react';

const SalesTrendReport = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {SalesTrend} = useDashAction();

  return (
    <Box sx={{flex: 1}}>
      <Header navigation={{goBack: () => navigate(-1)}} title={'Sales Trend Report'} />

      <Box
        sx={{
          flex: 1,
          bgcolor: '#f5f5f5',
          px: 2,
        }}>
        {SalesTrend.length > 0 && (
          <Box
            sx={{
              mt: 3.75,
              borderRadius: '15px',
            }}>
            <LineChartGraph data={SalesTrend} t={t} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SalesTrendReport;

