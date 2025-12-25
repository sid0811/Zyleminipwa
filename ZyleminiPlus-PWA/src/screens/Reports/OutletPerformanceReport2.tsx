import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useLocation as useRouterLocation } from 'react-router-dom';

import Loader from '../../components/Loader/Loader';
import Header from '../../components/Header/Header';
import { Colors } from '../../theme/colors';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { OutletPerformaceReportAPI } from '../../api/ReportsAPICalls';
import ChangeSelectionButton from './components/ChangeSelectionButton';
import UOMFilterModal from './components/UOMFilterModal';
import {
  getDistributorData,
  getUOMList,
} from '../../database/WebDatabaseHelpers';
import {
  DistributorData,
  getBrandForBrandWise_Report,
  UOMMaster,
} from '../../types/types';
import {
  writeErrorLog,
  writeReportsLog,
} from '../../utility/utils';
import { useNetInfo } from '../../hooks/useNetInfo';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import useDialog from '../../hooks/useDialog';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';

const OutletPerformanceReport2 = () => {
  const { t } = useTranslation();
  const routerLocation = useRouterLocation();
  const propsData = routerLocation.state || {};

  const { userId } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  const { dialogState, showDialog, hideDialog } = useDialog();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [UOMData, setUOMData] = useState<UOMMaster[]>([]);
  const [selectedUOM, setSelectedUOM] = useState({} as UOMMaster);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [selectionChangeFlag, setSelectionChangeFlag] = useState(false);

  const [selectedBrands, setSelectedBrands] = useState<
    getBrandForBrandWise_Report[]
  >([]);
  const [distData, setDistData] = useState<DistributorData[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState(
    {} as DistributorData
  );

  const [selectedFilterDates, setSelectedFilterDates] = useState({
    fromDate: '',
    toDate: '',
  });

  const currentmonth = moment().month(new Date().getMonth()).format('MMM');
  const previousmonth = moment()
    .month(new Date().getMonth() - 1)
    .format('MMM');
  const prevmonth2 = moment()
    .month(new Date().getMonth() - 2)
    .format('MMM');

  const monthTab = [
    {
      currentMonth: currentmonth,
      prevMonth: previousmonth,
      prevTwoMonth: prevmonth2,
    },
  ];

  const [selectedTabMonths] = useState(monthTab);

  useEffect(() => {
    PerformanceReport();
  }, [selectionChangeFlag]);

  useEffect(() => {
    fetchFilterData();
  }, []);

  const PerformanceReport = async () => {
    const Payload = {
      OutletPerformanceReport: [
        {
          userId,
          CustomerId: propsData?.CustomerId,
          Criteria: propsData?.Criteria,
          CriteriaId: propsData?.CriteriaId?.toString() || '',
          UOM: selectedUOM?.UOMDescription || '',
          DistributorID: selectedDistributors?.DistributorID || '',
          FromDate: selectedFilterDates?.fromDate || '',
          ToDate: selectedFilterDates?.toDate || '',
        },
      ],
    };

    try {
      setLoading(true);
      writeReportsLog('Outlet Performance');
      const resp = await OutletPerformaceReportAPI(Payload);
      setData(resp);
    } catch (error: any) {
      writeErrorLog('OutletPerformaceReportAPI', error);
      console.log(error);
      if (isNetConnected === false || isNetConnected == null) {
        showDialog(
          t('Alerts.InternetConnectionUnavailable'),
          t('Alerts.IntenetConnectionUnavailableMsg'),
          () => {},
          'error'
        );
      } else {
        showDialog('Error', error.message || 'An error occurred', () => {}, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  async function fetchFilterData() {
    try {
      const uomData = await getUOMList();
      setUOMData(uomData as UOMMaster[]);

      const distributorData = await getDistributorData(userId);
      setDistData(distributorData);
    } catch (err) {
      console.log('fetchFilterData error', err);
    }
  }

  const ReportUI = ({ item, index }: any) => {
    return (
      <Box sx={{ px: 2, mb: 2 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ backgroundColor: 'lightgray', p: 1.5, borderRadius: '6px 6px 0 0' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 14, color: Colors.textPrimary }}>
              {item?.ItemName}
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 12 }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                    {selectedTabMonths[0]?.prevTwoMonth}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                    {selectedTabMonths[0]?.prevMonth}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                    {selectedTabMonths[0]?.currentMonth}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontSize: 12 }}>Sales</TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Sales_Month3 || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Sales_Month2 || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Sales_Month1 || 0}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontSize: 12 }}>Free</TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Free_Month3 || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Free_Month2 || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12 }}>
                    {item?.Free_Month1 || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  return (
    <>
      <Loader visible={loading} />
      <CustomSafeView edges={['bottom']}>
        <Header
          title={`${t('OutletPerformanceReport.OutletPerformanceReportActionbarText')} - ${
            propsData?.PartyName || ''
          }`}
          navigation={{ back: () => window.history.back() }}
        />

        <Box sx={{ flex: 1 }}>
          {data.length > 0 ? (
            <Box sx={{ pb: 2 }}>
              {data.map((item, index) => (
                <ReportUI key={index} item={item} index={index} />
              ))}
            </Box>
          ) : (
            !loading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '50vh',
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  {t('No data available')}
                </Typography>
              </Box>
            )
          )}
        </Box>

        <ChangeSelectionButton onPress={() => setIsSelectionVisible(true)} />

        <UOMFilterModal
          isMultiFilterOpen={isSelectionVisible}
          onPress={() => setIsSelectionVisible(false)}
          onConfirm={() => {
            setSelectionChangeFlag(!selectionChangeFlag);
            setIsSelectionVisible(false);
          }}
          UOMData={UOMData}
          selectedUOM={selectedUOM?.UOMDescription || ''}
          setSelectedUOM={(val: any) => {
            const uom = typeof val === 'string' 
              ? UOMData.find((u: UOMMaster) => u.UOMDescription === val) || {} as UOMMaster
              : val;
            setSelectedUOM(uom);
          }}
          distData={distData}
          selectedDistributor={selectedDistributors?.DistributorID || ''}
          setSelectedDistributor={(val: any) => {
            const dist = typeof val === 'string'
              ? distData.find((d: DistributorData) => d.DistributorID === val) || {} as DistributorData
              : val;
            setSelectedDistributors(dist);
          }}
          brandData={[]}
          selectedBrand=""
          setSelectedBrands={() => {}}
          confirmFlag={false}
          fromDate={selectedFilterDates.fromDate ? new Date(selectedFilterDates.fromDate) : new Date()}
          setFromDate={(date: Date) => {
            setSelectedFilterDates({...selectedFilterDates, fromDate: moment(date).format('YYYY-MM-DD')});
          }}
          toDate={selectedFilterDates.toDate ? new Date(selectedFilterDates.toDate) : new Date()}
          setToDate={(date: Date) => {
            setSelectedFilterDates({...selectedFilterDates, toDate: moment(date).format('YYYY-MM-DD')});
          }}
          isDateFilterEnabled={true}
          isToDateRestrictionActive={false}
          onResetPress={() => {
            setSelectedUOM({} as UOMMaster);
            setSelectedDistributors({} as DistributorData);
            setSelectedFilterDates({fromDate: '', toDate: ''});
          }}
        />

        <ConfirmDialog
          open={dialogState.open}
          onClose={hideDialog}
          onConfirm={hideDialog}
          title={dialogState.title}
          message={dialogState.message}
          variant={dialogState.variant}
        />
      </CustomSafeView>
    </>
  );
};

export default OutletPerformanceReport2;
