// Web-adapted Button component
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { Colors } from '../../theme/colors';

interface btnProps {
  onPress?: () => void;
  title: string;
  height?: string | number;
  width?: string | number;
  textStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const AppButton = (props: btnProps) => {
  const { onPress, title, style, textStyle, height, width } = props;
  const { isDarkMode } = useGlobleAction();

  return (
    <MuiButton
      variant="contained"
      onClick={onPress}
      sx={{
        backgroundColor: Colors.buttonPrimary,
        color: Colors.white,
        height: height || 40,
        width: width || '100%',
        borderRadius: '8px',
        border: '2px solid transparent',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontSize: '15px',
        '&:hover': {
          backgroundColor: Colors.buttonPrimary,
          opacity: 0.9,
        },
        ...style,
        ...textStyle,
      }}
    >
      {title}
    </MuiButton>
  );
};

export default AppButton;


