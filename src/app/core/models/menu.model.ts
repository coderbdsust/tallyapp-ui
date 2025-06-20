export interface MenuItem {
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  items: Array<SubMenuItem>;
}

export interface SubMenuItem {
  icon?: string;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
  requiredModules?: string[]; // New property for module-based access control
}