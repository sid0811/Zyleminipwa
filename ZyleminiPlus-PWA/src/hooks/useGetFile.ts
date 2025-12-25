import {useRef} from 'react';

interface UseGetFileProps {
  singleUploadMode?: boolean;
}

interface DocumentPickerResponse {
  uri: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Hook to facilitate file selection using native HTML5 file input with configurable single or multiple upload mode.
 *
 * @param {Object} [params] - Configuration parameters.
 * @param {boolean} [params.singleUploadMode=false] - Whether to enable single upload mode. Defaults to `false` (multi-selection allowed).
 *
 * @returns {Object} - Hook API.
 * @returns {function} selectDoc - Function to trigger document selection and handle file updates.
 * @returns {React.RefObject<any>} toastRef - Ref object to handle toast notifications.
 *
 * @example
 * // Default behavior (multi-selection allowed)
 * const { selectDoc, toastRef } = useGetFile();
 *
 * // Single upload mode
 * const { selectDoc, toastRef } = useGetFile({ singleUploadMode: true });
 */
export const useGetFile = ({
  singleUploadMode = false,
}: UseGetFileProps = {}) => {
  const toastRef = useRef<any>(null);

  /**
   * Triggers the file picker to allow the user to select files.
   * Handles both single and multi-file selection based on the configuration.
   * Updates the state with the selected files and provides toast notifications for success or errors.
   *
   * @async
   * @param {function} updateState - Callback to update the state with selected file(s).
   * Takes an array of `DocumentPickerResponse` objects as a parameter.
   *
   * @throws Will show a toast error if file selection is cancelled or another error occurs.
   */
  const selectDoc = async (
    updateState: (items: DocumentPickerResponse[]) => void,
  ) => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/*';
      input.multiple = !singleUploadMode;

      // Create a promise to handle file selection
      const fileSelectionPromise = new Promise<File[]>((resolve, reject) => {
        input.onchange = (e: Event) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            resolve(Array.from(files));
          } else {
            reject(new Error('No files selected'));
          }
        };
        input.oncancel = () => {
          reject(new Error('AbortError'));
        };
      });

      // Trigger the file picker
      input.click();

      // Wait for file selection
      const files = await fileSelectionPromise;

      // Convert files to DocumentPickerResponse format
      const docs: DocumentPickerResponse[] = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          return {
            uri: dataUrl,
            name: file.name,
            type: file.type,
            size: file.size,
          };
        })
      );

      updateState(docs);
      toastRef?.current?.success('Uploaded Successfully');
    } catch (error) {
      if (error && (error as Error).message === 'AbortError') {
        toastRef?.current?.error('Uploading Cancelled!');
      } else {
        toastRef?.current?.error('Error uploading files!');
        console.log(error);
      }
    }
  };

  return {
    selectDoc,
    toastRef,
  };
};

