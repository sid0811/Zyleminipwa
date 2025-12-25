// Web-adapted EditFullOrderDiscount1 component
import React, {useEffect, useState} from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {useNavigate, useLocation} from 'react-router-dom';
import {
  deleteTABLE_DISCOUNT1,
  getDataDiscountMaster,
  getDiscountedData,
  getTABLE_DISCOUNTforEdit,
  updateTABLE_DISCOUNT1,
} from '../../../../database/SqlDatabase';
import {TABLE_TEMP_ORDER_DETAILS} from '../../../../types/types';

import Dropdown from '../../../../components/Dropdown/Dropdown';
import DashLine from '../../../CollectionModule/Components/DashLine';
import {Colors} from '../../../../theme/colors';
import {wp, hp, Dimen} from '../../../../utility/responsiveHelpers';
import {ScreenName} from '../../../../constants/screenConstants';
import {globalImg} from '../../../../constants/AllImages';
import {discountOnArray} from '../../../../utility/utils';

import {useOrderAction} from '../../../../redux/actionHooks/useOrderAction';
import {useLoginAction} from '../../../../redux/actionHooks/useLoginAction';
import {useTranslation} from 'react-i18next';

let discountArrCase = [
  {id: '1', name: 'Net'},
  {id: '3', name: 'Rate Per Box'},
];

let discountArrBTL = [
  {id: '1', name: 'Net'},
  {id: '4', name: 'Rate Per Unit'},
];

let discountArr1 = [
  {id: '1', name: 'Net'},
  {id: '2', name: 'Percent'},
];

interface Props {
  navigation?: any;
  route?: {
    params?: {id: number; orderID: string; entityid: string};
  };
}

