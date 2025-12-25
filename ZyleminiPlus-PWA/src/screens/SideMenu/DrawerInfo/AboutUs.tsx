import {Typography, Box, Link} from '@mui/material';
import Logo from '../../../components/Logo/Logo';
import Header from '../../../components/Header/Header';
import {Colors} from '../../../theme/colors';
import {VERSION_DETAIL} from '../../../constants/screenConstants';

export interface DrawerProp {
  navigation?: any;
}

export default function AboutUs(props: DrawerProp) {
  const {navigation} = props;

  return (
    <Box sx={{height: '100%', width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
      <Header title={'About Us'} navigation={navigation} />
      <Logo />
      <Typography sx={{
        fontSize: 13,
        fontFamily: 'Proxima Nova',
        alignSelf: 'center',
        fontWeight: 'bold',
        mt: '3%',
        color: Colors.black,
      }}>
        {VERSION_DETAIL}
      </Typography>

      <Typography sx={{
        fontSize: 13,
        ml: 1.875,
        mr: 1.875,
        color: '#696969',
      }}>
        {'\n'}
        Zylemini+ is a mobile app for the Sales Team in the field and in office.
        It generally works off-line and hence not dependent on Internet
        Connection always. The App synchronizes data with Cloud periodically and
        the frequency can be set. It delivers the Sales reports of Zylem on
        mobile so that Sales team is updated on-the-go. The reports cover
        Shop-wise Sales, Product-wise Sales, Target vs Achievement report and
        the status of data collection. It also enables collection of data in the
        field such as Sales, Stock, Photos of the place and location of the
        user. For a more demanding user, there is a provision for Advanced
        reports which are more complex. These can be delivered from the cloud.
      </Typography>

      <Link
        href="https://sapl.net/privacy-policy.html"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: 'blue',
          fontSize: 12,
          fontFamily: 'Proxima Nova',
          alignSelf: 'center',
          fontWeight: 'bold',
          mt: '5%',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}>
        Terms & Conditions
      </Link>
    </Box>
  );
}

