import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';

interface props {
  onPress: (val: boolean) => void;
  isModalOpen: boolean;
  minDate: Date;
  maxDate?: Date;
  onDateChange: (date: string) => void;
  format?: string;
  fromDate?: string;
}

function CustomCalender(props: props) {
  const {
    isModalOpen,
    fromDate,
    onPress,
    minDate,
    maxDate = undefined,
    onDateChange,
    format = 'DD-MMM-YYYY',
  } = props;

  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Moment | null>(
    fromDate ? moment(fromDate, format) : null
  );

  const handleClose = () => {
    onPress(false);
  };

  const handleOkay = () => {
    if (selectedDate) {
      onDateChange(selectedDate.format(format));
    }
    onPress(false);
  };

  return (
    <Dialog open={isModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Date</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            minDate={moment(minDate)}
            maxDate={maxDate ? moment(maxDate) : undefined}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
              },
            }}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleOkay} variant="contained">
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomCalender;

