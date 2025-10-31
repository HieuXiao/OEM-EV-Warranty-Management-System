import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "@/hook/useAuth";
import axiosPrivate from "@/api/axios";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";

const LOGIN_URL = "/api/auth/login";

export default function LoginForm({
  accountId,
  setAccountId,
  password,
  setPassword,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedAccountId = accountId.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await axiosPrivate.post(
        LOGIN_URL,
        JSON.stringify({
          accountId: trimmedAccountId,
          password: trimmedPassword,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const token = response?.data?.token;
      const role = response?.data?.roleName;
      const fullName = response?.data?.fullName;
      const email = response?.data?.email;

      setAuth({ accountId, fullName, email, role, token });
      setAccountId("");
      setPassword("");
      if (role === "ADMIN") navigate("/admin/users");
      if (role === "SC_STAFF") navigate("/scstaff/dashboard");
      if (role === "SC_TECHNICIAN") navigate("/sctechnician/dashboard");
      if (role === "EVM_STAFF") navigate("/evmstaff/products");
    } catch (err) {
      if (!err?.response) {
        setError("No Server Response");
      } else if (err.response?.status === 400) {
        setError("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setError("Unauthorized");
      } else {
        setError("Login Failed");
      }
    }
    setIsLoading(false);
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Account ID</Label>
          <Input
            id="email"
            type="text"
            placeholder="Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"} // Thay đổi type động
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10" // Thêm padding bên phải để icon không đè lên chữ
            />
            {/* Thêm nút để bật/tắt hiển thị mật khẩu */}
            <button
              type="button" // Quan trọng: để không submit form
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !accountId.trim() || !password.trim()}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </CardContent>
  );
}
