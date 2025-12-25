import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import moment from 'moment';
import { Colors } from '../../../theme/colors';
import { ShopImgs } from '../../../constants/AllImages';
import { hp, wp } from '../../../utility/responsiveHelpers';
import Icon from '../../../components/Icon/Icon';

interface cardProps {
  outletDetail: any;
}

const ShopDetailCard = ({ outletDetail }: cardProps) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  let week = moment().format('dddd'); //Saturday current week
  let weekDay = week.toUpperCase(); //SATURDAY

  return (
    <Box sx={{ marginVertical: 1, marginLeft: 1 }}>
      <Paper
        elevation={1}
        onClick={() => setIsDropDownOpen(!isDropDownOpen)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          backgroundColor: Colors.white,
          borderColor: Colors.border,
          borderTopRightRadius: wp('2'),
          borderTopLeftRadius: wp('2'),
          padding: 2.5,
          width: wp('88'),
          borderWidth: hp('0.3'),
          borderStyle: 'solid',
          cursor: 'pointer',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
          <Box
            component="img"
            src={weekDay === outletDetail?.weeklyoff ? ShopImgs.weeklyoff : ShopImgs.ShopImg}
            alt="Shop"
            sx={{
              marginLeft: wp('2'),
              height: hp('10'),
              width: wp('19'),
              objectFit: 'contain',
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: hp('-3'),
              marginLeft: wp('4'),
            }}
          >
            <Typography
              sx={{
                color: '#796A6A',
                fontWeight: 'bold',
                fontFamily: 'Proxima Nova',
                fontSize: 14,
                marginTop: hp('3'),
              }}
            >
              {outletDetail?.party}
            </Typography>
            <Typography
              sx={{
                color: '#796A6A',
                fontFamily: 'Proxima Nova',
                fontSize: 10,
                marginVertical: wp('3'),
              }}
            >
              {outletDetail?.Outlet_Info?.split('||')[0]}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 0.1,
              display: 'flex',
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <Icon
              name={isDropDownOpen ? 'up' : 'down'}
              family="AntDesign"
              size={18}
              color={Colors.black}
            />
          </Box>
        </Box>
      </Paper>
      <Collapse in={isDropDownOpen}>
        <Paper
          elevation={1}
          sx={{
            backgroundColor: Colors.white,
            justifyContent: 'center',
            borderColor: Colors.border,
            borderBottomRightRadius: wp('2'),
            borderBottomLeftRadius: wp('2'),
            padding: 2.5,
            width: wp('88'),
            marginLeft: hp('-0.01'),
            borderRightWidth: hp('0.3'),
            borderLeftWidth: hp('0.3'),
            borderBottomWidth: hp('0.4'),
            borderStyle: 'solid',
          }}
        >
          <Typography
            sx={{
              color: '#796A6A',
              fontSize: 11,
              marginTop: hp('2'),
              marginLeft: wp('6'),
              fontFamily: 'Proxima Nova',
              marginRight: wp('0.7'),
            }}
          >
            {outletDetail?.party}
          </Typography>
          <Typography
            sx={{
              color: '#796A6A',
              fontSize: 11,
              marginTop: hp('2'),
              marginLeft: wp('6'),
              fontFamily: 'Proxima Nova',
              marginRight: wp('0.7'),
            }}
          >
            {outletDetail?.Outlet_Info?.split('||')[0]}
          </Typography>
          <Typography
            sx={{
              color: '#796A6A',
              fontSize: 11,
              marginTop: hp('2'),
              marginLeft: wp('6'),
              fontFamily: 'Proxima Nova',
              marginRight: wp('0.7'),
            }}
          >
            {outletDetail?.Outlet_Info?.split('||')[1]}
          </Typography>
          <Typography
            sx={{
              color: '#796A6A',
              fontSize: 11,
              marginTop: hp('2'),
              marginLeft: wp('6'),
              fontFamily: 'Proxima Nova',
              marginRight: wp('0.7'),
            }}
          >
            {outletDetail?.Outlet_Info?.split('||')[2]}
          </Typography>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default ShopDetailCard;

