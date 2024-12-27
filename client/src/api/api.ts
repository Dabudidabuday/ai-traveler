import axios from "axios";

const baseURL = import.meta.env.PROD
  ? '/'  // In production, use relative path
  : 'http://localhost:3000/'; // In development, use localhost

export const api = axios.create({ 
  baseURL, 
  timeout: 300000 
});
