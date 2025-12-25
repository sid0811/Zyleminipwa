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
  Tabs,
  Tab,
} from '@mui/material';
import { Share, FilterList, Close } from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

import { TarVsAchiAPI } from '../../api/ReportsAPICalls';
import { ShopImgs } from '../../constants/AllImages';
import {
  brandWiseSorting,
  currentMonth,
  currentYear,
  previousMonth,
  previousMonthDate,
  previousYear,
  today,
  twoMonthsBack,
  twoMonthsBackDate,
  twoMonthsBackYear,
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

interface monthTab {
  month: string;
  monthKey: string;
  year: string;
}

const TargetVsAchievementReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userId } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  const { dialogState, showDialog, hideDialog, handleConfirm } = useDialog();

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMonthTab, setSelectedMonthTab] = useState({} as monthTab);

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
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedFilterDates, setSelectedFilterDates] = useState({
    fromDate: '',
    toDate: '',
  });

  const [shouldDateRangeWork, setDateRangeWork] = useState(false);

  const months = [
    {
      month: today.format('MMMM'),
      monthKey: String(currentMonth + 1),
      year: String(currentYear),
    },
    {
      month: previousMonthDate.format('MMMM'),
      monthKey: String(previousMonth + 1),
      year: String(previousYear),
    },
    {
      month: twoMonthsBackDate.format('MMMM'),
      monthKey: String(twoMonthsBack + 1),
      year: String(twoMonthsBackYear),
    },
  ];

  const [tabMonths, setTabMonths] = useState(months);

  useEffect(() => {
    setSelectedMonthTab(tabMonths[0]);
  }, []);

  useEffect(() => {
    getSalesReport();
  }, [selectionChangeFlag]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const reportGeneratedOn = moment().format('DD-MMM-YYYY [at] HH:mm:ss');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Target Vs Achievement Report', 105, 15, { align: 'center' });

      // Report generated timestamp
      doc.setFontSize(8);
      doc.text(`Report Generated on ${reportGeneratedOn}`, 200, 25, { align: 'right' });

      // Summary Table
      doc.setFontSize(14);
      doc.text('Summary', 14, 35);

      autoTable(doc, {
        startY: 40,
        head: [['Month', 'Total Target', 'Target Achieved']],
        body: [
          [
            selectedMonthTab.month,
            data?.Details && String(data?.Details[0]?.TotalTarget),
            data?.Details && String(data?.Details[0]?.TotalAchivement),
          ],
        ],
      });

      // Brand Details Table
      if (data.Data && data.Data.length) {
        const lastTableY = (doc as any).lastAutoTable.finalY || 60;
        doc.setFontSize(14);
        doc.text('Brand Details', 14, lastTableY + 15);

        const headers = ['Brand', 'Achievement', 'CR', 'Percent', 'RR', 'Target'];
        const rows = data.Data.map((brand: any) => [
          brand.Brand,
          brand.Achievement,
          brand.CR,
          brand.Percent,
          brand.RR,
          brand.Target,
        ]);

        autoTable(doc, {
          startY: lastTableY + 20,
          head: [headers],
          body: rows,
        });
      }

      // Save PDF
      doc.save(`Target_Achievement_${moment().format('YYYY-MM-DD')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showDialog('Error', 'Failed to generate PDF', () => {}, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSalesReport = async () => {
    writeReportsLog('Target Vs Achievement Report');

    const Payload = {
      TargetVsAchievementReport: [
        {
          UserID: userId,
          Brands:
            selectedBrands?.length > 0
              ? selectedBrands?.map(i => i.BRANDID).toString()
              : '',
          Distributors: selectedDistributors?.DistributorID || '',
          UOM: selectedUOM?.UOMDescription || '',
          SortBy: selectedSortBy?.value || '',
          Month: selectedMonthTab?.monthKey || tabMonths[0]?.monthKey,
          Year: selectedMonthTab?.year || tabMonths[0]?.year,
        },
      ],
    };

    try {
      setLoading(true);
      const resp = await TarVsAchiAPI(Payload);
      setData(resp);
    } catch (error: any) {
      console.log(error);
      writeErrorLog('getSalesReport', error);

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

  const handleTabPress = (month: monthTab) => {
    setSelectedMonthTab(month);
    setSelectionChangeFlag(!selectionChangeFlag);
  };

  const getFilterListData = async () => {
    await getClassificationfromDBReport1().then(async (takeCombo: any) => {
      await getControlId(takeCombo[0]?.ComboClassification).then(async (data: any) => {
        await getAllBrandList(data.ControlId, userId).then(async (data1: any) => {
          setBrandData(data1);
        });
      });
    });

    await getDistributorData(userId).then(distData => {
      setDistData(distData);
    });

    await getUOMList().then((data: any) => {
      setUOMData(data);
    });
  };

  const RenderItem = ({ item, index }: { item: any; index: number }) => {
    const keysWithoutBrand = Object.keys(item).filter(key => key !== 'Brand');

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
          {item.Brand}
        </Typography>

        <Box sx={{ my: 1 }}>
          <DashLine />
        </Box>

        {/* Headers */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
          {keysWithoutBrand.map(title => (
            <Typography
              key={title}
              sx={{
                color: '#221818',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {title}
            </Typography>
          ))}
        </Box>

        {/* Values */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {keysWithoutBrand.map(title => (
            <Typography
              key={title}
              sx={{
                color: '#362828',
                fontSize: 15,
              }}
            >
              {item[title]}
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
          title={t('TargetVsAchievement.TargetVsAchievementActionBarText')}
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
          title={t('TargetVsAchievement.TargetVsAchievementActionBarText')}
          onPressFilter={() => {
            setIsSortByVisible(true);
          }}
        />

        {data?.Headers?.length > 0 && (
          <SalesHeader
            brandCount={String(data?.Headers[0]?.Brands)}
            UOMName={String(data?.Headers[0]?.UOM)}
            isBrandWiseSale={false}
          />
        )}

        {/* Month Tabs */}
        <Tabs
          value={selectedMonthTab.monthKey || tabMonths[0].monthKey}
          onChange={(e, newValue) => {
            const month = tabMonths.find(m => m.monthKey === newValue);
            if (month) {
              handleTabPress(month);
              setDateRangeWork(false);
            }
          }}
          variant="fullWidth"
          sx={{
            backgroundColor: Colors.white,
            '& .MuiTab-root': {
              textTransform: 'none',
            },
            '& .Mui-selected': {
              backgroundColor: Colors.lightGray,
              borderBottom: `2px solid ${Colors.PinkColor}`,
            },
          }}
        >
          {tabMonths.map(item => (
            <Tab key={item.monthKey} label={item.month} value={item.monthKey} />
          ))}
        </Tabs>

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
              {t('TargetVsAchievement.TargetVsAchievementTotalTarget')}
            </Typography>
            <Typography
              sx={{
                color: '#362828',
                fontSize: 18,
                fontWeight: 'bold',
                mt: 0.5,
              }}
            >
              {data?.Details && String(data?.Details[0]?.TotalTarget)}
            </Typography>
          </Paper>

          <IconButton
            onClick={generatePDF}
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
              {t('TargetVsAchievement.TargetVsAchievementTargetAchieved')}
            </Typography>
            {data?.Details?.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography
                  sx={{
                    color: data?.Details[0]?.Percent > 0 ? '#2FC36E' : 'red',
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  {data?.Details[0]?.Percent}%
                </Typography>
                {data?.Details[0]?.Percent > 0 ? (
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
          isDateFilterEnabled={false}
          isToDateRestrictionActive={false}
          onResetPress={() => {
            setSelectedBrands([]);
            setSelectedDistributors({ Distributor: '', DistributorID: '' });
            setSelectedUOM({ id: null, UOMDescription: '' });
            setIsSelectionVisible(false);
            setTimeout(() => {
              setIsSelectionVisible(true);
            }, 300);
          }}
        />

        {/* Sort By Modal */}
        <Modal open={isSortByVisible} onClose={() => setIsSortByVisible(false)}>
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

export default TargetVsAchievementReport;
