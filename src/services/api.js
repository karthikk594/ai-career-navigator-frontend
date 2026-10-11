import axios from "axios";

const API = axios.create({
    baseURL:"https://ai-career-navigator-backend-xa04.onrender.com/api"
});

export default API;