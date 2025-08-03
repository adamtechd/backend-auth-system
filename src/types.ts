// src/types.ts

export interface Technician {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  name: string;
}

export interface WeeklyData {
  tools: string;
  vehicleId: string;
  meta: string;
  notes: string;
}

export interface RouteData {
  type: 'route';
  id: string;
  name: string;
  assignments: {
    [dateKey: string]: { technicianIds: string[] };
  };
  weeklyData: {
    [weekKey: string]: WeeklyData;
  };
}

export interface GroupHeader {
    type: 'group';
    id: string;
    name: string;
}

export type RoutePlanRow = GroupHeader | RouteData;

export interface PlansData {
  [key: string]: RoutePlanRow[];
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  role: 'admin' | 'viewer';
  permissions: { // Objeto de permissões agora é obrigatório
    canEditRoutes: boolean;
    canExportPdf: boolean;
    canExportExcel: boolean;
    canManageUsers: boolean;
    canUseChat: boolean; // NOVA PERMISSÃO
  }
}