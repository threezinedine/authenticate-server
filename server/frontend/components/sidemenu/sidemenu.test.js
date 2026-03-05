import { createSideMenu } from './sidemenu.js';

describe('SideMenu Component', () => {
    let container;

    const mockProfile = {
        name: 'Alex Johnson',
        role: 'Admin',
        avatarSrc: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    };

    const mockItems = [
        { label: 'Dashboard', href: '/admin', isActive: true, iconSvg: '<svg class="icon-dash"></svg>' },
        { label: 'Settings', href: '/settings', isActive: false, iconSvg: '<svg class="icon-settings"></svg>' }
    ];

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('renders the full internal profile structure accurately', () => {
        const sidemenu = createSideMenu({ profile: mockProfile, items: [] });
        container.appendChild(sidemenu);

        expect(sidemenu.querySelector('.sidemenu__profile-name').textContent).toBe('Alex Johnson');
        expect(sidemenu.querySelector('.sidemenu__profile-role').textContent).toBe('Admin');
        expect(sidemenu.querySelector('.sidemenu__avatar').src).toBe(mockProfile.avatarSrc);
    });

    it('renders identical mapping of children nav items', () => {
        const sidemenu = createSideMenu({ profile: mockProfile, items: mockItems });

        const renderedItems = sidemenu.querySelectorAll('.sidemenu-item');
        expect(renderedItems.length).toBe(2);

        // Assert the exact DOM composition of the first mapped Sidemenu Item matches the configuration
        expect(renderedItems[0].querySelector('.sidemenu-item__label').textContent).toBe('Dashboard');
        expect(renderedItems[0].getAttribute('href')).toBe('/admin');
        expect(renderedItems[0].classList.contains('sidemenu-item--active')).toBe(true);
    });

    it('toggles CSS sizing classes natively on the parent container and strictly delegates hiding commands to all nested children when the footer button is clicked', () => {
        // We use a mock callback to ensure the outer developer gets the broadcast correctly too
        const onToggleMock = jest.fn();
        const sidemenu = createSideMenu({ items: mockItems, onToggle: onToggleMock });
        container.appendChild(sidemenu);

        const toggleBtn = sidemenu.querySelector('.sidemenu__toggle-btn');

        // Assert initialized expanded block layout
        expect(sidemenu.classList.contains('sidemenu--collapsed')).toBe(false);

        // Click 1: Collapse the navigation
        toggleBtn.click();
        expect(sidemenu.classList.contains('sidemenu--collapsed')).toBe(true);
        expect(onToggleMock).toHaveBeenCalledWith(true);

        // Assert ALL children have also received the collapsed style token so their text drops cleanly
        const mappedChildStyles = Array.from(sidemenu.querySelectorAll('.sidemenu-item'));
        expect(mappedChildStyles.every(child => child.classList.contains('sidemenu-item--collapsed'))).toBe(true);

        // Click 2: Re-expand the navigation
        toggleBtn.click();
        expect(sidemenu.classList.contains('sidemenu--collapsed')).toBe(false);
        expect(onToggleMock).toHaveBeenCalledWith(false);
    });
});
