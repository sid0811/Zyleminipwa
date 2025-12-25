import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useOrderAction } from '../../../../redux/actionHooks/useOrderAction';

interface CNO3props {
  isSavePressed: (action: boolean) => void;
}

function SubmissionButton3({ isSavePressed }: CNO3props) {
  const { t } = useTranslation();
  const { isDataCollection } = useOrderAction();

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', gap: 2, backgroundColor: 'white', boxShadow: 3 }}>
      {isDataCollection ? (
        <Button
          variant="contained"
          fullWidth
          onClick={() => isSavePressed(true)}
          sx={{ backgroundColor: '#46BE50' }}
        >
          {t('Common.Submit')}
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            fullWidth
            onClick={() => isSavePressed(true)}
            sx={{ backgroundColor: '#46BE50' }}
          >
            {t('Common.Save')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => isSavePressed(false)}
            sx={{ borderColor: '#46BE50', color: '#46BE50' }}
          >
            {t('Common.Discard')}
          </Button>
        </>
      )}
    </Box>
  );
}

export default SubmissionButton3;

