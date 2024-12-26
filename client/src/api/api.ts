import axios from "axios";

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/'  // In production, use relative path
  : 'http://localhost:3000/'; // In development, use localhost

export const api = axios.create({ 
  baseURL, 
  timeout: 300000 
});
