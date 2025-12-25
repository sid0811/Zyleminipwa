import { useCallback, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  deleteEditedorderDiscount,
  deleteEditedorderMaster,
  deleteOrderDetails,
  getCustomerShopName,
  getCustomerShopNameforNewParty,
  getDetailsItem,
  getDistributorNameSideOrder,
  getInsertedsTempdiscount,
  getPrevOrdersDayNo,
  getSelectedDistributorNameSideOrder,
  getTableDiscount,
} from '../../../database/WebDatabaseHelpers';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import { useNextCNO1Button } from '../Functions/useNextCNO1Button';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import DashLine from '../../CollectionModule/Components/DashLine';
import {
  DistributorData,
  JoinPcustOMaster,
  getDetailsItemOMaster,
} from '../../../types/types';
import Header from '../../../components/Header/Header';
import TopCardOrderDetail from './components/TopCardOrderDetail';
import { discardPopUp, filterITEMSEQUENCEName } from '../Functions/Validations';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../../../constants/screenConstants';
import {
  entityTypes,
  isAccessControlProvided,
  writeErrorLog,
} from '../../../utility/utils';
import { Colors } from '../../../theme/colors';
import EditFullOrderPreview from '../Components/FullPartialDiscount/EditFullOrderPreview';
import EditPartialPreview from '../Components/FullPartialDiscount/EditPartialPreview';
import EditSideOrderPreview from './components/EditSideOrderPreview';
import FooterCard3 from '../Components/Step3/FooterCard3';
import { DoPDFShare } from '../Components/PDFShareFormat';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';

interface SideOrderDetailProps {
  navigation?: any;
  route: {
    params?: any;
  };
}

