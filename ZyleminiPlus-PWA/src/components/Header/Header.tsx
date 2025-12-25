import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Colors } from '../../theme/colors';
import { hp, wp } from '../../utility/responsiveHelpers';

interface HeaderProp {
  navigation?: {
    back?: () => void;
    goBack?: () => void;
  };
  title: string;
  flexValue?: number | undefined;
  isBackValidation?: boolean;
  backBtnValidFunc?: () => void;
  onFilterPress?: () => void;
}

const Header: React.FC<HeaderProp> = (props) => {
  const navigate = useNavigate();
  const {
    navigation,
    title,
    flexValue = undefined,
    isBackValidation = false,
    backBtnValidFunc,
    onFilterPress,
  } = props;

  const handleBackButtonPress = () => {
    if (isBackValidation && backBtnValidFunc) {
      backBtnValidFunc();
    } else if (navigation?.back) {
      navigation.back();
    } else if (navigation?.goBack) {
      navigation.goBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 1,
        backgroundColor: Colors.mainBackground,
        minHeight: hp('6'),
      }}
    >
      <IconButton
        onClick={handleBackButtonPress}
        sx={{
          marginLeft: wp('1.4'),
          color: Colors.white,
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography
        variant="h6"
        sx={{
          marginLeft: wp('4'),
          color: Colors.white,
          flex: 1,
        }}
      >
        {title}
      </Typography>
      {onFilterPress && (
        <IconButton onClick={onFilterPress} sx={{ color: Colors.white }}>
          <Typography>Filter</Typography>
        </IconButton>
      )}
    </Box>
  );
};

export default Header;

