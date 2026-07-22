import axiosClient from "./axiosClient";

// GET /api/rewards/me -> { rewards: [...] }
export function getMyRewards() {
  return axiosClient.get("/rewards/me").then((res) => res.data.rewards);
}
