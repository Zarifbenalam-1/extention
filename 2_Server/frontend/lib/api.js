import axios from 'axios';

const API = axios.create({
  baseURL: '/api',   // same origin, under /api prefix
  headers: {
    'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
  }
});

export const getUsers   = ()     => API.get('/admin/users');
export const createUser = (data) => API.post('/admin/users', data);
export const toggleUser = (id)   => API.patch(`/admin/users/${id}/toggle`);
export const deleteUser = (id)   => API.delete(`/admin/users/${id}`);
export const getLogs    = (limit=100, ext=null) =>
  API.get(`/admin/logs?limit=${limit}${ext ? '&extension_id='+ext : ''}`);
