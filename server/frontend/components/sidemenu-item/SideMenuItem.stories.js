import { createSideMenuItem } from './sidemenu-item.js';
import './style.css';

export default {
    title: 'Components/SideMenuItem',
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        href: { control: 'text' },
        isActive: { control: 'boolean' },
        isCollapsed: { control: 'boolean' },
    },
};

const Template = (args) => {
    // Wrap in a dark container to see the glassmorphic highlights properly since it relies on text-muted/brand-accent
    const wrapper = document.createElement('div');
    wrapper.style.padding = '1rem';
    wrapper.style.background = 'var(--bg-primary)';
    wrapper.style.width = args.isCollapsed ? '60px' : '240px';
    wrapper.style.transition = 'width 0.3s ease';

    wrapper.appendChild(createSideMenuItem(args));
    return wrapper;
};

const iconDashboard = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>';

export const Default = Template.bind({});
Default.args = {
    label: 'Dashboard',
    iconSvg: iconDashboard,
    href: '/admin/dashboard',
    isActive: false,
    isCollapsed: false,
};

export const Active = Template.bind({});
Active.args = {
    label: 'Dashboard',
    iconSvg: iconDashboard,
    href: '/admin/dashboard',
    isActive: true,
    isCollapsed: false,
};

export const Collapsed = Template.bind({});
Collapsed.args = {
    label: 'Dashboard',
    iconSvg: iconDashboard,
    href: '/admin/dashboard',
    isActive: false,
    isCollapsed: true,
};
