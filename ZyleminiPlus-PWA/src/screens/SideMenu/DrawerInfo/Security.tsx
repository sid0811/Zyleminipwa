import {Box, Typography} from '@mui/material';
import {DrawerProp} from './AboutUs';
import Header from '../../../components/Header/Header';
import {Colors} from '../../../theme/colors';
import React from 'react';

export default function Security(props: DrawerProp) {
  const {navigation} = props;

  return (
    <Box sx={{height: '100%', width: '100%', overflowY: 'auto'}}>
      <Header title={'Security'} navigation={navigation} />
      <Box sx={{}}>
        <Box sx={{mr: 2.5, ml: 2.5}}>
          <Typography sx={{
            color: '#696969',
            fontSize: 13,
            lineHeight: 2.5,
            fontFamily: 'Proxima Nova',
            alignSelf: 'center',
          }}>
            {'\n'}
            {'\n'}
            We implemented the most advanced technologies. The purpose of this
            statement is to assure you that your data is protected in the best
            way possible. Also, we would like to establish transparency
            regarding our security infrastructure and practices. SAPL provides
            the highest level system security thank to its hosting and technical
            infrastructure. Network, data and physical security standards are
            met and updated according to the fast changing world. We take the
            measures below regarding security;
            {'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>SSL</Typography>
            {'\n'}
            SSL used in SAPL servers enables the encryption of the data flow
            between the users and the system.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Accessing User Data
            </Typography>
            {'\n'}
            Unless you permit, no one can access your account. SAPL support team
            can access your account only If you make a support request.
            {'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              User Passwords
            </Typography>
            {'\n'}
            We expect our users to create powerful passwords and keeping your
            password for yourself is your responsibility.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Physical Security, Network Security, and the Firewall
            </Typography>
            {'\n'}
            Physical Security, Network Security, and the firewall infrastructure
            of our app and our user information databases are stored in a data
            centre . They provide us with the most advanced firewalls in the
            industry.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Data Sharing
            </Typography>
            {'\n'}
            Transferring of the data is only possible with your permission. We
            never share data with partners that have a rather low-security
            level.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Backup Plan
            </Typography>
            {'\n'}
            Our backup planning works on a daily basis, in the case of technical
            issues. For your data safety, {'\n'}• Don't share your password with
            anyone {'\n'}• Don't write down your password and leave it available
            for others {'\n'}• Update your App{'\n'} • Sync data regularly
            {'\n'}What we do in the case of Security Breaches{'\n'}
            It's not possible to be completely safe on the internet, and we
            can't guarantee a %100 percent safety. When we are aware of a breach
            though, we notify the affected user to take the necessary steps.
            {'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Your Responsibilities
            </Typography>
            {'\n'}
            It's also your responsibility to keep your account information safe,
            using unique passwords. Please make sure that your devices are
            properly protected.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              Information we collect
            </Typography>
            {'\n'}
            When you register to SAPL, we ask you to provide certain personal
            information, including a valid email address. We collect only Email
            and DisplayName information from third parties.{'\n'}
            {'\n'}
            <Typography component="span" sx={{fontWeight: 'bold', color: Colors.black}}>
              How do we use the Information collected?
            </Typography>
            {'\n'}
            The information we collect is used to maintain, protect and improve
            the service we provide. This information is controlled by that
            service or as authorized by you via your privacy settings at that
            service.{'\n'}
            {'\n'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

