// Web-adapted Dropdown component using Material-UI
import React, { useState, useRef, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Autocomplete,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import Icon from '../Icon/Icon';
import { Colors } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';

interface DropDownProps {
  isDropDownOpen?: boolean;
  width?: string | number;
  mainStyle?: React.CSSProperties;
  data?: Array<any> | undefined;
  ddStyle?: React.CSSProperties;
  CustomDDStyle?: React.CSSProperties;
  ddItemStyle?: React.CSSProperties;
  ddSeparatorStyle?: React.CSSProperties;
  selectedTextStyle?: React.CSSProperties;
  selectedValue?: string | string[];
  label: any;
  leftIcon?: boolean;
  title?: any;
  placeHolder?: any;
  onPressItem?: (data?: string | string[] | any) => void;
  isTitleShown?: boolean;
  selectedListIsScrollView?: boolean;
  isSearchable?: boolean;
  searchBoxStyle?: React.CSSProperties;
  isVoiceRecognitionActive?: boolean;
  multiSelect?: boolean;
}

const Dropdown = (prop: DropDownProps) => {
  const { t } = useTranslation();
  const {
    mainStyle,
    data = [],
    CustomDDStyle,
    placeHolder = 'Select',
    selectedValue,
    label = 'title',
    selectedTextStyle,
    title,
    leftIcon,
    onPressItem,
    isTitleShown = true,
    isSearchable = false,
    multiSelect = false,
    width = '100%',
  } = prop;
  
  const { isDarkMode } = useGlobleAction();
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<any>>(
    Array.isArray(selectedValue) ? selectedValue : selectedValue ? [selectedValue] : []
  );

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    String(item[label] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const value = event.target.value;
    
    if (multiSelect) {
      const newValue = typeof value === 'string' ? value.split(',') : value;
      setSelectedItems(newValue);
      if (onPressItem) {
        const selectedObjects = data.filter((item) =>
          newValue.includes(String(item[label]))
        );
        onPressItem(selectedObjects);
      }
    } else {
      const selectedItem = data.find((item) => String(item[label]) === value);
      setSelectedItems([value as string]);
      if (onPressItem && selectedItem) {
        onPressItem(selectedItem);
      }
      setIsDropDownOpen(false);
    }
  };

  // For Autocomplete (better for searchable dropdowns)
  if (isSearchable) {
    return (
      <Box sx={{ width, ...mainStyle }}>
        {isTitleShown && title && (
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {title}
          </Typography>
        )}
        <Autocomplete
          multiple={multiSelect}
          options={filteredData}
          getOptionLabel={(option) => String(option[label] || '')}
          value={
            multiSelect
              ? data.filter((item) =>
                  selectedItems.includes(String(item[label]))
                )
              : data.find((item) => String(item[label]) === selectedValue) || null
          }
          onChange={(event, newValue) => {
            if (multiSelect) {
              const values = Array.isArray(newValue) ? newValue : [];
              setSelectedItems(values.map((item) => String(item[label])));
              if (onPressItem) {
                onPressItem(values);
              }
            } else {
              const singleValue = newValue as any;
              setSelectedItems(singleValue ? [String(singleValue[label])] : []);
              if (onPressItem && singleValue) {
                onPressItem(singleValue);
              }
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeHolder}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? Colors.inputBox : Colors.white,
                },
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            multiSelect
              ? value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={index}
                    label={String(option[label])}
                  />
                ))
              : null
          }
          sx={{
            width: '100%',
            ...CustomDDStyle,
          }}
        />
      </Box>
    );
  }

  // Standard Select dropdown
  return (
    <Box sx={{ width, ...mainStyle }}>
      {isTitleShown && title && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      <FormControl
        fullWidth
        sx={{
          ...CustomDDStyle,
        }}
      >
        <Select
          open={isDropDownOpen}
          onOpen={() => setIsDropDownOpen(true)}
          onClose={() => setIsDropDownOpen(false)}
          value={
            multiSelect
              ? selectedItems
              : selectedValue || ''
          }
          onChange={handleChange}
          multiple={multiSelect}
          displayEmpty
          renderValue={(selected) => {
            if (multiSelect) {
              if ((selected as string[]).length === 0) {
                return <Typography sx={{ color: Colors.placeholderColor }}>{placeHolder}</Typography>;
              }
              return (selected as string[]).join(', ');
            }
            if (!selected || selected === '') {
              return <Typography sx={{ color: Colors.placeholderColor }}>{placeHolder}</Typography>;
            }
            const selectedItem = data.find((item) => String(item[label]) === selected);
            return selectedItem ? String(selectedItem[label]) : placeHolder;
          }}
          sx={{
            backgroundColor: isDarkMode ? Colors.inputBox : Colors.white,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: Colors.border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: Colors.primary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: Colors.primary,
            },
            ...selectedTextStyle,
          }}
          IconComponent={() => (
            <Icon
              name={isDropDownOpen ? 'up' : 'down'}
              family="AntDesign"
              size={18}
              color={Colors.primary}
            />
          )}
        >
          {filteredData.map((item, index) => (
            <MenuItem
              key={index}
              value={String(item[label])}
              sx={{
                ...prop.ddItemStyle,
              }}
            >
              {leftIcon && (
                <Icon name="menu" family="MaterialIcons" size={18} sx={{ mr: 1 }} />
              )}
              {String(item[label] || '')}
              {multiSelect && selectedItems.includes(String(item[label])) && (
                <Icon
                  name="check"
                  family="FontAwesome"
                  size={18}
                  color={Colors.primary}
                  sx={{ ml: 'auto' }}
                />
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Dropdown;


