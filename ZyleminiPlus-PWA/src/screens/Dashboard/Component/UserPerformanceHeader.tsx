import {Box, Typography, IconButton, TextField, InputAdornment} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';
import {Colors} from '../../../theme/colors';
import {fontsSize} from '../../../theme/typography';

interface props {
  navigation?: any;
  headerText: string;
  textInputPlaceHolder: string;
  setSearchText: (val: string) => void;
  searchText: string;
  totalCountText: string;
  dataLength: number;
}

const UserPerformanceHeader = (props: props) => {
  const {
    headerText,
    textInputPlaceHolder,
    setSearchText,
    searchText,
    totalCountText,
    dataLength,
  } = props;
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{
        height: 'auto',
        width: '100%',
        bgcolor: Colors.mainBackground,
        px: 1.25,
        borderBottomLeftRadius: '35px',
        borderBottomRightRadius: '35px',
        pb: 3.125,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
        }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              left: 8,
              color: Colors.white,
            }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{
            fontSize: fontsSize.large,
            fontWeight: 'bold',
            fontFamily: 'Proxima Nova',
            color: Colors.white,
          }}>
            {headerText}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          px: 2,
          mx: 2,
          my: 1.25,
        }}>
          <TextField
            placeholder={textInputPlaceHolder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{fontSize: 22}} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              bgcolor: Colors.white,
              borderRadius: '3%',
              '& .MuiOutlinedInput-root': {
                height: '7vh',
                borderColor: Colors.border,
                borderWidth: '0.5%',
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        px: 2.5,
        my: 1,
      }}>
        <Typography sx={{
          color: '#333',
          fontSize: fontsSize.large,
          my: 1,
          fontWeight: 'bold',
          fontFamily: 'Proxima Nova',
        }}>
          {totalCountText}
        </Typography>
        <Typography sx={{
          color: '#333',
          fontSize: fontsSize.large,
          my: 1,
          fontWeight: 'bold',
          fontFamily: 'Proxima Nova',
        }}>
          {dataLength || '0'}
        </Typography>
      </Box>
    </>
  );
};

export default UserPerformanceHeader;

