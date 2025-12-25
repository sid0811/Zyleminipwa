import React from 'react';
import {Box, Typography} from '@mui/material';
import {PieChart, Pie, Cell, ResponsiveContainer} from 'recharts';

const DonutChart = ({dataa}: any) => {
  const allValuesZero = dataa.every((item: any) => item.value === 0);

  const fallbackData = [
    {color: '#050404', label: 'Achievement', value: 0},
    {color: '#999999', label: 'Target', value: 100},
    {color: '#FFEB3B', label: 'Balance', value: 0},
  ];

  const chartData = allValuesZero ? fallbackData : dataa;
  const pieData = chartData.map((val: any) => ({
    ...val,
    value: val.value >= 0 ? val.value : 0,
  }));

  const Labels = ({slices}: any) => {
    return slices.map((slice: any, index: number) => {
      const {label, color, value} = slice;
      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            mt: 0.75,
          }}>
          <Box sx={{
            height: 12,
            width: 12,
            borderRadius: '6px',
            bgcolor: color,
            mr: 0.625,
          }} />
          <Typography sx={{fontSize: 14, color: 'black'}}>
            {label} - {value}
          </Typography>
        </Box>
      );
    });
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      height: 200,
    }}>
      <Box sx={{flex: 1.5}}>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={30}
            >
              {pieData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{flex: 1}}>
        <Labels slices={chartData} />
      </Box>
    </Box>
  );
};

export default DonutChart;

