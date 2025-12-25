import { Box, Typography, TextField, Button, Select, MenuItem, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Delete, Add } from '@mui/icons-material';

import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { Colors } from '../../../theme/colors';
import { globalImg } from '../../../constants/AllImages';
import { ORDER_BOXES_NAME } from '../Functions/Validations';
import {
  isAccessControlProvided,
  removeNonNumeric,
} from '../../../utility/utils';
import Dropdown from '../../../components/Dropdown/Dropdown';
import DashLine from '../../CollectionModule/Components/DashLine';
import { AccessControlKeyConstants } from '../../../constants/screenConstants';

interface OrderMainProps {
  boxLable: string;
  unitLable: string;
  Custom_fields: any;
  discountList: any;
  schemeList: any;
  rateList: any;
  distcountType: any;
  onUnitChange: any;
  enteredBox: string;
  enteredFreeBox: string;
  enteredBTL: string;
  enteredFreeBTL: string;
  enteredRate: string;
  isEditableRate: boolean;
  selectedScheme: string;
  onSelectScheme: any;
  selectedDiscount: string;
  onSelectDiscount: any;
  selectedRate: string;
  onSelectRate: any;
  onSelectDiscountType: any;
  onChangeRate: any;
  onAddDiscountPress: any;
  onDiscountDeletePress: any;
  onOrderDeletePress: any;
  grossAmount: number;
  SelectedDiscountType: string;
  onCustomInputval: (val: string, index: number) => void;
}

