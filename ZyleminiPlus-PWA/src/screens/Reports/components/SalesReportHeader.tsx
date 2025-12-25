import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack, FilterList } from '@mui/icons-material';
import { Colors } from '../../../theme/colors';
import { SideMenuImg, globalImg } from '../../../constants/AllImages';

interface HeaderProp {
  navigation: any;
  title: string;
  flexValue?: number | undefined;
  onPressFilter: () => void;
}

const SalesReportHeader = (props: HeaderProp) => {
  const { navigation, title, onPressFilter } = props;

  const handleBackButtonPress = () => {
    navigation.goBack ? navigation.goBack() : navigation.navigate(-1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: 'auto',
        p: 1,
        backgroundColor: Colors.mainBackground,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={handleBackButtonPress}
          sx={{ color: Colors.textPrimary }}
        >
          <ArrowBack />
        </IconButton>

        <Box
          component="img"
          src={SideMenuImg.shopIcon}
          sx={{
            height: 35,
            width: 35,
            ml: 1,
          }}
        />
        
        <Typography
          sx={{
            ml: 2,
            fontSize: 18,
            fontWeight: 600,
            color: Colors.textPrimary,
          }}
        >
          {title}
        </Typography>
      </Box>

      <IconButton
        onClick={onPressFilter}
        sx={{ color: Colors.textPrimary, mr: 2 }}
      >
        <FilterList />
      </IconButton>
    </Box>
  );
};

export default SalesReportHeader;