const EditFullOrderDiscount1 = (props: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = location.state || props.route?.params || {};
  const {orderID, entityid, id} = routeParams; // orderID, id
  console.log('props EditFullOrderDiscount side O-->', orderID, id);
  const {savedOrderID} = useOrderAction();
  const {userId} = useLoginAction();

  const [isDDshown, setIsDDshown] = useState(false);
  const [product, setProduct] = useState([]);
  const [data, setData] = useState<TABLE_TEMP_ORDER_DETAILS[]>([]);
  const [discountList, setDiscountList] = useState([]);
  const [brandSKU, setBrandSKU] = useState([]);
  const [companySKU, setCompanySKU] = useState([]);
  const [flavourSKU, setFlavourSKU] = useState([]);
  const [Custom_fields, setCustom_fields] = useState([]);
  const [SelectedDiscType, setSelectedDiscType] = useState('');
  const [SelectedDiscINType, setSelectedDiscINType] = useState('');
  const [discountON, setDiscountON] = useState(0);
  const [PercentCalNum, setCalcPercent] = useState(0);
  const [TotalPerAmt, setTotalPerAmt] = useState(0);
  const [AmtDiscOn, setAmtDiscOn] = useState(0);
  const [DiscountONQty, setDiscountONQty] = useState(0);
  const [CalcNum, setCalcNum] = useState(0);
  const [SelectedDiscFor, setSelectedDiscFor] = useState('');
  const [totalAmt, setTotalAmt] = useState(0);
  const [totalCases, setTotalCases] = useState(0);
  const [totalBTL, setTotalBTL] = useState(0);
  const [totalBPC, setTotalBPC] = useState(0);
  const [applyFlag, setApplyFlag] = useState(false);
  const [isValueChanged, setIsValueChanged] = useState(false);
  const [CSCount, setCSCount] = useState(0);
  const [BTLCount, setBTLCount] = useState(0);
  const [AMTCount, setAMTCount] = useState(0);

  const [ApplyChanged, setApplyChanged] = useState(false);

  const [dataForDelete, setDataForDelete] = useState([]);
  const [editDiscount, setEditDiscount] = useState([]);

  const [isExistShown, setIsExistShown] = useState(false);

  useEffect(() => {
    NEWdislist();
    getDataDiscountMaster(userId).then((data: any) => {
      setDiscountList(data);
      setIsExistShown(true);
    });
  }, []);

  // console.log('data-->', data)
  console.log('SelectedDiscFor--->', SelectedDiscFor);
  console.log('discountON AMOUNT--->', discountON);
  console.log('SelectedDiscINType-->', SelectedDiscINType);
  console.log('totalAmt-->', totalAmt);
  console.log('SelectedDiscType-->', SelectedDiscType);
  console.log('CalcNum-->', CalcNum);
  console.log('DiscountONQty-->', DiscountONQty);
  console.log('total cases-->', totalCases);
  console.log('total btl-->', totalBTL);
  // console.log('bpc total --->', totalBPC);
  // console.log('custom_field--->', Custom_fields);

  const NEWdislist = async () => {
    // let apporderid = await AsyncStorage.getItem('apporderid')
    // sliceddata = apporderid.slice(1, -1)

    let tempData = [];
    // await db.getitemdataall(apporderid).then(data1 => {
    // await db.getRetrievedDiscountData(orderID).then(data1 => {
    await getDiscountedData(orderID).then((data1: any) => {
      // console.log('getDiscountedData data full-->', data1);

      let filtered = data1.filter((disc: any) => disc.BrandCode == '');
      // console.log('dtaa pp full 11-->', filtered);

      // console.log('data1 from getting item data 111-->', data1);
      let amountss = 0;
      let quantity_one = 0;
      let quantity_two = 0;
      let bpcTotal = 0;
      let btlConversion1 = 0;
      let casesConversion = 0;
      for (let i = 0; i < data1.length; i++) {
        amountss = amountss + parseInt(data1[i].Amount);
        // amountss += parseInt(data[i].Amount);
        quantity_one += parseInt(data1[i].quantity_one);
        quantity_two += parseInt(data1[i].quantity_two);
        bpcTotal += parseInt(data1[i].BPC);
        btlConversion1 +=
          parseInt(data1[i].BPC) * parseInt(data1[i].quantity_one) +
          parseInt(data1[i].quantity_two);
        casesConversion +=
          parseInt(data1[i].quantity_one) +
          parseInt(data1[i].quantity_two) / parseInt(data1[i].BPC);
      }
      // let btlConversion1 = (bpcTotal * quantity_one) + quantity_two
      // console.log('btlConversion1 crea--->', btlConversion1);
      // console.log('bpcTotal crea-->', bpcTotal);
      setTotalBPC(bpcTotal);
      setTotalAmt(amountss);
      setTotalCases(+casesConversion.toFixed(2));
      setTotalBTL(btlConversion1);

      setCSCount(quantity_one);
      setBTLCount(quantity_two);
      setAMTCount(amountss);

      setData(data1);
    });

    await getTABLE_DISCOUNTforEdit(id, orderID).then((dataa: any) => {
      console.log('getTABLE_DISCOUNTforEdit--->', dataa);
      setEditDiscount(dataa);
    });
  };

  let selectedBrands = data?.filter(
    (brands: any) => brands.BrandCode == 'BRAND',
  );
  let selectedCompany = data?.filter(
    (brands: any) => brands.BrandCode == 'PRINCIPAL COMPANY',
  );
  let selectedFlavour = data?.filter(
    (brands: any) => brands.BrandCode == 'FLAVOUR',
  );
  // console.log('selectedBrands-->', selectedBrands);

  let brandNameItem = [
    ...new Set(data.map((el: any) => JSON.stringify(el.BRAND))),
  ].map(str => JSON.parse(str));
  let brandsItem = [
    ...new Set(data.map((el: any) => JSON.stringify(el.BRAND))),
  ].map(str => JSON.parse(str));
  let CompanyItem = [
    ...new Set(data.map((el: any) => JSON.stringify(el.DIVISION))),
  ].map(str => JSON.parse(str));
  let FlavourItem = [
    ...new Set(data.map((el: any) => JSON.stringify(el.FLAVOUR))),
  ].map(str => JSON.parse(str));

  let brandItem: any = [];
  brandSKU.map((el, i) => {
    return brandItem.push(data.filter((brand: any) => brand.BRAND == el));
  });

  let companyItem: any = [];
  companySKU.map((el, i) => {
    return companyItem.push(data.filter((brand: any) => brand.DIVISION == el));
  });

  let flavourItem: any = [];
  flavourSKU.map((el, i) => {
    return flavourItem.push(data.filter((brand: any) => brand.FLAVOUR == el));
  });

  // console.log('brandItem-->', brandItem);
  // console.log('companyItem-->', companyItem);
  // console.log('flavourItem-->', flavourItem);

  let checkAdd: any = [];

  if (brandItem?.flat(1).length > 0) {
    checkAdd = AddTotal(brandItem.flat(1));
    // console.log('checkAdd-->', checkAdd);
  } else if (companyItem?.flat(1).length > 0) {
    checkAdd = AddTotal(companyItem.flat(1));
  } else if (flavourItem?.flat(1).length > 0) {
    checkAdd = AddTotal(flavourItem.flat(1));
  }

  function AddTotal(dataAdd: any) {
    let totalAmtBySelection = 0;
    let totalCaseBySelection = 0;
    let totalBTLBySelection = 0;
    let BPCBySelection = 0;
    let btlConversion11 = 0;
    for (let i = 0; i < dataAdd?.length; i++) {
      totalAmtBySelection = totalAmtBySelection + parseInt(dataAdd[i].Amount);
      totalCaseBySelection += parseInt(dataAdd[i].quantity_one);
      totalBTLBySelection += parseInt(dataAdd[i].quantity_two);
      BPCBySelection += parseInt(dataAdd[i].bpc);
      btlConversion11 +=
        parseInt(dataAdd[i].bpc) * parseInt(dataAdd[i].quantity_one) +
        parseInt(dataAdd[i].quantity_two);
    }
    // let btlConversion11 = (BPCBySelection * totalCaseBySelection) + totalBTLBySelection
    // console.log('BTLConvo--->', BTLConvo);
    // console.log('btlConversion11 crea selec--->', btlConversion11);
    console.log('BPCBySelection crea selec-->', BPCBySelection);
    return {
      totalAmtBySelection,
      totalCaseBySelection,
      totalBTLBySelection,
      BPCBySelection,
      btlConversion11,
    };
  }

  console.log('add total on selection-->', checkAdd);

  const _renderDiscountARR1 = (item: any, index: number) => {
    return (
      <Box sx={{zIndex: 999}}>
        <Dropdown
          selectedListIsScrollView={true}
          data={discountOnArray}
          label={'name'}
          placeHolder={item.DiscountOnType}
          CustomDDStyle={styles.dropDownContainer}
          isTitleShown={false}
          selectedValue={SelectedDiscType}
          onPressItem={(val: any) => {
            setSelectedDiscType(val.name);
          }}
        />
      </Box>
    );
  };

  // console.log('selectDiscountOnvalue-->', SelectedDiscType);

  function _renderDiscount(item: any, index: number) {
    let beat = [];

    if (SelectedDiscType.length > 0) {
      if (SelectedDiscType === 'Amount') {
        beat = discountArr1;
      } else if (SelectedDiscType === 'Box') {
        beat = discountArrCase;
      } else {
        beat = discountArrBTL;
      }
    } else {
      if (item.DiscountOnType === 'Amount') {
        beat = discountArr1;
      } else if (item.DiscountOnType === 'Box') {
        beat = discountArrCase;
      } else {
        beat = discountArrBTL;
      }
    }

    return (
      <Box sx={{zIndex: 999}}>
        <Dropdown
          selectedListIsScrollView={true}
          data={beat}
          label={'name'}
          placeHolder={SelectedDiscType.length > 0 ? 'SELECT' : item.RNP}
          CustomDDStyle={styles.dropDownContainer}
          isTitleShown={false}
          selectedValue={SelectedDiscINType}
          onPressItem={(val: any) => {
            setSelectedDiscINType(val.name);
          }}
        />
      </Box>
    );
  }

  // console.log('SelectedDiscIn-->', SelectedDiscINType);

  function DiscountON(input: number, item: any) {
    // console.log('discount on input-->', input);
    setDiscountON(input);
    // console.log('Disc On input--->', discountON);
    CalcPercent(input, item);

    if (SelectedDiscType === 'Amount') {
      let CalcDiscAmt = checkAdd.totalAmtBySelection
        ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
          ? isValueChanged
            ? totalAmt - input
            : checkAdd.totalAmtBySelection - input
          : totalAmt - input
        : totalAmt - input;
      setAmtDiscOn(CalcDiscAmt);
      //   console.log('selectDiscountOnvalue Amount-->', AmtDiscOn);
    }
  }

  function CalcPercent(val: number, item: any) {
    let calPer =
      SelectedDiscINType.length > 0
        ? checkAdd.totalAmtBySelection
          ? brandSKU.length > 0 ||
            companySKU.length > 0 ||
            flavourSKU.length > 0
            ? isValueChanged
              ? totalAmt * (val / 100)
              : checkAdd.totalAmtBySelection * (val / 100)
            : totalAmt * (val / 100)
          : totalAmt * (val / 100)
        : checkAdd.totalAmtBySelection
        ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
          ? isValueChanged
            ? totalAmt * (val / 100)
            : checkAdd.totalAmtBySelection * (val / 100)
          : totalAmt * (val / 100)
        : parseFloat(item.OnAmount) * (val / 100);
    let TotalCalPer =
      SelectedDiscINType.length > 0
        ? checkAdd.totalAmtBySelection
          ? brandSKU.length > 0 ||
            companySKU.length > 0 ||
            flavourSKU.length > 0
            ? isValueChanged
              ? totalAmt - calPer
              : checkAdd.totalAmtBySelection - calPer
            : totalAmt - calPer
          : totalAmt - calPer
        : checkAdd.totalAmtBySelection
        ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
          ? isValueChanged
            ? totalAmt - calPer
            : checkAdd.totalAmtBySelection - calPer
          : totalAmt - calPer
        : parseFloat(item.OnAmount) - calPer;
    setCalcPercent(calPer);
    setTotalPerAmt(TotalCalPer);
    //  console.log('CalcPercent-->', TotalPerAmt);
    //  console.log('PercentCalNum--->', PercentCalNum);
  }

  function DiscountIN(input: number, item: any) {
    // console.log('discount on input-->', input);
    setDiscountON(input);
    // console.log('Disc On input--->', discountON);
    CalcPercent1(input, item);

    if (SelectedDiscType === 'Amount') {
      let CalcDiscAmt = checkAdd.totalAmtBySelection
        ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
          ? isValueChanged
            ? totalAmt - input
            : checkAdd.totalAmtBySelection - input
          : totalAmt - input
        : totalAmt - input;
      setAmtDiscOn(CalcDiscAmt);
      //   console.log('selectDiscountOnvalue Amount-->', AmtDiscOn);
    }
  }

  function CalcPercent1(val: number, item: any) {
    console.log('Calcpercent1 runs');
    let calPer = isValueChanged
      ? totalAmt * (val / 100)
      : parseFloat(item.OnAmount) * (val / 100);
    // totalAmt - calPer
    let TotalCalPer = isValueChanged
      ? totalAmt - calPer
      : parseFloat(item.OnAmount) - calPer;

    // console.log('new logic percen--->',
    //     isValueChanged ?
    //         totalAmt * (val / 100)
    //         : parseFloat(item.OnAmount) * (val / 100));

    setCalcPercent(calPer);
    setTotalPerAmt(TotalCalPer);
  }

  function CalcPercent2(val: number, item: any, input: number) {
    console.log('Calcpercent2 runs', input, val);
    // let calPer = isValueChanged ?
    //     input * (val / 100)
    //     : parseFloat(item.OnAmount) * (val / 100)

    // let TotalCalPer = isValueChanged ?
    //     input - calPer
    //     : parseFloat(item.OnAmount) - calPer

    let checkDiscountOn = discountON == 0 ? item.Rate : discountON;

    let calPer = input * (checkDiscountOn / 100);

    let TotalCalPer = input - calPer;

    setCalcPercent(calPer);
    setTotalPerAmt(TotalCalPer);
  }

  function DiscountON1(input: number, item: any) {
    // let Add = 0
    setDiscountONQty(input);
    //   console.log('Disc On input QTY--->', DiscountONQty);

    if (SelectedDiscType.length > 0) {
      let manish = callforsum(input, item);
      setCalcNum(manish);
      console.log('manish-->', CalcNum);
    } else {
      let manish = callforsum1(input, item);
      setCalcNum(manish);
      console.log('manish 1-->', CalcNum);
    }
  }

  function editDiscountON(input: number, item: any) {
    let manish = callforsum2(input, item);
    setCalcNum(manish);
    console.log('editDiscountON manish-->', manish);
  }

  const callforsum = (input: number, item: any) => {
    console.log('callforsum runs');
    var x = SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP;
    var y = input;
    let Add = 0;

    // console.log('RPC--->', parseInt(SelectedDiscINType.length > 0 ? checkAdd.totalCaseBySelection ? isValueChanged ? totalCases : checkAdd.totalCaseBySelection : totalCases : checkAdd.totalCaseBySelection ? isValueChanged ? totalCases : checkAdd.totalCaseBySelection : item.OnAmount));

    if (x == 'Net') {
      let b = y;
      Add = b;
      //   console.log('data runs-->')
    } else if (x == 'Rate Per Box') {
      let quntity = parseFloat(
        SelectedDiscINType.length > 0
          ? checkAdd.totalCaseBySelection
            ? isValueChanged
              ? totalCases
              : checkAdd.totalCaseBySelection
            : totalCases
          : checkAdd.totalCaseBySelection
          ? isValueChanged
            ? totalCases
            : checkAdd.totalCaseBySelection
          : item.OnAmount,
      );
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    } else if (x == 'Rate Per Unit') {
      let quntity = parseInt(
        SelectedDiscINType.length > 0
          ? checkAdd.btlConversion11
            ? isValueChanged
              ? totalBTL
              : checkAdd.btlConversion11
            : totalBTL
          : checkAdd.btlConversion11
          ? isValueChanged
            ? totalBTL
            : checkAdd.btlConversion11
          : item.OnAmount,
      );
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    } else if (x == 'Percent') {
      let a = checkAdd.totalAmtBySelection
        ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
          ? checkAdd.totalAmtBySelection
          : totalAmt
        : totalAmt;
      let b = y;
      let c = b / 100;
      let d = a * c;
      let e = a - d;

      Add = Add + d;
    }

    return Add;
  };

  const callforsum1 = (input: number, item: any) => {
    console.log(
      'x condition 1--->',
      SelectedDiscINType.length > 0 ? SelectedDiscINType : 'RNP',
    );
    var x = SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP;
    var y = input;
    let Add = 0;

    if (x == 'Net') {
      let b = y;
      Add = b;
      //   console.log('data runs-->')
    } else if (x == 'Rate Per Box') {
      //  isValueChanged ? totalAmt * (val / 100) : parseFloat(item.OnAmount) * (val / 100)
      // isValueChanged ? totalCases : item.OnAmount
      let quntity = parseFloat(isValueChanged ? totalCases : item.OnAmount);
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    } else if (x == 'Rate Per Unit') {
      // totalBTL
      let quntity = parseInt(isValueChanged ? totalBTL : item.OnAmount);
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    }

    return Add;
  };

  function callforsum2(input: number, item: any) {
    console.log(
      'x condition 2--->',
      SelectedDiscINType.length > 0 ? SelectedDiscINType : 'RNP',
      DiscountONQty,
      input,
      isValueChanged,
    );
    var x = SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP;
    var y = DiscountONQty == 0 ? item.Rate : DiscountONQty;
    let Add = 0;

    if (x == 'Net') {
      let b = y;
      Add = b;
      //   console.log('data runs-->')
    } else if (x == 'Rate Per Box') {
      let quntity = input;
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    } else if (x == 'Rate Per Unit') {
      // totalBTL
      let quntity = input;
      let b1 = y; //get all bottle qty
      let dis = quntity * b1;

      Add = Add + dis;
    }

    return Add;
  }

  // console.log('condition-->', checkAdd.totalAmtBySelection ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0 ? checkAdd.totalAmtBySelection : totalAmt : totalAmt);

  function onDiscOnValChange(input: number, item: any) {
    if (SelectedDiscType.length > 0) {
      if (SelectedDiscType === 'Amount') {
        setIsValueChanged(true);
        setTotalAmt(input);
      } else if (SelectedDiscType === 'Box') {
        setIsValueChanged(true);
        setTotalCases(input);
      } else if (SelectedDiscType === 'Bottle') {
        setIsValueChanged(true);
        setTotalBTL(input);
      }
    } else {
      if (item.DiscountOnType === 'Amount') {
        setIsValueChanged(true);
        setTotalAmt(input);
      } else if (item.DiscountOnType === 'Box') {
        setIsValueChanged(true);
        setTotalCases(input);
      } else if (item.DiscountOnType === 'Bottle') {
        setIsValueChanged(true);
        setTotalBTL(input);
      }
    }
  }

  //   const applyClickHandler = async (orderId:string, id:number | string) => {
  //     if (SelectedDiscType == 'Amount') {
  //       // props.discAmt1(SelectedDiscINType === 'Percent' ? PercentCalNum : discountON)

  //      updateTABLE_DISCOUNT(
  //         SelectedDiscFor,
  //         SelectedDiscINType === 'Percent'
  //           ? PercentCalNum.toFixed(2)
  //           : discountON,
  //         SelectedDiscINType,
  //         totalAmt,
  //         discountON,
  //         '',
  //         SelectedDiscType,
  //         orderId,
  //         id,
  //       );
  //     } else {
  //       updateTABLE_DISCOUNT(
  //         SelectedDiscFor,
  //         CalcNum,
  //         SelectedDiscINType,
  //         SelectedDiscType === 'Box' ? totalCases : totalBTL,
  //         DiscountONQty,
  //         '',
  //         SelectedDiscType,
  //         orderID,
  //         id,
  //       );
  //     }

  function _renderDiscountARR(item: any, index: number) {
    // console.log('_renderDiscountARR-->', val, key);

    return (
      <Box sx={{zIndex: 999}}>
        <Dropdown
          selectedListIsScrollView={true}
          isSearchable={true}
          data={discountList}
          label={'DT_DESC'}
          placeHolder={item.DiscountType}
          CustomDDStyle={{...styles.dropDownContainer, width: '49vw'}}
          isTitleShown={false}
          selectedValue={SelectedDiscFor}
          onPressItem={(val: any) => {
            setSelectedDiscFor(val.DT_DESC);
          }}
        />
      </Box>
    );
  }

  function DeleteItem(id: string | number) {
    console.log('item id for delete--->', id);
    deleteTABLE_DISCOUNT1(id);
    navigate(-1);
  }

  // console.log('selectDiscountFor-->', SelectedDiscFor);

  const selectedDiscounts = ({item, index}: any) => {
    // console.log('iteeeemmm--->', item);
    if (ApplyChanged && isExistShown) {
      applyClickHandler11(item);
    } else {
      null;
    }

    async function applyClickHandler11(item: any) {
      // var apporderid = await AsyncStorage.getItem('app_order_id')
      // var sliceddata = apporderid.slice(1, -1)
      console.log('item.RNP apply--->', item.RNP);

      console.log('applyClickHandler11 runs ---------', item.RNP);

      if (
        SelectedDiscType.length > 0
          ? SelectedDiscType == 'Amount'
          : item.DiscountOnType == 'Amount'
      ) {
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          SelectedDiscINType == 'Percent' || item.RNP == 'Percent'
            ? PercentCalNum == 0
              ? item.DiscountAmount
              : PercentCalNum.toFixed(2)
            : discountON === 0
            ? item.DiscountAmount
            : discountON,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Amount' || item.RNP === 'Amount'
            ? totalAmt
            : isValueChanged
            ? totalAmt
            : item.OnAmount,
          discountON == 0 ? item.Rate : discountON,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalCaseBySelection
            ? checkAdd.totalCaseBySelection
            : CSCount,
          checkAdd.totalBTLBySelection
            ? checkAdd.totalBTLBySelection
            : BTLCount,
          checkAdd.totalAmtBySelection
            ? checkAdd.totalAmtBySelection
            : AMTCount,
          checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
          checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
        );
      }
      //  else if (
      //     SelectedDiscType == 'Box' ||
      //     SelectedDiscType == 'Bottle' ||
      //     item.DiscountOnType == 'Box' ||
      //     item.DiscountOnType == 'Bottle'
      // ) {
      if (SelectedDiscType === 'Box') {
        console.log('box if runs');
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          CalcNum == 0 ? item.DiscountAmount : CalcNum,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Box' || item.RNP === 'Box'
            ? totalCases
            : isValueChanged
            ? totalCases
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalCaseBySelection
            ? checkAdd.totalCaseBySelection
            : CSCount,
          checkAdd.totalBTLBySelection
            ? checkAdd.totalBTLBySelection
            : BTLCount,
          checkAdd.totalAmtBySelection
            ? checkAdd.totalAmtBySelection
            : AMTCount,
          checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
          checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
        );
      } else if (SelectedDiscType.length == 0 && item.DiscountOnType == 'Box') {
        console.log('box else runs');
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          CalcNum == 0 ? item.DiscountAmount : CalcNum,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Box' || item.RNP === 'Box'
            ? totalCases
            : isValueChanged
            ? totalCases
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalCaseBySelection
            ? checkAdd.totalCaseBySelection
            : CSCount,
          checkAdd.totalBTLBySelection
            ? checkAdd.totalBTLBySelection
            : BTLCount,
          checkAdd.totalAmtBySelection
            ? checkAdd.totalAmtBySelection
            : AMTCount,
          checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
          checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
        );
      } else if (SelectedDiscType === 'Bottle') {
        console.log('Bottle if runs');
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          CalcNum == 0 ? item.DiscountAmount : CalcNum,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Bottle' || item.RNP === 'Bottle'
            ? totalBTL
            : isValueChanged
            ? totalBTL
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalCaseBySelection
            ? checkAdd.totalCaseBySelection
            : CSCount,
          checkAdd.totalBTLBySelection
            ? checkAdd.totalBTLBySelection
            : BTLCount,
          checkAdd.totalAmtBySelection
            ? checkAdd.totalAmtBySelection
            : AMTCount,
          checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
          checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
        );
      } else if (
        SelectedDiscType.length == 0 &&
        item.DiscountOnType == 'Bottle'
      ) {
        console.log('Bottle else runs');
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          CalcNum == 0 ? item.DiscountAmount : CalcNum,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Bottle' || item.RNP === 'Bottle'
            ? totalBTL
            : isValueChanged
            ? totalBTL
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalCaseBySelection
            ? checkAdd.totalCaseBySelection
            : CSCount,
          checkAdd.totalBTLBySelection
            ? checkAdd.totalBTLBySelection
            : BTLCount,
          checkAdd.totalAmtBySelection
            ? checkAdd.totalAmtBySelection
            : AMTCount,
          checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
          checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
        );
      }

      setApplyFlag(false);
      setSelectedDiscFor('');
      setApplyChanged(false);
      navigate(-1);
    }

    let TotalQtyDisc = checkAdd.totalAmtBySelection
      ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
        ? checkAdd.totalAmtBySelection - CalcNum
        : totalAmt - CalcNum
      : totalAmt - CalcNum;
    // console.log("selectedDiscounts item-->", item);
    return (
      <Box sx={{mt: 1}}>
        <Box sx={{overflow: 'auto', maxHeight: '70vh'}}>
          <Box>
            <Box sx={styles.oredrFreeMainContainer}>
              <Box sx={styles.orderFreeColumnContainer}>
                <Typography sx={styles.orderTextStyle}>
                  {t('Orders.EditOrderOrder')}
                </Typography>
              </Box>
              <Box sx={styles.boxColumnContainer}>
                <Typography sx={styles.boxTextStyle}>
                  {t('Orders.EditOrderCs')}
                </Typography>
                <Box sx={styles.grossTextBoxContainer}>
                  <Typography sx={styles.grossTextBoxStyle}>
                    {checkAdd.totalCaseBySelection
                      ? brandSKU.length > 0 ||
                        companySKU.length > 0 ||
                        flavourSKU.length > 0
                        ? checkAdd.totalCaseBySelection
                        : CSCount
                      : CSCount}
                  </Typography>
                </Box>
              </Box>
              <Box sx={styles.unitColumContainer}>
                <Typography sx={[styles.unitTextStyle, {ml: '7vw'}]}>
                  {t('EditOrder.EditOrderBtl')}
                </Typography>

                <Box sx={styles.grossTextBoxContainer}>
                  <Typography sx={styles.grossTextBoxStyle}>
                    {checkAdd.totalBTLBySelection
                      ? brandSKU.length > 0 ||
                        companySKU.length > 0 ||
                        flavourSKU.length > 0
                        ? checkAdd.totalBTLBySelection
                        : BTLCount
                      : BTLCount}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{flex: 0.1}}>
              <Box sx={styles.grossMainContainer}>
                <Box sx={styles.grossTextContainer}>
                  <Typography sx={styles.grossTextStyle}>
                    {t('EditOrder.EditOrderGrossAmount')}
                  </Typography>
                </Box>

                <Box sx={[styles.grossTextBoxContainer, {flex: 0.44}]}>
                  <Typography sx={[styles.grossTextBoxStyle, {mt: 1}]}>
                    {checkAdd.totalAmtBySelection
                      ? brandSKU.length > 0 ||
                        companySKU.length > 0 ||
                        flavourSKU.length > 0
                        ? checkAdd.totalAmtBySelection
                        : AMTCount
                      : AMTCount}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Dash Line */}
            <Box sx={styles.dashLineContainer}>
              <DashLine />
            </Box>

            <Box>
              <Box>
                <Box>
                  <Box sx={styles.discountMainContainer}>
                    <Box sx={styles.discountColumnContainer}>
                      <Typography sx={styles.discountTextStyle}>
                        {t('EditOrder.EditOrderDiscountFor')}
                      </Typography>
                    </Box>
                    <Box
                      sx={[
                        styles.discountDropDownContainer,
                        {
                          flex: 0.8,
                          mr: '-3vw',
                        },
                      ]}>
                      {_renderDiscountARR(item, index)}
                    </Box>
                  </Box>

                  <Box sx={styles.discountMainContainer}>
                    <Box sx={styles.discountColumnContainer}>
                      <Typography sx={styles.discountTextStyle}>
                        {t('EditOrder.EditOrderDiscountOn')}
                      </Typography>
                    </Box>
                    <Box sx={styles.discountDropDownContainer}>
                      {_renderDiscountARR1(item, index)}
                    </Box>
                    <Box sx={styles.discountTextBoxContainer}>
                      {SelectedDiscType.length > 0 ? (
                        SelectedDiscType === 'Amount' &&
                        SelectedDiscINType === 'Net' ? (
                          <Typography sx={styles.grossTextBoxStyle}>{'1'}</Typography>
                        ) : SelectedDiscType === 'Amount' ? (
                          <Box sx={styles.grossTextBoxContainer}>
                            <TextField
                              type="number"
                              placeholder={totalAmt.toString()}
                              sx={styles.discountTextBoxStyle}
                              value={checkAdd.totalAmtBySelection
                                ? isValueChanged
                                  ? totalAmt
                                  : checkAdd.totalAmtBySelection
                                : totalAmt}
                              onChange={(e) => {
                                const input = Number(e.target.value);
                                onDiscOnValChange(input, item);
                                CalcPercent2(
                                  input,
                                  item,
                                  input,
                                );
                              }}
                            />
                          </Box>
                        ) : SelectedDiscType === 'Box' ? (
                          <Box sx={styles.grossTextBoxContainer}>
                            <TextField
                              type="number"
                              placeholder={totalCases.toString()}
                              sx={styles.discountTextBoxStyle}
                              value={checkAdd.totalCaseBySelection
                                ? isValueChanged
                                  ? totalCases
                                  : checkAdd.totalCaseBySelection
                                : totalCases}
                              onChange={(e) => {
                                const input = Number(e.target.value);
                                onDiscOnValChange(input, item);
                                editDiscountON(input, item);
                              }}
                            />
                          </Box>
                        ) : SelectedDiscType === 'Bottle' ? (
                          <Box sx={styles.grossTextBoxContainer}>
                            <TextField
                              type="number"
                              placeholder={totalBTL.toString()}
                              sx={styles.discountTextBoxStyle}
                              value={checkAdd.btlConversion11
                                ? isValueChanged
                                  ? totalBTL
                                  : checkAdd.btlConversion11
                                : totalBTL}
                              onChange={(e) => {
                                const input = Number(e.target.value);
                                onDiscOnValChange(input, item);
                                editDiscountON(input, item);
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography sx={styles.grossTextBoxStyle}>{'0'}</Typography>
                        )
                      ) : item.DiscountOnType === 'Amount' &&
                        item.DiscountOnType === 'Net' ? (
                        <Typography sx={styles.grossTextBoxStyle}>{'1'}</Typography>
                      ) : item.DiscountOnType === 'Amount' ? (
                        <Box sx={styles.grossTextBoxContainer}>
                          <TextField
                            type="number"
                            defaultValue={
                              checkAdd.totalAmtBySelection
                                ? isValueChanged
                                  ? totalAmt
                                  : checkAdd.totalAmtBySelection
                                : item.OnAmount
                            }
                            sx={styles.discountTextBoxStyle}
                            onChange={(e) => {
                              const input = Number(e.target.value);
                              onDiscOnValChange(input, item);
                              CalcPercent2(
                                input,
                                item,
                                input,
                              );
                            }}
                          />
                        </Box>
                      ) : item.DiscountOnType === 'Box' ? (
                        <Box sx={styles.grossTextBoxContainer}>
                          <TextField
                            type="number"
                            defaultValue={
                              checkAdd.totalCaseBySelection
                                ? isValueChanged
                                  ? totalCases
                                  : checkAdd.totalCaseBySelection
                                : item.OnAmount
                            }
                            sx={styles.discountTextBoxStyle}
                            onChange={(e) => {
                              const input = Number(e.target.value);
                              onDiscOnValChange(input, item);
                              editDiscountON(input, item);
                            }}
                          />
                        </Box>
                      ) : item.DiscountOnType === 'Bottle' ? (
                        <Box sx={styles.grossTextBoxContainer}>
                          <TextField
                            type="number"
                            defaultValue={
                              checkAdd.btlConversion11
                                ? isValueChanged
                                  ? totalBTL
                                  : checkAdd.btlConversion11
                                : item.OnAmount
                            }
                            sx={styles.discountTextBoxStyle}
                            onChange={(e) => {
                              const input = Number(e.target.value);
                              onDiscOnValChange(input, item);
                              editDiscountON(input, item);
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography sx={styles.grossTextBoxStyle}>
                          {item.OnAmount}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={styles.discountMainContainer}>
                    <Box sx={styles.discountColumnContainer}>
                      <Typography sx={styles.discountTextStyle}>
                        {t('EditOrder.EditOrderDiscountIn')}
                      </Typography>
                    </Box>
                    <Box sx={styles.discountDropDownContainer}>
                      {_renderDiscount(item, index)}
                    </Box>
                    {SelectedDiscType.length > 0 ? (
                      SelectedDiscType === 'Amount' ? (
                        <Box sx={[styles.discountTextBoxContainer]}>
                          <TextField
                            type="number"
                            sx={styles.discountTextBoxStyle}
                            onChange={(e) =>
                              DiscountON(Number(e.target.value), item)
                            }
                          />
                        </Box>
                      ) : SelectedDiscType === 'Box' ||
                        SelectedDiscType === 'Bottle' ? (
                        <Box sx={styles.discountTextBoxContainer}>
                          <TextField
                            type="number"
                            sx={styles.discountTextBoxStyle}
                            onChange={(e) =>
                              DiscountON1(Number(e.target.value), item)
                            }
                          />
                        </Box>
                      ) : (
                        <Box sx={[styles.discountTextBoxContainer]}>
                          <Typography sx={styles.grossTextBoxStyle}>
                            {item.Rate}
                          </Typography>
                        </Box>
                      )
                    ) : item.DiscountOnType === 'Amount' ? (
                      <Box sx={[styles.discountTextBoxContainer]}>
                        <TextField
                          type="number"
                          defaultValue={item.Rate}
                          sx={styles.discountTextBoxStyle}
                          onChange={(e) =>
                            DiscountIN(Number(e.target.value), item)
                          }
                        />
                      </Box>
                    ) : item.DiscountOnType === 'Box' ||
                      item.DiscountOnType === 'Bottle' ? (
                      <Box sx={styles.discountTextBoxContainer}>
                        <TextField
                          type="number"
                          defaultValue={item.Rate}
                          sx={styles.discountTextBoxStyle}
                          onChange={(e) =>
                            DiscountON1(Number(e.target.value), item)
                          }
                        />
                      </Box>
                    ) : (
                      <Box sx={[styles.discountTextBoxContainer]}>
                        <Typography sx={styles.grossTextBoxStyle}>
                          {item.Rate}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {SelectedDiscType.length > 0 ? (
                    SelectedDiscType === 'Amount' &&
                    SelectedDiscINType === 'Percent' ? (
                      <Box
                        sx={[
                          styles.grossTextBoxContainer1,
                          {
                            flex: 0.35,
                            mr: '2.4vw',
                          },
                        ]}>
                        <Typography
                          sx={[
                            styles.grossTextBoxStyle,
                            {mr: '-2vw'},
                          ]}>
                          {PercentCalNum.toFixed(2)}
                        </Typography>
                      </Box>
                    ) : SelectedDiscType === 'Amount' ? (
                      <Box
                        sx={[
                          styles.grossTextBoxContainer1,
                          {
                            flex: 0.35,
                            mr: '2.4vw',
                          },
                        ]}>
                        <Typography
                          sx={[
                            styles.grossTextBoxStyle,
                            {mr: '-2vw'},
                          ]}>
                          {discountON}
                        </Typography>
                      </Box>
                    ) : SelectedDiscType === 'Box' ||
                      SelectedDiscType === 'Bottle' ? (
                      <Box
                        sx={[
                          styles.grossTextBoxContainer1,
                          {
                            flex: 0.35,
                            mr: '2.4vw',
                          },
                        ]}>
                        <Typography
                          sx={[
                            styles.grossTextBoxStyle,
                            {mr: '-2.5vw'},
                          ]}>
                          {CalcNum}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={[
                          styles.grossTextBoxContainer1,
                          {
                            flex: 0.35,
                            mr: '2.4vw',
                          },
                        ]}>
                        <Typography
                          sx={[
                            styles.grossTextBoxStyle,
                            {mr: '-2.5vw'},
                          ]}>
                          {item.DiscountAmount}
                        </Typography>
                      </Box>
                    )
                  ) : (item.DiscountOnType === 'Amount' &&
                      item.RNP === 'Percent') ||
                    SelectedDiscINType === 'Percent' ? (
                    <Box
                      sx={[
                        styles.grossTextBoxContainer1,
                        {
                          flex: 0.35,
                          mr: '2.4vw',
                        },
                      ]}>
                      <Typography
                        sx={[
                          styles.grossTextBoxStyle,
                          {mr: '-2vw'},
                        ]}>
                        {SelectedDiscINType === 'Net'
                          ? discountON
                          : PercentCalNum == 0
                          ? item.DiscountAmount
                          : PercentCalNum.toFixed(2)}
                      </Typography>
                    </Box>
                  ) : item.DiscountOnType === 'Amount' ? (
                    <Box
                      sx={[
                        styles.grossTextBoxContainer1,
                        {
                          flex: 0.35,
                          mr: '2.4vw',
                        },
                      ]}>
                      <Typography
                        sx={[
                          styles.grossTextBoxStyle,
                          {mr: '-2vw'},
                        ]}>
                        {discountON === 0 ? item.DiscountAmount : discountON}
                      </Typography>
                    </Box>
                  ) : item.DiscountOnType === 'Box' ||
                    item.DiscountOnType === 'Bottle' ? (
                    <Box
                      sx={[
                        styles.grossTextBoxContainer1,
                        {
                          flex: 0.35,
                          mr: '2.4vw',
                        },
                      ]}>
                      <Typography
                        sx={[
                          styles.grossTextBoxStyle,
                          {mr: '-2.5vw'},
                        ]}>
                        {CalcNum == 0 ? item.DiscountAmount : CalcNum}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={[
                        styles.grossTextBoxContainer1,
                        {
                          flex: 0.35,
                          mr: '2.4vw',
                        },
                      ]}>
                      <Typography
                        sx={[
                          styles.grossTextBoxStyle,
                          {mr: '-2.5vw'},
                        ]}>
                        {item.DiscountAmount}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{mt: 2}}>
                    <Button
                      onClick={() => {
                        DeleteItem(id);
                      }}
                      sx={styles.deleteBtnView}>
                      <Box
                        sx={{
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',
                        }}>
                        <Box
                          component="img"
                          sx={styles.deleteImgStyle}
                          src={globalImg.deleteRed}
                          alt="Delete"
                        />
                      </Box>
                      <Box sx={styles.deleteTextContainer}>
                        <Typography sx={styles.deleteTextStyle}>
                          {t('EditOrder.EditOrderDelete')}
                        </Typography>
                      </Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{mb: 1.2}}></Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={styles.modalConatiner}>
      <Box sx={styles.modalSizeContainer}>
        <Box sx={styles.modalTopText}>
          <Typography sx={{color: 'white'}}>
            {t('EditOrder.EditOrderAddDiscount')}
          </Typography>
          <Typography sx={{color: 'white'}}>{t('EditOrder.EditOrderClear')}</Typography>
        </Box>
        <Box sx={{flex: 1, px: 2.5, overflow: 'auto', maxHeight: '70vh'}}>
          {editDiscount.map((item: any, index: number) => (
            <Box key={index}>
              {selectedDiscounts({item, index})}
            </Box>
          ))}
        </Box>
        <Box sx={styles.applyCancelConatiner}>
          <Button
            onClick={() => {
              setApplyFlag(true), setApplyChanged(true);
            }}
            sx={{
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <Box sx={styles.applyBtnContainer}>
              <Typography sx={styles.applyBtnText}>
                {t('EditOrder.EditOrderApply')}
              </Typography>
            </Box>
          </Button>

          <Button
            onClick={() => {
              navigate(-1);
            }}>
            <Box sx={styles.cancelBtnContainer}>
              <Typography sx={styles.cancelBtnText}>
                {t('EditOrder.EditOrderCancel')}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const styles: any = {
  modalConatiner: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    minHeight: '100vh',
  },
  modalSizeContainer: {
    height: '90vh',
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 1.25,
    overflow: 'hidden',
  },
  modalTopText: {
    height: 50,
    backgroundColor: '#796A6A',
    display: 'flex',
    flexDirection: 'row',
    px: 2.5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labels: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#7d7d7d',
    paddingBottom: 5,
    lineHeight: 25,
    marginTop: 4,
    marginRight: wp(3.4),
    // marginLeft: wp(1.2)
  },
  inputStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: 15,
    borderWidth: wp('0.4'),
    borderRadius: wp('2'),
    backgroundColor: '#FFFFFF',
    borderColor: '#E6DFDF',
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  checkboxStyle: {
    padding: 2,
    borderWidth: wp('0.4'),
    borderTopWidth: 0,
    // borderRadius: wp('2'),
    backgroundColor: '#FFFFFF',
    borderColor: '#E6DFDF',
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    textAlign: 'center',
  },

  container: {
    flex: 1,
  },

  oredrFreeMainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },

  grossMainContainer: {
    display: 'flex',
    flexDirection: 'row',
  },

  orderFreeColumnContainer: {
    flex: 0.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  orderTextStyle: {
    mt: '5vh',
    color: '#796A6A',
    fontSize: 12,
    fontFamily: 'Proxima Nova',
    fontWeight: 'bold',
  },

  freeTextStyle: {
    marginTop: hp('1'),
    color: '#796A6A',
    fontSize: wp('3%'),
    fontFamily: 'Proxima Nova',
  },

  boxColumnContainer: {
    flex: 0.8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  boxTextStyle: {
    color: '#796A6A',
    fontSize: 12,
    fontFamily: 'Proxima Nova',
    ml: '5vw',
    fontWeight: 'bold',
  },

  boxTextBoxStyle: {
    flex: 1,
    height: hp('5.5'),
    width: wp('20'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
    backgroundColor: '#ffffff',
    marginLeft: wp('-10'),
    marginRight: wp('10'),
    marginTop: hp('1'),
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
  },

  unitColumContainer: {
    display: 'flex',
    flexDirection: 'column',
    mr: '5vw',
  },

  unitTextStyle: {
    color: '#796A6A',
    fontSize: 12,
    fontFamily: 'Proxima Nova',
    ml: '3.8vw',
    fontWeight: 'bold',
  },

  unitTextBoxStyle: {
    flex: 1,
    height: hp('3'),
    width: wp('20'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
    backgroundColor: '#ffffff',
    marginLeft: wp('-3'),
    marginRight: wp('10'),
    marginTop: hp('1'),
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
  },

  rateContainer: {
    flex: 0.7,
    flexDirection: 'row',
    marginTop: hp('1.5'),
  },

  rateColumnContainer: {
    flex: 0.4,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  rateTextStyle: {
    marginTop: hp('2'),
    color: '#796A6A',
    //  fontSize: wp('3%'),
    fontFamily: 'Proxima Nova',
    fontSize: 12,
  },

  boxUnitDropContainer: {
    flex: 0.1,
    alignContent: 'center',
    justifyContent: 'center',
  },

  dropDownContainer: {
    borderColor: '#E6DFDF',
    borderRadius: '1vw',
    width: '30vw',
    minHeight: '5.5vh',
    mt: 0,
    mx: '4vw',
    backgroundColor: '#FFFFFF',
    px: '2vh',
    my: 1.25,
    borderWidth: '0.15vw',
    mr: '10vw',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    p: 0.25,
  },

  dropDownStyless: {
    flex: 1,
    width: wp('30'),
    height: hp('5'),
    backgroundColor: 'white',
    justifyContent: 'center',
    marginLeft: wp('-6'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
  },

  rateTextBoxContainer: {
    flex: 0.38,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  rateTextBoxStyle: {
    fontSize: 10,
    height: hp('5.5'),
    width: wp('20'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
    backgroundColor: '#ffffff',
    marginRight: wp('-3'),
    marginTop: hp('0'),
    textAlign: 'center',
    padding: 5,
  },

  dashLineContainer: {
    flex: 1,
    mt: '0.2vh',
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
  },

  dashLineContainer2: {
    flex: 1,
    marginTop: hp('1'),
    alignContent: 'center',
    alignItems: 'center',
  },

  dashLineStyle: {
    width: wp('83'),
    height: hp('1'),
    // color: '#ADA2A2',
  },

  grossTextContainer: {
    flex: 0.5,
    display: 'flex',
    flexDirection: 'row',
  },

  grossTextStyle: {
    color: '#796A6A',
    mt: '2vh',
    fontFamily: 'Proxima Nova',
    fontSize: 12,
    fontWeight: 'bold',
  },

  grossTextBoxContainer: {
    flex: 0.43,
    display: 'flex',
    alignItems: 'flex-end',
  },

  grossTextBoxContainer1: {
    flex: 0.38,
    display: 'flex',
    alignItems: 'flex-end',
  },

  grossTextBoxStyle: {
    color: Colors.black || '#000',
    height: '5.5vh',
    lineHeight: '5.5vh',
    width: '20vw',
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: '1vw',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  discountMainContainer: {
    flex: 0.5,
    display: 'flex',
    flexDirection: 'row',
    mt: '1vh',
  },

  discountColumnContainer: {
    flex: 0.4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  discountTextStyle: {
    color: '#796A6A',
    fontFamily: 'Proxima Nova',
    mt: '2vh',
    fontSize: 12,
    fontWeight: 'bold',
  },

  discountDropContainer: {
    flex: 0.5,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  dropDownContainerDiscount: {
    flex: 1,
    width: wp('30'),
    height: hp('5.5'),
    borderColor: '#E6DFDF',
    borderRadius: wp('1'),
    marginTop: hp('0'),
    marginHorizontal: wp('1'),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: hp('4'),
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: wp('0.5'),
    marginRight: wp('9'),
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
    padding: 15,
  },

  discountDropStyle: {
    flex: 1,
    width: wp('30'),
    height: hp('5'),
    backgroundColor: 'white',
    justifyContent: 'center',
    marginLeft: wp('-4'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
  },
  discountDropDownContainer: {
    flex: 0.6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  discountTextBoxContainer: {
    flex: 0.28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  discountTextBoxStyle: {
    color: Colors.black || '#000',
    height: '5.5vh',
    width: '20vw',
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: '1vw',
    backgroundColor: '#ffffff',
    mt: 0,
    textAlign: 'center',
    p: 0.625,
    fontSize: 10,
    '& input': {
      textAlign: 'center',
    },
  },

  applicableMainContainer: {
    flex: 1,
    marginTop: hp('2'),
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginLeft: wp('-4'),
  },

  roundedtext: {
    width: 25,
    height: 25,
    // flexWrap:"wrap",
    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: wp('5'),
  },

  applicableTextStyle: {
    marginLeft: wp('4'),
    fontFamily: 'Proxima Nova',
    //  fontSize: wp('3'),
    color: '#3955CB',
    marginTop: hp('0.7'),
    fontSize: 12,
  },

  applyDeleteMainContainer: {
    flex: 1,
    marginTop: hp('2'),
    flexDirection: 'row',
    marginBottom: hp('1'),
  },

  applyMainContainer: {
    flex: 0.7,
    justifyContent: 'flex-start',
    marginLeft: wp('9'),
  },

  applyContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  applyImgContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  applyImgStyle: {
    height: hp('3'),
    width: wp('4'),
  },

  applyTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: wp('4'),
  },

  applyTextStyle: {
    fontFamily: 'Proxima Nova',
    color: '#2FC36E',
    fontWeight: 'bold',
    //    fontSize:RFValue(15),
    fontSize: wp('3'),
  },

  deleteMainContainer: {
    flex: 0.5,
    justifyContent: 'flex-end',
  },

  deleteBtnView: {
    alignSelf: 'flex-end',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'flex-end',
    textTransform: 'none',
  },

  deleteContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  deleteImgContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  deleteImgStyle: {
    height: '3vh',
    width: '4vw',
  },

  deleteTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    ml: '4vw',
  },

  deleteTextStyle: {
    fontFamily: 'Proxima Nova',
    color: '#E23333',
    fontWeight: 'bold',
    fontSize: '3vw',
    mt: '-2.6vh',
  },

  FlatListStyle: {
    marginLeft: 10,
    marginRight: 10,
  },
  SubHeadingConatiner: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  SubHeadingTextStyle: {
    color: Colors.TexthintColor,
    //fontWeight: 'bold',
    fontSize: Dimen.FontSizeSmall,
    fontFamily: 'Proxima Nova',
  },
  SelectModeContainer: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    borderRadius: 5,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'center',
  },
  SelectModeConatiner2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  FlatListConatiner: {
    marginLeft: 20,
    marginRight: 20,
    padding: 20,
    backgroundColor: Colors.white,
    height: 'auto',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    overflow: 'hidden',
    // maxHeight: 'auto',
  },
  TextInputStyle: {
    borderWidth: 1,
    height: 30,
    width: 85,
    marginTop: 5,
    borderRadius: 5,
    padding: 0,
    paddingLeft: 10,
    color: Colors.black,
    borderColor: Colors.black,
    fontFamily: 'Proxima Nova',
    marginHorizontal: 5,
  },
  DotStyle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    marginTop: 5,
  },

  applyCancelConatiner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    py: 0.625,
  },
  applyBtnContainer: {
    backgroundColor: 'green',
    display: 'flex',
    justifyContent: 'center',
    borderColor: '#CC1167',
    height: 50,
    width: 120,
    borderRadius: 1.25,
  },
  applyBtnText: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Proxima Nova',
    fontSize: 10,
    fontWeight: 'bold',
    p: 1.25,
  },
  cancelBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: 50,
    width: 120,
    borderRadius: 1.25,
    borderWidth: 1,
    textTransform: 'none',
  },
  cancelBtnText: {
    color: Colors.black || '#000',
    alignSelf: 'center',
    fontFamily: 'Proxima Nova',
    fontSize: 10,
    fontWeight: 'bold',
    p: 1.25,
  },
  okBtnConatiner: {
    justifyContent: 'center',
    height: 50,
    width: 120,
    borderRadius: 10,
    borderWidth: 1,
  },
  okBtnText: {
    color: 'green',
    alignSelf: 'center',
    fontFamily: 'Proxima Nova',
    fontSize: 10,
    fontWeight: 'bold',
    // padding: 10,
  },
};

export default EditFullOrderDiscount1;
