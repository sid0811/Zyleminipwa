export type Screens = {
  name: any;
  component: any;
  options: any;
  params?: any;
  getId?: (options: { params?: any }) => string | undefined;
};

