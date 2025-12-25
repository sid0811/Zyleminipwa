import {Box, Typography} from '@mui/material';

import {TeamPerformanceStyles} from '../TeamPerformance.style';
import {ImageDetail} from '../TeamPerfTypes';
import {openLinkInBrowser} from '../../../../utility/utils';

const ImageDetails = ({details = []}: {details?: ImageDetail[]}) => (
  <Box sx={TeamPerformanceStyles().imageContainer}>
    {details.map((image, index) => (
      <Box key={index} sx={TeamPerformanceStyles().outletSection}>
        <Typography sx={TeamPerformanceStyles().outletName}>{image.Outlet}</Typography>
        <Box
          sx={TeamPerformanceStyles().imageButton}
          onClick={() => openLinkInBrowser(image.ImageURL)}>
          <Typography sx={TeamPerformanceStyles().imageButtonText}>
            {image.ImageURL ? 'Click To See The Image' : 'No Image Available'}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

export default ImageDetails;

