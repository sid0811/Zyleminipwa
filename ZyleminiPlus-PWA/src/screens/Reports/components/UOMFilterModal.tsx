import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

// Fallback DatePicker component for when @mui/x-date-pickers is not installed
const DatePickerFallback = ({ value, onChange, slotProps, ...props }: any) => {
  const textFieldProps = slotProps?.textField || {};
  const momentValue = value ? (moment.isMoment(value) ? value : moment(value)) : moment();
  return (
    <TextField
      type="date"
      value={momentValue.format('YYYY-MM-DD')}
      onChange={(e) => {
        const date = moment(e.target.value);
        onChange && onChange(date);
      }}
      {...textFieldProps}
      {...props}
    />
  );
};

const LocalizationProviderFallback = ({ children }: any) => children;
const AdapterMomentFallback = {};

// Try to use real components if available, otherwise use fallbacks
let DatePicker: any;
let LocalizationProvider: any;
let AdapterMoment: any;

try {
  const muiDatePickers = require('@mui/x-date-pickers');
  const adapterMoment = require('@mui/x-date-pickers/AdapterMoment');
  DatePicker = muiDatePickers.DatePicker;
  LocalizationProvider = muiDatePickers.LocalizationProvider;
  AdapterMoment = adapterMoment.AdapterMoment;
} catch {
  DatePicker = DatePickerFallback;
  LocalizationProvider = LocalizationProviderFallback;
  AdapterMoment = AdapterMomentFallback;
}

import Dropdown from '../../../components/Dropdown/Dropdown';
import { Colors } from '../../../theme/colors';

interface props {
  isMultiFilterOpen: boolean;
  onPress: (val: boolean) => void;
  onConfirm: (val: boolean) => void;
  brandData: any;
  brandLabel?: string;
  selectedBrand: string;
  setSelectedBrands: (val: any) => void;
  distData: any;
  selectedDistributor: string;
  setSelectedDistributor: (val: any) => void;
  UOMData: any;
  selectedUOM: string;
  setSelectedUOM: (val: any) => void;
  confirmFlag: boolean;
  fromDate: any;
  setFromDate: (date: Date) => void;
  toDate: any;
  setToDate: (date: Date) => void;
  isDateFilterEnabled: boolean;
  isToDateRestrictionActive: boolean;
  isProductFilterActive?: boolean;
  onResetPress: () => void;
}

function UOMFilterModal(props: props) {
  const {
    isMultiFilterOpen,
    onPress,
    onConfirm,
    brandData,
    brandLabel = 'BRAND',
    selectedBrand,
    setSelectedBrands,
    distData,
    selectedDistributor,
    setSelectedDistributor,
    UOMData,
    selectedUOM,
    setSelectedUOM,
    confirmFlag,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    isDateFilterEnabled,
    isToDateRestrictionActive = false,
    isProductFilterActive = true,
    onResetPress,
  } = props;

  const { t } = useTranslation();

  const onFromDateChange = (selectedDate: any) => {
    if (selectedDate) {
      const date = selectedDate.toDate ? selectedDate.toDate() : new Date(selectedDate);
      if (isToDateRestrictionActive) {
        setFromDate(date);
        const getToDate = getMaxDate(date);
        setToDate(getToDate);
      } else {
        setFromDate(date);
      }
    }
  };

  const onToDateChange = (selectedDate: any) => {
    if (selectedDate) {
      const date = selectedDate.toDate ? selectedDate.toDate() : new Date(selectedDate);
      setToDate(date);
    }
  };

  const getValidDate = (dateString: any) => {
    if (!dateString) return moment();
    
    const date = moment(dateString);
    return date.isValid() ? date : moment();
  };

  // Calculate maximum date (90 days from fromDate)
  const getMaxDate = (fromDate: any) => {
    const maxDate = new Date(fromDate);
    maxDate.setDate(maxDate.getDate() + 90);
    return maxDate;
  };

  return (
    <Modal
      open={isMultiFilterOpen}
      onClose={() => onPress(!isMultiFilterOpen)}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'auto',
        }}
      >
        {/* Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Edit sx={{ mr: 1, color: Colors.primary }} />
          <Typography variant="h6" component="h2">
            {t('TargetVsAchievement.TargetVsAchievementChangeSelection')}
          </Typography>
        </Box>

        {/* Date Pickers */}
        {isDateFilterEnabled && (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 600 }}>
                  FROM DATE
                </Typography>
                <DatePicker
                  value={getValidDate(fromDate)}
                  onChange={onFromDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 600 }}>
                  TO DATE
                </Typography>
                <DatePicker
                  value={getValidDate(toDate)}
                  onChange={onToDateChange}
                  disabled={isToDateRestrictionActive}
                  minDate={getValidDate(fromDate)}
                  maxDate={moment(getMaxDate(getValidDate(fromDate).toDate()))}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Box>
            </Box>
          </LocalizationProvider>
        )}

        {/* Products Dropdown */}
        {isProductFilterActive && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 600 }}>
              {t('TargetVsAchievement.TargetVsAchievementProducts')}
            </Typography>
            <Dropdown
              selectedListIsScrollView={true}
              data={brandData}
              label={brandLabel ? brandLabel : 'BRAND'}
              CustomDDStyle={{}}
              ddItemStyle={{}}
              isTitleShown={false}
              selectedValue={selectedBrand}
              onPressItem={(val: any) => {
                setSelectedBrands(val);
              }}
              multiSelect={true}
            />
          </Box>
        )}

        {/* Distributors Dropdown */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 600 }}>
            {t('TargetVsAchievement.TargetVsAchievementDistributors')}
          </Typography>
          <Dropdown
            selectedListIsScrollView={true}
            data={distData}
            label={'Distributor'}
            CustomDDStyle={{}}
            ddItemStyle={{}}
            isTitleShown={false}
            selectedValue={selectedDistributor}
            onPressItem={(val: any) => {
              setSelectedDistributor(val);
            }}
          />
        </Box>

        {/* UOM Dropdown */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: 12, fontWeight: 600 }}>
            {t('TargetVsAchievement.TargetVsAchievementUOM')}
          </Typography>
          <Dropdown
            selectedListIsScrollView={true}
            data={UOMData}
            label={'UOMDescription'}
            CustomDDStyle={{}}
            ddItemStyle={{}}
            isTitleShown={false}
            selectedValue={selectedUOM}
            onPressItem={(val: any) => {
              setSelectedUOM(val);
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onPress(!isMultiFilterOpen);
              onConfirm(!confirmFlag);
            }}
            sx={{
              backgroundColor: Colors.primary,
              '&:hover': {
                backgroundColor: Colors.primaryDark,
              },
            }}
          >
            {t('TargetVsAchievement.TargetVsAchievementConfirm')}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onResetPress();
            }}
            sx={{
              borderColor: Colors.primary,
              color: Colors.primary,
            }}
          >
            {t('TargetVsAchievement.TargetVsAchievementReset')}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() => {
              onPress(!isMultiFilterOpen);
            }}
            sx={{
              color: Colors.textSecondary,
            }}
          >
            {t('TargetVsAchievement.TargetVsAchievementCancel')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UOMFilterModal;

