import { createSideMenuItem } from '../sidemenu-item/sidemenu-item.js';

/**
 * Creates a SideMenu component containing a user profile, navigation items, and a collapse toggle.
 *
 * @param {Object} props
 * @param {Object} props.profile - { name: string, role: string, avatarSrc: string }
 * @param {Array}  props.items   - Array of item objects { label, href, iconSvg, isActive }
 * @param {boolean} props.isCollapsed - Initial collapsed state
 * @param {Function} props.onToggle  - Callback when collapsed state changes
 * @param {Function} props.onLogout  - Callback when logout button is clicked
 */
export const createSideMenu = ({ profile, items = [], isCollapsed = false, onToggle, onLogout }) => {
    const sidemenu = document.createElement('aside');
    sidemenu.className = 'sidemenu';
    if (isCollapsed) sidemenu.classList.add('sidemenu--collapsed');

    // ─── Profile Section ──────────────────────────────────────────────────────
    const profileSection = document.createElement('div');
    profileSection.className = 'sidemenu__profile';

    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'sidemenu__avatar-wrapper';
    if (profile?.avatarSrc) {
        const avatarImg = document.createElement('img');
        avatarImg.src = profile.avatarSrc;
        avatarImg.alt = profile.name || 'User Avatar';
        avatarImg.className = 'sidemenu__avatar';
        avatarWrapper.appendChild(avatarImg);
    }

    const profileInfo = document.createElement('div');
    profileInfo.className = 'sidemenu__profile-info';
    if (profile?.name) {
        const nameEl = document.createElement('div');
        nameEl.className = 'sidemenu__profile-name';
        nameEl.textContent = profile.name;
        profileInfo.appendChild(nameEl);
    }
    if (profile?.role) {
        const roleEl = document.createElement('div');
        roleEl.className = 'sidemenu__profile-role';
        roleEl.textContent = profile.role;
        profileInfo.appendChild(roleEl);
    }

    profileSection.appendChild(avatarWrapper);
    profileSection.appendChild(profileInfo);
    sidemenu.appendChild(profileSection);

    // ─── Navigation Section ───────────────────────────────────────────────────
    const navSection = document.createElement('nav');
    navSection.className = 'sidemenu__nav';

    items.forEach(itemConfig => {
        const itemEl = createSideMenuItem({ ...itemConfig, isCollapsed });
        navSection.appendChild(itemEl);
    });

    sidemenu.appendChild(navSection);

    // ─── Edge Toggle Tab ──────────────────────────────────────────────────────
    // Floating chevron tab pinned to the right edge of the sidebar, vertically centred.
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidemenu__toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

    const chevronLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    const chevronRight = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    const updateChevron = (collapsed) => {
        toggleBtn.innerHTML = collapsed ? chevronRight : chevronLeft;
    };
    updateChevron(isCollapsed);

    // The toggle button is appended directly to sidemenu (not the footer)
    // so it can be positioned absolutely on the right edge.
    sidemenu.appendChild(toggleBtn);

    // ─── Shared collapse / expand logic ──────────────────────────────────────
    const collapseMenu = (forceCollapsed) => {
        const shouldCollapse = forceCollapsed !== undefined
            ? forceCollapsed
            : !sidemenu.classList.contains('sidemenu--collapsed');

        sidemenu.classList.toggle('sidemenu--collapsed', shouldCollapse);

        navSection.querySelectorAll('.sidemenu-item').forEach(item => {
            item.classList.toggle('sidemenu-item--collapsed', shouldCollapse);
        });

        updateChevron(shouldCollapse);
        if (onToggle) onToggle(shouldCollapse);
    };

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseMenu();
    });

    // Click anywhere outside the sidebar → collapse it
    document.addEventListener('click', (e) => {
        if (!sidemenu.contains(e.target) && !sidemenu.classList.contains('sidemenu--collapsed')) {
            collapseMenu(true);
        }
    });

    // ─── Footer (Logout only) ─────────────────────────────────────────────────
    const footerSection = document.createElement('div');
    footerSection.className = 'sidemenu__footer';

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'sidemenu__logout-btn';
    logoutBtn.setAttribute('aria-label', 'Log out');
    logoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="sidemenu__logout-label">Log Out</span>
    `;
    logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onLogout) onLogout();
    });

    footerSection.appendChild(logoutBtn);
    sidemenu.appendChild(footerSection);

    return sidemenu;
};
