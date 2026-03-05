export const createSideMenuItem = ({ label, iconSvg, href = '#', isActive = false, isCollapsed = false }) => {
    const item = document.createElement('a');
    item.href = href;
    item.className = 'sidemenu-item';

    if (isActive) {
        item.classList.add('sidemenu-item--active');
    }

    if (isCollapsed) {
        item.classList.add('sidemenu-item--collapsed');
    }

    if (iconSvg) {
        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'sidemenu-item__icon';
        iconWrapper.innerHTML = iconSvg;
        item.appendChild(iconWrapper);
    }

    if (label) {
        const textWrapper = document.createElement('span');
        textWrapper.className = 'sidemenu-item__label';
        textWrapper.textContent = label;
        item.appendChild(textWrapper);
    }

    return item;
};
