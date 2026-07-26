"use client";

import { useEffect, useMemo, useState } from "react";
import EmployeeLayout from "../../../components/EmployeeLayout";
import * as rewardApi from "../../../api/reward.api";
import { formatDate } from "../../../utils/formatDate";

const SOURCE_ICON = {
  "Employee of the Month": "military_tech",
  Bonus: "stars",
  Recognition: "volunteer_activism",
};

function iconFor(title = "") {
  const match = Object.keys(SOURCE_ICON).find((k) => title.toLowerCase().includes(k.toLowerCase()));
  return match ? SOURCE_ICON[match] : "task_alt";
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    rewardApi
      .getMyRewards()
      .then(setRewards)
      .catch((err) => setLoadError(err.message || "Couldn't load your rewards right now."))
      .finally(() => setIsLoading(false));
  }, []);

  const totalPoints = useMemo(() => rewards.reduce((sum, r) => sum + (r.points || 0), 0), [rewards]);

  const monthly = useMemo(() => {
    // Points earned per calendar month, most recent 6 months, oldest first.
    const now = new Date();
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString([], { month: "short" }), total: 0 });
    }
    rewards.forEach((r) => {
      const d = new Date(r.awardedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.total += r.points || 0;
    });
    const max = Math.max(1, ...buckets.map((b) => b.total));
    return buckets.map((b) => ({ ...b, heightPct: Math.round((b.total / max) * 100) }));
  }, [rewards]);

  return (
    <EmployeeLayout title="Rewards">
      {loadError && (
        <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md mb-6">
          {loadError}
        </div>
      )}

      <div className="space-y-gutter pb-12">
        {/* Points showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-7 bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
            <p className="font-label-md text-white/70 uppercase tracking-widest">Total Points Balance</p>
            <h3 className="text-[48px] font-bold mt-1">{isLoading ? "\u2014" : totalPoints.toLocaleString()}</h3>
            <p className="font-label-md text-white/70 mt-4">
              Points are awarded by your manager, HR, or CEO for great work.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-gutter">
            <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-[32px]">military_tech</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-primary">{rewards.length}</h4>
              <p className="font-label-md text-on-surface-variant">Rewards Earned</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mb-4 text-on-tertiary-container">
                <span className="material-symbols-outlined text-[32px]">trending_up</span>
              </div>
              <h4 className="font-headline-md text-headline-md text-primary">
                {monthly[monthly.length - 1]?.total || 0}
              </h4>
              <p className="font-label-md text-on-surface-variant">This Month</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Trend chart */}
          <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-outline-variant card-shadow">
            <h3 className="font-headline-md text-headline-md text-primary mb-1">Points Trend</h3>
            <p className="font-label-md text-on-surface-variant mb-8">Earnings over the last 6 months</p>
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {monthly.map((b) => (
                <div key={b.key} className="flex flex-col items-center w-full group">
                  <div
                    className="w-full bg-secondary-container rounded-t-lg transition-all group-hover:bg-primary"
                    style={{ height: `${Math.max(4, b.heightPct)}%` }}
                    title={`${b.label}: ${b.total} pts`}
                  />
                  <span className="mt-4 font-label-sm text-on-surface-variant">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeemable — not backed by a redeem endpoint yet */}
          <div className="lg:col-span-4 bg-tertiary p-8 rounded-xl text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary-fixed-dim">redeem</span>
                <h3 className="font-headline-md text-headline-md">Redeem Points</h3>
              </div>
              <p className="font-body-md text-white/70 mb-6">
                Points redemption for gift cards and perks isn't available yet.
              </p>
              <div className="text-[36px] font-bold">{totalPoints.toLocaleString()} <span className="text-body-lg text-white/50 font-normal">pts</span></div>
            </div>
            <button
              disabled
              className="mt-8 w-full py-4 bg-white/20 text-white rounded-xl font-label-md font-bold cursor-not-allowed"
              title="Coming soon"
            >
              Claim Rewards &mdash; Coming Soon
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
          <div className="px-8 py-6 border-b border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-primary">Earnings History</h3>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <p className="p-8 text-label-md text-on-surface-variant">Loading...</p>
            ) : rewards.length === 0 ? (
              <p className="p-8 text-label-md text-on-surface-variant">
                No rewards yet &mdash; they'll show up here once your manager or HR awards one.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm">
                    <th className="px-8 py-4 uppercase">Activity</th>
                    <th className="px-8 py-4 uppercase">Description</th>
                    <th className="px-8 py-4 uppercase">Date</th>
                    <th className="px-8 py-4 uppercase text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {rewards.map((r) => (
                    <tr key={r._id} className="hover:bg-surface-container transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">{iconFor(r.title)}</span>
                          </div>
                          <span className="font-body-md text-on-surface font-semibold">{r.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-label-md text-on-surface-variant">
                        {r.description || "\u2014"}
                      </td>
                      <td className="px-8 py-5 font-label-md text-on-surface-variant">
                        {formatDate(r.awardedAt)}
                      </td>
                      <td className="px-8 py-5 text-right font-headline-md text-label-md text-primary font-bold">
                        +{r.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Coming soon: catalog + peer kudos */}
        <div className="flex flex-col md:flex-row gap-gutter">
          <div className="flex-1 bg-surface-container-low p-8 rounded-xl border border-outline-variant flex items-center gap-6 opacity-70">
            <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
            </div>
            <div>
              <h4 className="font-headline-md text-label-md text-primary font-bold">Reward Store</h4>
              <p className="font-body-md text-label-md text-on-surface-variant mb-2">
                Browse gift cards and merchandise with your points.
              </p>
              <span className="text-label-sm text-on-surface-variant font-semibold">Coming soon</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-container-low p-8 rounded-xl border border-outline-variant flex items-center gap-6 opacity-70">
            <div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
              <span className="material-symbols-outlined text-[28px]">volunteer_activism</span>
            </div>
            <div>
              <h4 className="font-headline-md text-label-md text-primary font-bold">Recognize a Peer</h4>
              <p className="font-body-md text-label-md text-on-surface-variant mb-2">
                Give a shout-out to a teammate and reward them with points.
              </p>
              <span className="text-label-sm text-on-surface-variant font-semibold">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}