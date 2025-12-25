// Web-adapted TextInput component
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Colors } from '../../theme/colors';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { removeQuotation } from '../../utility/utils';
import Icon from '../Icon/Icon';

interface TextInputProps {
  onChangeText?: (txt: string) => void;
  onSubmitEditing?: () => void;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
  placeholder?: string;
  width?: string | number;
  marginVertical?: string | number;
  value?: string;
  otherProps?: any;
  multiline?: boolean;
  iconName?: string;
  iconFamily?: any;
  iconSize?: number;
  height?: string | number;
  isPassword?: boolean;
  blurOnSubmit?: boolean;
}

const AppTextInput = (prop: TextInputProps) => {
  const {
    onChangeText,
    onSubmitEditing,
    style,
    containerStyle,
    iconStyle,
    placeholder,
    width = '100%',
    marginVertical,
    value,
    otherProps,
    multiline = false,
    blurOnSubmit = false,
    iconName,
    iconFamily,
    iconSize,
    height,
    isPassword = false,
  } = prop;
  const { isDarkMode } = useGlobleAction();

  const [isSecureText, setIsSecureText] = useState(isPassword);

  const toggleSecureText = () => {
    setIsSecureText(prev => !prev);
  };

  return (
    <Box
      sx={{
        width,
        marginTop: marginVertical,
        marginBottom: marginVertical,
        height,
        position: 'relative',
        ...containerStyle,
      }}
    >
      <TextField
        fullWidth
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChangeText?.(removeQuotation(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline && onSubmitEditing) {
            onSubmitEditing();
          }
        }}
        multiline={multiline}
        type={isPassword && isSecureText ? 'password' : 'text'}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            height: height || 'auto',
            backgroundColor: isDarkMode ? Colors.textColor2 : Colors.white,
            borderColor: Colors.inputBox,
            borderWidth: '2px',
            borderStyle: 'solid',
            '& fieldset': {
              borderColor: Colors.inputBox,
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: Colors.inputBox,
            },
            '&.Mui-focused fieldset': {
              borderColor: Colors.inputBox,
            },
          },
          '& .MuiInputBase-input': {
            paddingLeft: iconName ? '40px' : '10px',
            paddingRight: isPassword ? '40px' : '10px',
            paddingTop: '6px',
            paddingBottom: '6px',
            fontSize: '18px',
            color: isDarkMode ? Colors.white : Colors.black,
          },
          '& .MuiInputBase-input::placeholder': {
            color: Colors.placeholderColor,
            opacity: 1,
          },
          ...style,
        }}
        InputProps={{
          startAdornment: iconName && (
            <InputAdornment position="start" sx={{ position: 'absolute', left: '8px', ...iconStyle }}>
              <Icon name={iconName} family={iconFamily} size={iconSize || 24} />
            </InputAdornment>
          ),
          endAdornment: isPassword && (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleSecureText}
                edge="end"
                sx={{ color: Colors.primary }}
              >
                {isSecureText ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...otherProps}
      />
    </Box>
  );
};

export default AppTextInput;

