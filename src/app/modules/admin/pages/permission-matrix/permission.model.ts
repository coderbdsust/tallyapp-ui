export interface Module {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  modules: string[];
  isDefault: boolean;
}

export interface NewRole {
  name: string;
  description: string;
  modules: string[];
}