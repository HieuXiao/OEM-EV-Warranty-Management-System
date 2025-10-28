// FE/src/components/login/LoginForm.jsx

import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import useAuth from "@/hook/useAuth";
import axiosPrivate from "@/api/axios";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

const LOGIN_URL = "/api/auth/login";

export default function LoginForm({
  accountId,
  setAccountId,
  password,
  setPassword,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </CardContent>
  );
}
