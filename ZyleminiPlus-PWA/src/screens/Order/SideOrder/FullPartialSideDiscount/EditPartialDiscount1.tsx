// Web-adapted EditPartialDiscount1 component
import React, {useEffect, useState} from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigation, useRoute } from '@react-navigation/native';
import DashLine from '../../../CollectionModule/Components/DashLine';
import {Colors} from '../../../../theme/colors';
import {hp, wp, Dimen} from '../../../../utility/responsiveHelpers';
import {
  deleteTABLE_DISCOUNT1,
  deleteTABLE_TEMP_CategoryDiscountItem,
  getDISCOUNTEDItemforCNOEdit,
  getDISCOUNTEDItemforEdit,
  getDataDiscountMaster,
  getDiscountedData,
  getTABLE_DISCOUNTforEdit,
  getitemdataall,
  insertintoTABLE_TEMP_CategoryDiscountItem,
  updateTABLE_DISCOUNT1,
} from '../../../../database/SqlDatabase';
import {useOrderAction} from '../../../../redux/actionHooks/useOrderAction';
import {TABLE_TEMP_ORDER_DETAILS} from '../../../../types/types';
import {globalImg} from '../../../../constants/AllImages';
import Icon from '../../../../components/Icon/Icon';
import {ScreenName} from '../../../../constants/screenConstants';
// import PartialDiscountExtended from './PartialDiscountExtended';
import {useLoginAction} from '../../../../redux/actionHooks/useLoginAction';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import {discountOnArray} from '../../../../utility/utils';
import {useTranslation} from 'react-i18next';

let partialDiscountDD = ['BRAND', 'PRINCIPAL COMPANY', 'FLAVOUR'];

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

let primdaryID = 0;

interface Props {
  navigation?: any;
  route?: {
    params?: {id: number; orderID: string; entityid: string};
  };
}

