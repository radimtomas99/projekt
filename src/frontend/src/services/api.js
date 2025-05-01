import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Získání tokenu z localStorage
  console.log("Sending token: ", token);  // Logování tokenu
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Přidání tokenu do hlavičky
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export default api;
