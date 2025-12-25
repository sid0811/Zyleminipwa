import {useNavigate} from 'react-router-dom';
import {
  deleteNewPartyImageDetailByShopId,
  getNewPartyImageDetailsyncData,
  getNewPartyOutletSyncData,
} from '../../database/SqlDatabase';

export const clearUnwantedImageNewParty = async () => {
  try {
    const results = await Promise.allSettled<any>([
      getNewPartyOutletSyncData(),
      getNewPartyImageDetailsyncData(),
    ]);

    const [newPartyOutletResult, newPartyImageDetailsResult] = results;

    if (
      newPartyOutletResult.status === 'fulfilled' &&
      newPartyOutletResult.value.length > 0 &&
      newPartyImageDetailsResult.status === 'fulfilled' &&
      newPartyImageDetailsResult.value.length > 0
    ) {
      await newPartyImage(newPartyImageDetailsResult, newPartyOutletResult);
    } else if (
      newPartyImageDetailsResult.status === 'fulfilled' &&
      newPartyImageDetailsResult.value.length > 0
    ) {
      await newPartyImage(newPartyImageDetailsResult, null);
    }
  } catch (error) {
    console.error(' Error in clearUnwantedImageNewParty:', error);
  }
};

async function newPartyImage(
  newPartyImageDetailsResult: PromiseFulfilledResult<any> | null | undefined,
  newPartyOutletResult: PromiseFulfilledResult<any> | null | undefined,
) {
  try {
    if (newPartyOutletResult != null) {
      const validKeys = new Set(
        newPartyOutletResult?.value.map((p: any) => p.MobileGenPrimaryKey),
      );
      console.log(' Valid MobileGenPrimaryKeys:', [...validKeys]);
      await processWithImageDeatils(newPartyImageDetailsResult, validKeys);
    } else {
      // No parent associated to images — delete them
      await processWithImageDeatils(newPartyImageDetailsResult, undefined);
    }
  } catch (error) {
    console.error(' Error in newPartyImage:', error);
  }
}

async function processWithImageDeatils(
  newPartyImageDetailsResult: PromiseFulfilledResult<any> | null | undefined,
  validKeys: Set<unknown> | undefined,
) {
  try {
    const promises = newPartyImageDetailsResult?.value.map(
      async (item: any) => {
        const imagePath = item.ImagePath;
        // For web, check if image exists in localStorage
        const exists = localStorage.getItem(imagePath) !== null;
        console.log(` item : ${item}`);

        if (validKeys != null) {
          const isValid = [...validKeys].some(key => item.ShopId == key);
          if (exists && !isValid) {
            // Remove from localStorage
            localStorage.removeItem(imagePath);
            await deleteNewPartyImageDetailByShopId(item.ShopId);
            console.log(` Deleted unlinked image: ${imagePath}`);
          }
        } else {
          if (exists) {
            // Remove from localStorage
            localStorage.removeItem(imagePath);
            await deleteNewPartyImageDetailByShopId(item.ShopId);
            console.log(` Deleted orphaned image: ${imagePath}`);
          }
        }
      },
    );

    await Promise.all(promises || []);
  } catch (error) {
    console.error('❌ Error in processWithImageDeatils:', error);
  }
}

export function popToExistingScreenByName(
  navigation: any,
  screenName: string,
  childScreenName?: string,
  params?: undefined | any,
) {
  // For web with React Router, use navigate function directly
  // This is a simplified version - full navigation stack manipulation
  // may need more complex implementation with React Router
  if (childScreenName) {
    navigation(`/${screenName}/${childScreenName}`, { state: params });
  } else if (params) {
    navigation(`/${screenName}`, { state: params });
  } else {
    navigation(`/${screenName}`);
  }
}

