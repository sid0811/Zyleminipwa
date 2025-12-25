import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Modal,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Share, FilterList, Close } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import SalesReportHeader from './components/SalesReportHeader';
import SalesHeader from './components/SalesHeader';
import UOMFilterModal from './components/UOMFilterModal';
import ChangeSelectionButton from './components/ChangeSelectionButton';
import DashLine from '../CollectionModule/Components/DashLine';
import Loader from '../../components/Loader/Loader';
import LoadingSkeleton from '../../components/Loading/LoadingSkeleton';

import { BrandWiseAPI } from '../../api/ReportsAPICalls';
import { ShopImgs, globalImg } from '../../constants/AllImages';
import {
  brandWiseSorting,
  writeErrorLog,
  writeReportsLog,
} from '../../utility/utils';
import { Colors } from '../../theme/colors';
import {
  getAllBrandList,
  getClassificationfromDBReport1,
  getControlId,
  getDistributorData,
  getUOMList,
} from '../../database/WebDatabaseHelpers';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import {
  DistributorData,
  getBrandForBrandWise_Report,
  UOMMaster,
} from '../../types/types';
import { useNetInfo } from '../../hooks/useNetInfo';
import useDialog from '../../hooks/useDialog';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';

interface SortByData {
  name: string;
  value: string;
}

