import {Box, Typography} from '@mui/material';
import {useEffect, useState} from 'react';
import {TeamPerformanceStyles} from '../TeamPerformance.style';

interface ReceiptDetailsProps {
  details?: {
    [userId: string]: {
      outletName: string;
      paymentDetails: {
        collectedAmount: number;
        paymentMode: string;
        allocatedAmount?: number;
        balance?: number;
      }[];
      receipts: {
        invNo: string;
        invoiceDate: string;
        collectedAmount: number;
      }[];
    }[];
  };
  userId: number;
}

const ReceiptDetails = ({details, userId}: ReceiptDetailsProps) => {
  const [isReady, setIsReady] = useState(false);
  const [safeReceipts, setSafeReceipts] = useState<any[]>([]);
  
  useEffect(() => {
    console.log("ReceiptDetails - details:", details);
    console.log("ReceiptDetails - userId:", userId);
    
    if (details && details[userId]) {
      const receipts = details[userId];
      console.log("ReceiptDetails - receipts:", receipts);
      
      // Ensure we have valid data before setting state
      if (Array.isArray(receipts)) {
        setSafeReceipts(receipts);
        setIsReady(true);
      } else {
        console.log("Receipts is not an array:", receipts);
        setIsReady(true);
      }
    } else {
      console.log("No details or userId found");
      setIsReady(true);
    }
  }, [details, userId]);
  
  if (!isReady) {
    return <Typography>Loading...</Typography>;
  }
  
  if (!details || !details[userId] || safeReceipts.length === 0) {
    return <Typography>No receipt details available</Typography>;
  }
  
  return (
    <Box sx={{...TeamPerformanceStyles().orderContainer, p: 0}}>
      {safeReceipts?.map((receipt, index) => {
        console.log(`Processing receipt ${index}:`, receipt);
        
        // Skip if no data
        const hasPaymentDetails = Array.isArray(receipt?.paymentDetails) ? receipt.paymentDetails.length > 0 : !!receipt?.paymentDetails;
        const hasReceipts = receipt?.receipts?.length > 0;
        
        if (!hasPaymentDetails && !hasReceipts) {
          console.log(`Skipping receipt ${index} - no data`);
          return null;
        }
        
        return (
          <Box key={index} sx={{...TeamPerformanceStyles().outletSection, mb: 2}}>
            <Typography
              sx={{
                ...TeamPerformanceStyles().outletName,
                fontSize: 14,
                fontWeight: '600',
                mb: 1,
                color: '#000',
              }}>
              {String(receipt?.outletName || 'Unknown Outlet')}
            </Typography>
            
            {/* Payment Details */}
            {hasPaymentDetails && (
              <Box sx={{p: 1.5, bgcolor: '#FFF3E0', borderRadius: '4px', mb: 1}}>
                {(() => {
                  const paymentDetail = Array.isArray(receipt.paymentDetails) 
                    ? receipt.paymentDetails?.filter((item: any) => item != null)?.[0] 
                    : receipt.paymentDetails;
                  const showBalance = paymentDetail?.balance !== undefined && paymentDetail.balance !== null && paymentDetail.balance !== 0;
                  
                  return (
                    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                      <Box sx={{width: '50%', py: 0.5}}>
                        <Typography sx={{fontSize: 12, color: '#666', mb: 0.25}}> Collected </Typography>
                        <Typography sx={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                          {' '} {String(paymentDetail?.collectedAmount || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{width: '50%', py: 0.5}}>
                        <Typography sx={{fontSize: 12, color: '#666', mb: 0.25}}> Mode </Typography>
                        <Typography sx={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                          {''} {String(paymentDetail?.paymentMode || '-')}
                        </Typography>
                      </Box>
                      <Box sx={{width: '50%', py: 0.5}}>
                        <Typography sx={{fontSize: 12, color: '#666', mb: 0.25}}> Allocated</Typography>
                        <Typography sx={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                          {' '} {String(paymentDetail?.allocatedAmount || 0)}
                        </Typography>
                      </Box>
                      {showBalance && (
                        <Box sx={{width: '50%', py: 0.5}}>
                          <Typography sx={{fontSize: 12, color: '#666', mb: 0.25}}> Balance</Typography>
                          <Typography sx={{fontSize: 14, fontWeight: '600', color: '#000'}}>
                            {' '} {String(paymentDetail?.balance || 0)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            )}
            
            {/* Receipts */}
            {hasReceipts && (
              <Box>
                <Box sx={{height: '0.5vh'}} />
                <Box
                  sx={{
                    ...TeamPerformanceStyles().tableContainer,
                    width: '100%',
                    bgcolor: '#fff',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                  <Box>
                    <Box
                      sx={{
                        ...TeamPerformanceStyles().tableHeader,
                        bgcolor: '#FFF3E0',
                        display: 'flex',
                        flexDirection: 'row',
                        py: 1.5,
                        px: 2,
                      }}>
                      <Box
                        sx={{
                          ...TeamPerformanceStyles().headerCellContainer,
                          flex: 3,
                        }}>
                        <Typography
                          sx={{
                            ...TeamPerformanceStyles().headerCell,
                            fontWeight: '500',
                            color: '#000',
                          }}>
                          Inv No
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          ...TeamPerformanceStyles().headerCellContainer,
                          flex: 3,
                        }}>
                        <Typography
                          sx={{
                            ...TeamPerformanceStyles().headerCell,
                            fontWeight: '500',
                            color: '#000',
                          }}>
                          Invoice Date
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          ...TeamPerformanceStyles().headerCellContainer,
                          flex: 2,
                          alignItems: 'flex-end',
                        }}>
                        <Typography
                          sx={{
                            ...TeamPerformanceStyles().headerCell,
                            fontWeight: '500',
                            color: '#000',
                          }}>
                          Amount
                        </Typography>
                      </Box>
                    </Box>
                    {receipt.receipts?.filter((item: any) => item != null).map((item: any, itemIndex: number) => (
                      <Box
                        key={itemIndex}
                        sx={{
                          ...TeamPerformanceStyles().tableRow,
                          display: 'flex',
                          flexDirection: 'row',
                          py: 0.75,
                          px: 2,
                          borderBottom: '1px solid #E0E0E0',
                        }}>
                        <Box
                          sx={{...TeamPerformanceStyles().cellContainer, flex: 3}}>
                          <Typography
                            sx={{...TeamPerformanceStyles().cell, color: '#666'}}>
                            {String(item?.invNo || '')}
                          </Typography>
                        </Box>
                        <Box
                          sx={{...TeamPerformanceStyles().cellContainer, flex: 3}}>
                          <Typography
                            sx={{...TeamPerformanceStyles().cell, color: '#666'}}>
                            {item?.invoiceDate ? (() => {
                              try {
                                const date = new Date(item.invoiceDate);
                                return String(isNaN(date.getTime()) ? item.invoiceDate : date.toLocaleDateString());
                              } catch (error) {
                                return String(item.invoiceDate);
                              }
                            })() : ''}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            ...TeamPerformanceStyles().cellContainer,
                            flex: 2,
                            alignItems: 'flex-end',
                          }}>
                          <Typography
                            sx={{
                              ...TeamPerformanceStyles().cell,
                              ...TeamPerformanceStyles().numberCell,
                              color: '#666',
                            }}>
                            {String(item?.collectedAmount || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ReceiptDetails;

