// Web-adapted ShopHeader component - Preserving exact UI
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { globalImg } from '../../../../constants/AllImages';
import { CustomFontStyle } from '../../../../theme/typography';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../components/Icon/Icon';

interface HeaderProps {
  onPress?: (val: boolean) => void;
  navigation?: any;
}

const ShopHeader = (props: HeaderProps) => {
  const { t } = useTranslation();
  const { onPress, navigation } = props;
  const { isDarkMode } = useGlobleAction();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Colors.mainBackground,
        height: 'auto',
        padding: '1vh',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '5px' }}>
        <IconButton
          onClick={() => {
            navigate(-1); // Web: Go back
          }}
          sx={{ marginLeft: '1.4vw', color: Colors.white }}
        >
          <Icon
            family="MaterialIcons"
            name="keyboard-backspace"
            size={25}
            color={Colors.white}
          />
        </IconButton>
        <Typography
          sx={[
            CustomFontStyle().titleExtraLarge,
            { marginLeft: '4vw', color: Colors.white },
          ]}
        >
          {t('SideMenu.Shops') || 'Shops'}
        </Typography>
      </Box>
      {/* View toggle buttons can be added here if needed */}
    </Box>
  );
};

export default ShopHeader;