const EditPartialDiscount1 = (props: Props) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = props.route?.params || route.params || {};
  const {orderID, entityid, id} = routeParams; // orderID, id
  console.log('orderID, id -->', orderID, id, entityid);

  const {savedOrderID} = useOrderAction();
  const {userId} = useLoginAction();

  const [isDDshown, setIsDDshown] = useState(false);
  const [product, setProduct] = useState<any>([]);
  const [data, setData] = useState<TABLE_TEMP_ORDER_DETAILS[]>([]);
  const [discountList, setDiscountList] = useState([]);
  const [brandSKU, setBrandSKU] = useState<any>([]);
  const [companySKU, setCompanySKU] = useState<any>([]);
  const [flavourSKU, setFlavourSKU] = useState<any>([]);
  const [Custom_fields, setCustom_fields] = useState<any>([]);
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

  const [brandCODE, setBrandCode] = useState<any>([]);
  const [companyITEMS, setCompanyItems] = useState<any>([]);
  const [flavourITEMS, setFlavourItems] = useState<any>([]);
  const [discountedBrand, setDiscountedBrand] = useState<any>([]);

  const [ApplyExistFlag, setApplyExistFlag] = useState(false);
  const [ApplyChanged, setApplyChanged] = useState(false);
  const [editDiscount, setEditDiscount] = useState([]);

  const [isExistShown, setIsExistShown] = useState(false);

  useEffect(() => {
    getDataDiscountMaster(userId).then((data: any) => {
      setDiscountList(data);
      setIsExistShown(true);
    });
  }, []);

  useEffect(() => {
    if (isExistShown) {
      existingDiscount();
    } else {
      NEWdislist();
    }
  }, [isExistShown]);

  // console.log('brandcode--->', brandCODE);
  // console.log('discounted Item--->', discountedBrand, discountedBrand.length);
  // console.log('companyITEMS Item--->', companyITEMS);
  // console.log('flavourITEMS Item--->', flavourITEMS);

  // console.log('data-->', data)
  // console.log('SelectedDiscFor disc for--->', SelectedDiscFor);
  // console.log('isExistShown--->', isExistShown);
  // console.log('applyFlag--->', applyFlag);
  // console.log('condition Apply --->', !isExistShown && applyFlag ? 'apply' : 'cancel');
  // console.log('condition for applyClick --->', SelectedDiscType.length > 0 && SelectedDiscINType.length > 0 && SelectedDiscFor.length > 0 && ApplyChanged && !isExistShown);
  // console.log('condition for applyClick11 --->', SelectedDiscType.length > 0 && SelectedDiscINType.length > 0 && SelectedDiscFor.length > 0 && ApplyChanged && isExistShown);
  // console.log('conditinnn for existing -->', ApplyChanged && isExistShown);
  // console.log('calcnum--->', CalcNum);
  // console.log('SelectedDiscType discOn--->', SelectedDiscType);
  // console.log('PercentCalNum--->', PercentCalNum);
  // console.log('productt--->', product.length);
  // // console.log('discountON AMOUNT--->', discountON);
  // console.log('DiscountONQty-->', DiscountONQty);
  // console.log('totalAmt-->', totalAmt);
  // console.log('total cases-->', totalCases);
  // console.log('total btl-->', totalBTL);
  // console.log('cs count--->', CSCount);
  // console.log('BTLCount count--->', BTLCount);
  // console.log('bpc total --->', totalBPC);
  // console.log('custom_field--->', Custom_fields);

  const NEWdislist = async () => {
    // let apporderid = await AsyncStorage.getItem('apporderid')
    // sliceddata = apporderid.slice(1, -1)

    let tempData = [];
    // await db.getitemdataall(apporderid).then(data1 => {
    // await db.getRetrievedDiscountData(orderID).then(data1 => {
    await getDiscountedData(orderID).then((data1: any) => {
      // console.log('getDiscountedData data 1 -->', data1);

      let filtered = data1.filter((disc: any) => disc.BrandCode != '');
      console.log('dtaa pp 1-->', filtered);

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

      // db.getOrdersFromDbIfPresentfordiscount(apporderid).then(data => {
      //     // console.log("I am from insertedpreviousdata", data);
      // });
    });

    console.log('data 1--->', data);

    // db.retrievedDiscountData(sliceddata).then((daata) => {
    //     console.log('retrievedDiscountData daata--->', daata);
    //     setData(daata)
    // })
    // db.retrievedPItemOrderDetailsData(sliceddata).then((daata) => {
    //     console.log('retrievedPItemOrderDetailsData daata--->', daata);
    //     // setData(daata)
    // })

    // await db.getSelectedDiscount(id, orderID).then((dataaa) => {
    //     console.log('getSelectedDiscount --->', dataaa);
    // })
  };

  const existingDiscount = async () => {
    await getTABLE_DISCOUNTforEdit(id, orderID).then((dataa: any) => {
      console.log('getTABLE_DISCOUNTforEdit--->', dataa);
      // dataa.map(el => {
      //     console.log('for edit map--->', el.Amount)
      //     setTotalBPC(el.BPC)
      //     setTotalAmt(el.Amount)
      //     setTotalCases(el.Cases)
      //     setTotalBTL(el.BtlConversion)

      //     setCSCount(el.Cases)
      //     setBTLCount(el.Bottle)
      //     setAMTCount(el.Amount)
      // })

      setEditDiscount(dataa);
    });

    await getDISCOUNTEDItemforEdit(id, orderID).then((dataa1: any) => {
      console.log('getDISCOUNTEDItemforEdit--->', dataa1);
      let x: any = [];
      let y: any = [];
      let z: any = [];
      dataa1.map((item: any) => {
        setBrandCode(item.BrandCode);
        x.push(item.Item);
        y.push(item.DIVISION);
        z.push(item.FLAVOUR);
      });
      setDiscountedBrand(x);
      setCompanyItems(y);
      setFlavourItems(z);
    });

    await getDiscountedData(orderID).then((data1: any) => {
      // console.log('getDiscountedData data 1 -->', data1);

      let filtered = data1.filter((disc: any) => disc.BrandCode != '');
      console.log('dtaa pp 1-->', filtered);

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

      // setData(data1)

      // db.getOrdersFromDbIfPresentfordiscount(apporderid).then(data => {
      //     // console.log("I am from insertedpreviousdata", data);
      // });
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
  brandSKU.map((el: any) => {
    return brandItem.push(data.filter((brand: any) => brand.BRAND == el));
  });

  let companyItem: any = [];
  companySKU.map((el: any) => {
    return companyItem.push(data.filter((brand: any) => brand.DIVISION == el));
  });

  let flavourItem: any = [];
  flavourSKU.map((el: any) => {
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
    let totalSelectedCases = 0;
    let totalCaseBySelection = 0;
    let totalBTLBySelection = 0;
    let BPCBySelection = 0;
    let btlConversion11 = 0;
    let casesConversion = 0;
    for (let i = 0; i < dataAdd?.length; i++) {
      totalAmtBySelection = totalAmtBySelection + parseInt(dataAdd[i].Amount);
      totalSelectedCases += parseInt(dataAdd[i].quantity_one);
      totalCaseBySelection +=
        parseInt(dataAdd[i].quantity_one) +
        parseInt(dataAdd[i].quantity_two) / parseInt(dataAdd[i].BPC);
      totalBTLBySelection += parseInt(dataAdd[i].quantity_two);
      BPCBySelection += parseInt(dataAdd[i].BPC);
      btlConversion11 +=
        parseInt(dataAdd[i].BPC) * parseInt(dataAdd[i].quantity_one) +
        parseInt(dataAdd[i].quantity_two);
      casesConversion +=
        parseInt(dataAdd[i].quantity_one) +
        parseInt(dataAdd[i].quantity_two) / parseInt(dataAdd[i].bpc);
    }
    // let btlConversion11 = (BPCBySelection * totalCaseBySelection) + totalBTLBySelection
    // console.log('BTLConvo--->', BTLConvo);
    // console.log('btlConversion11 crea selec--->', btlConversion11);
    console.log('BPCBySelection crea selec-->', BPCBySelection);
    return {
      totalAmtBySelection,
      totalSelectedCases,
      totalCaseBySelection,
      totalBTLBySelection,
      BPCBySelection,
      btlConversion11,
    };
  }

  console.log('add total on selection-->', checkAdd);

  const addCustomField = () => {
    setCustom_fields([
      ...Custom_fields,
      {
        isDDshown1: false,
        product1: [],
        data1: [],
        discountList1: [],
        brandSKU1: [],
        companySKU1: [],
        flavourSKU1: [],
        SelectedDiscType1: '',
        SelectedDiscINType1: '',
        discountON11: 0,
        PercentCalNum1: 0,
        TotalPerAmt1: 0,
        AmtDiscOn1: 0,
        CalcNum1: 0,
        SelectedDiscFor1: '',
        totalAmt1: 0,
        totalCases1: '',
        totalBTL1: '',
        totalBPC1: 0,
        isValueChanged1: false,
      },
    ]);
  };

  const deleteDynamicfield = (index: number | string) => {
    console.log('delete index-->', index);
    // let test1 = [...Custom_fields]
    // test1.splice(key, 1);
    Custom_fields.splice(index, 1);
    // console.log('Custom_fields after delete-->', Custom_fields);
    setCustom_fields([...Custom_fields]);
  };

  const _renderDiscountARR1 = (item: any, index: number) => {
    return (
      <Box sx={{zIndex: 999}}>
        <Dropdown
          selectedListIsScrollView={true}
          data={discountOnArray}
          label={'name'}
          placeHolder={isExistShown ? item.DiscountOnType : 'SELECT'}
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
          placeHolder={
            isExistShown
              ? SelectedDiscType.length > 0
                ? 'SELECT'
                : item.RNP
              : 'SELECT'
          }
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
    // let calPer = isValueChanged
    //     ? input * (val / 100)
    //     : parseFloat(item.OnAmount) * (val / 100);

    // let TotalCalPer = isValueChanged
    //     ? input - calPer
    //     : parseFloat(item.OnAmount) - calPer;

    let checkDiscountOn = discountON == 0 ? item.Rate : discountON;

    let calPer = input * (checkDiscountOn / 100);

    let TotalCalPer = input - calPer;

    setCalcPercent(calPer);
    setTotalPerAmt(TotalCalPer);
  }

  function DiscountON1(input: number, item: any) {
    console.log('DiscountON1 input--->', input);
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
    console.log(
      'item.RNP callforsum--->',
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
    var x = SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP;
    var y = input;
    let Add = 0;

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
          : isValueChanged
          ? totalCases
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
          : isValueChanged
          ? totalBTL
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

  console.log(
    'cases to upadte--->',
    checkAdd.totalCaseBySelection ? checkAdd.totalCaseBySelection : CSCount,
  );

  if (
    SelectedDiscType.length > 0 &&
    SelectedDiscINType.length > 0 &&
    SelectedDiscFor.length > 0 &&
    ApplyChanged &&
    !isExistShown
  ) {
    applyClickHandler();
    console.log('applyClickHandler RUNS---');
  } else {
    null;
  }

  async function applyClickHandler() {
    // var apporderid = await AsyncStorage.getItem('app_order_id')
    // var sliceddata = apporderid.slice(1, -1)

    if (SelectedDiscType == 'Amount') {
      // props.discAmt1(SelectedDiscINType === 'Percent' ? PercentCalNum : discountON)
      updateTABLE_DISCOUNT1(
        SelectedDiscFor,
        SelectedDiscINType === 'Percent'
          ? PercentCalNum.toFixed(2)
          : discountON,
        SelectedDiscINType,
        checkAdd.totalAmtBySelection
          ? isValueChanged
            ? totalAmt
            : checkAdd.totalAmtBySelection
          : totalAmt,
        discountON,
        product[0],
        SelectedDiscType,
        orderID,
        id,
        checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
        checkAdd.totalBTLBySelection ? checkAdd.totalBTLBySelection : BTLCount,
        checkAdd.totalAmtBySelection ? checkAdd.totalAmtBySelection : AMTCount,
        checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
        checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
      );

      ApplyClickIF(orderID, id);
    } else {
      // props.discAmt1(CalcNum)
      updateTABLE_DISCOUNT1(
        SelectedDiscFor,
        CalcNum,
        SelectedDiscINType,
        SelectedDiscType === 'Box'
          ? checkAdd.totalCaseBySelection
            ? isValueChanged
              ? totalCases
              : checkAdd.totalCaseBySelection
            : totalCases
          : checkAdd.btlConversion11
          ? isValueChanged
            ? totalBTL
            : checkAdd.btlConversion11
          : totalBTL,
        DiscountONQty,
        product[0],
        SelectedDiscType,
        orderID,
        id,
        checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
        checkAdd.totalBTLBySelection ? checkAdd.totalBTLBySelection : BTLCount,
        checkAdd.totalAmtBySelection ? checkAdd.totalAmtBySelection : AMTCount,
        checkAdd.BPCBySelection ? checkAdd.BPCBySelection : totalBPC,
        checkAdd.btlConversion11 ? checkAdd.btlConversion11 : totalBTL,
      );

      ApplyClickElse(orderID, id);
    }

    // amountss = 0;
    // quantity_one = 0;
    // quantity_two = 0;
    // bpcTotal = 0;
    setApplyFlag(false);
    setApplyChanged(false);
    setSelectedDiscFor('');
    navigation.goBack();
  }

  async function ApplyClickIF(orderID: string, id: number | string) {
    if (SelectedDiscType == 'Amount') {
      deleteTABLE_TEMP_CategoryDiscountItem(id);

      if (brandItem.flat(1).length > 0) {
        brandItem.flat(1).map((el: any) => {
          console.log('dataa aaa-->', el.Amount);
          // db.updateTABLE_TEMP_CategoryDiscountItem(
          //     el.item_id,
          //     '',
          //     '',
          //     el.Amount,
          //     orderID,
          //     id,
          // )
          insertintoTABLE_TEMP_CategoryDiscountItem(
            id,
            orderID,
            el.item_id,
            '',
            '',
            el.Amount,
            'N',
          );
        });
      } else if (companyItem.flat(1).length > 0) {
        companyItem.flat(1).map((el: any) => {
          //console.log('dataa aaa-->', el.quantity_one);
          insertintoTABLE_TEMP_CategoryDiscountItem(
            id,
            orderID,
            el.item_id,
            '',
            '',
            el.Amount,
            'N',
          );
        });
      } else if (flavourItem.flat(1).length > 0) {
        flavourItem.flat(1).map((el: any) => {
          //  console.log('dataa aaa-->', el.quantity_one);
          insertintoTABLE_TEMP_CategoryDiscountItem(
            id,
            orderID,
            el.item_id,
            '',
            '',
            el.Amount,
            'N',
          );
        });
      } else {
        data?.map((el: any) => {
          console.log('dataa aaa-->', el.item_id);
          insertintoTABLE_TEMP_CategoryDiscountItem(
            id,
            orderID,
            el.item_id,
            '',
            '',
            el.Amount,
            'N',
          );
        });
      }
      // Actions.CreateNewOrderPreview();
    }
  }

  async function ApplyClickElse(orderID: string, id: number | string) {
    console.log('ApplyClickElse -->', orderID, id);

    deleteTABLE_TEMP_CategoryDiscountItem(id);

    if (brandItem.flat(1).length > 0) {
      brandItem.flat(1).map((el: any) => {
        // console.log('dataa aaa-->', el.quantity_one);
        insertintoTABLE_TEMP_CategoryDiscountItem(
          id,
          orderID,
          el.item_id,
          el.quantity_one,
          el.quantity_two,
          '',
          'N',
        );
      });
    } else if (companyItem.flat(1).length > 0) {
      companyItem.flat(1).map((el: any) => {
        // console.log('dataa aaa-->', el.quantity_one);
        insertintoTABLE_TEMP_CategoryDiscountItem(
          id,
          orderID,
          el.item_id,
          el.quantity_one,
          el.quantity_two,
          '',
          'N',
        );
      });
    } else if (flavourItem.flat(1).length > 0) {
      flavourItem.flat(1).map((el: any) => {
        //    console.log('dataa aaa-->', el.quantity_one);
        insertintoTABLE_TEMP_CategoryDiscountItem(
          id,
          orderID,
          el.item_id,
          el.quantity_one,
          el.quantity_two,
          '',
          'N',
        );
      });
    } else {
      data.map((el: any) => {
        //  console.log('dataa aaa-->', el.quantity_one);
        insertintoTABLE_TEMP_CategoryDiscountItem(
          id,
          orderID,
          el.item_id,
          el.quantity_one,
          el.quantity_two,
          '',
          'N',
        );
      });
    }
    // Actions.CreateNewOrderPreview();
    // navigation.navigate(ScreenName.SIDEORDERDETAIL, {
    //   entityid,
    //   orderID,
    //   isInProcessOrder: true,
    // });
  }

  function _renderDiscountARR(item: any, index: number) {
    return (
      <Box sx={{zIndex: 999}}>
        <Dropdown
          selectedListIsScrollView={true}
          isSearchable={true}
          data={discountList}
          label={'DT_DESC'}
          placeHolder={isExistShown ? item.DiscountType : 'SELECT'}
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

  function DeleteItem(id: number | string) {
    console.log('item id for delete--->', id);
    deleteTABLE_TEMP_CategoryDiscountItem(id);
    deleteTABLE_DISCOUNT1(id);
    // Actions.sideordrDetails();
    // navigation.navigate(ScreenName.SIDEORDERDETAIL, {
    //   entityid,
    //   orderID,
    //   isInProcessOrder: true,
    // });
    navigation.goBack();
  }

  // console.log('selectDiscountFor-->', SelectedDiscFor);

  const selectedDiscounts = ({item, index}: any) => {
    // console.log('itemm-->', item);
    // console.log('discount Amoount--->', SelectedDiscINType == 'Percent' || item.DiscountOnType == 'Percent' ? PercentCalNum == 0 ? item.DiscountAmount : PercentCalNum.toFixed(2) : discountON === 0 ? item.DiscountAmount : discountON);

    let TotalQtyDisc = checkAdd.totalAmtBySelection
      ? brandSKU.length > 0 || companySKU.length > 0 || flavourSKU.length > 0
        ? checkAdd.totalAmtBySelection - CalcNum
        : totalAmt - CalcNum
      : totalAmt - CalcNum;

    // {
    //     ApplyExistFlag ?
    //         !isExistShown && applyFlag ?
    //             SelectedDiscType.length > 0 && SelectedDiscINType.length > 0 && SelectedDiscFor.length > 0 && ApplyChanged ?
    //                 applyClickHandler()
    //                 : applyClickHandler()
    //             : applyClickHandler11()
    //         : null
    // }

    // if (SelectedDiscType.length > 0 && SelectedDiscINType.length > 0 && SelectedDiscFor.length > 0 && ApplyChanged && isExistShown) {
    //     applyClickHandler11()
    // } else {
    //     null
    // }

    console.log(
      'box insert cond--->',
      (SelectedDiscType.length > 0 && SelectedDiscType === 'Box') ||
        item.RNP === 'Box'
        ? SelectedDiscINType.length > 0
          ? checkAdd.totalCaseBySelection
            ? isValueChanged
              ? totalCases
              : checkAdd.totalCaseBySelection
            : totalCases
          : checkAdd.totalCaseBySelection
          ? isValueChanged
            ? totalCases
            : checkAdd.totalCaseBySelection
          : item.OnAmount
        : item.OnAmount,
    );

    async function boxCond() {
      if (
        SelectedDiscType.length > 0
          ? SelectedDiscType === 'Box'
          : item.RNP === 'Box'
      ) {
        return SelectedDiscINType.length > 0
          ? checkAdd.totalCaseBySelection
            ? isValueChanged
              ? totalCases
              : checkAdd.totalCaseBySelection
            : totalCases
          : checkAdd.totalCaseBySelection
          ? isValueChanged
            ? totalCases
            : checkAdd.totalCaseBySelection
          : item.OnAmount;
      } else {
        return SelectedDiscINType.length > 0
          ? checkAdd.totalBTLBySelection
            ? isValueChanged
              ? totalBTL
              : checkAdd.totalBTLBySelection
            : totalBTL
          : checkAdd.totalBTLBySelection
          ? isValueChanged
            ? totalBTL
            : checkAdd.totalBTLBySelection
          : item.OnAmount;
      }
    }

    console.log(
      'box vcondub--->',
      //  await boxCond(),
      SelectedDiscType.length,
      SelectedDiscType.length == 0,
      item.DiscountOnType,
      SelectedDiscType.length == 0 && item.DiscountOnType == 'Box',
    );

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

      // let boxCondition =  if(SelectedDiscType.length > 0 ? SelectedDiscType === 'Box' : item.RNP === 'Box') { SelectedDiscINType.length > 0 ? checkAdd.totalCaseBySelection ? isValueChanged ? totalCases : checkAdd.totalCaseBySelection : totalCases : checkAdd.totalCaseBySelection ? isValueChanged ? totalCases : checkAdd.totalCaseBySelection : item.OnAmount : item.OnAmount}

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
          SelectedDiscType.length == 0
            ? isValueChanged
              ? totalAmt
              : item.OnAmount
            : checkAdd.totalAmtBySelection
            ? isValueChanged
              ? totalAmt
              : checkAdd.totalAmtBySelection
            : totalAmt,
          discountON == 0 ? item.Rate : discountON,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
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
      // else if (
      //     SelectedDiscType == 'Box' ||
      //     SelectedDiscType == 'Bottle' ||
      //     item.DiscountOnType == 'Box' ||
      //     item.DiscountOnType == 'Bottle'
      // )
      // {
      if (SelectedDiscType === 'Box') {
        console.log('box if runs');
        updateTABLE_DISCOUNT1(
          SelectedDiscFor.length > 0 ? SelectedDiscFor : item.DiscountType,
          CalcNum == 0 ? item.DiscountAmount : CalcNum,
          SelectedDiscINType.length > 0 ? SelectedDiscINType : item.RNP,
          SelectedDiscType === 'Box' || item.RNP === 'Box'
            ? SelectedDiscINType.length > 0
              ? checkAdd.totalCaseBySelection
                ? isValueChanged
                  ? totalCases
                  : checkAdd.totalCaseBySelection
                : totalCases
              : checkAdd.totalCaseBySelection
              ? isValueChanged
                ? totalCases
                : checkAdd.totalCaseBySelection
              : item.OnAmount
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
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
          SelectedDiscType.length == 0
            ? isValueChanged
              ? totalCases
              : item.OnAmount
            : SelectedDiscType === 'Box' || item.RNP === 'Box'
            ? SelectedDiscINType.length > 0
              ? checkAdd.totalCaseBySelection
                ? isValueChanged
                  ? totalCases
                  : checkAdd.totalCaseBySelection
                : totalCases
              : checkAdd.totalCaseBySelection
              ? isValueChanged
                ? totalCases
                : checkAdd.totalCaseBySelection
              : item.OnAmount
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
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
            ? SelectedDiscINType.length > 0
              ? checkAdd.totalBTLBySelection
                ? isValueChanged
                  ? totalBTL
                  : checkAdd.totalBTLBySelection
                : totalBTL
              : checkAdd.totalBTLBySelection
              ? isValueChanged
                ? totalBTL
                : checkAdd.totalBTLBySelection
              : item.OnAmount
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
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
          SelectedDiscType.length == 0
            ? isValueChanged
              ? totalBTL
              : item.OnAmount
            : SelectedDiscType === 'Bottle' || item.RNP === 'Bottle'
            ? SelectedDiscINType.length > 0
              ? checkAdd.totalBTLBySelection
                ? isValueChanged
                  ? totalBTL
                  : checkAdd.totalBTLBySelection
                : totalBTL
              : checkAdd.totalBTLBySelection
              ? isValueChanged
                ? totalBTL
                : checkAdd.totalBTLBySelection
              : item.OnAmount
            : item.OnAmount,
          DiscountONQty == 0 ? item.Rate : DiscountONQty,
          product.length > 0 ? product[0] : item.BrandCode,
          SelectedDiscType.length > 0 ? SelectedDiscType : item.DiscountOnType,
          orderID,
          id,
          checkAdd.totalSelectedCases ? checkAdd.totalSelectedCases : CSCount,
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
      // }

      setApplyFlag(false);
      setSelectedDiscFor('');
      setApplyChanged(false);
      navigation.goBack();
    }

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
                        ? checkAdd.totalSelectedCases
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
                                  ? item.OnAmount
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
                </Box>

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
            <Box sx={{mb: 1.2}}></Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const discountsList = (item: any, index: number) => {
    //brandSelected
    let isSelected =
      brandCODE?.length > 0
        ? brandCODE?.includes(item)
        : product.includes(item);
    // console.log('setSelection item-->', item)
    return (
      <Button
        onClick={() => {
          if (!isSelected) {
            setBrandCode([]);
            setIsExistShown(false);
            {
              if (product[0] === 'BRAND') {
                setBrandSKU([]);
                setCompanySKU([]);
                setFlavourSKU([]);
              } else if (product[0] === 'PRINCIPAL COMPANY') {
                setCompanySKU([]);
                setBrandSKU([]);
                setFlavourSKU([]);
              } else if (product[0] === 'FLAVOUR') {
                setFlavourSKU([]);
                setBrandSKU([]);
                setCompanySKU([]);
              }
            }
            let data = [];
            data.push(item);
            setProduct(data);

            // setIsDDshown(false)
          } else {
            setBrandCode([]);
            setIsExistShown(false);
            {
              if (product[0] === 'BRAND') {
                setBrandSKU([]);
                setCompanySKU([]);
                setFlavourSKU([]);
              } else if (product[0] === 'PRINCIPAL COMPANY') {
                setCompanySKU([]);
                setBrandSKU([]);
                setFlavourSKU([]);
              } else if (product[0] === 'FLAVOUR') {
                setFlavourSKU([]);
                setBrandSKU([]);
                setCompanySKU([]);
              }
            }
            let data = product.filter((item1: any) => item1 != item);
            setProduct(data);
          }
        }}
        sx={{textTransform: 'none'}}>
        <Box sx={styles.checkboxStyle}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={false}
                checked={isSelected}
                onChange={() => {
                  if (!isSelected) {
                    setBrandCode([]);
                    setIsExistShown(false);
                    {
                      if (product[0] === 'BRAND') {
                        setBrandSKU([]);
                        setCompanySKU([]);
                        setFlavourSKU([]);
                      } else if (product[0] === 'PRINCIPAL COMPANY') {
                        setCompanySKU([]);
                        setBrandSKU([]);
                        setFlavourSKU([]);
                      } else if (product[0] === 'FLAVOUR') {
                        setFlavourSKU([]);
                        setBrandSKU([]);
                        setCompanySKU([]);
                      }
                    }
                    let data = [];
                    data.push(item);
                    setProduct(data);
                  } else {
                    setBrandCode([]);
                    setIsExistShown(false);
                    if (product[0] === 'BRAND') {
                      setBrandSKU([]);
                      setCompanySKU([]);
                      setFlavourSKU([]);
                    } else if (product[0] === 'PRINCIPAL COMPANY') {
                      setCompanySKU([]);
                      setBrandSKU([]);
                      setFlavourSKU([]);
                    } else if (product[0] === 'FLAVOUR') {
                      setFlavourSKU([]);
                      setBrandSKU([]);
                      setCompanySKU([]);
                    }
                    let data = product.filter((item1: any) => item1 != item);
                    setProduct(data);
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: isSelected ? 'black' : 'gray',
                  textAlign: 'center',
                }}>
                {item}
              </Typography>
            }
          />
        </Box>
      </Button>
    );
  };

  const sizeDDView = (item1: any, index1: number) => {
    let isContains =
      discountedBrand.length > 0
        ? discountedBrand.includes(item1)
        : brandSKU.includes(item1);
    // console.log('sizeDDView item-->', item1);

    return (
      <Button
        onClick={() => {
          if (!isContains) {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            setCompanySKU([]);
            setFlavourSKU([]);
            let data = [];
            data.push(item1);
            setBrandSKU([...brandSKU, ...data]);
          } else {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            let data = brandSKU.filter((item2: any) => item2 != item1);
            setBrandSKU(data);
          }
        }}
        sx={{textTransform: 'none'}}>
        <Box sx={styles.checkboxStyle}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={false}
                checked={isContains}
                onChange={() => {
              if (!isContains) {
                setBrandCode([]);
                setIsExistShown(false);
                setDiscountedBrand([]);
                setCompanyItems([]);
                setFlavourItems([]);
                setCompanySKU([]);
                setFlavourSKU([]);
                let data = [];
                data.push(item1);
                setBrandSKU([...brandSKU, ...data]);
              } else {
                setBrandCode([]);
                setIsExistShown(false);
                setDiscountedBrand([]);
                setCompanyItems([]);
                setFlavourItems([]);
                let data = brandSKU.filter((item2: any) => item2 != item1);
                setBrandSKU(data);
              }
            }}
              />
            }
            label={
              <Typography
                sx={{
                  color: isContains ? 'black' : 'gray',
                  textAlign: 'center',
                }}>
                {item1}
              </Typography>
            }
          />
        </Box>
      </Button>
    );
  };

  const sizeDDView1 = (item1: any, index1: number) => {
    let isContains =
      companyITEMS.length > 0
        ? companyITEMS.includes(item1)
        : companySKU.includes(item1);
    // console.log('sizeDDView item-->', item1);

    return (
      <Button
        onClick={() => {
          if (!isContains) {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            setBrandSKU([]);
            setFlavourSKU([]);
            let data = [];
            data.push(item1);
            setCompanySKU([...companySKU, ...data]);
          } else {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            let data = companySKU.filter((item2: any) => item2 != item1);
            setCompanySKU(data);
          }
        }}
        sx={{textTransform: 'none'}}>
        <Box sx={styles.checkboxStyle}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={false}
                checked={isContains}
                onChange={() => {
              if (!isContains) {
                setBrandCode([]);
                setIsExistShown(false);
                setDiscountedBrand([]);
                setCompanyItems([]);
                setFlavourItems([]);
                setBrandSKU([]);
                setFlavourSKU([]);
                let data = [];
                data.push(item1);
                setCompanySKU([...companySKU, ...data]);
              } else {
                setBrandCode([]);
                setIsExistShown(false);
                setDiscountedBrand([]);
                setCompanyItems([]);
                setFlavourItems([]);
                let data = companySKU.filter((item2: any) => item2 != item1);
                setCompanySKU(data);
              }
            }}
              />
            }
            label={
              <Typography
                sx={{
                  color: isContains ? 'black' : 'gray',
                  textAlign: 'center',
                }}>
                {item1}
              </Typography>
            }
          />
        </Box>
      </Button>
    );
  };

  const sizeDDView2 = (item1: any, index1: number) => {
    let isContains =
      flavourITEMS.length > 0
        ? flavourITEMS.includes(item1)
        : flavourSKU.includes(item1);
    // console.log('sizeDDView item-->', item1);

    return (
      <Button
        onClick={() => {
          if (!isContains) {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            setBrandSKU([]);
            setCompanySKU([]);
            let data = [];
            data.push(item1);
            setFlavourSKU([...flavourSKU, ...data]);
          } else {
            setBrandCode([]);
            setIsExistShown(false);
            setDiscountedBrand([]);
            setCompanyItems([]);
            setFlavourItems([]);
            let data = flavourSKU.filter((item2: any) => item2 != item1);
            setFlavourSKU(data);
          }
        }}
        sx={{textTransform: 'none'}}>
        <Box sx={styles.checkboxStyle}>
          <FormControlLabel
            control={
              <Checkbox
                disabled={false}
                checked={isContains}
                onChange={() => {
                  if (!isContains) {
                    setBrandCode([]);
                    setIsExistShown(false);
                    setDiscountedBrand([]);
                    setCompanyItems([]);
                    setFlavourItems([]);
                    setBrandSKU([]);
                    setCompanySKU([]);
                    let data = [];
                    data.push(item1);
                    setFlavourSKU([...flavourSKU, ...data]);
                  } else {
                    setBrandCode([]);
                    setIsExistShown(false);
                    setDiscountedBrand([]);
                    setCompanyItems([]);
                    setFlavourItems([]);
                    let data = flavourSKU.filter((item2: any) => item2 != item1);
                    setFlavourSKU(data);
                  }
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: isContains ? 'black' : 'gray',
                  textAlign: 'center',
                }}>
                {item1}
              </Typography>
            }
          />
        </Box>
      </Button>
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
          <Box sx={{mt: 2}}>
            <Button
              onClick={() => {
                setIsDDshown(true);
              }}
              sx={[
                styles.inputStyle,
                {
                  py: 1.25,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  textTransform: 'none',
                },
              ]}>
              <Typography sx={{color: 'gray'}}>
                {product.length != 0 ? product.join(' , ') : brandCODE}{' '}
              </Typography>
              <Icon
                name={'down'}
                family="AntDesign"
                size={18}
                color={Colors.black || '#000'}
              />
            </Button>
            {isDDshown
              ? partialDiscountDD.map((item, index) => {
                  return discountsList(item, index);
                })
              : null}
          </Box>
          {isDDshown ? (
            brandCODE.length > 0 ? (
              brandCODE === 'BRAND' ? (
                <Typography sx={styles.checkboxStyle}>
                  {t('EditOrder.EditOrderSelectBrandCategory')}
                </Typography>
              ) : null
            ) : null
          ) : null}
          {isDDshown ? (
            product[0] === 'BRAND' ? (
              <Typography sx={styles.checkboxStyle}>
                {t('EditOrder.EditOrderSelectBrandCategory')}
              </Typography>
            ) : null
          ) : null}
          {isDDshown
            ? brandCODE.length > 0
              ? brandCODE === 'BRAND'
                ? brandNameItem.map((item1, index1) => {
                    return sizeDDView(item1, index1);
                  })
                : null
              : null
            : null}
          {isDDshown
            ? product[0] === 'BRAND'
              ? brandNameItem.map((item1, index1) => {
                  return sizeDDView(item1, index1);
                })
              : null
            : null}
          {isDDshown ? (
            brandCODE.length > 0 ? (
              brandCODE === 'PRINCIPAL COMPANY' ? (
                <Typography sx={styles.checkboxStyle}>
                  {t('EditOrder.EditOrderSelectPrincipalCompany')}
                </Typography>
              ) : null
            ) : null
          ) : null}
          {isDDshown ? (
            product[0] === 'PRINCIPAL COMPANY' ? (
              <Typography sx={styles.checkboxStyle}>
                {t('EditOrder.EditOrderSelectPrincipalCompany')}
              </Typography>
            ) : null
          ) : null}
          {isDDshown
            ? brandCODE.length > 0
              ? brandCODE === 'PRINCIPAL COMPANY'
                ? CompanyItem.map((item1, index1) => {
                    return sizeDDView1(item1, index1);
                  })
                : null
              : null
            : null}
          {isDDshown
            ? product[0] === 'PRINCIPAL COMPANY'
              ? CompanyItem.map((item1, index1) => {
                  return sizeDDView1(item1, index1);
                })
              : null
            : null}
          {isDDshown ? (
            brandCODE.length > 0 ? (
              brandCODE === 'FLAVOUR' ? (
                <Typography sx={styles.checkboxStyle}>
                  {t('EditOrder.EditOrderSelectFlavourCategory')}
                </Typography>
              ) : null
            ) : null
          ) : null}
          {isDDshown ? (
            product[0] === 'FLAVOUR' ? (
              <Typography sx={styles.checkboxStyle}>
                {t('EditOrder.EditOrderSelectFlavourCategory')}
              </Typography>
            ) : null
          ) : null}
          {isDDshown
            ? brandCODE.length > 0
              ? brandCODE === 'FLAVOUR'
                ? FlavourItem.map((item1, index1) => {
                    return sizeDDView2(item1, index1);
                  })
                : null
              : null
            : null}
          {isDDshown
            ? product[0] === 'FLAVOUR'
              ? FlavourItem.map((item1, index1) => {
                  return sizeDDView2(item1, index1);
                })
              : null
            : null}
          {isDDshown ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignSelf: 'center',
                mt: 1.2,
              }}>
              <Button
                onClick={() => {
                  setIsDDshown(false);
                }}
                sx={styles.okBtnConatiner}>
                <Typography sx={styles.okBtnText}>
                  {t('EditOrder.EditOrderCtaOk')}
                </Typography>
              </Button>
            </Box>
          ) : null}

          {editDiscount.map((item: any, index: number) => (
            <Box key={index}>
              {selectedDiscounts({item, index})}
            </Box>
          ))}
        </Box>
        <Box sx={styles.applyCancelConatiner}>
          <Button
            onClick={() => {
              setApplyFlag(true),
                setApplyExistFlag(true),
                setApplyChanged(true);
            }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignSelf: 'center',
              textTransform: 'none',
            }}>
            <Box sx={styles.applyBtnContainer}>
              <Typography sx={styles.applyBtnText}>
                {t('EditOrder.EditOrderApply')}
              </Typography>
            </Box>
          </Button>

          <Button
            onClick={() => {
              navigation.goBack();
            }}
            sx={{textTransform: 'none'}}>
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
    flexDirection: 'row',
  },

  grossMainContainer: {
    //  flex: 1,
    flexDirection: 'row',
  },

  orderFreeColumnContainer: {
    flex: 0.5,
    flexDirection: 'column',
    alignItems: 'flex-start',
    // marginHorizontal:wp('3')
  },

  orderTextStyle: {
    marginTop: hp('5'),
    color: '#796A6A',
    //   fontSize: wp('3%'),
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
    flexDirection: 'column',
    alignItems: 'center',
    // marginLeft: wp(-3),
  },

  boxTextStyle: {
    color: '#796A6A',
    // fontSize: wp('3%'),
    fontSize: 12,
    fontFamily: 'Proxima Nova',
    marginLeft: wp(5),
    // marginHorizontal: wp('2'),
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
    //  flex: 0.45,
    flexDirection: 'column',
    marginRight: wp(5),
  },

  unitTextStyle: {
    color: '#796A6A',
    //   fontSize: wp('3%'),
    fontSize: 12,
    fontFamily: 'Proxima Nova',
    // marginHorizontal: wp('9'),
    marginLeft: wp(3.8),
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
    borderRadius: wp('1'),
    width: wp('30'),
    height: hp('5.5'),
    marginTop: hp('0'),
    marginHorizontal: wp('4'),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: hp('2'),
    // fontSize: 3,
    marginVertical: 10,
    borderWidth: wp('0.15'),
    marginRight: wp('10'),
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    // textAlign: 'center',
    padding: 2,
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
    marginTop: hp('0.2'),
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

  //   grossTextBoxContainer1: {
  //     // flex: 0.1,
  //     flexDirection: 'column',
  //     alignItems: 'flex-end',
  //     // marginRight: wp(1.2)
  //     // marginLeft: wp(12.5)
  //   },

  grossTextContainer: {
    flex: 0.5,
    flexDirection: 'row',
  },

  grossTextStyle: {
    color: '#796A6A',
    //      fontSize: wp('3'),
    marginTop: hp('2'),
    fontFamily: 'Proxima Nova',
    fontSize: 12,
    fontWeight: 'bold',
  },

  grossTextBoxContainer: {
    flex: 0.43,
    // flexDirection: 'column',
    alignItems: 'flex-end',
  },

  grossTextBoxContainer1: {
    flex: 0.38,
    // flexDirection: 'column',
    alignItems: 'flex-end',
  },

  grossTextBoxStyle: {
    color: Colors.black,
    height: hp('5.5'),
    lineHeight: hp('5.5'),
    width: wp('20'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
    backgroundColor: '#ffffff',
    // marginRight: wp('-3'),
    // marginTop: hp('1'),
    textAlign: 'center',
    fontSize: 10,
  },

  discountMainContainer: {
    flex: 0.5,
    flexDirection: 'row',
    marginTop: hp('1'),
  },

  discountColumnContainer: {
    flex: 0.4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    ////chng
    // marginHorizontal:wp('3'),
  },

  discountTextStyle: {
    //  marginLeft: wp('2'),

    color: '#796A6A',
    //  fontSize: wp('3%'),
    fontFamily: 'Proxima Nova',
    marginTop: hp('2'),
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
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  discountTextBoxContainer: {
    flex: 0.28,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  discountTextBoxStyle: {
    color: Colors.black,
    height: hp('5.5'),
    width: wp('20'),
    borderColor: '#E6DFDF',
    borderWidth: 1,
    borderRadius: wp('1'),
    backgroundColor: '#ffffff',
    // marginRight: wp('-3'),
    marginTop: hp('0'),
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
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
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    height: hp('3'),
    width: wp('4'),
  },

  deleteTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: wp('4'),
  },

  deleteTextStyle: {
    fontFamily: 'Proxima Nova',
    color: '#E23333',
    fontWeight: 'bold',
    fontSize: wp('3'),
    //   fontSize:RFValue(15),
    marginTop: hp('-2.6'),
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5,
  },
  applyBtnContainer: {
    backgroundColor: 'green',
    justifyContent: 'center',
    borderColor: '#CC1167',
    height: 50,
    width: 120,
    borderRadius: 10,
  },
  applyBtnText: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Proxima Nova',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 10,
  },
  cancelBtnContainer: {
    justifyContent: 'center',
    height: 50,
    width: 120,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    color: Colors.black,
    alignSelf: 'center',
    fontFamily: 'Proxima Nova',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 10,
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

export default EditPartialDiscount1;
