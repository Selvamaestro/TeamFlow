/**
 * Helper function to construct full avatar URL for profile pictures.
 * Prepends backend URL if path is relative (e.g. /uploads/...)
 * Falls back to UI-Avatars if no avatar exists.
 */
export function getAvatarUrl(userOrUrl, fallbackName = "User") {
    if (!userOrUrl) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0D8ABC&color=fff`;
    }

    let avatarPath = "";
    let displayName = fallbackName;

    if (typeof userOrUrl === "string") {
        avatarPath = userOrUrl;
    } else if (typeof userOrUrl === "object") {
        avatarPath = userOrUrl.avatarUrl || userOrUrl.avatar || "";
        displayName = userOrUrl.name || fallbackName;
    }

    if (!avatarPath) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
    }

    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://") || avatarPath.startsWith("data:")) {
        return avatarPath;
    }

    // Default backend URL base without /api
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const backendUrl = apiBase.replace(/\/api\/?$/, "");

    return `${backendUrl}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;
}
