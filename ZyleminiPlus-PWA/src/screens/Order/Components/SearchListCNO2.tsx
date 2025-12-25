import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import SearchSubListCNO2 from './SearchSubListCNO2';

interface SearchListCNO2Props {
  totalOrders: string | number;
  data: any[];
  productFilter: string;
  searchText: string;
  OID: string;
  uid: string;
  dId: string;
  QRdata: any;
  onChangeInOrder: () => void;
  onChangeListCollpase: any;
  counterBrand: number;
}

const SearchListCNO2 = (props: SearchListCNO2Props) => {
  const { t } = useTranslation();
  const { isDarkMode } = useGlobleAction();
  const {
    totalOrders,
    data,
    productFilter,
    searchText,
    OID,
    uid,
    dId,
    QRdata,
    onChangeInOrder,
    onChangeListCollpase,
    counterBrand,
  } = props;

  const [expandedBrand, setExpandedBrand] = useState<string | false>(false);

  const handleAccordionChange = (brandId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedBrand(isExpanded ? brandId : false);
    onChangeListCollpase(isExpanded ? brandId : null);
  };

  // If QRdata is present, auto-expand its brand
  useEffect(() => {
    if (QRdata && QRdata.BRANDID) {
      setExpandedBrand(QRdata.BRANDID);
    }
  }, [QRdata]);

  // Auto-expand if only one brand is present
  useEffect(() => {
    if (data.length === 1) {
      setExpandedBrand(data[0].BRANDID);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, px: 2.5 }}>
      {data.map((brandItem: any, index: number) => (
        <Accordion
          key={brandItem.BRANDID || index}
          expanded={expandedBrand === brandItem.BRANDID}
          onChange={handleAccordionChange(brandItem.BRANDID)}
          sx={{
            mb: 1,
            backgroundColor: isDarkMode ? Colors.mainBackground : Colors.white,
            '&:before': {
              display: 'none',
            },
            borderRadius: 1,
            overflow: 'hidden',
          }}
          elevation={2}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: Colors.buttonPrimary,
              color: Colors.white,
              minHeight: 56,
              '&.Mui-expanded': {
                minHeight: 56,
              },
              '& .MuiAccordionSummary-content': {
                my: 1.5,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                {brandItem.BRAND || 'Unknown Brand'}
              </Typography>
              <Typography sx={{ fontWeight: 500, fontSize: 13 }}>
                {brandItem.ItemCount || 0} {t('Items')}
              </Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ p: 0, backgroundColor: isDarkMode ? Colors.mainBackground : '#fafafa' }}>
            <SearchSubListCNO2
              itemData={brandItem}
              OID={OID}
              uid={uid}
              dId={dId}
              searchText={searchText}
              productFilter={productFilter}
              brandId={brandItem.BRANDID}
              isPreview={false}
              onChangeInOrder={onChangeInOrder}
              isItemOrerTaken={(val) => {
                // Handle item taken event
                console.log('Item taken:', val);
              }}
              onChangeCollpase={(val: any) => {
                // Handle collapse change within sub-list
              }}
            />
          </AccordionDetails>
        </Accordion>
      ))}
      
      {data.length === 0 && searchText.length > 2 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: Colors.TexthintColor }}>
            {t('No products found')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchListCNO2;
