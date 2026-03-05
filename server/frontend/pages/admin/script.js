/**
 * Admin Page – Route Guard & Initialization
 *
 * Guard order:
 *   1. If no access_token in localStorage → redirect to /login immediately (client-side).
 *   2. (Future) If GET /api/v1/users/me returns 401 → redirect to /login with expiration message.
 */

import { createSideMenu } from '/static/components/sidemenu/sidemenu.js';

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
    // ─── 2. Server-side session validation ────────────────────────────────
    // Verify the stored token is still valid with the backend.
    // This catches expired tokens that passed the client-side check.
    const storedToken = localStorage.getItem('access_token');
    try {
        const res = await fetch('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        if (res.status === 401) {
            localStorage.removeItem('access_token');
            sessionStorage.setItem('auth_redirect_msg', 'Session expired. Please log in again.');
            window.location.replace('/login');
            return;
        }
        if (res.status === 403) {
            localStorage.removeItem('access_token');
            sessionStorage.setItem('auth_redirect_msg', 'Insufficient permissions. Admin access required.');
            window.location.replace('/login');
            return;
        }
    } catch (_) {
        // Network error — allow page to continue loading
    }

    // --- Render SideMenu Component ---
    const sidebarContainer = document.getElementById('adminSidebarContainer');

    // Shared SVG Icons for Nav
    const iconDash = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>';
    const iconChart = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>';
    const iconFolder = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
    const iconUsers = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    const iconMsg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    const iconSettings = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

    const sidemenuConfig = {
        profile: {
            name: 'Alex Johnson',
            role: 'Admin',
            avatarSrc: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
        },
        items: [
            { label: 'Dashboard', href: '/admin', iconSvg: iconDash, isActive: true },
            { label: 'Analytics', href: '/admin/analytics', iconSvg: iconChart },
            { label: 'Projects', href: '/admin/projects', iconSvg: iconFolder },
            { label: 'Team', href: '/admin/team', iconSvg: iconUsers },
            { label: 'Messages', href: '/admin/messages', iconSvg: iconMsg },
            { label: 'Settings', href: '/admin/settings', iconSvg: iconSettings }
        ],
        isCollapsed: false,
        onToggle: (isNowCollapsed) => {
            // Unused hook for now. The sidemenu autonomously shrinks itself to 80px via CSS.
            // If the main content area layout needs shifting, it can be triggered here.
        }
    };

    if (sidebarContainer) {
        sidebarContainer.appendChild(createSideMenu(sidemenuConfig));
    }
}
