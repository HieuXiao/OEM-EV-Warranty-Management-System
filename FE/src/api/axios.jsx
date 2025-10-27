import axios from "axios";
import { getCurrentUser, clearAuth } from "@/lib/auth";

// Có thể cấu hình sẵn nếu cần
// const BASE_URL = "https://oem-ev-warranty-management-system-be-production.up.railway.app";

const axiosPrivate = axios.create({
  baseURL: "",
  withCredentials: false,
});

// ✅ Interceptor: thêm Authorization + xử lý FormData
axiosPrivate.interceptors.request.use(
  (config) => {
    // Bảo đảm headers luôn là object
    if (!config.headers) {
      config.headers = {};
    }

    // Thêm token vào Authorization nếu có
    const user = getCurrentUser();
    if (user?.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }

    // Nếu data là FormData (ví dụ upload .png), xoá Content-Type mặc định
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // axios sẽ tự thêm multipart/form-data
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor: bắt lỗi response (giữ nguyên logic cũ của bạn)
axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn(
        "❌ Unauthorized — token expired or invalid:",
        error?.config?.url
      );

      try {
        clearAuth(); // xóa token & user khỏi localStorage
      } catch (e) {
        console.error("Error clearing auth:", e);
      }

      try {
        window.dispatchEvent(
          new CustomEvent("app:unauthorized", {
            detail: {
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            },
          })
        );
      } catch (e) {
        console.error("Error dispatching event:", e);
      }

      try {
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      } catch (e) {
        console.error("Redirect failed:", e);
      }
    }

    // Ghi log lỗi 500 hoặc các lỗi khác (để dễ debug upload)
    if (status === 500) {
      console.error("💥 Internal Server Error:", error?.response?.data || {});
    }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
