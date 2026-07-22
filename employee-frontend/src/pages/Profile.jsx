import { useEffect, useRef, useState } from "react";
import EmployeeLayout from "../layouts/EmployeeLayout";
import { useAuth } from "../context/AuthContext";
import * as userApi from "../api/user.api";
import * as attendanceApi from "../api/attendance.api";
import * as leaveApi from "../api/leave.api";
import * as rewardApi from "../api/reward.api";

function computeAttendanceStreak(records) {
  // records are sorted desc by date already (backend behavior).
  const presentDates = records
    .filter((r) => r.status === "present")
    .map((r) => new Date(r.date).toDateString());

  let streak = 0;
  let cursor = new Date();
  // Walk backwards day by day; streak breaks the first day with no present record.
  // (Weekends aren't modeled by the backend, so this counts consecutive calendar days.)
  while (presentDates.includes(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const [attendanceStreak, setAttendanceStreak] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    attendanceApi
      .getMyAttendance()
      .then((records) => setAttendanceStreak(computeAttendanceStreak(records)))
      .catch(() => setAttendanceStreak(0));

    leaveApi
      .getMyLeaveRequests()
      .then((requests) => setPendingLeaveCount(requests.filter((r) => r.status === "pending").length))
      .catch(() => setPendingLeaveCount(0));

    rewardApi
      .getMyRewards()
      .then((rewards) => setTotalPoints(rewards.reduce((sum, r) => sum + (r.points || 0), 0)))
      .catch(() => setTotalPoints(0));
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await userApi.updateUser(user.id, { name, phone });
      await refreshUser();
      setSaveFeedback({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setSaveFeedback({ type: "error", text: err.message || "Couldn't save your changes." });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setName(user.name || "");
    setPhone(user.phone || "");
    setSaveFeedback(null);
  }

  async function handleAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await userApi.uploadAvatar(user.id, file);
      await refreshUser();
    } catch (err) {
      setSaveFeedback({ type: "error", text: err.message || "Couldn't upload your photo." });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  }

  if (!user) return null;

  return (
    <EmployeeLayout title="Profile Settings">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Overview column */}
        <div className="lg:col-span-4 space-y-gutter">
          <section className="bg-white rounded-[16px] p-8 border border-outline-variant card-shadow text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full border-4 border-secondary-container overflow-hidden bg-surface-container-highest flex items-center justify-center">
                {user.avatarUrl ? (
                  <img className="w-full h-full object-cover" src={user.avatarUrl} alt={user.name} />
                ) : (
                  <span className="font-headline-lg text-headline-lg text-primary">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-60"
                type="button"
                aria-label="Change profile photo"
              >
                <span className="material-symbols-outlined text-sm">
                  {isUploadingAvatar ? "hourglass_top" : "photo_camera"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarPick}
              />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface">{user.name}</h3>
            <p className="text-on-surface-variant font-label-md mt-1">
              {user.designation || "No designation set"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-secondary-container text-primary font-label-sm capitalize">
                {user.role?.replace("_", " ")}
              </span>
              {user.department && (
                <span className="px-4 py-1.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm">
                  {user.department}
                </span>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[16px] p-6 border border-outline-variant card-shadow">
            <h4 className="font-label-md text-primary mb-6 border-b border-outline-variant/30 pb-4">
              Professional Details
            </h4>
            <div className="space-y-6">
              <DetailRow icon="badge" label="Employee ID" value={user.employeeId || "—"} />
              <DetailRow icon="lan" label="Department" value={user.department || "—"} />
              <DetailRow icon="work" label="Designation" value={user.designation || "—"} />
              <DetailRow
                icon="schedule"
                label="Employment Type"
                value={user.employmentType?.replace("_", " ") || "—"}
              />
            </div>
          </section>
        </div>

        {/* Account settings column */}
        <div className="lg:col-span-8 space-y-gutter">
          <section className="bg-white rounded-[16px] p-8 border border-outline-variant card-shadow">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-headline-md text-headline-md text-on-surface">Account Information</h4>
              <span className="text-on-surface-variant font-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                {user.status === "active" ? "Account Active" : "Account Inactive"}
              </span>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-6" onSubmit={handleSaveProfile}>
              <div className="md:col-span-1">
                <label className="block text-label-md text-on-surface mb-2">Full Name</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none transition-all font-body-md"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-label-md text-on-surface mb-2">Phone</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none transition-all font-body-md"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Not set"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-label-md text-on-surface mb-2">Email Address</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed outline-none font-body-md pr-10"
                    readOnly
                    type="email"
                    value={user.email}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                    lock
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1">Read-only contact email</p>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-outline-variant/30 mt-2">
                <h5 className="font-label-md text-primary mb-4">Security</h5>
              </div>

              <div className="md:col-span-2">
                <label className="block text-label-md text-on-surface mb-2">Password</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    className="flex-grow px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed outline-none font-body-md"
                    readOnly
                    type="password"
                    value="********"
                  />
                  <button
                    className="px-6 py-3 bg-surface-container-high text-on-surface-variant font-label-md rounded-lg whitespace-nowrap cursor-not-allowed"
                    type="button"
                    disabled
                    title="Password changes aren't available yet — this needs a backend endpoint first."
                  >
                    Update Password
                  </button>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  Password changes aren't wired up yet — the backend doesn't expose that endpoint.
                </p>
              </div>

              {saveFeedback && (
                <div className="md:col-span-2">
                  <p
                    className={`text-label-sm ${
                      saveFeedback.type === "success" ? "text-primary" : "text-error"
                    }`}
                  >
                    {saveFeedback.text}
                  </p>
                </div>
              )}

              <div className="md:col-span-2 pt-4 flex justify-end gap-4">
                <button
                  className="px-8 py-3 text-on-surface-variant font-label-md hover:bg-surface-container rounded-lg transition-colors"
                  type="button"
                  onClick={handleDiscard}
                >
                  Discard Changes
                </button>
                <button
                  className="px-8 py-3 bg-primary text-white font-label-md rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <StatCard
              label="Pending Leave Requests"
              value={pendingLeaveCount}
              unitLabel="Awaiting review"
              icon="beach_access"
              iconBg="bg-secondary-container"
              iconColor="text-primary"
            />
            <StatCard
              label="Attendance Streak"
              value={attendanceStreak}
              unitLabel="Consecutive days"
              icon="local_fire_department"
              iconBg="bg-tertiary-fixed"
              iconColor="text-tertiary"
            />
          </div>

          <div className="bg-white rounded-[16px] p-6 border border-outline-variant card-shadow flex items-center justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant">Total Reward Points</p>
              <h5 className="text-[28px] font-bold text-primary mt-1">
                {totalPoints}
                <span className="text-label-md font-medium text-on-secondary-container ml-2">pts earned</span>
              </h5>
            </div>
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">stars</span>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p className="font-label-md text-on-surface capitalize">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, unitLabel, icon, iconBg, iconColor }) {
  return (
    <section className="bg-white rounded-[16px] p-6 border border-outline-variant card-shadow flex items-center justify-between">
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <h5 className="text-[28px] font-bold text-primary mt-1">
          {value} <span className="text-label-md font-medium text-on-secondary-container">{unitLabel}</span>
        </h5>
      </div>
      <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${iconColor} text-[28px]`}>{icon}</span>
      </div>
    </section>
  );
}
