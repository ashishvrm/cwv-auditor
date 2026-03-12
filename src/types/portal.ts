export interface AppCard {
  id: string;
  name: string;
  description: string;
  icon: string; // React component name or icon string
  route: string;
  enabled: boolean;
  comingSoon?: boolean;
  badge?: string;
}

export interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  children?: NavItem[];
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'warning' | 'critical';
  };
  disabled?: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissible?: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: string | number | boolean | undefined;
}

export interface TableColumn<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface Modal {
  id: string;
  title: string;
  isOpen: boolean;
  type: 'info' | 'warning' | 'error' | 'confirm';
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
