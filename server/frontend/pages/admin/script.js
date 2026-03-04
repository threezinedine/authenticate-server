document.addEventListener('DOMContentLoaded', () => {
    // Basic sidebar toggle logic for the admin layout
    const layout = document.querySelector('.admin-layout');

    // We will bind this to a physical toggle button inside the topbar/sidebar later
    window.toggleAdminSidebar = () => {
        if (layout) {
            layout.classList.toggle('is-sidebar-collapsed');
        }
    };
});
