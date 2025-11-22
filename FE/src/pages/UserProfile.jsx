import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosPrivate from "@/api/axios";
import useAuth from "@/hook/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import các thành phần Layout chung
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ScsSidebar from "@/components/scstaff/ScsSidebar";
import ScTechnicianSideBar from "@/components/sctechnician/ScTechnicianSideBar";
import EVMStaffSideBar from "@/components/evmstaff/EVMStaffSideBar";

// Component con để chọn Sidebar dựa trên vai trò
const UserSidebar = ({ isMobileOpen, onClose }) => {
  const { auth } = useAuth();

  switch (auth?.role) {
    case "ADMIN":
      return <AdminSidebar isMobileOpen={isMobileOpen} onClose={onClose} />;
    case "SC_STAFF":
      return <ScsSidebar isMobileOpen={isMobileOpen} onClose={onClose} />;
    case "SC_TECHNICIAN":
      return (
        <ScTechnicianSideBar isMobileOpen={isMobileOpen} onClose={onClose} />
      );
    case "EVM_STAFF":
      return <EVMStaffSideBar isMobileOpen={isMobileOpen} onClose={onClose} />;
    default:
      return null; // Hoặc một sidebar mặc định nếu có
  }
};

export default function UserProfile() {
  const { auth, setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  // Form for profile information
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo },
  } = useForm();

  // Form for changing password
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: errorsPassword },
  } = useForm();

  // Fetch current user data on page load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!auth?.accountId) return;
      try {
        const response = await axiosPrivate.get("/api/accounts/current");
        const userData = response.data;
        resetInfo({
          username: userData.username || "",
          fullName: userData.fullName || "",
          password: userData.password || "",
          gender: userData.gender || null,
          email: userData.email || "",
          phone: userData.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setApiError("Failed to load user information.");
      }
    };
    fetchCurrentUser();
  }, [auth, resetInfo]);

  // Helper function to show and hide messages
  const showMessage = (setter, message, isError = false) => {
    setter(message);
    setTimeout(() => setter(null), 3000); // Hide after 3 seconds
  };

  // Handle profile info update
  const onSubmitInfo = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      const response = await axiosPrivate.put(
        `/api/accounts/${auth.accountId}`,
        data
      );
      showMessage(setSuccessMessage, "Profile updated successfully!");
    } catch (error) {
      console.error("Update info failed:", error);
      showMessage(
        setApiError,
        error.response?.data?.message || "Profile update failed.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const onSubmitPassword = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      await axiosPrivate.put(
        `/api/accounts/${auth.accountId}/change-password`,
        {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }
      );
      showMessage(setSuccessMessage, "Password changed successfully!");
      resetPassword();
    } catch (error) {
      console.error("Change password failed:", error);
      showMessage(
        setApiError,
        error.response?.data?.message ||
          "Password change failed. Check your old password.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      <UserSidebar isMobileOpen={isMobileMenuOpen} onClose={handleCloseMenu} />{" "}
      {/* Hiển thị Sidebar động dựa trên vai trò */}
      <div className="flex-1">
        <Header onMenuClick={handleOpenMenu} /> {/* Hiển thị Header chung */}
        <main className="container mx-auto max-w-3xl p-4 md:p-8 space-y-6">
          {/* Nội dung trang gốc bắt đầu từ đây */}
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

          {/* General success/error messages */}
          {apiError && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive rounded-md">
              {apiError}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-600/10 text-green-700 border border-green-600/20 rounded-md">
              {successMessage}
            </div>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            {/* Tab 1: Update Profile */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmitInfo(onSubmitInfo)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        {...registerInfo("fullName", {
                          required: "Full name is required",
                        })}
                      />
                      {errorsInfo.fullName && (
                        <p className="text-sm text-destructive">
                          {errorsInfo.fullName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerInfo("email", {
                          required: "Email is required",
                        })}
                      />
                      {errorsInfo.email && (
                        <p className="text-sm text-destructive">
                          {errorsInfo.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" {...registerInfo("phone")} />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Change Password */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Change your login password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmitPassword(onSubmitPassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Old Password</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        {...registerPassword("oldPassword", {
                          required: "Old password is required",
                        })}
                      />
                      {errorsPassword.oldPassword && (
                        <p className="text-sm text-destructive">
                          {errorsPassword.oldPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message:
                              "New password must be at least 6 characters",
                          },
                        })}
                      />
                      {errorsPassword.newPassword && (
                        <p className="text-sm text-destructive">
                          {errorsPassword.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your new password",
                          validate: (value) =>
                            value === watchPassword("newPassword") ||
                            "The passwords do not match",
                        })}
                      />
                      {errorsPassword.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {errorsPassword.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