const BrandWiseSaleReport = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const shopId = routerLocation.state?.shopId || '';
  
  const { t } = useTranslation();
  const { userId } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  const { dialogState, showDialog, hideDialog, handleConfirm } = useDialog();

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [isSortByVisible, setIsSortByVisible] = useState(false);
  const [selectionChangeFlag, setSelectionChangeFlag] = useState(false);

  const [brandData, setBrandData] = useState<any>([]);
  const [selectedBrands, setSelectedBrands] = useState<getBrandForBrandWise_Report[]>([]);
  const [distData, setDistData] = useState<DistributorData[]>([]);
  const [selectedDistributors, setSelectedDistributors] = useState({} as DistributorData);
  const [UOMData, setUOMData] = useState<UOMMaster[]>([]);
  const [selectedUOM, setSelectedUOM] = useState({} as UOMMaster);
  const [selectedSortBy, setSelectedSortBy] = useState({} as SortByData);

  const [selectedFilterDates, setSelectedFilterDates] = useState({
    fromDate: '',
    toDate: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getSalesReport();
  }, [selectionChangeFlag]);

  const getSalesReport = async () => {
    writeReportsLog('Brandwise Sale');
    const Payload = {
      BrandWiseSalesReport: [
        {
          UserID: userId,
          Brands:
            selectedBrands?.length > 0
              ? selectedBrands?.map(i => i.BRANDID).toString()
              : '',
          Distributors: selectedDistributors?.DistributorID || '',
          UOM: selectedUOM?.UOMDescription || '',
          SortBy: selectedSortBy?.value || '',
          CustomerId: shopId || '',
          FromDate: selectedFilterDates?.fromDate || '',
          ToDate: selectedFilterDates?.toDate || '',
        },
      ],
    };
    
    console.log('Payload BrandWiseSalesReport -->', Payload);
    
    try {
      setLoading(true);
      const resp = await BrandWiseAPI(Payload);
      setData(resp);
    } catch (error: any) {
      writeErrorLog('getSalesReport', error);
      console.log(error);
      
      if (isNetConnected === false || isNetConnected == null) {
        showDialog(
          t('Alerts.InternetConnectionUnavailable'),
          t('Alerts.IntenetConnectionUnavailableMsg'),
          () => {},
          'error'
        );
      } else {
        showDialog(
          'Error',
          error.message || 'An error occurred',
          () => {},
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilterListData = async () => {
    await getClassificationfromDBReport1().then(async (takeCombo: any) => {
      await getControlId(takeCombo[0]?.ComboClassification).then(
        async (data: any) => {
          await getAllBrandList(data.ControlId, userId).then(
            async (data1: any) => {
              setBrandData(data1);
            },
          );
        },
      );
    });

    await getDistributorData(userId).then(distData => {
      setDistData(distData);
    });

    await getUOMList().then((data: any) => {
      setUOMData(data);
    });
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Brandwise Sale Report', 105, 15, { align: 'center' });
      
      // Last Three Months Sales
      if (data.GraphData && data.GraphData[0]) {
        doc.setFontSize(14);
        doc.text('Last Three Months Sales', 14, 30);
        
        const graphData = data.GraphData[0];
        const months = Object.keys(graphData);
        const monthData = months.map(month => [month, graphData[month]]);
        
        autoTable(doc, {
          startY: 35,
          head: [['Month', 'Sales']],
          body: monthData,
        });
      }
      
      // Total Sales
      const totalSales = data.MonthSales && data?.MonthSales[0]?.Sale !== undefined
        ? data?.MonthSales[0]?.Sale
        : 'N/A';
      const salePercentage = data.Percentage &&
        data.Percentage[0] &&
        data.Percentage[0].Sale_Percentage !== undefined
        ? data.Percentage[0].Sale_Percentage
        : 'N/A';
      
      const lastTableY = (doc as any).lastAutoTable.finalY || 60;
      doc.setFontSize(14);
      doc.text('Total Sales', 14, lastTableY + 15);
      
      autoTable(doc, {
        startY: lastTableY + 20,
        head: [['Metric', 'Value']],
        body: [
          ['Total Sales', totalSales],
          ['Total % Sales', `${salePercentage}%`],
        ],
      });
      
      // All Sales Data
      if (data.Data && data.Data.length) {
        const allData = data.Data;
        const dataKeys = Object.keys(allData[0]).filter(key => key !== 'BRAND');
        
        const lastTableY2 = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.text('All Sales Data', 14, lastTableY2 + 15);
        
        const headers = ['Brand', ...dataKeys];
        const rows = allData.map((item: any) => [
          item.BRAND,
          ...dataKeys.map(key => item[key]),
        ]);
        
        autoTable(doc, {
          startY: lastTableY2 + 20,
          head: [headers],
          body: rows,
        });
      }
      
      // Save PDF
      doc.save(`Brandwise_Sale_${moment().format('YYYY-MM-DD')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF', error);
      showDialog(
        'Error',
        'Failed to generate PDF',
        () => {},
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Prepare chart data
  const chartData = data?.GraphData && data.GraphData[0]
    ? Object.keys(data.GraphData[0]).map(month => ({
        month,
        sales: data.GraphData[0][month],
      }))
    : [];

  const RenderItem = ({ item, index }: { item: any; index: number }) => {
    const keysWithoutBrand = Object.keys(item).filter(key => key !== 'BRAND');

    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 1.5,
          mx: 2.5,
          borderRadius: 2,
          border: `1px solid ${Colors.border}`,
        }}
      >
        <Typography
          sx={{
            color: '#221818',
            fontSize: 12,
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          {item.BRAND}
        </Typography>
        
        <Box sx={{ my: 1 }}>
          <DashLine />
        </Box>

        {/* Month headers */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
          {keysWithoutBrand.map(month => (
            <Typography
              key={month}
              sx={{
                color: '#221818',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {month}
            </Typography>
          ))}
        </Box>

        {/* Month values */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {keysWithoutBrand.map(month => (
            <Typography
              key={month}
              sx={{
                color: '#362828',
                fontSize: 15,
              }}
            >
              {item[month]}
            </Typography>
          ))}
        </Box>
      </Paper>
    );
  };

  const RenderSortByList = ({ item, index }: { item: any; index: number }) => {
    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => {
            setSelectionChangeFlag(!selectionChangeFlag);
            setIsSortByVisible(false);
            setSelectedSortBy(item);
          }}
        >
          <ListItemText
            primary={item.name}
            primaryTypographyProps={{
              sx: { color: '#362828', fontSize: 12 },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  if (loading && !data?.Headers) {
    return (
      <CustomSafeView edges={['bottom']}>
        <SalesReportHeader
          navigation={{ navigate }}
          title={t('Sales.SalesActionbarText')}
          onPressFilter={() => {}}
        />
        <LoadingSkeleton variant="detail" />
      </CustomSafeView>
    );
  }

  return (
    <>
      <Loader visible={isGenerating} />
      <CustomSafeView edges={['bottom']}>
        <SalesReportHeader
          navigation={{ navigate }}
          title={t('Sales.SalesActionbarText')}
          onPressFilter={() => {
            setIsSortByVisible(true);
          }}
        />
        
        {data?.Headers?.length > 0 && (
          <SalesHeader
            brandCount={String(data?.Headers[0]?.Brands)}
            distributorsCount={String(data?.Headers[0]?.Distributors)}
            UOMName={String(data?.Headers[0]?.UOM)}
            isBrandWiseSale={true}
          />
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <Box sx={{ position: 'relative', mt: 2, px: 2 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            mt: 2,
            px: 2,
            gap: 1,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#362828',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {t('Sales.SalesMonthlyTotalSales')}
            </Typography>
            <Typography
              sx={{
                color: '#362828',
                fontSize: 18,
                fontWeight: 'bold',
                mt: 0.5,
              }}
            >
              {data?.MonthSales?.length > 0 ? data?.MonthSales[0]?.Sale : '0'}
            </Typography>
          </Paper>

          <IconButton
            onClick={generatePdf}
            sx={{
              alignSelf: 'center',
              backgroundColor: Colors.primary,
              color: Colors.white,
              '&:hover': {
                backgroundColor: Colors.primaryDark,
              },
            }}
          >
            <Share />
          </IconButton>

          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#362828',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {t('Sales.SalesTotalPerChange')}
            </Typography>
            {data?.Percentage?.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography
                  sx={{
                    color: data?.Percentage[0]?.Sale_Percentage > 0 ? '#2FC36E' : 'red',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  {data?.Percentage[0]?.Sale_Percentage}%
                </Typography>
                {data?.Percentage[0]?.Sale_Percentage > 0 ? (
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: '15px solid #2FC36E',
                      ml: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderTop: '15px solid red',
                      ml: 1,
                    }}
                  />
                )}
              </Box>
            )}
          </Paper>
        </Box>

        <Box sx={{ px: 2, my: 2 }}>
          <DashLine />
        </Box>

        {/* Data List */}
        <Box sx={{ pb: 12 }}>
          {data?.Data?.map((item: any, index: number) => (
            <RenderItem key={index} item={item} index={index} />
          ))}
        </Box>

        <ChangeSelectionButton
          getListData={() => getFilterListData()}
          setSelectionVisibleFlag={(val: boolean) => setIsSelectionVisible(val)}
        />

        <UOMFilterModal
          isMultiFilterOpen={isSelectionVisible}
          onPress={(val: boolean) => setIsSelectionVisible(val)}
          onConfirm={(val: boolean) => setSelectionChangeFlag(val)}
          brandData={brandData}
          selectedBrand={selectedBrands[0]?.BRAND}
          setSelectedBrands={(val: getBrandForBrandWise_Report[]) => {
            setSelectedBrands(val);
          }}
          distData={distData}
          selectedDistributor={selectedDistributors?.Distributor}
          setSelectedDistributor={(val: DistributorData) => setSelectedDistributors(val)}
          UOMData={UOMData}
          selectedUOM={selectedUOM?.UOMDescription}
          setSelectedUOM={(val: UOMMaster) => setSelectedUOM(val)}
          confirmFlag={selectionChangeFlag}
          fromDate={selectedFilterDates?.fromDate}
          setFromDate={(d: Date) => {
            setSelectedFilterDates(prevDates => ({
              ...prevDates,
              fromDate: moment(d).format('YYYY-MM-DD'),
            }));
          }}
          toDate={selectedFilterDates?.toDate}
          setToDate={(d: Date) => {
            setSelectedFilterDates(prevDates => ({
              ...prevDates,
              toDate: moment(d).format('YYYY-MM-DD'),
            }));
          }}
          isDateFilterEnabled={true}
          isToDateRestrictionActive={true}
          onResetPress={() => {
            setSelectedBrands([]);
            setSelectedDistributors({ Distributor: '', DistributorID: '' });
            setSelectedUOM({ id: null, UOMDescription: '' });
            setSelectedFilterDates({ fromDate: '', toDate: '' });
            setIsSelectionVisible(false);
            setTimeout(() => {
              setIsSelectionVisible(true);
            }, 300);
          }}
        />

        {/* Sort By Modal */}
        <Modal
          open={isSortByVisible}
          onClose={() => setIsSortByVisible(false)}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              boxShadow: 24,
              maxHeight: '40vh',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: '#F8F4F4',
              }}
            >
              <Typography sx={{ color: '#8C7878', fontSize: 12 }}>
                {t('Sales.SalesSortBy')}
              </Typography>
              <IconButton onClick={() => setIsSortByVisible(false)} size="small">
                <Close />
              </IconButton>
            </Box>
            <List>
              {brandWiseSorting?.map((item: any, index: number) => (
                <RenderSortByList key={index} item={item} index={index} />
              ))}
            </List>
          </Box>
        </Modal>

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
    </>
  );
};

export default BrandWiseSaleReport;