const OrderMain = (props: OrderMainProps): React.ReactElement => {
  const {
    boxLable,
    unitLable,
    enteredBox,
    enteredFreeBox,
    enteredBTL,
    enteredFreeBTL,
    enteredRate,
    isEditableRate,
    discountList,
    schemeList,
    rateList,
    distcountType,
    selectedScheme,
    onSelectScheme,
    selectedRate,
    onSelectRate,
    onSelectDiscountType,
    selectedDiscount,
    SelectedDiscountType,
    onSelectDiscount,
    onUnitChange,
    onChangeRate,
    Custom_fields = [],
    onAddDiscountPress,
    onDiscountDeletePress,
    grossAmount,
    onOrderDeletePress,
    onCustomInputval,
  } = props;
  
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography sx={{ mt: 5, color: '#796A6A', fontWeight: 'bold', fontSize: 12, fontFamily: 'Proxima Nova' }}>
            {t('EditOrder.EditOrderOrder')}
          </Typography>
          <Typography sx={{ mt: 5, color: '#796A6A', fontWeight: 'bold', fontSize: 12, fontFamily: 'Proxima Nova' }}>
            {t('EditOrder.EditOrderFree')}
          </Typography>
        </Box>

        {boxLable.length > 1 && (
          <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 3 }}>
            <Typography sx={{ color: '#796A6A', fontSize: 12, fontFamily: 'Proxima Nova', fontWeight: 'bold', mx: 2 }}>
              {boxLable}
            </Typography>
            <TextField
              type="number"
              placeholder="0"
              value={enteredBox}
              onFocus={() => {
                if (enteredBox === '0') {
                  onUnitChange('', ORDER_BOXES_NAME[0]);
                }
              }}
              onChange={(e) => onUnitChange(removeNonNumeric(e.target.value), ORDER_BOXES_NAME[0])}
              sx={{
                flex: 1,
                height: 44,
                width: '120px',
                mt: 1,
                '& .MuiInputBase-input': { textAlign: 'center', padding: '5px', fontSize: 10 },
              }}
              size="small"
            />
            <TextField
              type="number"
              placeholder="0"
              value={enteredFreeBox}
              onFocus={() => {
                if (enteredFreeBox === '0') {
                  onUnitChange('', ORDER_BOXES_NAME[2]);
                }
              }}
              onChange={(e) => onUnitChange(removeNonNumeric(e.target.value), ORDER_BOXES_NAME[2])}
              sx={{
                flex: 1,
                height: 44,
                width: '120px',
                mt: 1,
                '& .MuiInputBase-input': { textAlign: 'center', padding: '5px', fontSize: 10 },
              }}
              size="small"
            />
          </Box>
        )}

        {unitLable.length > 1 && (
          <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: '#796A6A', fontSize: 12, fontFamily: 'Proxima Nova', fontWeight: 'bold', mx: 9 }}>
              {unitLable}
            </Typography>
            <TextField
              type="number"
              placeholder="0"
              value={enteredBTL}
              onFocus={() => {
                if (enteredBTL === '0') {
                  onUnitChange('', ORDER_BOXES_NAME[1]);
                }
              }}
              onChange={(e) => onUnitChange(removeNonNumeric(e.target.value), ORDER_BOXES_NAME[1])}
              sx={{
                flex: 1,
                height: 44,
                width: '120px',
                mt: 1,
                ml: -3,
                '& .MuiInputBase-input': { textAlign: 'center', padding: '5px', fontSize: 10 },
              }}
              size="small"
            />
            <TextField
              type="number"
              placeholder="0"
              value={enteredFreeBTL}
              onFocus={() => {
                if (enteredFreeBTL === '0') {
                  onUnitChange('', ORDER_BOXES_NAME[3]);
                }
              }}
              onChange={(e) => onUnitChange(removeNonNumeric(e.target.value), ORDER_BOXES_NAME[3])}
              sx={{
                flex: 1,
                height: 44,
                width: '120px',
                mt: 1,
                ml: -3,
                '& .MuiInputBase-input': { textAlign: 'center', padding: '5px', fontSize: 10 },
              }}
              size="small"
            />
          </Box>
        )}
      </Box>

      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.ORDER_SCHEME_ON,
      ) && (
        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1.5 }}>
          <Box sx={{ flex: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography sx={{ mt: 2, color: '#796A6A', fontWeight: 'bold', fontFamily: 'Proxima Nova', fontSize: 12 }}>
              {t('EditOrder.EditOrderSchemeOn')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mr: 4 }}>
            <Dropdown
              selectedListIsScrollView={true}
              isSearchable={true}
              data={schemeList}
              label={'DT_DESC'}
              CustomDDStyle={{ width: '100%' }}
              isTitleShown={false}
              selectedValue={selectedScheme}
              onPressItem={(val: any) => {
                onSelectScheme(val);
              }}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, mt: 1.5, display: 'flex', alignItems: 'center' }}>
        <DashLine />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1.5 }}>
        <Box sx={{ flex: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography sx={{ mt: 2, color: '#796A6A', fontWeight: 'bold', fontFamily: 'Proxima Nova', fontSize: 12 }}>
            {t('EditOrder.EditOrderRatePer')}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Dropdown
            selectedListIsScrollView={true}
            data={rateList}
            label={'size'}
            CustomDDStyle={{ width: 180 }}
            isTitleShown={false}
            selectedValue={selectedRate}
            onPressItem={(val: any) => {
              onSelectRate(val);
            }}
          />
        </Box>
        <Box sx={{ flex: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 5 }}>
          <TextField
            type="number"
            placeholder="0"
            value={enteredRate}
            disabled={!isEditableRate}
            onChange={(e) => onChangeRate(e.target.value)}
            sx={{
              fontSize: 10,
              height: 44,
              width: '100px',
              '& .MuiInputBase-input': { textAlign: 'center', padding: '5px' },
            }}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, mt: 1, display: 'flex', alignItems: 'center' }}>
        <DashLine />
      </Box>

      <Box sx={{ flex: 0.1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'row' }}>
            <Typography sx={{ color: '#796A6A', mt: 2, fontWeight: 'bold', fontFamily: 'Proxima Nova', fontSize: 12 }}>
              {t('EditOrder.EditOrderGrossAmount')}
            </Typography>
          </Box>
          <Box sx={{ flex: 0.45, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box
              sx={{
                height: 44,
                width: '120px',
                border: `1px solid ${Colors.border}`,
                borderRadius: 1,
                backgroundColor: Colors.white,
                color: Colors.black,
                mr: -3,
                mt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              {grossAmount}
            </Box>
          </Box>
        </Box>
      </Box>

      {isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.ORDER_ADD_ITEM_DISC,
      ) && (
        <>
          <Box>
            {Custom_fields.map((CustomInput: any, key: number) => {
              return (
                <Box key={key} sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                    <Box sx={{ flex: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography sx={{ color: '#796A6A', fontFamily: 'Proxima Nova', mt: 2, fontSize: 12 }}>
                        {t('EditOrder.EditOrderDiscountIn')}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Dropdown
                        selectedListIsScrollView={true}
                        data={distcountType}
                        label={'name'}
                        CustomDDStyle={{ width: 135 }}
                        isTitleShown={false}
                        selectedValue={Custom_fields[key].meta_name}
                        onPressItem={(val: any) => {
                          onSelectDiscountType(val, key);
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <TextField
                        type="number"
                        placeholder="0"
                        value={Custom_fields[key].meta_val}
                        onFocus={() => {
                          if (Custom_fields[key].meta_val === '0') {
                            onCustomInputval('', key);
                          }
                        }}
                        onChange={(e) => {
                          const numericInput = e.target.value.replace(/[^0-9]/g, '');
                          onCustomInputval(numericInput, key);
                        }}
                        sx={{
                          color: Colors.black,
                          height: 44,
                          width: '120px',
                          mr: -3,
                          '& .MuiInputBase-input': { textAlign: 'center', padding: '5px', fontSize: 12 },
                        }}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }}>
                    <Box sx={{ flex: 0.4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography sx={{ color: '#796A6A', fontFamily: 'Proxima Nova', mt: 2, fontSize: 12 }}>
                        {t('EditOrder.EditOrderDiscountOn')}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Dropdown
                        selectedListIsScrollView={true}
                        isSearchable={true}
                        data={discountList}
                        label={'DT_DESC'}
                        CustomDDStyle={{ width: 135 }}
                        isTitleShown={false}
                        selectedValue={Custom_fields[key].meta_dis}
                        onPressItem={(val: any) => {
                          onSelectDiscount(val, key);
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Box
                        sx={{
                          color: Colors.black,
                          height: 44,
                          width: '120px',
                          border: `1px solid ${Colors.border}`,
                          borderRadius: 1,
                          backgroundColor: Colors.white,
                          mr: -3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '5px',
                          fontSize: 12,
                        }}
                      >
                        {Custom_fields[key].meta_discAmt}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'row', mt: 1 }} />
                  <Box>
                    <Button
                      onClick={() => {
                        onDiscountDeletePress(key);
                      }}
                      sx={{
                        display: 'flex',
                        alignSelf: 'flex-end',
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        textTransform: 'none',
                      }}
                    >
                      <Delete sx={{ color: '#E23333', height: 24, width: 16 }} />
                      <Typography sx={{ fontFamily: 'Proxima Nova', color: '#E23333', fontWeight: 'bold', fontSize: 12, ml: 4 }}>
                        {t('EditOrder.EditOrderDelete')}
                      </Typography>
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Button
            onClick={() => {
              onAddDiscountPress();
            }}
            sx={{ flex: 1, display: 'flex', flexDirection: 'row', textTransform: 'none', justifyContent: 'flex-start', ml: 0 }}
          >
            <Add sx={{ height: 24, width: 18, borderRadius: '50%', color: '#2FC36E' }} />
            <Typography sx={{ fontFamily: 'Proxima Nova', color: '#2FC36E', fontWeight: 'bold', fontSize: 12, ml: 1.5 }}>
              {t('EditOrder.EditOrderAddDiscount')}
            </Typography>
          </Button>
        </>
      )}

      <Box sx={{ flex: 1, mt: 1, display: 'flex', alignItems: 'center' }}>
        <DashLine />
      </Box>

      <Box sx={{ flex: 1, mt: 2, display: 'flex', flexDirection: 'row', mb: 4 }}>
        <Box sx={{ flex: 0.7, justifyContent: 'flex-start', ml: 9 }} />
        <Box sx={{ flex: 0.5, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              onOrderDeletePress();
            }}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              textTransform: 'none',
            }}
          >
            <Delete sx={{ color: '#E23333', height: 24, width: 16 }} />
            <Typography sx={{ fontFamily: 'Proxima Nova', color: '#E23333', fontWeight: 'bold', fontSize: 12, ml: 4 }}>
              {t('EditOrder.EditOrderDelete')}
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderMain;
