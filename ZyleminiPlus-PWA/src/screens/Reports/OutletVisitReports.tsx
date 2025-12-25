import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { Search, Store } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  getDataForActivity,
  getdatafromcust,
  getdatafromdist,
} from '../../database/WebDatabaseHelpers';
import { ScreenName } from '../../constants/screenConstants';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { ShopImgs } from '../../constants/AllImages';
import Loader from '../../components/Loader/Loader';
import LoadingSkeleton from '../../components/Loading/LoadingSkeleton';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import { writeReportsLog } from '../../utility/utils';

const OutletVisitReports = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useLoginAction();

  const [CustomerList, setCustomerList] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    GetAllData();
  }, []);

  const GetAllData = async () => {
    try {
      setIsLoading(true);
      writeReportsLog('Outlet Visit Report');
      
      const data = await getDataForActivity();
      
      const customerPromises = (data as any[]).map(async (item: any) => {
        if (item.entity_type === 1) {
          return await getdatafromcust(item.entity_id, userId);
        } else if (item.entity_type === 0) {
          return await getdatafromdist(item.entity_id, userId);
        }
        return [];
      });

      const results = await Promise.all(customerPromises);
      const allCustomers = results.flat();
      setCustomerList(allCustomers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = CustomerList.filter((item: any) =>
    item.Party?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOutletClick = (item: any) => {
    navigate(`/${ScreenName.OUTLETVISITACTIVITY}`, {
      state: {
        Party: item.Party,
        entity_id: item.CustomerId,
      },
    });
  };

  if (isLoading) {
    return (
      <CustomSafeView edges={['bottom']}>
        <Header title={t('Shops.ShopsActionBarText')} navigation={{ goBack: () => navigate(-1) }} />
        <LoadingSkeleton variant="list" count={8} />
      </CustomSafeView>
    );
  }

  return (
    <>
      <Loader visible={isLoading} />
      <CustomSafeView edges={['bottom']}>
        <Header title={t('Shops.ShopsActionBarText')} navigation={{ goBack: () => navigate(-1) }} />

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
            {filteredCustomers.length} {t('outlets found')}
          </Typography>
        </Box>

        {/* Outlet List */}
        <Box sx={{ px: 2 }}>
          {filteredCustomers.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {searchText
                  ? t('No outlets found matching your search')
                  : t('No outlet visits recorded')}
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
                      onClick={() => handleOutletClick(item)}
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
                            {item.Party}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {item.date && (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mt: 0.5 }}
                              >
                                Last Visit: {item.date}
                              </Typography>
                            )}
                            {item.Address && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {item.Address}
                              </Typography>
                            )}
                          </Box>
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
    </>
  );
};

export default OutletVisitReports;
