import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { 
  getInsertedTempOrder, 
  getOrderDataForAddEdit1, 
  getSubBrandSearchData 
} from '../../../database/WebDatabaseHelpers';
import EditOrderCNO from './EditOrderCNO';
import { filterITEMSEQUENCEName } from '../Functions/Validations';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import { COLLECTION_TYPE } from '../../../utility/utils';
import { useDataCollectionAction } from '../../../redux/actionHooks/useDataCollectionAction';
import { OrderSubListData } from '../../../types/types';
import DataCollectionStep2 from '../../DataCollection/DataCollectionStep2';
import useLocation from '../../../hooks/useLocation';

interface listProps {
  totalOrders?: string | number;
  itemData?: any;
  productFilter?: string;
  OID: string;
  searchText?: string;
  uid: string;
  dId: string;
  brandId?: string;
  isPreview?: boolean;
  isDataCollection?: boolean;
  isItemOrerTaken: (val: string) => void;
  onChangeInOrder: () => void;
  sumbitFromDate?: (date: string) => void;
  onChangeCollpase?: any;
}

const SearchSubListCNO2 = (props: listProps) => {
  const {
    itemData,
    OID,
    brandId = '',
    searchText = '',
    productFilter = '',
    uid,
    dId,
    isPreview = false,
    isItemOrerTaken,
    onChangeInOrder,
    sumbitFromDate = () => {},
    onChangeCollpase,
  } = props;
  
  const { latitude, longitude } = useLocation();
  const { t } = useTranslation();
  
  const {
    togglePressedCardIndex,
    pressedCardIndex,
    savedOrderID,
    selectedItemID,
    isDataCollection,
    totalOrderValue,
  } = useOrderAction();
  
  const { dataCollectionType } = useDataCollectionAction();

  const [subListData, setSublistData] = useState<OrderSubListData[]>([]);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [changedUnitInput, setChangedUnitInput] = useState('');
  const [deletePressCounter, setDeletePressCounter] = useState(0);

  const handleCardPress = (index: number) => {
    togglePressedCardIndex(index);
  };

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems([]);
      onChangeCollpase(openItems.filter(itemIndex => itemIndex !== index));
    } else {
      setOpenItems([index]);
    }
  };

  useEffect(() => {
    isPreview ? ItemFromPreview() : TakeItemForBrand();
  }, [totalOrderValue, changedUnitInput, deletePressCounter, isPreview]);

  async function ItemFromPreview() {
    setTimeout(() => {
      getInsertedTempOrder(savedOrderID).then((getdata: any) => {
        setSublistData(getdata);
        if (getdata.length > 0) {
          sumbitFromDate(getdata[getdata.length - 1]?.from_date);
        }
      });
    }, 300);
  }

  async function TakeItemForBrand() {
    if (!itemData?.BRANDID) return;
    
    await getSubBrandSearchData(
      itemData.BRANDID,
      searchText,
      productFilter,
      productFilter,
      uid,
    ).then((data: any) => {
      setTimeout(() => {
        getOrderDataForAddEdit1(
          OID,
          isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
        ).then((data1: any) => {
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data1.length; j++) {
              if (data[i].ItemId == data1[j].item_id) {
                data[i].quantity_one = data1[j].quantity_one;
                data[i].quantity_two = data1[j].quantity_two;
                data[i].bottleQty = data1[j].bottleQty;
                data[i].large_Unit = data1[j].large_Unit;
                data[i].small_Unit = data1[j].small_Unit;
              }
            }
          }
          setSublistData(data);
        });
      }, 400);
    });
  }

  const onDeletePreview = () => {
    setDeletePressCounter(deletePressCounter + 1);
    setOpenItems([]);
  };

  return (
    <Box sx={{ mt: isPreview ? 1 : -1.5 }}>
      {subListData?.map((item: any, index: number) => (
        <Box key={index} sx={{ mt: isPreview ? 1 : 0 }}>
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isPreview ? Colors.buttonPrimary : Colors.white,
              borderColor: Colors.border,
              borderRadius: 1,
              width: '87vw',
              alignSelf: 'center',
              border: `2px solid ${Colors.border}`,
              mt: -0.5,
              py: 2.5,
              px: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isPreview ? Colors.buttonPrimary : '#f5f5f5',
              },
            }}
            onClick={() => toggleItem(index)}
          >
            <Box sx={{ flex: isPreview ? 1.5 : item.bottleQty == 'true' ? 1.8 : 3 }}>
              <Typography
                sx={{
                  ml: 1,
                  fontSize: 12,
                  color: isPreview ? Colors.white : Colors.buttonPrimary,
                  fontWeight: 500,
                }}
              >
                {filterITEMSEQUENCEName(item.ITEMSEQUENCE)}
              </Typography>
            </Box>
            
            <Box 
              sx={{ 
                flex: isPreview ? 1.7 : 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              {item.bottleQty == 'true' ? (
                !isDataCollection ? (
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: Colors.PinkColor }}>
                        {item?.quantity_one + 'C ' + item?.quantity_two + 'B'}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#0ddb90' }}>
                        {item?.large_Unit + 'C ' + item?.small_Unit + 'B'}
                      </Typography>
                    </Box>
                    {isPreview && (
                      <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: Colors.PinkColor, mt: 0.6 }}>
                        {item?.Amount}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography sx={{ fontSize: 13, color: '#FF0000' }}>
                      {t('Search.SearchCs')}{item.quantity_one}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#FF0000' }}>
                      {t('Search.SearchBtl')} {item.quantity_two}
                    </Typography>
                  </Box>
                )
              ) : (
                <Typography sx={{ fontSize: 12 }} />
              )}
              
              {isPreview ? (
                <IconButton size="small" sx={{ color: Colors.white }}>
                  {openItems.includes(index) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              ) : item.bottleQty == 'true' ? (
                <Typography sx={{ fontSize: 10, fontWeight: 'bold', color: Colors.DarkBlue }}>
                  {t('Search.SearchEdit')}
                </Typography>
              ) : (
                <Typography sx={{ fontSize: 10, fontWeight: 'bold', color: Colors.DarkBlue }}>
                  {t('Search.SearchAdd')}
                </Typography>
              )}
            </Box>
          </Paper>

          <Collapse in={openItems.includes(index)} timeout="auto" unmountOnExit>
            {isDataCollection ? (
              <DataCollectionStep2
                isPreview={isPreview}
                uid={uid}
                OID={OID}
                dId={dId}
                itemID={item.ItemId}
                itemName={item.ITEMSEQUENCE}
                Ptr={item.PTR}
                bpc={item.BPC}
                brand={item.BRAND}
                flavour={item.FLAVOUR}
                division={item.DIVISION}
                brandId={isPreview ? item.BrandId : brandId}
                onChangeInUnits={(val: string) => setChangedUnitInput(val)}
                latitude={latitude}
                longitude={longitude}
              />
            ) : (
              <EditOrderCNO
                isPreview={isPreview}
                uid={uid}
                OID={OID}
                dId={dId}
                itemID={item.ItemId}
                itemName={item.ITEMSEQUENCE}
                Ptr={item.PTR}
                bpc={item.BPC}
                brand={item.BRAND}
                flavour={item.FLAVOUR}
                division={item.DIVISION}
                brandId={isPreview ? item.BrandId : brandId}
                onChangeInOrder={() => {
                  onChangeInOrder();
                }}
                onChangeInUnits={(val) => {
                  setChangedUnitInput(val);
                  isItemOrerTaken(item.ItemId);
                }}
                onDeletePreview={() => {
                  isPreview ? onDeletePreview() : null;
                }}
                latitude={latitude}
                longitude={longitude}
              />
            )}
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default SearchSubListCNO2;

