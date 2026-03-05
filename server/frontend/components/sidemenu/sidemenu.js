import { createSideMenuItem } from '../sidemenu-item/sidemenu-item.js';

/**
 * Creates a SideMenu component containing a user profile, navigation items, and a collapse toggle.
 *
 * @param {Object} props
 * @param {Object} props.profile - { name: string, role: string, avatarSrc: string }
 * @param {Array} props.items - Array of item objects { label, href, iconSvg, isActive }
 * @param {boolean} props.isCollapsed - Initial collapsed state
 * @param {Function} props.onToggle - Callback when the toggle button is clicked
 */
export const createSideMenu = ({ profile, items = [], isCollapsed = false, onToggle }) => {
    const sidemenu = document.createElement('aside');
    sidemenu.className = 'sidemenu';
    if (isCollapsed) {
        sidemenu.classList.add('sidemenu--collapsed');
    }

    // --- Profile Section ---
    const profileSection = document.createElement('div');
    profileSection.className = 'sidemenu__profile';

    // Avatar
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'sidemenu__avatar-wrapper';
    if (profile?.avatarSrc) {
        const avatarImg = document.createElement('img');
        avatarImg.src = profile.avatarSrc;
        avatarImg.alt = profile.name || 'User Avatar';
        avatarImg.className = 'sidemenu__avatar';
        avatarWrapper.appendChild(avatarImg);
    }

    // Profile Info (Text)
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

    // --- Navigation Section ---
    const navSection = document.createElement('nav');
    navSection.className = 'sidemenu__nav';

    items.forEach(itemConfig => {
        // Pass down the collapsed state to individual items
        const itemEl = createSideMenuItem({
            ...itemConfig,
            isCollapsed: isCollapsed
        });
        navSection.appendChild(itemEl);
    });

    sidemenu.appendChild(navSection);

    // --- Footer Section (Toggle) ---
    const footerSection = document.createElement('div');
    footerSection.className = 'sidemenu__footer';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidemenu__toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

    // Hamburger icon for toggle
    toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;

    toggleBtn.addEventListener('click', () => {
        const isNowCollapsed = !sidemenu.classList.contains('sidemenu--collapsed');

        if (isNowCollapsed) {
            sidemenu.classList.add('sidemenu--collapsed');
        } else {
            sidemenu.classList.remove('sidemenu--collapsed');
        }

        // Broad-cast the collapsed state to all child items so their labels hide/show via CSS modifier
        const allItems = Array.from(navSection.querySelectorAll('.sidemenu-item'));
        allItems.forEach(item => {
            if (isNowCollapsed) {
                item.classList.add('sidemenu-item--collapsed');
            } else {
                item.classList.remove('sidemenu-item--collapsed');
            }
        });

        if (onToggle) {
            onToggle(isNowCollapsed);
        }
    });

    footerSection.appendChild(toggleBtn);
    sidemenu.appendChild(footerSection);

    return sidemenu;
};
