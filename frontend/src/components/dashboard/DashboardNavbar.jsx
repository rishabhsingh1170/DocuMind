import { useState } from "react";
import {
  LogOut,
  User,
  Mail,
  Briefcase,
  Camera,
  UserRound,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { userAPI } from "../../utils/apiClient";

export default function DashboardNavbar({ user, onLogout, onUserUpdated }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const getAvatarLabel = () => {
    if (!user?.name) {
      return "U";
    }

    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return "U";
    }

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const companyDisplay =
    user?.company_name || user?.company_id || "Not assigned";

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");

    if (!user?._id || !profileFile) {
      setProfileError("Choose an image file first.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const updatedUser = await userAPI.uploadProfileImage(
        user._id,
        profileFile,
      );
      onUserUpdated(updatedUser);
      setProfileMessage("Profile picture updated successfully.");
      setProfileFile(null);
      setIsProfileMenuOpen(false);
    } catch (error) {
      setProfileError(error?.message || "Failed to update profile picture.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setProfileMessage("");

    const confirmMessage =
      user?.role === "admin"
        ? "Delete your account? This will also delete your chat, documents, and related records."
        : "Delete your account? This action cannot be undone.";

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      await userAPI.deleteMyAccount();
      onLogout();
    } catch (error) {
      setDeleteError(error?.message || "Failed to delete your account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-indigo-600">DocuMind AI</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            aria-label="Open profile menu"
          >
            {user?.profile_url ? (
              <img
                src={user.profile_url}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {getAvatarLabel()}
              </span>
            )}
            <UserRound className="h-4 w-4" />
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-16 z-20 w-[360px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                {user?.profile_url ? (
                  <img
                    src={user.profile_url}
                    alt="Profile"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {getAvatarLabel()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500">Profile details</p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>{user?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  <span className="break-all">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  <span>Company: {companyDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span className="capitalize">Role: {user?.role}</span>
                </div>
              </div>

              <form
                onSubmit={handleProfilePicUpload}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Edit Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProfileFile(e.target.files?.[0] || null)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  {profileFile && (
                    <p className="mt-1 text-xs text-slate-500">
                      Selected: {profileFile.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                  {isSavingProfile ? "Saving..." : "Upload New Picture"}
                </button>

                {profileError && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {profileError}
                  </p>
                )}

                {profileMessage && (
                  <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {profileMessage}
                  </p>
                )}
              </form>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </button>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {user?.role === "admin"
                    ? "Admin deletion removes your chat, uploaded documents, access records, and related company data."
                    : "Deleting your account removes your profile and access records."}
                </p>

                {deleteError && (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {deleteError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
