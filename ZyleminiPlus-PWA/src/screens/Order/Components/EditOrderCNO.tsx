import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ORDER_BOXES_NAME,
  limitReachedAlert,
  rateChangeAlert,
} from '../Functions/Validations';
import { useNavigate } from 'react-router-dom';
import {
  checkIsOrderIdInDb,
  checkIsRowExistInTempMasterTable,
  deleteDiscount,
  deleteRowItem,
  deleteTempDiscount,
  deleteTempDiscount2,
  getClassificationCode,
  getDataDiscountMaster,
  getDataSchemeMaster,
  getGSTFromPitem,
  getInsertedTableTempOrderMasterId,
  getInsertedsTempOrder,
  getItemDiscountFromDb,
  getItemDiscountFromDbifPresent,
  getItemSchemeFromDb2,
  getOrdersFromDbIfPresent,
  getPriceForCustomer,
  getPriceForPitem,
  getTempOrderPreviewDeleteCheck,
  getUOMLable,
  geteditRateFlag,
  insertTABLE_DISCOUNT,
  insertTABLE_TEMP_ORDER_DETAILS,
  insertTABLE_TEMP_OrderMaster,
  selectTempMasterDetailId,
  updateTABLE_TEMP_ORDER_DETAILS,
} from '../../../database/WebDatabaseHelpers';
import {
  discountTypeArray,
  getCurrentDateTime,
  removeNonNumeric,
  isValidvalue,
  formatNoWithTwoDecimal,
  COLLECTION_TYPE,
  writeErrorLog,
  getEffectiveLocation,
} from '../../../utility/utils';
import OrderMain from './OrderMain';
import useLocation from '../../../hooks/useLocation';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import { OrderAddDiscount_Customfield } from '../../../types/types';
import { useTranslation } from 'react-i18next';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useGlobalLocationRef } from '../../../redux/actionHooks/useGlobalLocationRef';

interface EditOrderCNOProps {
  uid: string;
  OID: string;
  dId: string;
  itemName: string;
  brandId: string;
  itemID: string;
  Ptr: string;
  bpc: string;
  brand: string;
  flavour: string;
  division: string;
  gst?: string;
  isPreview?: boolean;
  latitude: number;
  longitude: number;
  onChangeInOrder: () => void;
  onDeletePreview: () => void;
  onChangeInUnits: (val: string) => void;
}

