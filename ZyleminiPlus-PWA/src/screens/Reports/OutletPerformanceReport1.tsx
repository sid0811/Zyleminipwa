import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputAdornment,
} from '@mui/material';
import { ExpandMore, Search, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import {
  getBrands,
  getOutletParty,
  getSKU,
  getSize,
} from '../../database/WebDatabaseHelpers';
import {
  getBrands_OP_Report,
  getOutletParty_OP_Report,
  getSKU_OP_Report,
  getSize_OP_Report,
} from '../../types/types';
import Header from '../../components/Header/Header';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import LoadingSkeleton from '../../components/Loading/LoadingSkeleton';
import { ScreenName } from '../../constants/screenConstants';
import { Colors } from '../../theme/colors';

const allproducts = ['Brand', 'SKU', 'SIZE'];

const OutletPerformanceReport1 = () => {
  const { t } = useTranslation();
  const { userId } = useLoginAction();
  const navigation = useNavigation();

  // Party Selection
  const [party, setParty] = useState<getOutletParty_OP_Report[]>([]);
  const [filteredParty, setFilteredParty] = useState<getOutletParty_OP_Report[]>([]);
  const [selectedParty, setSelectParty] = useState<getOutletParty_OP_Report | null>(null);
  const [partySearch, setPartySearch] = useState('');

  // Product Criteria
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  // Brand Selection
  const [brands, setBrands] = useState<getBrands_OP_Report[]>([]);
  const [selectedBrands, setSelectBrands] = useState<getBrands_OP_Report[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  
  // SKU Selection
  const [SKU, setSKU] = useState<getSKU_OP_Report[]>([]);
  const [selectedSKU, setSelectSKU] = useState<getSKU_OP_Report[]>([]);
  const [skuSearch, setSkuSearch] = useState('');
  
  // Size Selection
  const [Size, setSize] = useState<getSize_OP_Report[]>([]);
  const [selectedSize, setSelectSize] = useState<getSize_OP_Report[]>([]);
  const [sizeSearch, setSizeSearch] = useState('');
  const [selectedSKUForSize, setSelectedSKUForSize] = useState<string>('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOutletData();
  }, []);

  const getOutletData = async () => {
    try {
      setLoading(true);
      const [partyData, brandsData, skuData, sizeData] = await Promise.all([
        getOutletParty(),
        getBrands(userId),
        getSKU(userId),
        getSize(userId),
      ]);

      setParty(partyData);
      setFilteredParty(partyData);
      setBrands(brandsData);
      setSKU(skuData);
      setSize(sizeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partySearch) {
      const filtered = party.filter(item =>
        item.Party?.toLowerCase().includes(partySearch.toLowerCase())
      );
      setFilteredParty(filtered);
    } else {
      setFilteredParty(party);
    }
  }, [partySearch, party]);

  const handleBrandToggle = (brand: getBrands_OP_Report) => {
    const isSelected = selectedBrands.some(b => b.BRANDID === brand.BRANDID);
    if (isSelected) {
      setSelectBrands(selectedBrands.filter(b => b.BRANDID !== brand.BRANDID));
    } else {
      setSelectBrands([...selectedBrands, brand]);
    }
  };

  const handleSKUToggle = (sku: getSKU_OP_Report) => {
    const isSelected = selectedSKU.some(s => s.ItemId === sku.ItemId);
    if (isSelected) {
      setSelectSKU(selectedSKU.filter(s => s.ItemId !== sku.ItemId));
    } else {
      setSelectSKU([...selectedSKU, sku]);
    }
  };

  const handleSizeToggle = (size: getSize_OP_Report) => {
    const isSelected = selectedSize.some(s => s.ITEMSIZEID === size.ITEMSIZEID);
    if (isSelected) {
      setSelectSize(selectedSize.filter(s => s.ITEMSIZEID !== size.ITEMSIZEID));
    } else {
      setSelectSize([...selectedSize, size]);
    }
  };

  const handleProceed = () => {
    if (!selectedParty) {
      alert(t('Please select an outlet'));
      return;
    }
    if (!selectedProduct) {
      alert(t('Please select a criteria'));
      return;
    }

    const criteriaId =
      selectedProduct === 'Brand'
        ? selectedBrands.map(el => el.BRANDID)
        : selectedProduct === 'SKU'
        ? selectedSKU.map(el => el.ItemId)
        : selectedProduct === 'SIZE'
        ? selectedSize.map(el => el.ITEMSIZEID)
        : [];

    if (criteriaId.length === 0) {
      alert(t('Please select at least one item'));
      return;
    }

    navigation.navigate(ScreenName.OUTLET_PERFORMANCE2, {
      propsData: {
        Criteria: selectedProduct,
        CustomerId: selectedParty.CustomerId,
        CriteriaId: criteriaId,
        PartyName: selectedParty.Party,
      },
    });
  };

  const filteredBrands = brands.filter(brand =>
    brand.BRAND?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredSKUs = SKU.filter(sku =>
    sku.Item?.toLowerCase().includes(skuSearch.toLowerCase())
  );

  const filteredSizes = Size.filter(size =>
    size.Item?.toLowerCase().includes(sizeSearch.toLowerCase())
  );

  if (loading) {
    return (
      <CustomSafeView edges={['bottom']}>
        <Header
          navigation={{ goBack: () => navigation.goBack() }}
          title={t('OutletPerformanceReport.OutletPerformanceReportActionbarText')}
        />
        <LoadingSkeleton variant="form" count={5} />
      </CustomSafeView>
    );
  }

  return (
    <CustomSafeView edges={['bottom']}>
      <Header
        navigation={{ goBack: () => navigate(-1) }}
        title={t('OutletPerformanceReport.OutletPerformanceReportActionbarText')}
      />

      <Box sx={{ p: 2, pb: 10 }}>
        {/* Select Outlet */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('OutletPerformanceReport.OutletPerformanceReportSelectOutlet')}
          </Typography>
          
          <TextField
            fullWidth
            size="small"
            placeholder={t('Search outlet')}
            value={partySearch}
            onChange={(e) => setPartySearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {selectedParty ? (
            <Chip
              label={selectedParty.Party}
              onDelete={() => setSelectParty(null)}
              color="primary"
              sx={{ mb: 1 }}
            />
          ) : (
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {filteredParty.slice(0, 10).map((item, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSelectParty(item);
                    setPartySearch('');
                  }}
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                >
                  {item.Party}
                </Button>
              ))}
            </Box>
          )}
        </Paper>

        {/* Select Criteria */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('OutletPerformanceReport.OutletPerformanceReportSelectCriteria')}
          </Typography>

          <FormGroup>
            {allproducts.map((product) => (
              <FormControlLabel
                key={product}
                control={
                  <Checkbox
                    checked={selectedProduct === product}
                    onChange={() => setSelectedProduct(product)}
                  />
                }
                label={product}
              />
            ))}
          </FormGroup>
        </Paper>

        {/* Brand Selection */}
        {selectedProduct === 'Brand' && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                {t('Select Brands')} ({selectedBrands.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                size="small"
                placeholder={t('Search brands')}
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filteredBrands.map((brand, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selectedBrands.some(b => b.BRANDID === brand.BRANDID)}
                        onChange={() => handleBrandToggle(brand)}
                      />
                    }
                    label={brand.BRAND}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* SKU Selection */}
        {selectedProduct === 'SKU' && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                {t('Select SKUs')} ({selectedSKU.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                size="small"
                placeholder={t('Search SKUs')}
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filteredSKUs.map((sku, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selectedSKU.some(s => s.ItemId === sku.ItemId)}
                        onChange={() => handleSKUToggle(sku)}
                      />
                    }
                    label={sku.Item}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Size Selection */}
        {selectedProduct === 'SIZE' && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                {t('Select Sizes')} ({selectedSize.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                size="small"
                placeholder={t('Search sizes')}
                value={sizeSearch}
                onChange={(e) => setSizeSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filteredSizes.map((size, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selectedSize.some(s => s.ITEMSIZEID === size.ITEMSIZEID)}
                        onChange={() => handleSizeToggle(size)}
                      />
                    }
                    label={`${size.Item} - ${size.ITEMSIZE}`}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Proceed Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          endIcon={<ChevronRight />}
          onClick={handleProceed}
          sx={{
            mt: 3,
            py: 1.5,
            backgroundColor: Colors.primary,
            '&:hover': {
              backgroundColor: Colors.primaryDark,
            },
          }}
        >
          {t('Proceed')}
        </Button>
      </Box>
    </CustomSafeView>
  );
};

export default OutletPerformanceReport1;
