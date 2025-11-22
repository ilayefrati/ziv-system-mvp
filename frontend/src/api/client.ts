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

// Companies API
export const companiesApi = {
  getAll: async () => {
    const response = await fetchAPI('/companies');
    return getJSON(response);
  },
  getById: async (id: number) => {
    const response = await fetchAPI(`/companies/${id}`);
    return getJSON(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any) => {
    const response = await fetchAPI(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  delete: async (id: number) => {
    const response = await fetchAPI(`/companies/${id}`, {
      method: 'DELETE',
    });
    return getJSON(response);
  },
  getVehicles: async (id: number) => {
    const response = await fetchAPI(`/companies/${id}/vehicles`);
    return getJSON(response);
  },
  getDrivers: async (id: number) => {
    const response = await fetchAPI(`/companies/${id}/drivers`);
    return getJSON(response);
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
  getAll: async () => {
    const response = await fetchAPI('/vehicles');
    return getJSON(response);
  },
  getById: async (id: number) => {
    const response = await fetchAPI(`/vehicles/${id}`);
    return getJSON(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any) => {
    const response = await fetchAPI(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON(response);
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
  getDriver: async (id: number) => {
    const response = await fetchAPI(`/vehicles/${id}/driver`);
    return getJSON(response);
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
  getAll: async () => {
    const response = await fetchAPI('/drivers');
    return getJSON(response);
  },
  getById: async (id: number) => {
    const response = await fetchAPI(`/drivers/${id}`);
    return getJSON(response);
  },
  create: async (data: any) => {
    const response = await fetchAPI('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return getJSON(response);
  },
  update: async (id: number, data: any) => {
    const response = await fetchAPI(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return getJSON(response);
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
  companies: async (query: string) => {
    const queryString = buildQueryString({ q: query });
    const response = await fetchAPI(`/search/companies${queryString}`);
    return getJSON(response);
  },
  vehicles: async (query: string, filters?: { company_id?: number; vehicle_type?: string }) => {
    const params: Record<string, any> = { q: query };
    if (filters) {
      if (filters.company_id !== undefined) params.company_id = filters.company_id;
      if (filters.vehicle_type !== undefined) params.vehicle_type = filters.vehicle_type;
    }
    const queryString = buildQueryString(params);
    const response = await fetchAPI(`/search/vehicles${queryString}`);
    return getJSON(response);
  },
  drivers: async (query: string, filters?: { company_id?: number; status?: string }) => {
    const params: Record<string, any> = { q: query };
    if (filters) {
      if (filters.company_id !== undefined) params.company_id = filters.company_id;
      if (filters.status !== undefined) params.status = filters.status;
    }
    const queryString = buildQueryString(params);
    const response = await fetchAPI(`/search/drivers${queryString}`);
    return getJSON(response);
  },
};
