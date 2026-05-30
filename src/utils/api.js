/**
 * API client helper to interact with the Express + MongoDB backend via local Vite proxy or production backend host.
 */

const getApiUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};

const getHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // --- Auth & Settings ---
  login: async (username, password) => {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  register: async (username, password) => {
    const res = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  getUserProfile: async (token) => {
    const res = await fetch(getApiUrl('/api/auth/user'), {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  updateSettings: async (token, { targetHours, categories }) => {
    const res = await fetch(getApiUrl('/api/auth/settings'), {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ targetHours, categories }),
    });
    return handleResponse(res);
  },

  // --- Tasks Operations ---
  fetchTasks: async (token) => {
    const res = await fetch(getApiUrl('/api/tasks'), {
      method: 'GET',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  saveTask: async (token, task) => {
    const res = await fetch(getApiUrl('/api/tasks'), {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(task),
    });
    return handleResponse(res);
  },

  syncTasks: async (token, tasks) => {
    const res = await fetch(getApiUrl('/api/tasks/sync'), {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ tasks }),
    });
    return handleResponse(res);
  },

  deleteTask: async (token, id) => {
    const res = await fetch(getApiUrl(`/api/tasks/${id}`), {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  purgeAllTasks: async (token) => {
    const res = await fetch(getApiUrl('/api/tasks'), {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  }
};
