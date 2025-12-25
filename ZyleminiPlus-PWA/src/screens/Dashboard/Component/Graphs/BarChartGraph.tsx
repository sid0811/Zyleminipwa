import React from 'react';
import {Box, Typography} from '@mui/material';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell} from 'recharts';

interface barData {
  data?: any;
  title?: string;
}

const BarChartGraph = ({data, title}: barData) => {
  if (!data || data.length === 0) {
    return <Box></Box>;
  }

  const filteredMarketCalls = data.filter((item: any) => {
    const excludedLabels = [
      'AttendanceEntry',
      'EndOfTheDay',
      'Images',
      'Visited',
    ];
    return !excludedLabels.includes(item.label);
  });

  const chartData = title === 'MARKET CALLS' ? filteredMarketCalls : data;

  return (
    <Box sx={{width: '100%', height: '100%'}}>
      <Typography sx={{
        fontSize: 15,
        fontWeight: '500',
        color: 'black',
        textAlign: 'center',
        mt: -2,
        ml: 2,
        mb: 4,
      }}>
        {''}
      </Typography>
      <ResponsiveContainer width="100%" height={135}>
        <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 20}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="label" 
            angle={-15}
            textAnchor="end"
            height={60}
            style={{fontSize: '11px', fontWeight: 'bold', fill: '#999999'}}
          />
          <YAxis style={{fontSize: '13px', fontWeight: 'bold', fill: '#999999'}} />
          <Tooltip />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#007aff'} stroke="#b5a7a7" strokeWidth={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartGraph;

