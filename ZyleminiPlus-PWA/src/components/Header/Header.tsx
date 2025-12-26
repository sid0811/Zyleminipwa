import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { hp, wp } from '../../utility/responsiveHelpers';

interface HeaderProp {
  navigation?: any;
  title: string;
  flexValue?: number | undefined;
  isBackValidation?: boolean;
  backBtnValidFunc?: () => void;
  onFilterPress?: () => void;
}

const Header: React.FC<HeaderProp> = (props) => {
  const nav = useNavigation();
  const {
    navigation = nav,
    title,
    flexValue = undefined,
    isBackValidation = false,
    backBtnValidFunc,
    onFilterPress,
  } = props;

  const handleBackButtonPress = () => {
    if (isBackValidation && backBtnValidFunc) {
      backBtnValidFunc();
    } else if (navigation?.canGoBack?.() !== false) {
      navigation?.goBack();
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

