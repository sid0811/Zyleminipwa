import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { CameraAlt, NavigateNext, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import useLocation from '../../../hooks/useLocation';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { Colors } from '../../../theme/colors';
import {
  getBeatData,
  getDistributorData,
  getOutletArrayFromShop,
  getOutletArrayRoute,
  getRouteData,
} from '../../../database/WebDatabaseHelpers';
import Header from '../../../components/Header/Header';
import { ScreenName } from '../../../constants/screenConstants';
import { useShopAction } from '../../../redux/actionHooks/useShopAction';
import {
  writeErrorLog,
  getAppOrderId,
} from '../../../utility/utils';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import Dropdown from '../../../components/Dropdown/Dropdown';
import useDialog from '../../../hooks/useDialog';
import ConfirmDialog from '../../../components/Dialog/ConfirmDialog';

function AddNewShop1() {
  const { selectedShopData } = useShopAction();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const { isDarkMode } = useGlobleAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  const { latitude, longitude } = useLocation();
  const { dialogState, showDialog, hideDialog, handleConfirm } = useDialog();

  const [outletArray, setOutletArray] = useState<any>([]);
  const [routeData, setRouteData] = useState<any>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [distData, setDistData] = useState<any>([]);
  const [selectedDist, setSelectedDist] = useState<any>(null);
  const [outletname, Setoutletname] = useState('');
  const [ownername, Setownername] = useState('');
  const [Address, SetAddress] = useState('');
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [Beatid, setBeatid] = useState<any>('');
  const [fileList, setfileList] = useState<any>([]);
  const [appOrderId, setAppOrderId] = useState('');
  const [capturedImages, setCapturedImages] = useState<File[]>([]);

  useEffect(() => {
    takeDataFromDB();
    getId();
  }, []);

  async function getId() {
    const id = await getAppOrderId(userId);
    setAppOrderId(id);
  }

  const takeDataFromDB = async () => {
    try {
      // Route
      const routeData: any = await getRouteData(userId);
      setRouteData(routeData);

      if (routeData.length > 0) {
        const outletArray = await getOutletArrayRoute(routeData[0]?.RouteID);
        setOutletArray(outletArray);
        setSelectedRoute(routeData[0]);
        setBeatid(routeData[0]?.RouteID);
      }

      // Dist
      const DistData: any = await getDistributorData(userId);
      setDistData(DistData);
      if (DistData.length > 0) {
        setSelectedDist(DistData[0]);
      }
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
      console.log('error while take data from db -->', error);
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setCapturedImages([...capturedImages, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  const nextPress = () => {
    if (Beatid && outletname && ownername && Address) {
      try {
        navigate(`/${ScreenName.ADDNEWSHOPS2}`, {
          state: {
            Beatid,
            outletname,
            ownername,
            Address,
            latitude,
            longitude,
            fileList: capturedImages,
            appOrderId,
          },
        });
      } catch (error) {
        writeErrorLog('nextPress', error);
      }
    } else {
      showDialog(
        t('Validation Error'),
        t('Please fill all required fields'),
        () => {},
        'warning'
      );
    }
  };

  const onBeatChange = async (val: any) => {
    setSelectedRoute(val);
    setBeatid(val.RouteID);
    try {
      const outletArray = await getOutletArrayRoute(val?.RouteID);
      setOutletArray(outletArray);
    } catch (error) {
      writeErrorLog('onBeatChange', error);
    }
  };

  return (
    <CustomSafeView edges={['bottom']}>
      <Header
        title={t('AddNewParty.AddNewPartyTitle')}
        navigation={{ goBack: () => navigate(-1) }}
      />
      
      <Box sx={{ flex: 1, p: 3, pb: 10 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Select Beat/Route */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.selectbeat')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <Dropdown
              data={routeData}
              label={'RouteName'}
              selectedListIsScrollView={true}
              placeHolder={'Select Route'}
              selectedValue={selectedRoute?.RouteName}
              onPressItem={(val: any) => {
                onBeatChange(val);
              }}
            />
          </Box>

          {/* Outlet Name */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.OutletName')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={outletname}
              onChange={(e) => Setoutletname(e.target.value)}
              placeholder={t('Enter outlet name')}
              variant="outlined"
            />
          </Box>

          {/* Owner Name */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.ownername')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={ownername}
              onChange={(e) => {
                const txt = e.target.value;
                if (/^[A-Za-z ]*$/.test(txt)) {
                  Setownername(txt);
                }
              }}
              placeholder={t('Enter owner name')}
              variant="outlined"
            />
          </Box>

          {/* Address */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.address')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={Address}
              onChange={(e) => SetAddress(e.target.value)}
              placeholder={t('Enter address')}
              variant="outlined"
            />
          </Box>

          {/* Location */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.addlocation')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={`${longitude.toString()}, ${latitude.toString()}`}
              disabled
              variant="outlined"
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: Colors.textPrimary,
                },
              }}
            />
          </Box>

          {/* Add Pictures */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.addpictures')}
            </Typography>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CameraAlt />}
              fullWidth
              sx={{ mb: 2, py: 1.5 }}
            >
              {t('Capture/Upload Images')}
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleImageCapture}
              />
            </Button>

            {capturedImages.length > 0 && (
              <ImageList cols={3} gap={8}>
                {capturedImages.map((image, index) => (
                  <ImageListItem key={index} sx={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Captured ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" color="error" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>

          {/* Next Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<NavigateNext />}
            onClick={nextPress}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: Colors.primary,
              '&:hover': {
                backgroundColor: Colors.primaryDark,
              },
            }}
          >
            {t('Next')}
          </Button>
        </Paper>
      </Box>

      <ConfirmDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
      />
    </CustomSafeView>
  );
}

export default AddNewShop1;
