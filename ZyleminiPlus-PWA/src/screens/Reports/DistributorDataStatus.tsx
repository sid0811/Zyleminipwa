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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
} from '@mui/material';
import { ExpandMore, Share, CheckCircle, Cancel } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

import { DistStatusAPI } from '../../api/ReportsAPICalls';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import SalesReportHeader from './components/SalesReportHeader';
import Loader from '../../components/Loader/Loader';
import { writeErrorLog, writeReportsLog } from '../../utility/utils';
import { Colors } from '../../theme/colors';
import { useNetInfo } from '../../hooks/useNetInfo';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import useDialog from '../../hooks/useDialog';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';

const DistributorDataStatus = () => {
  const { t } = useTranslation();
  const { userId } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  const { dialogState, showDialog, hideDialog } = useDialog();

  const [openItems, setOpenItems] = useState<number[]>([]);
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSalesReport();
  }, []);

  const generatePDF = async () => {
    if (!data.Success || data.DistStatus.length === 0) return;

    const pdf = new jsPDF();
    const reportGeneratedOn = moment().format('DD-MMM-YYYY [at] HH:mm:ss');

    // Header
    pdf.setFontSize(16);
    pdf.text('Distributor Status Report', 105, 15, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(`Distributor: ${data.DistStatus[0].Distributor}`, 105, 25, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Report generated on ${reportGeneratedOn}`, 200, 10, { align: 'right' });

    // Summary Table
    autoTable(pdf, {
      startY: 35,
      head: [['No. of Distributors', 'Upload % Monthly']],
      body: [[data.Details[0].NoOfDistributors, data.Details[0].UploadPerMonthly]],
      theme: 'grid',
      headStyles: { fillColor: [51, 122, 183] },
    });

    // Upload Status Table
    const uploadStatusData = data.DistStatus.flatMap((status: any) => [
      [status.Day1.split(':')[0], status.Day1.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day2.split(':')[0], status.Day2.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day3.split(':')[0], status.Day3.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day4.split(':')[0], status.Day4.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day5.split(':')[0], status.Day5.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day6.split(':')[0], status.Day6.split(':')[1] === '1' ? 'Yes' : 'No'],
      [status.Day7.split(':')[0], status.Day7.split(':')[1] === '1' ? 'Yes' : 'No'],
    ]);

    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 10,
      head: [['Date', 'Upload Status']],
      body: uploadStatusData,
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
    });

    pdf.save('distributor_status_report.pdf');
  };

  const getSalesReport = async () => {
    writeReportsLog('Distributor Data Status');
    const Payload = {
      DistStatus: [{ userId }],
    };

    try {
      setLoading(true);
      const resp = await DistStatusAPI(Payload);
      setData(resp);
    } catch (error: any) {
      writeErrorLog('DistStatusAPI', error);
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

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderDayStatus = (dayData: string) => {
    const [date, status] = dayData.split(':');
    const isUploaded = status === '1';

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1,
          px: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography sx={{ fontSize: 13 }}>{date}</Typography>
        <Chip
          icon={isUploaded ? <CheckCircle /> : <Cancel />}
          label={isUploaded ? 'Uploaded' : 'Not Uploaded'}
          size="small"
          color={isUploaded ? 'success' : 'error'}
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
    );
  };

  return (
    <>
      <Loader visible={loading} />
      <CustomSafeView edges={['bottom']}>
        <SalesReportHeader
          title={t('DistributorDataStatus.DistributorDataStatusActionBarText')}
          navigation={{ back: () => window.history.back() }}
          onPressFilter={() => {}}
        />

        <Box sx={{ p: 2 }}>
          {data.Success && data.DistStatus?.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={generatePDF} sx={{ color: Colors.primary }}>
                <Share />
              </IconButton>
            </Box>
          )}

          {data.Success && data.Details?.length > 0 && (
            <Paper elevation={3} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>No. of Distributors:</Typography>
                <Typography>{data.Details[0].NoOfDistributors}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 600 }}>Upload % Monthly:</Typography>
                <Typography sx={{ color: Colors.primary, fontWeight: 'bold' }}>
                  {data.Details[0].UploadPerMonthly}
                </Typography>
              </Box>
            </Paper>
          )}

          {data.Success && data.DistStatus?.length > 0 ? (
            data.DistStatus.map((item: any, index: number) => (
              <Accordion
                key={index}
                expanded={openItems.includes(index)}
                onChange={() => toggleItem(index)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {item.Distributor}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {renderDayStatus(item.Day1)}
                  {renderDayStatus(item.Day2)}
                  {renderDayStatus(item.Day3)}
                  {renderDayStatus(item.Day4)}
                  {renderDayStatus(item.Day5)}
                  {renderDayStatus(item.Day6)}
                  {renderDayStatus(item.Day7)}
                </AccordionDetails>
              </Accordion>
            ))
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

export default DistributorDataStatus;
