import { writeErrorLog } from '../../../utility/utils';
import moment from 'moment';

interface Props {
  DistributorName: string;
  PartyName: string;
  PartyArea: string;
  PartyLicenceNo: string;
  current_date_time: string;
  orderID: string;
  invoiceRows: any;
  partialorderdis: any;
  Schemeorderdis: any;
  itemDisc2: any;
  fullorderdis: any;
  quantity_one: number;
  quantity_two: number;
  Amount: string | number;
  remark: string;
  discountAmount: any;
  selectedPartialDis: any;
  selectedFullDis: any;
  isShareEnabled: boolean;
  large_Unit: number;
  small_Unit: number;
  gstAmount: number;
  gstRate: number;
  grossAmount: number;
}

export const DoPDFShare = async ({
  DistributorName,
  PartyName,
  PartyArea,
  PartyLicenceNo,
  current_date_time,
  orderID,
  invoiceRows,
  quantity_one,
  quantity_two,
  Amount,
  remark,
  discountAmount,
  selectedPartialDis,
  selectedFullDis,
  partialorderdis,
  Schemeorderdis,
  fullorderdis,
  itemDisc2,
  isShareEnabled = false,
  large_Unit,
  small_Unit,
  gstAmount,
  gstRate,
  grossAmount,
}: Props) => {
  try {
    const reportGeneratedOn = moment().format('DD-MMM-YYYY [at] HH:mm:ss');
    
    // Calculate the correct net amount (Gross Amount + GST - Discount)
    const baseAmount = Number(Amount);
    const gstAmt = Number(gstAmount);
    const discount = Number(discountAmount);
    const grossAmountCalc = baseAmount + gstAmt;
    const netAmount = grossAmountCalc - discount;
    
    console.log('📊 PDF Calculation Summary:', {
      baseAmount,
      gstRate,
      gstAmount: gstAmt,
      grossAmount: grossAmountCalc,
      discount,
      netAmount,
    });

    // For PWA, we can generate PDF using browser's print functionality or a library like jsPDF
    // This is a placeholder implementation
    if (isShareEnabled) {
      // Generate PDF and share (implementation depends on requirements)
      console.log('PDF Share functionality - to be implemented');
    } else {
      // Save PDF locally (implementation depends on requirements)
      console.log('PDF Save functionality - to be implemented');
    }
  } catch (error) {
    writeErrorLog('DoPDFShare', error);
    console.error('PDF generation error:', error);
  }
};

