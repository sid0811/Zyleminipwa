export interface Activity {
  type: string;
  count: number;
  color: string;
  collectionType: number;
  total: number;
}

export interface VisitDetail {
  outletName: string;
  checkIn: string;
  checkOut: string;
}

interface OrderItem {
  SKU: string;
  items: string;
  rate: number;
}

export interface OrderDetail {
  outletName: string;
  items: OrderItem[];
  totalRate: number;
  totalDiscount: number;
}

interface DataCollectionItem {
  sku: string;
  quantity: string;
}

export interface DataCollectionDetail {
  outletName: string;
  items: DataCollectionItem[];
}

export interface ReceiptItem {
  outletName: string;
  paymentDetails: {
    collectedAmount: number;
    paymentMode: string;
  };
  items: {
    invNo: string;
    invoiceDate: string;
    opOs: number;
    receipt: number;
    clOs: number;
  }[];
}

export interface ImageDetail {
  Outlet: string;
  ImageURL: string;
}

export interface ExecutiveData {
  id: number;
  name: string;
  outlets: number;
  totalActivities: number;
  activities: Activity[];
  visitDetails?: VisitDetail[];
  orderDetails?: OrderDetail[];
  dataCollectionDetails?: DataCollectionDetail[];
  receiptDetails?: ReceiptItem[];
  imageDetails?: ImageDetail[];
}

export interface MeetingDetail {
  outlet: string;
  meetingStart: string;
  meetingEnd: string;
  remarks: string;
}

export interface MeetingDetails {
  [key: string]: MeetingDetail[];
}

export interface TeamActivityReport {
  userId: number;
  name: string;
  profilePicURL: string;
  outlets: number;
  totalActivities: number;
  activities: TeamActivity[];
  visitDetails?: VisitDetail[];
  orderDetails?: OrderDetail[];
  dataCollectionDetails?: DataCollectionDetail[];
  receiptDetails?: ReceiptItem[];
  imageDetails?: ImageDetail[];
  meetingDetails?: MeetingDetail[];
}

interface TeamActivity {
  collectionType: number;
  type: string;
  count: number;
  color: string;
  total: number;
}

