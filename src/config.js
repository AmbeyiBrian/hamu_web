// Create a config file if it doesn't exist
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.hamuwater.com/api' 
  : 'http://localhost:8000/api';

export default API_BASE_URL;
