import { Box, Typography, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  setSelectionVisibleFlag?: (val: boolean) => void;
  getListData?: () => void;
  onPress?: () => void;
}

const ChangeSelectionButton = (props: Props) => {
  const { getListData, setSelectionVisibleFlag, onPress } = props;
  const { t } = useTranslation();

  return (
    <Button
      variant="contained"
      startIcon={<Edit />}
      onClick={() => {
        if (onPress) {
          onPress();
        } else {
          setSelectionVisibleFlag?.(true);
          getListData?.();
        }
      }}
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 200,
        height: 56,
        borderRadius: 48,
        backgroundColor: '#ffffff',
        color: '#CC1167',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.16)',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
        zIndex: 1000,
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {t('Sales.SalesChangeSelection')}
      </Typography>
    </Button>
  );
};

export default ChangeSelectionButton;

