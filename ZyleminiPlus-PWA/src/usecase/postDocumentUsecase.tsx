import {filePaths} from '../utility/utils';
import {FILE_NAMES} from '../constants/screenConstants';
import Apis from '../api/LoginAPICalls';

export async function callPostDocumentApi(
  mobileGenPrimaryKeys: any[],
  enteredUserName: string,
) {
  // For web, we'll use a simplified approach
  // PDFs are typically stored differently in web applications
  // This is a placeholder implementation
  
  try {
    // In web, we might store PDFs in IndexedDB or handle them differently
    // For now, we'll create a minimal implementation that doesn't crash
    
    const docsData: any[] = [];
    
    // Extract just the MobileGenPrimaryKey values
    const primaryKeyStrings = mobileGenPrimaryKeys.map(
      item => item.MobileGenPrimaryKey,
    );
    
    // Check localStorage for any stored PDF data (web alternative)
    for (const key of primaryKeyStrings) {
      const pdfKey = `${FILE_NAMES.PREFIX_ORDER_PDF}${key}`;
      const storedPdf = localStorage.getItem(pdfKey);
      
      if (storedPdf) {
        docsData.push({
          FileName: key + FILE_NAMES.PDF_EXTENTION,
          FileByte: storedPdf,
        });
      }
    }
    
    if (docsData.length > 0) {
      const finalJson = {
        LoginId: enteredUserName,
        DocsData: docsData,
      };
      
      const syncResponse = await Apis.postDocuments(finalJson);
      
      // Handle response - remove successfully uploaded PDFs
      const {SavedData} = syncResponse;
      if (SavedData?.length > 0) {
        SavedData.forEach((data: any) => {
          const pdfKey = `${FILE_NAMES.PREFIX_ORDER_PDF}${data.MobileGenPrimaryKey}`;
          localStorage.removeItem(pdfKey);
          console.log('PDF DELETED', pdfKey);
        });
      }
    }
  } catch (err) {
    console.error('Error handling PDF files:', err);
  }
}

