import { createSideMenu } from './sidemenu.js';
import './style.css';
import '../sidemenu-item/style.css';

export default {
    title: 'Components/SideMenu',
    tags: ['autodocs'],
    argTypes: {
        isCollapsed: { control: 'boolean' },
        onToggle: { action: 'toggled' },
        onLogout: { action: 'logout clicked' }
    },
};

const Template = (args) => {
    // Put it inside an overarching flex wrapper acting as the full generic "dashboard" screen
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.height = '600px';
    wrapper.style.width = '100vw'; // Take up all available preview 
    wrapper.style.backgroundColor = 'var(--bg-primary)';

    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.padding = '2rem';
    contentArea.style.color = 'var(--text-muted)';
    contentArea.innerHTML = '<h2>Dashboard Main Content Graph Overlay</h2><p>Interact with the hamburger toggle in the sidebar to test structural expansion layout flows natively responding with CSS Grid changes</p>';

    const sidemenu = createSideMenu({
        ...args,
        onToggle: (state) => {
            args.onToggle(state);
            // Storybook specific reactivity: re-render wrapper layout correctly if needed 
            // the DOM mutates the inner classes inherently though component logic
        }
    });

    wrapper.appendChild(sidemenu);
    wrapper.appendChild(contentArea);

    return wrapper;
};

// Extracted baseline SVG tokens representing common navigation
const dashIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>';
const userIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
const chartIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>';
const folderIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
const msgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
const gearIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';


export const Primary = Template.bind({});
Primary.args = {
    isCollapsed: false,
    profile: {
        name: 'Alex Johnson',
        role: 'Admin',
        avatarSrc: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    items: [
        { label: 'Dashboard', href: '#', iconSvg: dashIcon, isActive: true },
        { label: 'Analytics', href: '#', iconSvg: chartIcon },
        { label: 'Projects', href: '#', iconSvg: folderIcon },
        { label: 'Team', href: '#', iconSvg: userIcon },
        { label: 'Messages', href: '#', iconSvg: msgIcon },
        { label: 'Settings', href: '#', iconSvg: gearIcon }
    ]
};
