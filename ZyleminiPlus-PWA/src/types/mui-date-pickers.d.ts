declare module '@mui/x-date-pickers' {
  import { ComponentType } from 'react';
  export const LocalizationProvider: ComponentType<any>;
  export const DatePicker: ComponentType<any>;
}

declare module '@mui/x-date-pickers/AdapterMoment' {
  export const AdapterMoment: any;
}

