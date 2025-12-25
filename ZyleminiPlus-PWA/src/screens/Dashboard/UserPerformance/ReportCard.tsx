// Web-adapted ReportCard component
import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '../../../hooks/useNetInfo';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { fontsSize } from '../../../theme/typography';
import { ScreenName } from '../../../constants/screenConstants';
import { ReportCategories, isAccessControlProvided } from '../../../utility/utils';
import Icon from '../../../components/Icon/Icon';
import { Colors } from '../../../theme/colors';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { useNavigate } from 'react-router-dom';

interface Props {
  navigation?: any;
}

const ReportCard = ({ navigation }: Props) => {
  const { isNetConnected } = useNetInfo();
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();
  const navigate = useNavigate();

  const toggleCategory = (category: string) => {
    if (isNetConnected === true || isNetConnected == null) {
      if (ReportCategories[0].name === category) {
        navigate(`/${ScreenName.DASHBOARD_T_VS_ACHI_WOD_REP}`, {
          state: { CommandType: ReportCategories[0].CommandType },
        });
      } else if (ReportCategories[1].name === category) {
        navigate(`/${ScreenName.DASHBOARD_T_VS_ACHI_WOD_REP}`, {
          state: { CommandType: ReportCategories[1].CommandType },
        });
      } else if (ReportCategories[2].name === category) {
        navigate(`/${ScreenName.DASHBOARD_BWS_REP}`, {
          state: { CommandType: ReportCategories[2].CommandType },
        });
      } else if (ReportCategories[3].name === category) {
        navigate(`/${ScreenName.DASHBOARD_NEGATIVE_SHOP}`, {
          state: { CommandType: ReportCategories[3].CommandType },
        });
      } else if (ReportCategories[4].name === category) {
        navigate(`/${ScreenName.DASHBOARD_NEGATIVE_SHOP}`, {
          state: { CommandType: ReportCategories[4].CommandType },
        });
      } else if (ReportCategories[5].name === category) {
        navigate(`/${ScreenName.DASHBOARD_NEGATIVE_SHOP}`, {
          state: { CommandType: ReportCategories[5].CommandType },
        });
      } else if (ReportCategories[6].name === category) {
        navigate(`/${ScreenName.USER_OUTSTANDING_AGE_REP}`, {
          state: { CommandType: ReportCategories[6].CommandType },
        });
      }
    } else {
      window.alert(
        `${t('Alerts.InternetConnectionUnavailable') || 'Internet Connection Unavailable'}: ${t('Alerts.IntenetConnectionUnavailableMsg') || 'Please check your internet connection'}`
      );
    }
  };

  return (
    <CustomSafeView isScrollView={true}>
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#F0F0F0',
          padding: '20px',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontSize: fontsSize.extraLarger,
            fontWeight: 'bold',
            marginBottom: '20px',
            fontFamily: 'Proxima Nova, sans-serif',
            color: Colors.richCharcoal,
            marginTop: '-10px',
          }}
        >
          {t('Dashboard.SelectReportCategory') || 'Select Report Category'}
        </Typography>
        <Grid container spacing={2}>
          {ReportCategories.map((category, index) => {
            return (
              isAccessControlProvided(
                getAccessControlSettings,
                category.accessKeyValue,
              ) && (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      width: '100%',
                      minHeight: '100px',
                      backgroundColor: Colors.white,
                      borderRadius: '10px',
                      padding: '12px',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
                      border: `0.6px solid ${Colors.FABColor}`,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
                      },
                    }}
                    onClick={() => toggleCategory(category.name)}
                  >
                    <CardContent sx={{ padding: '8px !important' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Icon
                          name={category.icon}
                          family="MaterialCommunityIcons"
                          size={50}
                          color={category.iconColor}
                        />
                        <Box sx={{ marginLeft: '12px', flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: fontsSize.medium,
                              fontWeight: 'bold',
                              color: Colors.richCharcoal,
                              marginBottom: '4px',
                            }}
                          >
                            {category.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: fontsSize.small,
                              color: Colors.textColor3,
                              lineHeight: 1.4,
                            }}
                          >
                            {category.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            );
          })}
        </Grid>
        <Box sx={{ paddingBottom: '60px' }} />
      </Box>
    </CustomSafeView>
  );
};

export default ReportCard;


