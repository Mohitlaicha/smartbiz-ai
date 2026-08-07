import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Loader2,
  CheckSquare,
  Calendar,
} from "lucide-react";

import { useAuth } from "@/AuthContext";
import {
  profileAPI,
  businessAPI,
} from "@/api/client";

import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [myTasks, setMyTasks] = useState([]);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [loadingTasks, setLoadingTasks] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [taskError, setTaskError] =
    useState("");

  // ==========================
  // Load Profile
  // ==========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileError("");

        const response =
          await profileAPI.getProfile();

        setProfileForm({
          name: response.data.name || "",
          email: response.data.email || "",
          role: response.data.role || "",
        });
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setProfileError(
          error.response?.data?.message ||
            "Unable to load profile"
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================
  // Load Employee Tasks
  // ==========================
  useEffect(() => {
    if (!user) {
      return;
    }

    if (user?.role !== "employee") {
      return;
    }

    const loadMyTasks = async () => {
      try {
        setLoadingTasks(true);
        setTaskError("");

        const response =
          await businessAPI.getMyTasks();

        const tasks = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.tasks)
          ? response.data.tasks
          : [];

        setMyTasks(tasks);
      } catch (error) {
        console.error(
          "Unable to load profile tasks:",
          error
        );

        setTaskError(
          error.response?.data?.message ||
            "Unable to load assigned tasks"
        );
      } finally {
        setLoadingTasks(false);
      }
    };

    loadMyTasks();
  }, [user?.id, user?.role]);

  // ==========================
  // Profile Form
  // ==========================
  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");
    setSavingProfile(true);

    try {
      const response =
        await profileAPI.updateProfile({
          name: profileForm.name,
          email: profileForm.email,
        });

      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        setProfileForm((current) => ({
          ...current,
          name:
            response.data.user?.name ||
            current.name,
          email:
            response.data.user?.email ||
            current.email,
          role:
            response.data.user?.role ||
            current.role,
        }));
      }

      setProfileMessage(
        response.data.message ||
          "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setProfileError(
        error.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================
  // Password Form
  // ==========================
  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match"
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 8
    ) {
      setPasswordError(
        "New password must be at least 8 characters"
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response =
        await profileAPI.changePassword({
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,
        });

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully"
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error.response?.data?.message ||
          "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================
  // Task helpers
  // ==========================
  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";

      case "in_progress":
        return "In Progress";

      case "review":
        return "Review";

      case "done":
        return "Done";

      default:
        return status || "Unknown";
    }
  };

  const getDueDate = (task) => {
    return task.due_date || task.dueDate;
  };

  // ==========================
  // Loading
  // ==========================
  if (loadingProfile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // ==========================
  // Page
  // ==========================
  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account details and password."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ==========================
            Account Details
        ========================== */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Account details
              </h2>

              <p className="text-sm text-muted-foreground">
                Update your name and email
              </p>
            </div>
          </div>

          {profileMessage && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {profileError}
            </div>
          )}

          <form
            onSubmit={handleProfileSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">
                Full name
              </Label>

              <Input
                id="name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Account role
              </Label>

              <Input
                id="role"
                value={profileForm.role}
                disabled
                className="capitalize"
              />
            </div>

            <Button
              type="submit"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </div>

        {/* ==========================
            Change Password
        ========================== */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Change password
              </h2>

              <p className="text-sm text-muted-foreground">
                Use a strong password with at least
                8 characters
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Current password
              </Label>

              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New password
              </Label>

              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm new password
              </Label>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="new-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={changingPassword}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change password"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* ==========================
          Employee Assigned Tasks
      ========================== */}
      {user?.role === "employee" && (
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                My Assigned Tasks
              </h2>

              <p className="text-sm text-muted-foreground">
                Tasks assigned to your account
              </p>
            </div>
          </div>

          {taskError && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {taskError}
            </div>
          )}

          {loadingTasks ? (
            <div className="flex items-center gap-2 py-5 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading tasks...
            </div>
          ) : myTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <CheckSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">
                No assigned tasks
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No tasks have been assigned to you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.map((task) => {
                const dueDate =
                  getDueDate(task);

                return (
                  <div
                    key={task.id || task._id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">
                            Priority:{" "}
                            {task.priority ||
                              "medium"}
                          </span>

                          {task.assigner && (
                            <span>
                              Assigned by:{" "}
                              {task.assigner.name}
                            </span>
                          )}

                          {dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />

                              {new Date(
                                dueDate
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant="secondary">
                        {getTaskStatusLabel(
                          task.status
                        )}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}