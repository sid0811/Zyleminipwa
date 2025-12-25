import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
} from '@mui/material';
import { Search, Store } from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getmyactivitydataget } from '../../database/WebDatabaseHelpers';
import { ScreenName } from '../../constants/screenConstants';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { writeReportsLog } from '../../utility/utils';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';

const OutletMyActivityPatyList = () => {
  const navigate = useNavigate();
  const [CustomerList, setCustomerList] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    GetAllData();
  }, []);

  const GetAllData = () => {
    writeReportsLog('Outlet visit Party');
    const currentdate = moment().format('DD-MMM-YYYY');
    const yesterdaysdate = moment().subtract(1, 'day').format('DD-MMM-YYYY');
    const dayafteryesterdays = moment().subtract(2, 'day').format('DD-MMM-YYYY');

    getmyactivitydataget(currentdate, yesterdaysdate, dayafteryesterdays).then(
      (data: any) => {
        console.log('Data', data);

        const dummyArr = [];
        for (let i = 0; i < data.length; i++) {
          const x = {
            date: data[i].from_date,
            Party: data[i].Party,
            CustomerId: data[i].CustomerId,
          };
          dummyArr.push(x);
        }
        setCustomerList(dummyArr);
      }
    );
  };

  const filteredCustomers = CustomerList.filter((item: any) =>
    item.Party?.toLowerCase()?.includes(searchText?.toLowerCase())
  );

  const handleItemClick = (item: any) => {
    navigate(`/${ScreenName.MYACTIVTIYREPORT}`, {
      state: {
        Party: item?.Party,
        date: item?.date,
        entity_id: item?.CustomerId,
      },
    });
  };

  return (
    <CustomSafeView edges={['bottom']}>
      <Header
        title={t('MyActivityReport.MyActivityReportActionBarText')}
        navigation={{ goBack: () => navigate(-1) }}
      />

      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder={t('Shops.SearchShop')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Results Count */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="body2" color="textSecondary">
          {filteredCustomers.length} {t('results found')}
        </Typography>
      </Box>

      {/* Customer List */}
      <Box sx={{ px: 2 }}>
        {filteredCustomers.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {searchText
                ? t('No results found matching your search')
                : t('No activity data available')}
            </Typography>
          </Paper>
        ) : (
          <List sx={{ pb: 2 }}>
            {filteredCustomers.map((item: any, index: number) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleItemClick(item)}
                    sx={{ py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: Colors.primary,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Store />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, color: Colors.textPrimary }}
                        >
                          {item?.date}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 0.5 }}
                        >
                          {item?.Party}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Box>
    </CustomSafeView>
  );
};

export default OutletMyActivityPatyList;
