import React from 'react';
import {Box, Typography} from '@mui/material';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot} from 'recharts';

interface lineData {
  data: any;
  t: any;
  showTitle?: boolean;
}

function LineChartGraph({data, t, showTitle = true}: lineData) {
  if (!data || data.length === 0) {
    return <Box></Box>;
  }

  const chartData = data.map((el: any) => ({
    month: el.month,
    value: parseInt(el.value),
    label: `${el.month} - (${parseInt(el.value)})`,
  }));

  return (
    <Box sx={{width: '100%', mt: 1}}>
      {showTitle && (
        <Typography sx={{
          fontSize: 16,
          textAlign: 'center',
          fontWeight: '400',
          bgcolor: '#fff',
          mt: 1,
          borderBottomColor: 'white',
          zIndex: 99,
          borderTopRightRadius: '15px',
          borderTopLeftRadius: '15px',
          mb: -2.1,
          boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
          p: 0.875,
          borderColor: '#b5a7a7',
          color: '#785f5d',
          borderWidth: 0.7,
          borderStyle: 'solid',
        }}>
          {t('Dashboard.SalesTrend')}
        </Typography>
      )}
      <Box sx={{
        mt: 0,
        borderRadius: '12px',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        boxShadow: '10px 10px 8px rgba(0,0,0,0.5)',
        bgcolor: '#fff',
        p: 2,
      }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 20}}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              angle={-15}
              textAnchor="end"
              height={80}
              style={{fontSize: data.some((el: any) => el.value.length > 6) ? '8px' : '11px'}}
            />
            <YAxis 
              tickFormatter={(value) => `${value}`}
              style={{fontSize: data.some((el: any) => el.value.length > 6) ? '10px' : '12px'}}
            />
            <Tooltip formatter={(value: any) => [`${value}`, 'Value']} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="rgba(0, 0, 225, 1)" 
              strokeWidth={2}
              dot={<Dot r={6} fill="#ffa726" stroke="#ffa726" strokeWidth={6} />}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default LineChartGraph;

