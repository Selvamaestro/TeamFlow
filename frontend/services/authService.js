import api from "@/lib/api";

const authService = {
    getProfile() {
        return api.get("/auth/me");
    },

    updateProfile(data) {
        return api.put("/auth/profile", data);
    },

    changePassword(data) {
        return api.put("/auth/change-password", data);
    },

    uploadAvatar(formData) {
        return api.post("/auth/upload-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default authService;