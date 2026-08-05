import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Loader2,
} from "lucide-react";

import { profileAPI } from "@/api/client";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
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

  const [loadingProfile, setLoadingProfile] =
    useState(true);

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileAPI.getProfile();

        setProfileForm({
          name: response.data.name || "",
          email: response.data.email || "",
          role: response.data.role || "",
        });
      } catch (error) {
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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
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
      const response = await profileAPI.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setProfileForm((current) => ({
        ...current,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
      }));

      setProfileMessage(
        response.data.message
      );
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
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
        response.data.message
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          "Unable to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account details and password."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                Use a strong password with at least 8 characters
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
                onChange={handlePasswordChange}
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
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
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
                onChange={handlePasswordChange}
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
    </div>
  );
}