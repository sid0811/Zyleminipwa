// utils/checkVersionCore.ts

import {getVersionForUpdate} from '../api/LoginAPICalls';
import {writeErrorLog} from '../utility/utils';

export type Pair = {
  isVersionUpdate: boolean;
  platfromUrl?: string;
};

interface CheckVersionParams {
  token: string;
  minVersion: number;
  callBack?: (pair:Pair) =>void  
}

export const checkVersionCore = async ({
  token,
  minVersion,
  callBack
}: CheckVersionParams) => {
  try {
    const version = await getVersionForUpdate({authheader: token});
    console.log('Version', version);

    if (version && version >= minVersion) {
      // For web, we can provide the main website URL or app store links
      // Note: In PWA, version updates are typically handled automatically by service workers
      const updateUrl = 'https://sapl.net'; // Main website URL
      callBack?.({isVersionUpdate: true, platfromUrl: updateUrl});
    }
    else{
      callBack?.({isVersionUpdate: false})
    }
  } catch (error) {
    writeErrorLog('checkVersionCore', error);
    console.log('Version check error →', error);
  }
};

