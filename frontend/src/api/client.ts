const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to handle fetch requests
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // If body is FormData, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    ...options,
    headers: isFormData
      ? options.headers || {}
      : {
          ...defaultHeaders,
          ...options.headers,
        },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Unable to connect to ${url}. Make sure the backend server is running.`);
    }
    throw error;
  }
}

// Helper to parse JSON response
async function getJSON<T>(response: Response): Promise<{ data: T }> {
  const data = await response.json();
  return { data };
}

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Type definitions
export interface Company {
  id: number;
  identity_card: string;
  name?: string;
  address?: string;
  po_box?: string;
  phone?: string;
  fax?: string;
  contact_person?: string;
  contact_phone?: string;
  manager_name?: string;
  manager_phone?: string;
  manager_id?: string;
  email?: string;
  safety_officer?: string;
  carrier_license_expiry?: string;
  established_date?: string;
  inspection_week?: number;
  notes?: string;
  vehicles_count?: number;
  drivers_count?: number;
}

export interface Vehicle {
  id: number;
  license_plate: string;
  company_id?: number;
  company_name?: string;
  assigned_driver_id?: number;
  driver_name?: string;
  manufacturer?: string;
  model?: string;
  weight?: number;
  department?: string;
  car_type?: string;
  carrier_license_expiry_date?: string;
  internal_number?: number;
  chassis_number?: string;
  odometer_reading?: number;
  production_year?: number;
  license_expiry_date?: string;
  last_safety_inspection?: string;
  next_safety_inspection?: string;
  hova_insurance_expiry_date?: string;
  mekif_insurance_expiry_date?: string;
  special_equipment_expiry_date?: string;
  hazardous_license_expiry_date?: string;
  tachograph_expiry_date?: string;
  winter_inspection_expiry_date?: string;
  brake_inspection_expiry_date?: string;
  equipment?: string;
  has_tow_hook?: boolean;
  is_operational?: boolean;
  notes?: string;
}

export interface Driver {
  id: number;
  identity_card: string;
  company_id?: number;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  license_class?: string;
  license_expiry_date?: string;
  traffic_info_expiry_date?: string;
  address?: string;
  phone_mobile?: string;
  phone_home?: string;
  job_title?: string;
  work_location?: string;
  marital_status?: string;
  birth_date?: string;
  employment_start_date?: string;
  education?: string;
  was_license_revoked?: boolean;
  has_hazardous_materials_permit?: boolean;
  has_crane_operation_permit?: boolean;
  personal_number_in_company?: string;
  email?: string;
  notes?: string;
  vehicle_id?: number;
  vehicle_plate?: string;
}

// Companies API
export const companiesApi = {
  getAll: async (): Promise<{ data: Company[] }> => {
    const response = await fetchAPI('/companies');
    return getJSON<Company[]>(response);
  },
  getById: async (id: number): Promise<{ data: Company }> => {
    const response = await fetchAPI(`/companies/${id}`);
    return getJSON<Company>(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any): Promise<{ data: Company }> => {
    const response = await fetchAPI(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON<Company>(response);
  },
  delete: async (id: number) => {
    const response = await fetchAPI(`/companies/${id}`, {
      method: 'DELETE',
    });
    return getJSON(response);
  },
  getVehicles: async (id: number): Promise<{ data: Vehicle[] }> => {
    const response = await fetchAPI(`/companies/${id}/vehicles`);
    return getJSON<Vehicle[]>(response);
  },
  getDrivers: async (id: number): Promise<{ data: Driver[] }> => {
    const response = await fetchAPI(`/companies/${id}/drivers`);
    return getJSON<Driver[]>(response);
  },
  uploadFile: async (id: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    const response = await fetchAPI(`/companies/${id}/files`, {
      method: 'POST',
      body: formData,
    });
    return getJSON(response);
  },
};

// Vehicles API
export const vehiclesApi = {
  getAll: async (): Promise<{ data: Vehicle[] }> => {
    const response = await fetchAPI('/vehicles');
    return getJSON<Vehicle[]>(response);
  },
  getById: async (id: number): Promise<{ data: Vehicle }> => {
    const response = await fetchAPI(`/vehicles/${id}`);
    return getJSON<Vehicle>(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any): Promise<{ data: Vehicle }> => {
    const response = await fetchAPI(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON<Vehicle>(response);
  },
  delete: async (id: number) => {
    const response = await fetchAPI(`/vehicles/${id}`, {
      method: 'DELETE',
    });
    return getJSON(response);
  },
  assignDriver: async (id: number, driverId: number | null) => {
    const response = await fetchAPI(`/vehicles/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ driver_id: driverId }),
    });
    return getJSON(response);
  },
  getDriver: async (id: number): Promise<{ data: Driver | null }> => {
    const response = await fetchAPI(`/vehicles/${id}/driver`);
    return getJSON<Driver | null>(response);
  },
  uploadFile: async (id: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    const response = await fetchAPI(`/vehicles/${id}/files`, {
      method: 'POST',
      body: formData,
    });
    return getJSON(response);
  },
};

