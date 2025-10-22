import axios from "axios";
import { getCurrentUser } from "@/lib/auth";

// const BASE_URL =
//   "https://oem-ev-warranty-management-system-be-production.up.railway.app";

const axiosPrivate = axios.create({
  baseURL: "",
  withCredentials: false,
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user?.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

      // Phát sự kiện toàn cục để các component khác (như Toast hoặc AuthProvider) có thể phản ứng
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

      // Nếu user không đang ở trang login thì điều hướng về login
      try {
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      } catch (e) {
        console.error("Redirect failed:", e);
      }
    }

    // Luôn reject để các component có thể xử lý riêng nếu cần
    return Promise.reject(error);
  }
);

export default axiosPrivate;
