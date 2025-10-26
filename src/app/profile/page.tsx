"use client";
import { useSession } from "next-auth/react";
import { Mail, Phone, MapPin, Calendar, User, Edit2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import AvatarUpload from "@/components/ui/avatar-upload";
import Link from "next/link";

const ProfilePage = () => {
  const { data: session } = useSession();

  const [userData, setUserData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Memoize the fetch function to prevent recreation on every render
  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize the user ID to prevent unnecessary effect triggers
  const userId = useMemo(() => session?.user?.id, [session?.user?.id]);

  React.useEffect(() => {
    if (userId && !userData) {
      fetchProfile(userId);
    }
  }, [userId, userData, fetchProfile]);

  // Function to manually refresh profile data
  const refreshProfile = useCallback(() => {
    if (userId) {
      setUserData(null); // Clear existing data to force refresh
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  // Handle avatar change
  const handleAvatarChange = useCallback(
    (newAvatarUrl: string | null) => {
      if (userData) {
        setUserData({
          ...userData,
          profile: {
            ...userData.profile,
            avatarUrl: newAvatarUrl,
          },
        });
      }
      setIsEditingAvatar(false);
    },
    [userData]
  );

  // Memoize profile sections to prevent unnecessary re-renders
  const profileCard = useMemo(() => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {isEditingAvatar ? (
              <AvatarUpload
                currentAvatarUrl={userData.profile?.avatarUrl}
                displayName={userData.profile?.displayName}
                email={userData.email}
                size="xl"
                onAvatarChange={handleAvatarChange}
                className="items-center"
              />
            ) : (
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
                  {userData.profile?.avatarUrl ? (
                    <img
                      src={userData.profile.avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    `${
                      userData.profile?.displayName?.[0] ||
                      userData.email?.[0] ||
                      "U"
                    }`
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>

                {/* Edit avatar button */}
                <button
                  onClick={() => setIsEditingAvatar(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change avatar"
                >
                  <Edit2 className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>

          {!isEditingAvatar && (
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {userData.profile?.displayName || userData.email}
                </h2>
                —
                <p className="text-gray-600 capitalize">
                  {userData.role?.toLowerCase()}
                </p>
                <button
                  onClick={() => setIsEditingAvatar(true)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Edit avatar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {userData.profile?.bio && (
                <div className="py-2 italic">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{userData.profile.bio}"
                  </p>
                </div>
              )}
              {userData.profile?.isCreator && (
                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-1">
                  Content Creator
                </span>
              )}
              <p className="text-gray-500 text-sm">
                Status:{" "}
                <span className="capitalize">
                  {userData.status?.toLowerCase()}
                </span>
              </p>
            </div>
          )}
        </div>

        {isEditingAvatar && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsEditingAvatar(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }, [userData, isEditingAvatar, handleAvatarChange]);

  const personalInfo = useMemo(() => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Personal Information
          </h3>
          <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Edit2 size={16} />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Display Name
            </label>
            <p className="text-gray-800 font-medium">
              {userData.profile?.displayName || "Not set"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Email Address
            </label>
            <p className="text-gray-800 font-medium">{userData.email}</p>
            {userData.emailVerified && (
              <span className="text-green-600 text-xs">✓ Verified</span>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              User Role
            </label>
            <p className="text-gray-800 font-medium capitalize">
              {userData.role?.toLowerCase()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Account Status
            </label>
            <p className="text-gray-800 font-medium capitalize">
              {userData.status?.toLowerCase()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Member Since
            </label>
            <p className="text-gray-800 font-medium">
              {new Date(userData.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Last Login
            </label>
            <p className="text-gray-800 font-medium">
              {userData.lastLoginAt
                ? new Date(userData.lastLoginAt).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [userData]);

  const creatorInfo = useMemo(() => {
    if (!userData?.profile?.isCreator) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Creator Information
          </h3>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
            <Edit2 size={16} />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Category</label>
            <p className="text-gray-800 font-medium">
              {userData.profile.category || "Not specified"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Language</label>
            <p className="text-gray-800 font-medium">
              {userData.profile.language || "Not specified"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Total Streams
            </label>
            <p className="text-gray-800 font-medium">
              {userData._count?.streams || 0}
            </p>
          </div>
        </div>
      </div>
    );
  }, [userData]);

  const walletActivity = useMemo(() => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Wallet & Activity
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Wallet Balance
            </label>
            <p className="text-gray-800 font-medium text-lg">
              {userData.wallet
                ? `${userData.wallet.balance} Tokens`
                : // ? `${userData.wallet.balance} ${userData.wallet.currency}`
                  "No wallet"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Payment History
            </label>
            <p className="text-gray-800 font-medium underline">
              <Link href={`/profile/${userData.id}/payments`}>view all</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }, [userData]);

  const accountSettings = useMemo(() => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Account Settings
          </h3>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
            <Edit2 size={16} />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Account ID
            </label>
            <p className="text-gray-800 font-mono text-sm">{userData.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Authentication Method
            </label>
            <p className="text-gray-800 font-medium">
              {userData.googleId
                ? "Google OAuth"
                : userData.appleId
                ? "Apple OAuth"
                : "Email & Password"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
          {userData && (
            <button
              onClick={refreshProfile}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          )}
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        ) : userData ? (
          <>
            {profileCard}
            {personalInfo}
            {creatorInfo}
            {walletActivity}
            {accountSettings}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Failed to load profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