// Drivers API
export const driversApi = {
  getAll: async (): Promise<{ data: Driver[] }> => {
    const response = await fetchAPI('/drivers');
    return getJSON<Driver[]>(response);
  },
  getById: async (id: number): Promise<{ data: Driver }> => {
    const response = await fetchAPI(`/drivers/${id}`);
    return getJSON<Driver>(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any): Promise<{ data: Driver }> => {
    const response = await fetchAPI(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON<Driver>(response);
  },
  delete: async (id: number) => {
    const response = await fetchAPI(`/drivers/${id}`, {
      method: 'DELETE',
    });
    return getJSON(response);
  },
  uploadFile: async (id: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    
    const response = await fetchAPI(`/drivers/${id}/files`, {
      method: 'POST',
      body: formData,
    });
    return getJSON(response);
  },
};

// Files API
export const filesApi = {
  getCompanyFiles: async (id: number) => {
    const response = await fetchAPI(`/files/companies/${id}`);
    return getJSON(response);
  },
  getVehicleFiles: async (id: number) => {
    const response = await fetchAPI(`/files/vehicles/${id}`);
    return getJSON(response);
  },
  getDriverFiles: async (id: number) => {
    const response = await fetchAPI(`/files/drivers/${id}`);
    return getJSON(response);
  },
  download: async (id: number) => {
    const response = await fetchAPI(`/files/${id}/download`);
    const blob = await response.blob();
    return { data: blob };
  },
  delete: async (id: number) => {
    const response = await fetchAPI(`/files/${id}`, {
      method: 'DELETE',
    });
    return getJSON(response);
  },
};

// Search API
export const searchApi = {
  companies: async (query: string): Promise<{ data: Company[] }> => {
    const queryString = buildQueryString({ q: query });
    const response = await fetchAPI(`/search/companies${queryString}`);
    return getJSON<Company[]>(response);
  },
  vehicles: async (query: string, filters?: { company_id?: number; vehicle_type?: string }): Promise<{ data: Vehicle[] }> => {
    const params: Record<string, any> = { q: query };
    if (filters) {
      if (filters.company_id !== undefined) params.company_id = filters.company_id;
      if (filters.vehicle_type !== undefined) params.vehicle_type = filters.vehicle_type;
    }
    const queryString = buildQueryString(params);
    const response = await fetchAPI(`/search/vehicles${queryString}`);
    return getJSON<Vehicle[]>(response);
  },
  drivers: async (query: string, filters?: { company_id?: number; status?: string }): Promise<{ data: Driver[] }> => {
    const params: Record<string, any> = { q: query };
    if (filters) {
      if (filters.company_id !== undefined) params.company_id = filters.company_id;
      if (filters.status !== undefined) params.status = filters.status;
    }
    const queryString = buildQueryString(params);
    const response = await fetchAPI(`/search/drivers${queryString}`);
    return getJSON<Driver[]>(response);
  },
};