const SideOrderDetail = (props: SideOrderDetailProps): React.ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const { userId } = useLoginAction();
  const { onNextPress } = useNextCNO1Button();
  const { setSavedOrderId, setPropsData, sideOrderProps } = useOrderAction();
  const { getAccessControlSettings } = useGlobleAction();

  const { entityid, orderid, isInProcessOrder, isNewParty } = sideOrderProps;
  console.log('isInProcessOrder -->', isInProcessOrder);

  const [totalDiscount, setTotalDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shopDetails, setShopDetails] = useState<JoinPcustOMaster[]>([]);
  const [distributorDetail, setDistDetails] = useState({} as DistributorData);
  const [orderedItemList, setOrderedItemList] = useState<getDetailsItemOMaster[]>([]);
  const [remark, setRemark] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedPartialDis, setSelectedPartialDis] = useState([]);
  const [selectedFullDis, setSelectedFullDis] = useState([]);
  const [selectedScheme, setselectedScheme] = useState([]);
  const [selectedItemDisc2, setselectedItemDisc2] = useState([]);
  const [gstRate, setGstRate] = useState(0);
  const [gstAmount, setTotalGST] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);
  const [selecteDistDetails, setSelecteDistDetails] = useState({} as DistributorData);

  useEffect(() => {
    componentFocused();
    getAllTableDiscount();
  }, [openItems]);

  const getAllTableDiscount = async (): Promise<void> => {
    getTableDiscount(orderid).then((data: any) => {
      let filteredPartial = data.filter((disc: any) => disc.BrandCode != '');
      setSelectedPartialDis(filteredPartial);

      let filteredFull = data.filter(
        (disc: any) =>
          disc.BrandCode == '' && disc.flag == 'D' && disc.OrderedItemID == '',
      );
      setSelectedFullDis(filteredFull);

      let filteredselectedScheme = data.filter((disc: any) => disc.flag == 'S');
      setselectedScheme(filteredselectedScheme);

      let filteredselectedItemDis2 = data.filter(
        (disc: any) => disc.flag == 'D' && disc.OrderedItemID != '',
      );
      setselectedItemDisc2(filteredselectedItemDis2);
    });
  };

  const componentFocused = (): void => {
    if (Boolean(isNewParty)) {
      getCustomerShopNameforNewParty(entityid, orderid).then(data => {
        setShopDetails(data);
        setRemark(data[0]?.remark);
      });
    } else {
      getCustomerShopName(entityid, orderid).then(data => {
        setShopDetails(data);
        setRemark(data[0]?.remark);
      });
    }

    getDistributorNameSideOrder(orderid).then((data: any) => {
      setDistDetails(data[0]);
    });

    getSelectedDistributorNameSideOrder(orderid).then((data: any) => {
      setSelecteDistDetails(data[0]);
    });

    getDetailsItem(orderid).then(data => {
      console.log('Item details::::::::::::::::::::>', data);
      setOrderedItemList(data);

      let totalAmount = 0;
      let totalGST = 0;
      let totalGross = 0;
      let gstRate = 0;

      for (let i = 0; i < data.length; i++) {
        const amount = parseFloat(data[i].Amount) || 0;
        const itemGSTTotal = parseFloat(data[i].GSTTotal) || 0;
        const itemGrossAmount = parseFloat(data[i].Amount) || 0;

        totalAmount += amount;
        totalGST += itemGSTTotal;
        totalGross += itemGrossAmount;

        if (i === 0) {
          gstRate = parseFloat(data[i].GSTRate) || 0;
        }
      }

      console.log('- Tax Summary:');
      console.log('- Base Amount:', totalAmount.toFixed(2));
      console.log('- GST Rate:', gstRate, '%');
      console.log('- Total GST:', totalGST.toFixed(2));
      console.log('- Gross Amount:', totalGross.toFixed(2));

      setTotalDiscount(totalAmount);
      setTotalGST(totalGST);
      setGrossAmount(totalGross);
      setGstRate(gstRate);
    });

    getPrevOrdersDayNo().then(data => {
      var prod = [];
      prod = data;
      prod.map((Value, i) => {
        // this.setState({PREVIOUSDAYORDERDAYS: Value.Value});
      });
    });

    getInsertedsTempdiscount(orderid).then((getdata: any) => {
      let amountss = 0;
      for (let i = 0; i < getdata.length; i++) {
        amountss += parseInt(getdata[i].DiscountAmount);
        setDiscountAmount(amountss);
      }
    });
  };

  const toggleItem = (index: number): void => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(itemIndex => itemIndex !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  const onEditPressed = async (): Promise<void> => {
    try {
      setPropsData({ fromSideOrder: true, entityid: shopDetails[0].entity_id });
      setSavedOrderId(orderid);
      onNextPress(
        shopDetails[0]?.entity_type == '1' ? entityTypes[0] : entityTypes[1],
        {
          RouteID: shopDetails[0].RouteID,
          RouteName: shopDetails[0].RouteName,
        },
        shopDetails[0].entity_id,
        shopDetails[0].Party,
        selecteDistDetails,
        false,
        { navigate },
      );
    } catch (error) {
      console.log('onEditPressed error -->', error);
      writeErrorLog('onEditPressed', error);
    }
  };

  console.log('Shankar Gade sdsdksdsds', orderedItemList);

  const discardClickHandler = (): void => {
    deleteOrderDetails(shopDetails[0].id);
    deleteEditedorderMaster(shopDetails[0].id);
    deleteEditedorderDiscount(shopDetails[0].id);
    navigate(`/${ScreenName.ORDERS}`);
  };

  const generateAndShare = async (isShareEnabled: boolean): Promise<void> => {
    console.log('Order Detail', orderedItemList);

    let quantity_one = 0;
    let quantity_two = 0;
    let large_Unit = 0;
    let small_Unit = 0;
    let Amount = 0;

    for (let i = 0; i < orderedItemList.length; i++) {
      console.log('orderedItemList.length', orderedItemList.length);

      quantity_one += parseFloat(orderedItemList[i].quantity_one);
      quantity_two += parseFloat(orderedItemList[i].quantity_two);
      large_Unit += parseFloat(orderedItemList[i].large_Unit);
      small_Unit += parseFloat(orderedItemList[i].small_Unit);
      Amount += parseFloat(orderedItemList[i].Amount);
    }
    console.log(Amount);

    setIsGenerating(true);
    DoPDFShare({
      DistributorName: selecteDistDetails?.Distributor,
      PartyName: shopDetails[0]?.Party,
      PartyArea: shopDetails[0]?.AREA,
      PartyLicenceNo: shopDetails[0]?.LicenceNo,
      current_date_time: moment(shopDetails[0]?.Current_date_time).format('DD-MMM-YYYY'),
      orderID: orderid,
      invoiceRows: invoiceRows.join(''),
      partialorderdis: partialorderdis.join(''),
      Schemeorderdis: Schemeorderdis.join(''),
      fullorderdis: fullorderdis.join(''),
      itemDisc2: itemDisc2.join(''),
      quantity_one: quantity_one,
      quantity_two: quantity_two,
      Amount: Amount,
      remark: remark,
      discountAmount,
      selectedPartialDis,
      selectedFullDis,
      isShareEnabled: isShareEnabled,
      large_Unit,
      small_Unit,
      gstAmount,
      gstRate,
      grossAmount,
    });
    setIsGenerating(false);
  };

  const invoiceRows = orderedItemList.map(item => {
    const cleanItemSequence = filterITEMSEQUENCEName(item.item_Name);
    const itemGST = parseFloat(item.GSTTotal) || 0;
    const itemAmount = parseFloat(item.Amount) || 0;
    const itemGrossAmount = itemAmount + itemGST;

    return `
      <tr>
        <td>${cleanItemSequence}</td>
        <td>C:${item.quantity_one} B:${item.quantity_two} FC:${item.large_Unit} FB:${item.small_Unit}</td>
        <td>${item.rate}</td>
        <td> </td>
        <td> - </td>
        <td>${(parseFloat(item.GSTRate) || 0).toFixed(2)}%</td>
        <td>${itemGST.toFixed(2)}</td>
        <td>${itemAmount.toFixed(2)}</td>
        <td>${itemGrossAmount.toFixed(2)}</td>
      </tr>
    `;
  });

  const fullorderdis = selectedFullDis.map(
    (fulldis: any) =>
      `<tr>
      <td>Full Order Discount</td>
      <td> </td>
      <td> </td>
      <td>  </td>
      <td> ${fulldis.DiscountAmount}</td>
    </tr>`,
  );

  const partialorderdis = selectedPartialDis.map(
    (partiladis: any) =>
      `<tr>
      <td>Partial Discount </td>
      <td> </td>
      <td> </td>
      <td> ${partiladis.DiscountAmount} </td>
      <td> </td>
    </tr>`,
  );

  const Schemeorderdis = selectedScheme.map(
    (partiladis: any) =>
      `<tr>
      <td>Scheme-${partiladis.DiscountType}  </td>
       <td>c:${partiladis.Cases} B:${partiladis.Bottle}</td>
      <td> </td>
      <td>Scheme</td>
      <td> </td>
      <td> </td>
    </tr>`,
  );

  const itemDisc2 = selectedItemDisc2.map(
    (itemdiscs2: any) =>
      `<tr>
      <td>Discount-${itemdiscs2.DiscountType}  </td>
      <td> </td>
      <td> </td>
      <td> ${itemdiscs2.RNP}</td>
      <td> ${itemdiscs2.DiscountAmount} </td>
      <td> </td>
    </tr>`,
  );

  return (
    <>
      <Header title={t('Order.OrderActionBarText')} navigation={{ goBack: () => navigate(-1) }} />
      <Box sx={{ flex: 1 }}>
        <CustomSafeView isScrollView={true}>
          <TopCardOrderDetail
            deletePress={() => {
              isInProcessOrder &&
                discardPopUp(t, (action: boolean) => {
                  action && discardClickHandler();
                });
            }}
            onEditPress={() => {
              isInProcessOrder && onEditPressed();
            }}
            onCalendarPress={() => {}}
            outletName={shopDetails[0]?.Party}
            storeId={shopDetails[0]?.entity_id}
            distributorName={selecteDistDetails?.Distributor}
            distID={selecteDistDetails?.DistributorID}
            startdate={moment(shopDetails[0]?.Current_date_time).format('DD-MMM-YYYY')}
            totalOrders={totalDiscount}
            expectedDelivery={shopDetails[0]?.ExpectedDeliveryDate}
            totalDiscount={discountAmount}
            entityType={shopDetails[0]?.entity_type}
            generateAndShare={() => generateAndShare(true)}
            isAddDiscountShown={isInProcessOrder}
            GrossAmount={grossAmount}
            gstAmount={gstAmount}
            gstRate={gstRate}
          />

          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
            {orderedItemList?.map((item, index: number) => (
              <Box key={index} sx={{ flex: 1, mt: 1, width: '88%' }}>
                <Box
                  onClick={() => toggleItem(index)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#362828',
                    borderColor: '#E6DFDF',
                    borderRadius: 1,
                    height: 64,
                    border: '1px solid #E6DFDF',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  <Box sx={{ flex: 2.6, ml: 5 }}>
                    <Typography sx={{ fontFamily: 'Proxima Nova', fontSize: 12, color: '#FFFFFF' }}>
                      {filterITEMSEQUENCEName(item.item_Name)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1.7, display: 'flex', alignItems: 'flex-end', flexDirection: 'row', mr: 3 }}>
                    <Box>
                      <Typography sx={{ mr: 3, color: '#CC1167', fontFamily: 'Proxima Nova', fontWeight: 'bold', fontSize: 12 }}>
                        {item?.quantity_one + 'C' + ' ' + item?.quantity_two + 'B'}
                      </Typography>
                      <Typography sx={{ mr: 3, color: '#0ddb90', fontFamily: 'Proxima Nova', fontWeight: 'bold', fontSize: 12 }}>
                        {item?.large_Unit + 'C' + ' ' + item?.small_Unit + 'B'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ mr: 3, color: '#CC1167', fontFamily: 'Proxima Nova', fontWeight: 'bold', fontSize: 12, mt: 0.6 }}>
                        {item?.Amount}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: Colors.white }}>
                      {openItems.includes(index) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={openItems.includes(index)}>
                  {isInProcessOrder &&
                    isAccessControlProvided(
                      getAccessControlSettings,
                      AccessControlKeyConstants.ORDER_EDIT_ORDER_EDIT,
                    ) && (
                      <Box sx={{ flex: 1, px: 2.5 }}>
                        <EditSideOrderPreview
                          uid={userId}
                          OID={item.order_id}
                          dId={selecteDistDetails?.DistributorID}
                          itemID={item.item_id}
                          Ptr={item.PTR}
                          bpc={item.BPC}
                          onChangeInOrder={() => {}}
                          onChangeInUnits={() => {}}
                          onDeletePress={(val: any) => setOpenItems(val)}
                        />
                      </Box>
                    )}
                </Collapse>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1, mx: 2.5 }}>
            <DashLine />
          </Box>

          <Box>
            <Box sx={{ flex: 0.1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ flex: 0.5 }}>
                  <Typography sx={{ color: '#796A6A', fontWeight: 'bold', mt: 1, ml: 6, fontSize: 10 }}>
                    FULL ORDER DISCOUNT PREVIEW
                  </Typography>
                </Box>
              </Box>
            </Box>
            <EditFullOrderPreview
              orderID1={orderid}
              entityid={entityid}
              fromCreateNOrder={false}
              SideFlag={openItems}
              navigation={{ goBack: () => navigate(-1) }}
            />
          </Box>

          <Box>
            <Box sx={{ flex: 0.1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ flex: 0.5 }}>
                  <Typography sx={{ color: '#796A6A', fontWeight: 'bold', mt: 1, ml: 6, fontSize: 10 }}>
                    PARTIAL ORDER DISCOUNT PREVIEW
                  </Typography>
                </Box>
              </Box>
            </Box>
            <EditPartialPreview
              orderID1={orderid}
              entityid={entityid}
              fromCreateNOrder={false}
              SideFlag={openItems}
              navigation={{ goBack: () => navigate(-1) }}
            />
          </Box>

          <Box sx={{ mt: 1, mx: 2.5 }}>
            <DashLine />
          </Box>

          <FooterCard3
            navigation={{ goBack: () => navigate(-1) }}
            onCalenderPress={() => {}}
            expectedDate={shopDetails[0]?.ExpectedDeliveryDate}
            remark={remark}
            onChangeRemark={(rmks: string) => {
              // setRemark(rmks);
            }}
          />
        </CustomSafeView>
      </Box>
    </>
  );
};

export default SideOrderDetail;
