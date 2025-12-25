import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { Close, Share } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

import { Colors } from '../../../../../theme/colors';
import { removeSpecialCharacters } from '../../../../../utility/utils';

interface ListProps {
  listData: any;
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
  partyName: any;
  distrubutorName: any;
}

export default function TotalOutstandingShops(props: ListProps) {
  const { t } = useTranslation();
  const {
    listData = [],
    isModalOpen,
    onPress,
    partyName,
    distrubutorName,
  } = props;
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAndShare = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const reportGeneratedOn = moment().format('DD-MMM-YYYY [at] HH:mm:ss');

      // Add header
      pdf.setFontSize(16);
      pdf.text(distrubutorName || '', 105, 15, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(partyName || '', 105, 25, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Generated on ${reportGeneratedOn}`, 200, 10, { align: 'right' });

      pdf.setFontSize(12);
      pdf.text('Invoice Wise Outstanding Summary', 105, 35, { align: 'center' });

      // Prepare table data
      const tableData = listData.map((item: any) => [
        item.Document || '',
        item.InvoiceDate || '',
        item.Lag || '',
        parseFloat(item.Amount || 0).toFixed(2),
        parseFloat(item.NetOsAmt || 0).toFixed(2),
      ]);

      // Add table
      autoTable(pdf, {
        startY: 40,
        head: [['Invoice No', 'Date', 'Lag', 'Invoice Amount', 'Due Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [51, 122, 183] },
        styles: { fontSize: 9 },
      });

      // Save PDF
      const fileName = removeSpecialCharacters(
        `Invoice_Wise_Outstanding_Summary_${partyName}`
      ).substring(0, 80);
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
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
          textTransform: 'uppercase',
          fontWeight: 600,
          pr: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {listData?.length > 0 && (
            <IconButton
              onClick={generateAndShare}
              disabled={isGenerating}
              sx={{ color: Colors.FABColor }}
            >
              <Share />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('CollectionOutStanding.CollectionOutStandingTotalOutstanding')}
          </Typography>
        </Box>
        <IconButton
          onClick={() => onPress(!isModalOpen)}
          sx={{ color: Colors.FABColor }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 2 }}>
        {listData?.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {listData.map((item: any, index: number) => (
              <Box key={index}>
                <ListItem
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {item.Document}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            fontSize: 14,
                            color: Colors.primary,
                          }}
                        >
                          ₹{parseFloat(item.NetOsAmt || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Date: {item.InvoiceDate}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Lag: {item.Lag} days
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Invoice Amount: ₹{parseFloat(item.Amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>
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

