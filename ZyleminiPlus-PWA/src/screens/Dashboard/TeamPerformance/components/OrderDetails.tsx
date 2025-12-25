import {Box, Typography} from '@mui/material';
import {OrderDetail} from '../TeamPerfTypes';

import {TeamPerformanceStyles} from '../TeamPerformance.style';

interface ApiOrderItem {
  SKU: string;
  items: string;
  rate: number;
}

interface ApiOrderDetail {
  outletName: string;
  items: ApiOrderItem[];
  totalRate: number;
  totalDiscount: number;
}

interface OrderDetailsProps {
  details?: {
    [userId: string]: ApiOrderDetail[];
  };
  userId: number;
}

const OrderDetails = ({details, userId}: OrderDetailsProps) => {
  if (!details || !details[userId]) {
    return (
      <Box sx={TeamPerformanceStyles().orderContainer}>
        <Typography>No order details available</Typography>
      </Box>
    );
  }

  const userOrders = details[userId];

  // Convert API response format to match existing OrderDetail type
  const convertedOrders: OrderDetail[] = userOrders.map(order => ({
    outletName: order.outletName,
    totalRate: order.totalRate,
    totalDiscount: order.totalDiscount,
    items: order.items.map(item => ({
      SKU: item.SKU,
      items: item.items,
      rate: item.rate,
    })),
  }));

  return (
    <Box sx={{...TeamPerformanceStyles().orderContainer, p: 0}}>
      {convertedOrders?.map((order, index) => (
        <Box key={index} sx={TeamPerformanceStyles().outletSection}>
          <Typography sx={TeamPerformanceStyles().outletName}>
            {order.outletName}
          </Typography>
          <Box sx={TeamPerformanceStyles().tableContainer}>
            <Box sx={{width: '100%'}}>
              <Box
                sx={{
                  ...TeamPerformanceStyles().tableHeader,
                  bgcolor: '#F3E5F5',
                }}>
                <Box
                  sx={{
                    ...TeamPerformanceStyles().headerCellContainer,
                    flex: 2,
                  }}>
                  <Typography sx={TeamPerformanceStyles().headerCell}>SKU</Typography>
                </Box>
                <Box
                  sx={{
                    ...TeamPerformanceStyles().headerCellContainer,
                    flex: 2,
                  }}>
                  <Typography sx={TeamPerformanceStyles().headerCell}>
                    Quantity
                  </Typography>
                </Box>
                <Box
                  sx={{
                    ...TeamPerformanceStyles().headerCellContainer,
                    flex: 1,
                  }}>
                  <Typography sx={TeamPerformanceStyles().headerCell}>Amount</Typography>
                </Box>
              </Box>
              {order.items.map((item: any, itemIndex: number) => (
                <Box key={itemIndex} sx={TeamPerformanceStyles().tableRow}>
                  <Box
                    sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                    <Typography sx={TeamPerformanceStyles().cell}>{item.SKU}</Typography>
                  </Box>
                  <Box
                    sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                    <Typography sx={TeamPerformanceStyles().cell}>
                      {item.items}
                    </Typography>
                  </Box>
                  <Box
                    sx={{...TeamPerformanceStyles().cellContainer, flex: 1}}>
                    <Typography sx={TeamPerformanceStyles().cell}>
                      {item.rate.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Box sx={TeamPerformanceStyles().tableRow}>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 3}}>
                  <Typography
                    sx={{
                      ...TeamPerformanceStyles().cell,
                      textAlign: 'right',
                      fontWeight: '600',
                    }}>
                    Total Discount:
                  </Typography>
                </Box>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                  <Typography sx={TeamPerformanceStyles().cell}>
                    {order.totalDiscount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                  <Typography
                    sx={{
                      ...TeamPerformanceStyles().cell,
                      textAlign: 'right',
                      fontWeight: '600',
                    }}>
                    Total Amount:
                  </Typography>
                </Box>
                <Box
                  sx={{...TeamPerformanceStyles().cellContainer, flex: 2}}>
                  <Typography sx={TeamPerformanceStyles().cell}>
                    {order.totalRate.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default OrderDetails;

