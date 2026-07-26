"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeLayout from "../../../components/EmployeeLayout";
import * as attendanceApi from "../../../api/attendance.api";
import * as leaveApi from "../../../api/leave.api";
import { formatTime } from "../../../utils/formatDate";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_BADGE = {
  present: "bg-green-100 text-green-800",
  absent: "bg-error-container text-error",
  half_day: "bg-secondary-container text-on-secondary-container",
  leave: "bg-tertiary-container text-on-tertiary-container",
};

const LEAVE_STATUS_BADGE = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-secondary-container text-secondary",
  rejected: "bg-error-container text-error",
};

const LEAVE_TYPES = [
  { value: "paid", label: "Paid / Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

function monthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleDateString([], { month: "long", year: "numeric" });
}

// Monday-first calendar grid: an array of weeks, each an array of { date, inMonth }.
function buildCalendarGrid(month, year) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const gridStart = new Date(year, month - 1, 1 - startOffset);

  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cursor), inMonth: cursor.getMonth() === month - 1 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month - 1 && cursor > firstOfMonth) break;
  }
  return weeks;
}

function dateKey(d) {
  return d.toDateString();
}

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [records, setRecords] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]); // unfiltered, for the hours-worked chart
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [todaysAttendance, setTodaysAttendance] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [leaveForm, setLeaveForm] = useState({ type: "paid", startDate: "", endDate: "", reason: "" });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState(null);

  useEffect(() => {
    loadMonth(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  useEffect(() => {
    loadShared();
  }, []);

  async function loadShared() {
    try {
      const [allRecords, requests] = await Promise.all([
        attendanceApi.getMyAttendance().catch(() => []),
        leaveApi.getMyLeaveRequests().catch(() => []),
      ]);
      setRecentRecords(allRecords);
      setLeaveRequests(requests);

      const today = new Date().toDateString();
      setTodaysAttendance(allRecords.find((r) => new Date(r.date).toDateString() === today) || null);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your attendance right now.");
    }
  }

  async function loadMonth(m, y) {
    setIsLoading(true);
    try {
      const monthRecords = await attendanceApi.getMyAttendance({ month: m, year: y });
      setRecords(monthRecords);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your attendance right now.");
    } finally {
      setIsLoading(false);
    }
  }

  const recordsByDay = useMemo(() => {
    const map = new Map();
    records.forEach((r) => map.set(dateKey(new Date(r.date)), r));
    return map;
  }, [records]);

  const weeks = useMemo(() => buildCalendarGrid(month, year), [month, year]);

  function goToPrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  async function handleCheckIn() {
    setIsCheckingIn(true);
    setLoadError(null);
    try {
      const record = await attendanceApi.checkIn();
      setTodaysAttendance(record);
      await Promise.all([loadMonth(month, year), loadShared()]);
    } catch (err) {
      setLoadError(err.message || "Couldn't check in right now.");
    } finally {
      setIsCheckingIn(false);
    }
  }

  async function handleCheckOut() {
    setIsCheckingOut(true);
    setLoadError(null);
    try {
      const record = await attendanceApi.checkOut();
      setTodaysAttendance(record);
      await Promise.all([loadMonth(month, year), loadShared()]);
    } catch (err) {
      setLoadError(err.message || "Couldn't check out right now.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function handleSubmitLeave(e) {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) return;
    setIsSubmittingLeave(true);
    setLeaveFeedback(null);
    try {
      const created = await leaveApi.createLeaveRequest(leaveForm);
      setLeaveRequests((prev) => [created, ...prev]);
      setLeaveForm({ type: "paid", startDate: "", endDate: "", reason: "" });
      setLeaveFeedback({ type: "success", text: "Leave request submitted." });
    } catch (err) {
      setLeaveFeedback({ type: "error", text: err.message || "Couldn't submit your request." });
    } finally {
      setIsSubmittingLeave(false);
    }
  }

  // ---- Stats (derived from records for the selected month) ----
  const stats = useMemo(() => {
    const monthRecords = records;
    const presentLike = monthRecords.filter((r) => r.status === "present" || r.status === "half_day");
    const totalWeighted = monthRecords.reduce((sum, r) => {
      if (r.status === "present") return sum + 1;
      if (r.status === "half_day") return sum + 0.5;
      return sum;
    }, 0);
    const scorePct = monthRecords.length ? Math.round((totalWeighted / monthRecords.length) * 100) : null;

    const withCheckIn = monthRecords.filter((r) => r.checkIn);
    const avgLoginMs = withCheckIn.length
      ? withCheckIn.reduce((sum, r) => {
          const t = new Date(r.checkIn);
          return sum + (t.getHours() * 60 + t.getMinutes()) * 60000;
        }, 0) / withCheckIn.length
      : null;
    const avgLoginLabel =
      avgLoginMs === null
        ? "--:--"
        : new Date(avgLoginMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

    const lateDays = withCheckIn.filter((r) => {
      const t = new Date(r.checkIn);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 30);
    }).length;

    return { scorePct, avgLoginLabel, lateDays, presentDays: presentLike.length, totalDays: monthRecords.length };
  }, [records]);

  const hoursChart = useMemo(() => {
    const withBoth = [...recentRecords]
      .filter((r) => r.checkIn && r.checkOut)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
    const entries = withBoth.map((r) => ({
      date: new Date(r.date),
      hours: Math.max(0, (new Date(r.checkOut) - new Date(r.checkIn)) / 3600000),
    }));
    const maxHours = Math.max(10, ...entries.map((r) => r.hours));
    return { entries, maxHours };
  }, [recentRecords]);

  return (
    <EmployeeLayout title="Attendance & Time">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {loadError}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <p className="font-body-md text-on-surface-variant">Track your presence and manage leave schedules.</p>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl border border-outline-variant shadow-sm">
          {todaysAttendance?.checkIn && !todaysAttendance?.checkOut ? (
            <>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </div>
              <span className="font-label-md text-on-surface font-semibold">
                Checked in at {formatTime(todaysAttendance.checkIn)}
              </span>
              <button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="ml-2 text-label-md font-semibold text-primary disabled:opacity-60"
              >
                {isCheckingOut ? "Checking out..." : "Check Out"}
              </button>
            </>
          ) : todaysAttendance?.checkOut ? (
            <>
              <span className="material-symbols-outlined text-green-600">task_alt</span>
              <span className="font-label-md text-on-surface font-semibold">
                Done for today — {formatTime(todaysAttendance.checkIn)} to {formatTime(todaysAttendance.checkOut)}
              </span>
            </>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="flex items-center gap-2 text-label-md font-semibold text-primary disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">fingerprint</span>
              {isCheckingIn ? "Checking in..." : "Check In"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[16px] border border-outline-variant p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">Attendance Calendar</h3>
              <p className="font-label-md text-on-surface-variant">
                Showing activity for <span className="font-bold">{monthLabel(month, year)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 hover:bg-surface-container rounded-lg border border-outline-variant transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-surface-container rounded-lg border border-outline-variant transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-outline-variant border border-outline-variant rounded-xl overflow-hidden">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="bg-surface-container-high py-3 text-center font-label-md text-secondary uppercase tracking-wider"
              >
                {label}
              </div>
            ))}
            {weeks.flat().map(({ date, inMonth }, idx) => {
              const record = recordsByDay.get(dateKey(date));
              const isToday = dateKey(date) === dateKey(now);
              return (
                <div
                  key={idx}
                  className={`min-h-[90px] p-2 font-bold flex flex-col justify-between ${
                    inMonth ? "bg-white" : "bg-surface-container-low text-on-surface-variant/30"
                  } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                >
                  <span className={!inMonth ? "font-normal" : ""}>{date.getDate()}</span>
                  {isToday && !record && (
                    <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold self-start">
                      TODAY
                    </span>
                  )}
                  {record && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold self-start uppercase ${
                        STATUS_BADGE[record.status] || "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {record.status.replace("_", " ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {isLoading && <p className="mt-4 text-label-sm text-on-surface-variant">Loading month...</p>}
        </div>

        {/* Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-primary-container text-white rounded-[16px] p-8 relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h3 className="font-headline-sm text-headline-sm mb-1">Monthly Score</h3>
              <p className="font-body-md text-white/80 mb-6">Attendance consistency this month</p>
              <div className="flex items-end gap-4">
                <span className="text-[56px] font-extrabold leading-none">
                  {stats.scorePct === null ? "--" : `${stats.scorePct}%`}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between font-label-sm">
                  <span>
                    {stats.presentDays} present / {stats.totalDays} logged
                  </span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-1000 ease-out"
                    style={{ width: `${stats.scorePct ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">login</span>
              </div>
              <span className="text-[20px] font-bold text-primary">{stats.avgLoginLabel}</span>
              <span className="text-label-sm text-on-surface-variant">Avg. Login</span>
            </div>
            <div className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-error-container text-error rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">timer_off</span>
              </div>
              <span className="text-[20px] font-bold text-primary">{stats.lateDays}</span>
              <span className="text-label-sm text-on-surface-variant">Late Days</span>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-[16px] p-6">
            <h4 className="font-label-md text-primary font-bold mb-4 uppercase tracking-tighter">
              Hours Worked (recent)
            </h4>
            {hoursChart.entries.length === 0 ? (
              <p className="text-label-sm text-on-surface-variant">No completed shifts yet.</p>
            ) : (
              <div className="flex items-end justify-between h-24 gap-2 px-2">
                {hoursChart.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="w-4 bg-primary hover:opacity-80 transition-all cursor-pointer rounded-t-sm"
                    style={{ height: `${Math.max(4, (entry.hours / hoursChart.maxHours) * 100)}%` }}
                    title={`${entry.date.toLocaleDateString([], { weekday: "short" })}: ${entry.hours.toFixed(1)}h`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leave request form + list */}
        <div className="col-span-12 grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant rounded-[16px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">flight_takeoff</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">New Leave Request</h3>
            </div>
            <form className="space-y-6" onSubmit={handleSubmitLeave}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">From Date</label>
                  <input
                    className="w-full border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3"
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">To Date</label>
                  <input
                    className="w-full border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3"
                    type="date"
                    value={leaveForm.endDate}
                    min={leaveForm.startDate || undefined}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant">Leave Category</label>
                <select
                  className="w-full border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 font-body-md p-3"
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant">Reason for Leave</label>
                <textarea
                  className="w-full border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3 resize-none"
                  placeholder="Describe the reason for your request..."
                  rows={4}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
              {leaveFeedback && (
                <p className={`text-label-sm ${leaveFeedback.type === "success" ? "text-primary" : "text-error"}`}>
                  {leaveFeedback.text}
                </p>
              )}
              <button
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm font-bold shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={isSubmittingLeave || !leaveForm.startDate || !leaveForm.endDate}
              >
                {isSubmittingLeave ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant rounded-[16px] overflow-hidden flex flex-col shadow-sm">
            <div className="p-8 border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary">Recent Leave Requests</h3>
              <p className="font-body-md text-on-surface-variant">Monitor the status of your applications.</p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[420px]">
              {leaveRequests.length === 0 ? (
                <p className="p-8 text-label-md text-on-surface-variant">No leave requests yet.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low sticky top-0">
                    <tr>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight">Period</th>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight">Type</th>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {leaveRequests.map((req) => {
                      const start = new Date(req.startDate);
                      const end = new Date(req.endDate);
                      const days = Math.round((end - start) / 86400000) + 1;
                      return (
                        <tr
                          key={req._id}
                          className="hover:bg-surface-container-low transition-colors"
                          title={req.reason || ""}
                        >
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">
                                {start.toLocaleDateString([], { month: "short", day: "numeric" })} -{" "}
                                {end.toLocaleDateString([], { month: "short", day: "numeric" })}
                              </span>
                              <span className="text-label-sm text-on-surface-variant">
                                {days} day{days === 1 ? "" : "s"} total
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-body-md text-on-surface capitalize">{req.type}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={`px-4 py-1.5 rounded-full text-label-sm font-bold capitalize ${
                                LEAVE_STATUS_BADGE[req.status] || "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
