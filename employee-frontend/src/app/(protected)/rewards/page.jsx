"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeLayout from "../../../components/EmployeeLayout";
import * as rewardApi from "../../../api/reward.api";
import { formatDate } from "../../../utils/formatDate";

const TIERS = [
  { min: 20000, label: "Platinum Elite", icon: "workspace_premium" },
  { min: 10000, label: "Gold Elite", icon: "military_tech" },
  { min: 5000, label: "Silver Achiever", icon: "military_tech" },
  { min: 0, label: "Rising Talent", icon: "military_tech" },
];

function tierFor(points) {
  return TIERS.find((t) => points >= t.min) || TIERS[TIERS.length - 1];
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await rewardApi.getMyRewards();
      setRewards(list);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your rewards right now.");
    } finally {
      setIsLoading(false);
    }
  }

  const totalPoints = useMemo(() => rewards.reduce((sum, r) => sum + (r.points || 0), 0), [rewards]);

  const thisMonthPoints = useMemo(() => {
    const key = monthKey(new Date());
    return rewards.filter((r) => monthKey(r.awardedAt) === key).reduce((sum, r) => sum + (r.points || 0), 0);
  }, [rewards]);

  const tier = tierFor(totalPoints);
  const nextTier = [...TIERS].reverse().find((t) => t.min > totalPoints);

  // Last 6 months trend, oldest first.
  const trend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: d.toLocaleDateString([], { month: "short" }), points: 0 });
    }
    const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
    rewards.forEach((r) => {
      const key = monthKey(r.awardedAt);
      if (byKey[key]) byKey[key].points += r.points || 0;
    });
    const maxPoints = Math.max(1, ...months.map((m) => m.points));
    return { months, maxPoints };
  }, [rewards]);

  return (
    <EmployeeLayout title="Reward Center">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <p className="font-label-md text-on-surface-variant">Loading rewards...</p>
      ) : (
        <div className="space-y-gutter pb-12">
          {/* Points showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-7 bg-primary-container p-8 rounded-xl flex flex-col justify-between relative overflow-hidden text-white shadow-sm">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-label-md text-label-md text-white/70 uppercase tracking-widest">
                      Total Points Balance
                    </p>
                    <h3 className="font-display-lg text-display-lg mt-1">{totalPoints.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                    <span className="material-symbols-outlined text-[32px]">stars</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1 font-label-md text-label-md bg-white/10 px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    {thisMonthPoints >= 0 ? "+" : ""}
                    {thisMonthPoints.toLocaleString()} this month
                  </span>
                  {nextTier && (
                    <span className="font-label-md text-label-md">
                      Next tier: {nextTier.label} at {nextTier.min.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {nextTier && (
                <div className="mt-12 relative z-10">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full"
                      style={{ width: `${Math.min(100, Math.round((totalPoints / nextTier.min) * 100))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-gutter">
              <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-[36px]">{tier.icon}</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">{tier.label}</h4>
                <p className="font-label-md text-label-md text-on-surface-variant">Current Level</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mb-4 text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[36px]">workspace_premium</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-primary">{rewards.length}</h4>
                <p className="font-label-md text-label-md text-on-surface-variant">Recognitions Earned</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Trend chart */}
            <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary">Points Trend</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    Your earnings activity over the last 6 months
                  </p>
                </div>
              </div>
              {totalPoints === 0 ? (
                <p className="text-label-md text-on-surface-variant">No recognitions recorded yet.</p>
              ) : (
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                  {trend.months.map((m) => (
                    <div key={m.key} className="flex flex-col items-center w-full group">
                      <div
                        className="w-full bg-secondary-container rounded-t-lg transition-all group-hover:bg-primary"
                        style={{ height: `${Math.max(4, (m.points / trend.maxPoints) * 100)}%` }}
                        title={`${m.label}: ${m.points.toLocaleString()} pts`}
                      />
                      <span className="mt-4 font-label-sm text-label-sm text-on-surface-variant">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-gutter">
              <div className="bg-tertiary p-8 rounded-xl text-white flex-1 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-tertiary-fixed-dim">redeem</span>
                    <h3 className="font-headline-md text-headline-md">Your Balance</h3>
                  </div>
                  <p className="font-body-md text-body-md text-white/70 mb-6">
                    Points earned from project milestones, peer recognition, and company rewards.
                  </p>
                  <div className="text-display-lg font-bold">
                    {totalPoints.toLocaleString()} <span className="text-body-lg text-white/50 font-normal">pts</span>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    disabled
                    title="Redemption isn't wired up to a store yet — this is a running total of what you've earned."
                    className="w-full py-4 bg-white/20 text-white rounded-xl font-headline-md text-label-md font-bold cursor-not-allowed"
                  >
                    Redemption coming soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings history */}
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-primary">Earnings History</h3>
            </div>
            {rewards.length === 0 ? (
              <p className="p-8 text-label-md text-on-surface-variant">
                Nothing here yet — recognitions from your manager, HR, or leadership will show up here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                      <th className="px-8 py-4 uppercase">Activity</th>
                      <th className="px-8 py-4 uppercase">Awarded By</th>
                      <th className="px-8 py-4 uppercase">Date</th>
                      <th className="px-8 py-4 uppercase text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {rewards.map((r) => (
                      <tr key={r._id} className="hover:bg-surface-container transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
                              <span className="material-symbols-outlined text-[18px]">military_tech</span>
                            </div>
                            <div>
                              <span className="font-body-md text-body-md text-on-surface font-semibold block">
                                {r.title}
                              </span>
                              {r.description && (
                                <span className="text-label-sm text-on-surface-variant">{r.description}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-label-md text-label-md text-on-surface-variant capitalize">
                          {r.awardedBy?.name || "System"}
                        </td>
                        <td className="px-8 py-5 font-label-md text-label-md text-on-surface-variant">
                          {formatDate(r.awardedAt)}
                        </td>
                        <td className="px-8 py-5 text-right font-headline-md text-label-md text-primary font-bold">
                          +{(r.points || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}
