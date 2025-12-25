import React, {useEffect, useState} from 'react';
import {Box, Typography, List, ListItem} from '@mui/material';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {useNavigate, useLocation} from 'react-router-dom';

import {userPerformanceReport} from '../../../api/DashboardAPICalls';
import {useLoginAction} from '../../../redux/actionHooks/useLoginAction';

import {fontsSize} from '../../../theme/typography';
import Loader from '../../../components/Loader/Loader';
import {Colors} from '../../../theme/colors';
import UserPerformanceHeader from '../Component/UserPerformanceHeader';
import {
  getDateRangeArray,
  previousMonthDate,
  today,
  twoMonthsBackDate,
  writeReportsLog,
} from '../../../utility/utils';
import {
  DistributorData,
  getBrandForBrandWise_Report,
  UOMMaster,
} from '../../../types/types';
import {
  getBrands,
  getDistributorData,
  getUOMList,
} from '../../../database/SqlDatabase';

import ChangeSelectionButton from '../../Reports/components/ChangeSelectionButton';
import UOMFilterModal from '../../Reports/components/UOMFilterModal';

const DashboardBWSReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {CommandType} = location.state as {CommandType: string};
  const {t} = useTranslation();
  const {userId} = useLoginAction();

  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [UOMData, setUOMData] = useState<UOMMaster[]>([]);
  const [selectedUOM, setSelectedUOM] = useState({} as UOMMaster);

  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [selectionChangeFlag, setSelectionChangeFlag] = useState(false);

  const [brandData, setBrandData] = useState<any>([]);
  const [selectedBrands, setSelectedBrands] = useState<
    getBrandForBrandWise_Report[]
  >([]);
  const [distData, setDistData] = useState<DistributorData[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState(
    {} as DistributorData,
  );

  const [selectedFilterDates, setSelectedFilterDates] = useState({
    fromDate: '',
    toDate: '',
  });

  const monthTab = [
    {
      blankHeader: '',
      currentMonth: today.format('MMM'),
      prevMonth: previousMonthDate.format('MMM'),
      prevTwoMonth: twoMonthsBackDate.format('MMM'),
    },
  ];

  const [selectedTabMonths, setSelectedTabMonths] = useState(monthTab);

  const rows = [
    'BillCuts',
    'Outlets',
    'Sales',
    'Value',
    'ValuePercent',
    'VolumePercent',
  ];

  useEffect(() => {
    fetchData();
  }, [CommandType, userId, selectionChangeFlag]);

  useEffect(() => {
    fetchFilterData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const ddata = await userPerformanceReport(
        userId,
        CommandType,
        selectedUOM?.UOMDescription,
        selectedDistributors?.DistributorID,
        selectedBrands?.map(i => i?.BRANDID)?.toString(),
        selectedFilterDates?.fromDate,
        selectedFilterDates?.toDate,
      );
      setData(ddata?.Brand_Wise_Sales);
    } catch (error: any) {
      window.alert(error.message || t('Alerts.AnErrorOccurred'));
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFilterData() {
    writeReportsLog('Dashboard BWS Report');
    await getUOMList()
      .then((data: any) => {
        setUOMData(data);
      })
      .catch(err => console.log('getUOMList error', err));

    await getDistributorData(userId)
      .then(distData => {
        setDistData(distData);
      })
      .catch(err => console.log('getDistributorData error', err));

    await getBrands(userId)
      .then(data => {
        setBrandData(data);
      })
      .catch(err => console.log('getBrands error', err));
  }

  const onConfirmDateRange = () => {
    const dateRange = getDateRangeArray(
      new Date(selectedFilterDates?.fromDate),
      'MMM',
    );

    const monthTab = [
      {
        blankHeader: '',
        currentMonth: dateRange[2]?.month,
        prevMonth: dateRange[1]?.month,
        prevTwoMonth: dateRange[0]?.month,
      },
    ];

    setSelectedTabMonths(monthTab);
    setSelectionChangeFlag(!selectionChangeFlag);
  };

  return (
    <>
      <Loader visible={isLoading} />
      <Box sx={{flex: 1}}>
        <UserPerformanceHeader
          headerText={t('Dashboard.BrandWiseSales')}
          textInputPlaceHolder={t('Orders.SearchBrand')}
          setSearchText={val => setSearchText(val)}
          searchText={searchText}
          totalCountText={t('Dashboard.TotalBrandSales') + ' - '}
          dataLength={data?.length}
        />
        {data?.length > 0 ? (
          <>
            <List sx={{px: 2.5, overflowY: 'auto', pb: 16.25}}>
              {data
                ?.filter((item: any) =>
                  item?.Brand.toLowerCase().includes(searchText.toLowerCase()),
                )
                .map((item: any, index: number) => (
                  <ListItem
                    key={item.Brand}
                    sx={{
                      bgcolor: 'white',
                      borderRadius: '8px',
                      p: 1.875,
                      mb: 1.875,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'block',
                    }}>
                    <Typography
                      sx={{
                        fontSize: fontsSize.large,
                        fontWeight: 'bold',
                        mb: 1.25,
                        color: Colors.black,
                      }}>
                      {item.Brand}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        bgcolor: '#333',
                        p: 0.25,
                        mb: 1.25,
                      }}>
                      {selectedTabMonths[0] &&
                        Object.values(selectedTabMonths[0]).map(
                          (header, idx) => (
                            <Typography
                              key={idx}
                              sx={{
                                flex: 1,
                                fontWeight: 'bold',
                                textAlign: idx === 0 ? 'left' : 'center',
                                color: Colors.white,
                              }}>
                              {header}
                            </Typography>
                          ),
                        )}
                    </Box>

                    {rows.map((row, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          mb: 0.625,
                        }}>
                        <Typography
                          sx={{
                            flex: 1,
                            fontWeight: 'bold',
                            color: Colors.black,
                            fontSize: fontsSize.smallDefault,
                          }}>
                          {row}
                        </Typography>
                        <Box sx={{flex: 3, display: 'flex', flexDirection: 'row'}}>
                          <Typography
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              color: Colors.black,
                              fontSize: fontsSize.smallDefault,
                            }}>
                            {item[row]?.CM || '-'}
                          </Typography>
                          <Typography
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              color: Colors.black,
                              fontSize: fontsSize.smallDefault,
                            }}>
                            {item[row]?.PM || '-'}
                          </Typography>
                          <Typography
                            sx={{
                              flex: 1,
                              textAlign: 'center',
                              color: Colors.black,
                              fontSize: fontsSize.smallDefault,
                            }}>
                            {item[row]?.MBP || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </ListItem>
                ))}
            </List>

            <ChangeSelectionButton
              getListData={() => {}}
              setSelectionVisibleFlag={val => setIsSelectionVisible(val)}
            />

            <UOMFilterModal
              isMultiFilterOpen={isSelectionVisible}
              onPress={val => setIsSelectionVisible(val)}
              onConfirm={val => onConfirmDateRange()}
              brandData={brandData}
              selectedBrand={selectedBrands[0]?.BRAND}
              setSelectedBrands={val => setSelectedBrands(val)}
              distData={distData}
              selectedDistributor={selectedDistributors?.Distributor}
              setSelectedDistributor={val => setSelectedDistributors(val)}
              UOMData={UOMData}
              selectedUOM={selectedUOM?.UOMDescription}
              setSelectedUOM={val => setSelectedUOM(val)}
              confirmFlag={selectionChangeFlag}
              fromDate={selectedFilterDates?.fromDate}
              setFromDate={d => {
                setSelectedFilterDates(prevDates => ({
                  ...prevDates,
                  fromDate: moment(d).format('YYYY-MM-DD'),
                }));
              }}
              toDate={selectedFilterDates?.toDate}
              setToDate={d => {
                setSelectedFilterDates(prevDates => ({
                  ...prevDates,
                  toDate: moment(d).format('YYYY-MM-DD'),
                }));
              }}
              isDateFilterEnabled={true}
              isToDateRestrictionActive={true}
              onResetPress={() => {
                setSelectedBrands([]);
                setSelectedDistributors({Distributor: '', DistributorID: ''});
                setSelectedUOM({id: null, UOMDescription: ''});
                setSelectedFilterDates({fromDate: '', toDate: ''});
                setIsSelectionVisible(false);

                setTimeout(() => {
                  setIsSelectionVisible(true);
                }, 300);
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              mt: 2,
              bgcolor: '#fc5c65',
              height: 50,
              width: '50%',
            }}>
            <Typography sx={{color: '#fff', fontSize: 16}}>
              {t('VistBaseMap.VistBaseMapNoData')}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DashboardBWSReport;

