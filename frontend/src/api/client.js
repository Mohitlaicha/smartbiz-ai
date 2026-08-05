import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  forgotPassword: (data) =>
    api.post("/auth/forgot-password", data),
  resetPassword: (data) =>
    api.post("/auth/reset-password", data),
};

export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile", data),
  changePassword: (data) =>
    api.put("/profile/password", data),
};

export const businessAPI = {
  getDashboard: () => api.get("/dashboard"),

  getProducts: () => api.get("/products"),
  createProduct: (data) => api.post("/products", data),
  addProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) =>
    api.put(`/products/${id}`, data),
  deleteProduct: (id) =>
    api.delete(`/products/${id}`),

  getInvoices: () => api.get("/invoices"),
  createInvoice: (data) => api.post("/invoices", data),
  addInvoice: (data) => api.post("/invoices", data),
  updateInvoice: (id, data) =>
    api.put(`/invoices/${id}`, data),
  deleteInvoice: (id) =>
    api.delete(`/invoices/${id}`),

  getCustomers: () => api.get("/customers"),
  addCustomer: (data) => api.post("/customers", data),
  updateCustomer: (id, data) =>
    api.put(`/customers/${id}`, data),
  deleteCustomer: (id) =>
    api.delete(`/customers/${id}`),

  getTasks: () => api.get("/tasks"),

  getEmployees: () => api.get("/employees"),
  createEmployee: (data) =>
    api.post("/employees", data),
  updateEmployee: (id, data) =>
    api.put(`/employees/${id}`, data),
  deleteEmployee: (id) =>
    api.delete(`/employees/${id}`),

  getExpenses: () => api.get("/expenses"),
  createExpense: (data) =>
    api.post("/expenses", data),
  updateExpense: (id, data) =>
    api.put(`/expenses/${id}`, data),
  deleteExpense: (id) =>
    api.delete(`/expenses/${id}`),

  getReports: (params = {}) =>
    api.get("/reports", { params }),
};