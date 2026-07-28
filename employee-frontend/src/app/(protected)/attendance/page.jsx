"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import EmployeeLayout from "../../../components/EmployeeLayout";
import * as attendanceApi from "../../../api/attendance.api";
import * as leaveApi from "../../../api/leave.api";
import { formatDate, formatTime } from "../../../utils/formatDate";

const LEAVE_TYPES = [
  { value: "paid", label: "Paid Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

const STATUS_BADGE = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-secondary-container text-secondary",
  rejected: "bg-error-container text-error",
};

const DAY_BADGE = {
  present: "bg-green-100 text-green-800",
  absent: "bg-error-container text-error",
  half_day: "bg-blue-100 text-blue-800",
  leave: "bg-tertiary-fixed text-tertiary",
};

function startOfDay(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildCalendarWeeks(year, month, recordsByDay) {
  // month is 0-indexed. Monday-first grid, matching the mockup.
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, record: recordsByDay[day] || null });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function AttendancePage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isCheckingInOut, setIsCheckingInOut] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeave, setIsLoadingLeave] = useState(true);
  const [leaveForm, setLeaveForm] = useState({ type: "paid", startDate: "", endDate: "", reason: "" });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState(null);

  const loadAttendance = useCallback(async () => {
    setIsLoadingRecords(true);
    setAttendanceError(null);
    try {
      const list = await attendanceApi.getMyAttendance({ month: viewMonth + 1, year: viewYear });
      setRecords(list);

      const todayStr = new Date().toDateString();
      setTodayRecord(list.find((r) => new Date(r.date).toDateString() === todayStr) || null);
    } catch (err) {
      setAttendanceError(err.message || "Couldn't load attendance records.");
    } finally {
      setIsLoadingRecords(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    setIsLoadingLeave(true);
    leaveApi
      .getMyLeaveRequests()
      .then(setLeaveRequests)
      .catch(() => setLeaveRequests([]))
      .finally(() => setIsLoadingLeave(false));
  }, []);

  const recordsByDay = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        map[d.getDate()] = r;
      }
    });
    return map;
  }, [records, viewYear, viewMonth]);

  const weeks = useMemo(
    () => buildCalendarWeeks(viewYear, viewMonth, recordsByDay),
    [viewYear, viewMonth, recordsByDay]
  );

  // Mirror the admin panel's day-by-day logic: walk every day in the
  // viewed month up to "today" (inclusive), classifying each one as
  // present, absent, or leave. A past day with no record must NOT be
  // silently excluded (that's what inflated the rate before) — it
  // counts as absent. Future days are excluded from the denominator
  // entirely since they haven't happened yet.
  const attendanceStats = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStart = startOfDay(today);

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = startOfDay(new Date(viewYear, viewMonth, day));
      if (cellDate > todayStart) continue; // future day — not counted yet

      const record = recordsByDay[day];

      if (record) {
        if (record.status === "present" || record.status === "half_day") {
          presentCount++;
        } else if (record.status === "leave") {
          leaveCount++;
        } else {
          absentCount++; // explicit "absent" or other non-present status
        }
      } else {
        absentCount++; // past day, no record at all = absent
      }
    }

    // Leave days sit outside the working-day base, same as the admin panel.
    const workingDays = presentCount + absentCount;
    const rate = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 0;

    return { presentCount, absentCount, leaveCount, workingDays, rate };
  }, [viewYear, viewMonth, recordsByDay, today]);

  const presentDays = attendanceStats.presentCount;
  const attendanceRate = attendanceStats.rate;

  function shiftMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  async function handleCheckIn() {
    setIsCheckingInOut(true);
    setAttendanceError(null);
    try {
      const record = await attendanceApi.checkIn();
      setTodayRecord(record);
      loadAttendance();
    } catch (err) {
      setAttendanceError(err.message || "Couldn't check in.");
    } finally {
      setIsCheckingInOut(false);
    }
  }

  async function handleCheckOut() {
    setIsCheckingInOut(true);
    setAttendanceError(null);
    try {
      const record = await attendanceApi.checkOut();
      setTodayRecord(record);
      loadAttendance();
    } catch (err) {
      setAttendanceError(err.message || "Couldn't check out.");
    } finally {
      setIsCheckingInOut(false);
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
      setLeaveFeedback({ type: "error", text: err.message || "Couldn't submit that request." });
    } finally {
      setIsSubmittingLeave(false);
    }
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <EmployeeLayout title="Attendance & Time">
      {attendanceError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {attendanceError}
        </div>
      )}

      <div className="grid grid-cols-12 gap-gutter">
        {/* Calendar */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[16px] border border-outline-variant p-8 card-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">Attendance Calendar</h3>
              <p className="font-label-md text-on-surface-variant">
                Showing activity for <span className="font-bold">{monthLabel}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-2 hover:bg-surface-container rounded-lg border border-outline-variant transition-all"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="p-2 hover:bg-surface-container rounded-lg border border-outline-variant transition-all"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {isLoadingRecords ? (
            <p className="font-label-md text-on-surface-variant">Loading calendar...</p>
          ) : (
            <div className="border border-outline-variant rounded-xl overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-outline-variant">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="bg-surface-container-high py-3 text-center font-label-md text-secondary uppercase tracking-wider text-label-sm"
                  >
                    {d}
                  </div>
                ))}
                {weeks.flat().map((cell, idx) => {
                  const isToday =
                    cell &&
                    viewYear === today.getFullYear() &&
                    viewMonth === today.getMonth() &&
                    cell.day === today.getDate();

                  // A day is only "absent" if it's already in the past (before today)
                  // and no attendance record exists for it. Future days and today
                  // (before check-in) should stay neutral, not red.
                  const cellDate = cell ? new Date(viewYear, viewMonth, cell.day) : null;
                  const isPast = cellDate && startOfDay(cellDate) < startOfDay(today);
                  const isMissedDay = cell && !cell.record && isPast;

                  return (
                    <div
                      key={idx}
                      className={`bg-surface-container-lowest min-h-[90px] p-2 font-bold flex flex-col justify-between ${
                        !cell ? "bg-surface-container-low text-on-surface-variant/30" : ""
                      } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
                    >
                      {cell && (
                        <>
                          <span>{cell.day}</span>
                          {isToday && !cell.record && (
                            <div className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold self-start">
                              TODAY
                            </div>
                          )}
                          {cell.record && (
                            <div
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold self-start ${
                                DAY_BADGE[cell.record.status] || DAY_BADGE.absent
                              }`}
                            >
                              {cell.record.status.replace("_", " ").toUpperCase()}
                            </div>
                          )}
                          {isMissedDay && (
                            <div className="text-[10px] px-2 py-0.5 rounded-full font-bold self-start bg-error-container text-error">
                              ABSENT
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Score + check in/out */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-primary-container text-white rounded-[16px] p-8 relative overflow-hidden">
            <h3 className="font-headline-sm text-headline-sm mb-1">Monthly Attendance Rate</h3>
            <p className="font-body-md text-white/70 mb-6">{presentDays} present days this month</p>
            <div className="flex items-end gap-4">
              <span className="text-[56px] font-extrabold leading-none">{attendanceRate}%</span>
            </div>
            <div className="mt-8 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-1000 ease-out"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-[16px] p-6 card-shadow">
            <h4 className="font-label-md text-primary font-bold mb-4">Today</h4>
            {todayRecord ? (
              <div className="space-y-3">
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface-variant">Check-in</span>
                  <span className="text-on-surface font-semibold">{formatTime(todayRecord.checkIn)}</span>
                </div>
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface-variant">Check-out</span>
                  <span className="text-on-surface font-semibold">{formatTime(todayRecord.checkOut)}</span>
                </div>
                {!todayRecord.checkOut && (
                  <button
                    onClick={handleCheckOut}
                    disabled={isCheckingInOut}
                    className="w-full bg-primary text-white py-3 rounded-xl font-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isCheckingInOut ? "Please wait..." : "Check Out"}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isCheckingInOut}
                className="w-full bg-primary text-white py-3 rounded-xl font-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                {isCheckingInOut ? "Please wait..." : "Check In"}
              </button>
            )}
          </div>
        </div>

        {/* Leave request form + list */}
        <div className="col-span-12 grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant rounded-[16px] p-8 card-shadow">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">flight_takeoff</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">New Leave Request</h3>
            </div>
            <form onSubmit={handleSubmitLeave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">From Date</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant">To Date</label>
                  <input
                    required
                    type="date"
                    className="w-full border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant">Leave Category</label>
                <select
                  className="w-full border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 font-body-md p-3"
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
                  className="w-full border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-body-md p-3 resize-none"
                  placeholder="Describe the reason for your request..."
                  rows={4}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </div>
              {leaveFeedback && (
                <p
                  className={`text-label-sm ${
                    leaveFeedback.type === "success" ? "text-primary" : "text-error"
                  }`}
                >
                  {leaveFeedback.text}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmittingLeave}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm font-bold shadow-lg hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmittingLeave ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant rounded-[16px] overflow-hidden flex flex-col card-shadow">
            <div className="p-8 border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary">Recent Leave Requests</h3>
              <p className="font-body-md text-on-surface-variant">
                Monitor status of your previous applications.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[420px]">
              {isLoadingLeave ? (
                <p className="p-8 text-label-md text-on-surface-variant">Loading...</p>
              ) : leaveRequests.length === 0 ? (
                <p className="p-8 text-label-md text-on-surface-variant">
                  You haven't submitted any leave requests yet.
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low sticky top-0">
                    <tr>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight text-label-sm">
                        Period
                      </th>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight text-label-sm">
                        Type
                      </th>
                      <th className="px-8 py-4 font-label-md text-secondary uppercase tracking-tight text-label-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {leaveRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-on-surface">
                              {formatDate(req.startDate)} - {formatDate(req.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-body-md text-on-surface capitalize">{req.type}</td>
                        <td className="px-8 py-6">
                          <span
                            className={`px-4 py-1.5 rounded-full text-label-sm font-bold capitalize ${
                              STATUS_BADGE[req.status] || STATUS_BADGE.pending
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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