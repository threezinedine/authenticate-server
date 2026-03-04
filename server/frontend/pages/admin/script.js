/**
 * Admin Page – Route Guard & Initialization
 *
 * Guard order:
 *   1. If no access_token in localStorage → redirect to /login immediately (client-side).
 *   2. (Future) If GET /api/v1/users/me returns 401 → redirect to /login with expiration message.
 */

// ─── 1. Immediate client-side token check ─────────────────────────────────
const token = localStorage.getItem('access_token');

if (!token) {
    window.location.replace('/login');
} else {
    // ─── 2. DOM-dependent initialisation (only runs when token exists) ────
    document.addEventListener('DOMContentLoaded', () => {
        initAdminPage();
    });
}

async function initAdminPage() {
    // Sidebar toggle
    const layout = document.getElementById('adminLayout');
    window.toggleAdminSidebar = () => {
        if (layout) layout.classList.toggle('is-sidebar-collapsed');
    };

    // Future: verify token with server here.
    // If 401 → window.location.replace('/login?expired=true');
}
