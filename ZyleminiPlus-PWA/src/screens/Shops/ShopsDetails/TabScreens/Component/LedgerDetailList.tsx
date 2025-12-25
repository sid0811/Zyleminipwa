import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { Close, Share } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Colors } from '../../../../../theme/colors';
import {
  LedgerReceiptDetail,
  LedgerVoucherDetail,
  LedgerTotal,
} from '../../../../../types/types';
import { removeSpecialCharacters } from '../../../../../utility/utils';

interface LedgerDetails {
  Ledger_VoucherDetails?: LedgerVoucherDetail[];
  Ledger_ReceiptDetails?: LedgerReceiptDetail[];
  Ledger_TotalDetails?: LedgerTotal[];
}

interface ListProps {
  partyName: string;
  Ledger_Details: LedgerDetails[];
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
  distrubutorName: any;
}

export default function LedgerDetailList(props: ListProps) {
  const { t } = useTranslation();
  const {
    partyName,
    distrubutorName,
    Ledger_Details = [],
    isModalOpen,
    onPress,
  } = props;
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndShare = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const formattedTime = today.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Header
      pdf.setFontSize(16);
      pdf.text(distrubutorName || '', 105, 15, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(partyName || '', 105, 25, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated on ${formattedDate} at ${formattedTime}`, 200, 10, {
        align: 'right',
      });

      let yPos = 35;

      Ledger_Details.forEach((ledger, index) => {
        // Voucher Details Table
        if (ledger.Ledger_VoucherDetails && ledger.Ledger_VoucherDetails.length > 0) {
          pdf.setFontSize(12);
          pdf.text('Voucher Details', 14, yPos);
          yPos += 5;

          const voucherData = ledger.Ledger_VoucherDetails.map((item) => [
            item.Voucherno || '',
            item.Date || '',
            item.Billno || '',
            parseFloat(item.Amount || '0').toFixed(2),
          ]);

          autoTable(pdf, {
            startY: yPos,
            head: [['Voucher No', 'Date', 'Bill No', 'Amount']],
            body: voucherData,
            theme: 'grid',
            headStyles: { fillColor: [51, 122, 183] },
          });

          yPos = (pdf as any).lastAutoTable.finalY + 10;
        }

        // Receipt Details Table
        if (ledger.Ledger_ReceiptDetails && ledger.Ledger_ReceiptDetails.length > 0) {
          pdf.setFontSize(12);
          pdf.text('Receipt Details', 14, yPos);
          yPos += 5;

          const receiptData = ledger.Ledger_ReceiptDetails.map((item) => [
            item.Receiptno || '',
            item.Date || '',
            parseFloat(item.Amount || '0').toFixed(2),
          ]);

          autoTable(pdf, {
            startY: yPos,
            head: [['Receipt No', 'Date', 'Amount']],
            body: receiptData,
            theme: 'grid',
            headStyles: { fillColor: [40, 167, 69] },
          });

          yPos = (pdf as any).lastAutoTable.finalY + 10;
        }

        // Total Details
        if (ledger.Ledger_TotalDetails && ledger.Ledger_TotalDetails.length > 0) {
          const total = ledger.Ledger_TotalDetails[0];
          pdf.setFontSize(12);
          pdf.text(`Total Invoices: ₹${total.Totalinvoice || '0'}`, 14, yPos);
          yPos += 7;
          pdf.text(`Total Receipts: ₹${total.Totalreceipt || '0'}`, 14, yPos);
          yPos += 7;
          pdf.text(`Balance: ₹${total.Balance || '0'}`, 14, yPos);
          yPos += 15;
        }
      });

      const fileName = removeSpecialCharacters(`Ledger_Details_${partyName}`).substring(0, 80);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => onPress(!isModalOpen)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: Colors.loginBackgrnd,
          color: Colors.FABColor,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {Ledger_Details?.length > 0 && (
            <IconButton
              onClick={generateAndShare}
              disabled={isGenerating}
              sx={{ color: Colors.FABColor }}
            >
              <Share />
            </IconButton>
          )}
          <Typography variant="h6">{partyName}</Typography>
        </Box>
        <IconButton onClick={() => onPress(!isModalOpen)} sx={{ color: Colors.FABColor }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2 }}>
        {Ledger_Details?.length > 0 ? (
          Ledger_Details.map((ledger, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              {/* Voucher Details */}
              {ledger.Ledger_VoucherDetails && ledger.Ledger_VoucherDetails.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {t('Voucher Details')}
                  </Typography>
                  <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#337ab7' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                            Voucher No
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                            Bill No
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ledger.Ledger_VoucherDetails.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.Voucherno}</TableCell>
                            <TableCell>{item.Date}</TableCell>
                            <TableCell>{item.Billno}</TableCell>
                            <TableCell align="right">
                              ₹{parseFloat(item.Amount || '0').toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Receipt Details */}
              {ledger.Ledger_ReceiptDetails && ledger.Ledger_ReceiptDetails.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {t('Receipt Details')}
                  </Typography>
                  <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#28a745' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                            Receipt No
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                            Amount
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ledger.Ledger_ReceiptDetails.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.Receiptno}</TableCell>
                            <TableCell>{item.Date}</TableCell>
                            <TableCell align="right">
                              ₹{parseFloat(item.Amount || '0').toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Total Details */}
              {ledger.Ledger_TotalDetails && ledger.Ledger_TotalDetails.length > 0 && (
                <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography>Total Invoices:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: Colors.primary }}>
                      ₹{ledger.Ledger_TotalDetails[0].Totalinvoice || '0'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography>Total Receipts:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: '#28a745' }}>
                      ₹{ledger.Ledger_TotalDetails[0].Totalreceipt || '0'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Balance:</Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: 18, color: Colors.primary }}>
                      ₹{ledger.Ledger_TotalDetails[0].Balance || '0'}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fc5c65',
              height: 50,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 16 }}>
              {t('VistBaseMap.VistBaseMapNoData')}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

