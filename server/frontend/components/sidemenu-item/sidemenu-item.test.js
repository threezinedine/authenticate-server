import { createSideMenuItem } from './sidemenu-item.js';

describe('SideMenuItem Component', () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('renders an anchor tag with the correct href, label, and icon', () => {
        const item = createSideMenuItem({
            label: 'Dashboard',
            href: '/admin/dashboard',
            iconSvg: '<svg class="test-icon"></svg>'
        });
        container.appendChild(item);

        expect(item.tagName).toBe('A');
        expect(item.getAttribute('href')).toBe('/admin/dashboard');
        expect(item.classList.contains('sidemenu-item')).toBe(true);
        expect(item.querySelector('.sidemenu-item__label').textContent).toBe('Dashboard');
        expect(item.querySelector('.sidemenu-item__icon svg.test-icon')).toBeTruthy();
    });

    it('applies the active modifier class when isActive is true', () => {
        const item = createSideMenuItem({
            label: 'Settings',
            isActive: true
        });
        expect(item.classList.contains('sidemenu-item--active')).toBe(true);
    });

    it('applies the collapsed modifier class when isCollapsed is true', () => {
        const item = createSideMenuItem({
            label: 'Users',
            isCollapsed: true
        });
        expect(item.classList.contains('sidemenu-item--collapsed')).toBe(true);
    });
});