const EditOrderCNO = (props: EditOrderCNOProps): React.ReactElement => {
  const {
    uid,
    OID,
    dId,
    itemID,
    itemName,
    brandId,
    Ptr,
    bpc,
    brand,
    flavour,
    division,
    gst = '0',
    isPreview = false,
    latitude,
    longitude,
    onChangeInOrder,
    onDeletePreview,
    onChangeInUnits,
  } = props;
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    entityType,
    savedOrderID,
    totalOrderValue,
    setTotalOrderVal,
    IncrementOrderValue,
    DecrementOrderValue,
    selectedBrandID,
    setAddSelectedBrandID,
    setRemoveSelectedBrandID,
    setAddSelectededItemID,
    setRemoveSelectedItemID,
  } = useOrderAction();
  const globalLocationRef = useGlobalLocationRef();

  const isMounted = useRef<boolean>(false);
  const [userTyped, setUserTyped] = useState<boolean>(false);
  const [userDiscValTyped, setUserDiscValTyped] = useState<boolean>(false);
  const [userAddDiscountChange, setAddDiscountChange] = useState<boolean>(false);
  const [counterCallForSum, setCounterForSum] = useState(false);

  const [boxLable, setBoxLable] = useState('');
  const [unitLable, setUnitLable] = useState('');
  const [ratePerArr, setRatePerArr] = useState<any>([]);
  const [ptr, setPTR] = useState(Number(Ptr));
  const [enteredBox, setEnteredBox] = useState('0');
  const [enteredFreeBox, setEnteredFreeBox] = useState('0');
  const [enteredBTL, setEnteredBTL] = useState('0');
  const [enteredFreeBTL, setEnteredFreeBTL] = useState('0');
  const [isEditableRate, setIsEditableRate] = useState(false);
  const [enteredRate, setEnteredRate] = useState('');
  const [calcAmount, setCalcAmount] = useState(0);

  const [discountList, setDiscountList] = useState<[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<any>([]);
  const [selectedRate, setSelectedRate] = useState<any>([]);
  const [discountType, setDiscountType] = useState<any>([]);
  const [schemeList, setSchemeList] = useState<[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<any>([]);
  const [Custom_fields, setCustom_fields] = useState<OrderAddDiscount_Customfield[]>([]);
  const [isEnteredRateChanged, setIsEnteredRateChanged] = useState(false);

  const [gstRate, setGstRate] = useState(gst ? Number(gst) : 0);
  const [gstAmount, setGstAmount] = useState(0);
  const [totalGstAmt, setTotalGstAmt] = useState(0);
  const [totalBaseAmount, setTotalBaseAmount] = useState(0);

  const onChangeUnit = async (input: string, selectedBox: string): Promise<void> => {
    if (input.length <= 4) {
      selectedBox === ORDER_BOXES_NAME[0]
        ? setEnteredBox(input)
        : selectedBox === ORDER_BOXES_NAME[1]
        ? setEnteredBTL(input)
        : selectedBox === ORDER_BOXES_NAME[2]
        ? setEnteredFreeBox(input)
        : selectedBox === ORDER_BOXES_NAME[3]
        ? setEnteredFreeBTL(input)
        : null;
    } else {
      limitReachedAlert(t, 'Quantity');
    }
    
    let calculatedResult = await calculateAmount();
    setCalcAmount(calculatedResult.baseAmount);
    setUserTyped(true);
    onChangeInUnits(input);
  };

  useEffect(() => {
    if (isMounted.current && userTyped) {
      applyClickHandler();
      setUserTyped(false);
    } else {
      isMounted.current = true;
    }
  }, [enteredBox, userTyped]);

  useEffect(() => {
    if (isMounted.current && userDiscValTyped) {
      callForSum();
      setUserDiscValTyped(false);
    } else {
      isMounted.current = true;
    }
  }, [userDiscValTyped]);

  const saveEnteredRate = (input: string): void => {
    if (input.length < 9) {
      setEnteredRate(input);
    } else {
      limitReachedAlert(t, 'Rate');
    }
  };

  const onChangeEnteredRate = (input: string): void => {
    isEnteredRateChanged
      ? saveEnteredRate(input)
      : rateChangeAlert(t, (action: boolean) => {
          setIsEnteredRateChanged(action);
        });
  };

  useEffect(() => {
    takeDataFromDB();
    fetchTaxRates();
    getOrderIfPresent();
  }, []);

  const takeDataFromDB = async (): Promise<void> => {
    await getUOMLable().then(uom => {
      const uomValue = uom[0]?.Value;

      if (uomValue) {
        const [boxLabel, unitLabel] = uomValue.split('/');
        setBoxLable(boxLabel);
        setUnitLable(unitLabel);
        setRatePerArr([...ratePerArr, { size: boxLabel }, { size: unitLabel }]);
        setSelectedRate({ size: boxLabel });
      }
    });

    await geteditRateFlag().then(rateFlag => {
      setIsEditableRate(rateFlag[0]?.Value === 'TRUE' ? true : false);
    });
    
    await getDataDiscountMaster(uid).then((discList: any) => {
      setDiscountList(discList);
    });
    
    await getDataSchemeMaster(uid).then((schList: any) => {
      setSchemeList(schList);
    });
  };

  async function GetPriceFromCDP(oid: string, itemId: string): Promise<void> {
    await getClassificationCode(oid, uid).then(async (data5: any) => {
      if (data5[0]?.PriceListId.length > 0) {
        await getPriceForCustomer(data5[0]?.PriceListId, itemId, uid).then(
          (data: any) => {
            data[0]?.Price
              ? setEnteredRate(data[0]?.Price)
              : priceFromPItem(itemId);
          },
        );
      } else {
        priceFromPItem(itemId);
      }
    });
  }

  const priceFromPItem = async (itemId: string): Promise<void> => {
    await getPriceForPitem(itemId, uid).then((data: any) => {
      data[0]?.PTR ? setEnteredRate(data[0]?.PTR) : setEnteredRate('1');
    });
  };

  const getOrderIfPresent = async (): Promise<void> => {
    getOrdersFromDbIfPresent(OID, COLLECTION_TYPE.ORDER, itemID).then(
      async (presntData: any) => {
        if (presntData.length > 0) {
          setEnteredBox(
            presntData[0]?.quantity_one != 'undefined'
              ? presntData[0]?.quantity_one
              : '0',
          );
          setEnteredBTL(
            presntData[0]?.quantity_two != 'undefined'
              ? presntData[0]?.quantity_two
              : '0',
          );
          setEnteredFreeBox(
            presntData[0]?.large_Unit != 'undefined'
              ? presntData[0]?.large_Unit
              : '0',
          );
          setEnteredFreeBTL(
            presntData[0]?.small_Unit != 'undefined'
              ? presntData[0]?.small_Unit
              : '0',
          );
          setCalcAmount(
            presntData[0]?.Amount != 'undefined'
              ? Number(presntData[0]?.Amount)
              : 0,
          );
          setEnteredRate(
            presntData[0]?.rate != 'undefined' ? presntData[0]?.rate : '0',
          );

          await getItemDiscountFromDbifPresent(
            OID,
            presntData[0]?.order_id,
            itemID,
          ).then(presentDisc => {
            setCustom_fields(prevCustomFields => {
              const updatedCustomFields =
                presentDisc?.map(item => ({
                  meta_name: item.RNP,
                  meta_val: item.Rate,
                  meta_dis: item.DiscountType,
                  meta_discAmt: Number(item.DiscountAmount),
                })) || [];

              const uniqueCustomFields = [
                ...new Set(updatedCustomFields.map(el => el)),
              ].map(el => el);

              return [...prevCustomFields, ...uniqueCustomFields];
            });
          });

          getItemSchemeFromDb2(OID, presntData[0]?.order_id, itemID).then(
            (presntSch: any) => {
              try {
                setSelectedScheme({ DT_DESC: presntSch[0]?.DiscountType });
              } catch (error) {
                writeErrorLog('getItemSchemeFromDb2', error);
                console.log('error while retriving scheme -->', presntSch);
              }
            },
          );
        } else {
          !isPreview && GetPriceFromCDP(OID, itemID);
        }
      },
    );
  };

  const fetchTaxRates = async (): Promise<void> => {
    console.log('=== Fetching GST Rate ===');
    console.log('ItemID:', itemID);
    console.log('UID:', uid);

    try {
      const taxData: any = await getGSTFromPitem(itemID, uid);
      console.log('Tax Data Raw Response:', JSON.stringify(taxData, null, 2));
      console.log('Tax Data Length:', taxData?.length);

      if (taxData && taxData.length > 0) {
        console.log('Tax Data First Item:', JSON.stringify(taxData[0], null, 2));

        const gstValue = taxData[0]?.GST
          ? Number(taxData[0].GST)
          : taxData[0]?.GSTRate
          ? Number(taxData[0].GSTRate)
          : 0;

        console.log('Parsed GST Value:', gstValue);
        setGstRate(gstValue);
        console.log('GST Rate Set Successfully - GST:', gstValue, '%');
      } else {
        console.log('No tax data found, setting GST to 0');
        setGstRate(0);
      }
    } catch (error) {
      writeErrorLog('fetchTaxRates', error);
      console.log('Error fetching GST rate:', error);
      setGstRate(0);
    }
    console.log('=== GST Rate Fetch Complete ===\n');
  };

  const addCustomField = (): void => {
    setCustom_fields([
      ...Custom_fields,
      {
        meta_name: 'value',
        meta_val: '0',
        meta_dis: 'value',
        meta_discAmt: 0,
      },
    ]);
  };

  const deleteDynamicfield = (index: number): void => {
    Custom_fields.splice(index, 1);
    setCustom_fields([...Custom_fields]);
    setUserTyped(true);
  };

  const onCustomInputval = (value: string, index: number): void => {
    if (value.length < 6) {
      Custom_fields[index].meta_val = value;
      setCustom_fields(Custom_fields);
      setUserDiscValTyped(true);
    } else {
      limitReachedAlert(t, 'Discount');
    }
  };

  const onCustomInputName = (value: any, index: number): void => {
    Custom_fields[index].meta_name = value?.name;
    setDiscountType(value);
    setCustom_fields(Custom_fields);
    setUserTyped(true);
  };

  const onCustomInputdis = (value: any, index: number): void => {
    Custom_fields[index].meta_dis = value?.DT_DESC;
    setSelectedDiscount(value);
    setCustom_fields(Custom_fields);
    setUserTyped(true);
  };

  const calculateAmount = async (): Promise<{
    gstAmount: number;
    finalAmount: number;
    baseAmount: number;
  }> => {
    console.log('Calculate Amount Debug:', {
      gstRate,
      enteredBox,
      enteredBTL,
      enteredRate,
      bpc,
      ptr,
      isEditableRate,
    });
    
    let baseAmount = 0;
    let quntity = 0;

    if (isEditableRate) {
      if (boxLable.length > 1) {
        if (enteredRate) {
          let perbottle = Number(enteredRate) / Number(bpc);
          if (enteredBTL) {
            if (enteredBox) {
              quntity = parseInt(bpc) * parseInt(enteredBox) + parseInt(enteredBTL);
            } else {
              quntity = parseInt(enteredBTL);
            }
          } else if (enteredBox) {
            quntity = parseInt(bpc) * parseInt(enteredBox);
          }
          baseAmount = quntity * perbottle;
          baseAmount = Number(baseAmount.toFixed(2));
        } else {
          baseAmount = 0.0;
        }
      } else if (unitLable.length > 1) {
        if (enteredRate) {
          if (enteredBTL) {
            if (enteredBox) {
              quntity = parseInt(bpc) * parseInt(enteredBox) + parseInt(enteredBTL);
            } else {
              quntity = parseInt(enteredBTL);
            }
          } else if (enteredBox) {
            quntity = parseInt(bpc) * parseInt(enteredBox);
          }
          baseAmount = quntity * Number(enteredRate);
          baseAmount = Number(baseAmount.toFixed(2));
        } else {
          baseAmount = 0;
        }
      }
    } else {
      if (ptr == 0) {
        baseAmount = 0;
      } else {
        let perbottle = ptr / parseInt(bpc);
        quntity = parseInt(bpc) * parseInt(enteredBox) + parseInt(enteredBTL);
        baseAmount = quntity * perbottle;
        baseAmount = Number(baseAmount.toFixed(2));
      }
    }

    let gstAmountFinal = 0;
    let finalAmount = 0;

    if (baseAmount > 0) {
      const gstAmt = (baseAmount * gstRate) / 100;
      gstAmountFinal = Number(gstAmt.toFixed(2));
      finalAmount = baseAmount + gstAmountFinal;
      finalAmount = Number(finalAmount.toFixed(2));

      setGstAmount(gstAmountFinal);
    } else {
      finalAmount = 0;
      setGstAmount(0);
    }

    console.log('Final Calculation Result:', {
      baseAmount,
      gstRate,
      gstAmountFinal,
      finalAmount,
    });

    return {
      gstAmount: gstAmountFinal,
      finalAmount: finalAmount,
      baseAmount: baseAmount,
    };
  };

  async function applyClickHandler(): Promise<void> {
    const currentDateTime = await getCurrentDateTime();
    let finaldis = '';

    let calculatedResult = await calculateAmount();
    console.log('calculatedResult:::::::::::::::::::>>>', calculatedResult);

    let baseAmount = calculatedResult.baseAmount;
    let calculatedGstAmt = calculatedResult.gstAmount;
    let finalAmountWithTax = calculatedResult.finalAmount;
    
    setCalcAmount(baseAmount);
    setTotalGstAmt(calculatedGstAmt);
    setTotalBaseAmount(baseAmount);

    console.log('\nVALUES TO INSERT ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Base Amount:    ₹', baseAmount);
    console.log('GST Rate:       ', gstRate, '%');
    console.log('GST Amount:     ₹', calculatedGstAmt);
    console.log('Final Amount:   ₹', finalAmountWithTax);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (selectedRate?.size != undefined) {
      console.log('Selectedrateperfunc', selectedRate?.size);
      await checkIsOrderIdInDb(OID, COLLECTION_TYPE.ORDER, uid).then(
        async (data: any) => {
          if (data.length === 0) {
            var locationCords = getEffectiveLocation(
              latitude,
              longitude,
              globalLocationRef.current,
            );
            
            insertTABLE_TEMP_OrderMaster(
              savedOrderID,
              currentDateTime,
              entityType?.id,
              OID,
              locationCords.latitude,
              locationCords.longitude,
              baseAmount,
              COLLECTION_TYPE.ORDER,
              uid,
              '1',
            );

            await selectTempMasterDetailId(itemID, savedOrderID).then(
              async (dataId: any) => {
                if (dataId.length == 0) {
                  console.log('- Inserting Order with GST Data');
                  console.log('- GST Rate:', gstRate);
                  console.log('- GST Amount:', calculatedGstAmt);
                  console.log('- Base Amount:', baseAmount);
                  console.log('- Final Amount:', finalAmountWithTax);
                  
                  await insertTABLE_TEMP_ORDER_DETAILS(
                    savedOrderID,
                    itemID,
                    itemName,
                    enteredBox || '0',
                    enteredBTL || '0',
                    enteredFreeBox || '0',
                    enteredFreeBTL || '0',
                    currentDateTime,
                    '',
                    enteredRate,
                    bpc,
                    baseAmount,
                    '1',
                    'true',
                    brandId,
                    OID,
                    COLLECTION_TYPE.ORDER,
                    brand,
                    division,
                    flavour,
                    gstRate,             
                    calculatedGstAmt,   
                    finalAmountWithTax,  
                  ).then(data => {
                    console.log(' Order inserted successfully');
                  });
                } else {
                  console.log('- Updating Order with GST Data');
                  
                  await updateTABLE_TEMP_ORDER_DETAILS(
                    enteredBox || '0',
                    enteredBTL || '0',
                    enteredFreeBox || '0',
                    enteredFreeBTL || '0',
                    currentDateTime,
                    '',
                    baseAmount,
                    enteredRate,
                    'true',
                    savedOrderID,
                    itemID,
                    gstRate,
                    calculatedGstAmt,
                    finalAmountWithTax,
                  );
                  console.log('  Order updated successfully');
                }
              },
            );
          } else {
            await getInsertedTableTempOrderMasterId(
              OID,
              COLLECTION_TYPE.ORDER,
              uid,
            ).then(async (data: any) => {
              console.log('getInsertedTableTempOrderMasterId-->', data);

              let savedOrderID = data[0].id;
              await checkIsRowExistInTempMasterTable(
                savedOrderID,
                COLLECTION_TYPE.ORDER,
              ).then(async (datalen: any) => {
                if (datalen?.length > 0) {
                  await selectTempMasterDetailId(itemID, savedOrderID).then(
                    async (dataId: any) => {
                      if (dataId.length == 0) {
                        console.log(' Inserting Order (Update Path)');
                        
                        insertTABLE_TEMP_ORDER_DETAILS(
                          savedOrderID,
                          itemID,
                          itemName,
                          enteredBox || '0',
                          enteredBTL || '0',
                          enteredFreeBox || '0',
                          enteredFreeBTL || '0',
                          currentDateTime,
                          '',
                          enteredRate,
                          bpc,
                          baseAmount,
                          '1',
                          'true',
                          brandId,
                          OID,
                          COLLECTION_TYPE.ORDER,
                          brand,
                          division,
                          flavour,
                          gstRate,
                          calculatedGstAmt,
                          finalAmountWithTax,
                        );
                      } else {
                        console.log('  Updating Order (Update Path)');
                        
                        await updateTABLE_TEMP_ORDER_DETAILS(
                          enteredBox || '0',
                          enteredBTL || '0',
                          enteredFreeBox || '0',
                          enteredFreeBTL || '0',
                          currentDateTime,
                          '',
                          baseAmount,
                          enteredRate,
                          'true',
                          savedOrderID,
                          itemID,
                          gstRate,              
                          calculatedGstAmt,     
                          finalAmountWithTax, 
                        );
                      }
                    },
                  );
                }
              });
            });
          }
          
          await deleteTempDiscount(savedOrderID, itemID);

          for (let i = 0; i < Custom_fields.length; i++) {
            if (Custom_fields[i].meta_dis !== 'value') {
              finaldis = Custom_fields[i].meta_dis;
            } else {
              finaldis = 'cash';
            }

            await insertTABLE_DISCOUNT(
              savedOrderID,
              finaldis,
              Custom_fields[i].meta_discAmt,
              '',
              '',
              Custom_fields[i].meta_name,
              '',
              '',
              Custom_fields[i].meta_val || '0',
              '',
              itemID,
              '',
              '',
              'N',
              '',
              enteredBox,
              enteredBTL,
              '',
              '',
              '',
              'D',
              itemName,
            );
          }
        },
      );
    } else {
      null;
    }
    
    if (selectedScheme?.DT_DESC != undefined) {
      await deleteTempDiscount2(savedOrderID, itemID);
      await insertTABLE_DISCOUNT(
        savedOrderID,
        selectedScheme?.DT_DESC,
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        itemID,
        '',
        '',
        'N',
        '',
        enteredBox,
        enteredBTL,
        '',
        '',
        '',
        'S',
        itemName,
      );
    } else {
      null;
    }
  }

  async function deleteClickHandler(): Promise<void> {
    if (isPreview) {
      getTempOrderPreviewDeleteCheck(savedOrderID).then((data: any) => {
        if (data?.length == 1) {
          itemDeleteHandler();
          navigate(-1);
        } else {
          itemDeleteHandler();
        }
      });
    } else {
      itemDeleteHandler();
    }
    onDeletePreview();
  }

  async function itemDeleteHandler(): Promise<void> {
    setRemoveSelectedBrandID(brandId);
    deleteRowItem(savedOrderID, itemID);
    deleteDiscount(savedOrderID, itemID);
    setRemoveSelectedItemID(itemID);
  }

  const callForSum = (): void => {
    for (let i = 0; i < Custom_fields.length; i++) {
      if (Custom_fields[i].meta_name == 'Net') {
        let a = calcAmount;
        let b = Custom_fields[i].meta_val;
        let c = a - Number(b);
        Custom_fields[i].meta_discAmt = formatNoWithTwoDecimal(b);
        setCustom_fields(Custom_fields);
      } else if (Custom_fields[i].meta_name == 'Rate Per Unit') {
        if (enteredBTL) {
          if (enteredBox) {
            let quntity = parseInt(bpc) * parseInt(enteredBox) + parseInt(enteredBTL);
            let b1 = Custom_fields[i].meta_val;
            let dis = quntity * Number(b1);
            Custom_fields[i].meta_discAmt = +dis.toFixed(2);
            setCustom_fields(Custom_fields);
          } else {
            let quntity = parseInt(enteredBTL);
            let b1 = Custom_fields[i].meta_val;
            let dis = quntity * Number(b1);
            Custom_fields[i].meta_discAmt = +dis.toFixed(2);
            setCustom_fields(Custom_fields);
          }
        } else if (enteredBox) {
          let quntity = parseInt(bpc) * parseInt(enteredBox);
          let b1 = Custom_fields[i].meta_val;
          let dis = quntity * Number(b1);
          Custom_fields[i].meta_discAmt = +dis.toFixed(2);
          setCustom_fields(Custom_fields);
        }
      } else if (Custom_fields[i].meta_name == 'Percent') {
        let a = calcAmount;
        let b = Custom_fields[i].meta_val;
        let c = Number(b) / 100;
        let d = a * c;
        Custom_fields[i].meta_discAmt = +d.toFixed(2);
        setCustom_fields(Custom_fields);
      } else if (Custom_fields[i].meta_name == 'Rate Per Case') {
        var quntity = parseInt(enteredBox);
        let b1 = Custom_fields[i].meta_val;
        var dis = quntity * Number(b1);
        Custom_fields[i].meta_discAmt = +dis.toFixed(2);
        setCustom_fields(Custom_fields);
      }
    }
    setCounterForSum(!counterCallForSum);
    setUserTyped(true);
  };

  return (
    <OrderMain
      boxLable={boxLable}
      unitLable={unitLable}
      Custom_fields={Custom_fields}
      discountList={discountList}
      schemeList={schemeList}
      rateList={ratePerArr}
      distcountType={discountTypeArray}
      enteredBox={enteredBox}
      enteredFreeBox={enteredFreeBox}
      enteredBTL={enteredBTL}
      enteredFreeBTL={enteredFreeBTL}
      enteredRate={enteredRate}
      grossAmount={calcAmount}
      isEditableRate={isEditableRate}
      onChangeRate={(input: string) => {
        onChangeEnteredRate(input);
        setUserTyped(true);
      }}
      onSelectRate={(rate: any) => {
        setSelectedRate(rate);
        setUserTyped(true);
      }}
      onSelectDiscountType={(DType: any, index: number) =>
        onCustomInputName(DType, index)
      }
      selectedRate={selectedRate?.size}
      onSelectDiscount={(disc: any, index: number) =>
        onCustomInputdis(disc, index)
      }
      SelectedDiscountType={discountType?.name}
      selectedDiscount={selectedDiscount?.DT_DESC}
      onSelectScheme={(sch: any) => {
        setSelectedScheme(sch);
        setUserTyped(true);
        setAddDiscountChange(true);
      }}
      selectedScheme={selectedScheme?.DT_DESC}
      onUnitChange={(input: string, key: string) => {
        onChangeUnit(input, key);
      }}
      onAddDiscountPress={() => addCustomField()}
      onDiscountDeletePress={(index: number) => deleteDynamicfield(index)}
      onOrderDeletePress={() => deleteClickHandler()}
      onCustomInputval={(val, index) => onCustomInputval(val, index)}
    />
  );
};

export default EditOrderCNO;
