import './style.css';

export const createButton = ({ label, variant = 'primary', iconSvg, onClick, type = 'button', disabled = false }) => {
    const btn = document.createElement('button');
    btn.type = type;
    btn.className = `btn btn--${variant}`;

    if (disabled) {
        btn.disabled = true;
    }

    if (onClick) {
        btn.addEventListener('click', onClick);
    }

    // Handle button content (Icon + Label)
    if (iconSvg) {
        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'btn__icon';
        iconWrapper.innerHTML = iconSvg;
        btn.appendChild(iconWrapper);
    }

    if (label) {
        const textWrapper = document.createElement('span');
        textWrapper.className = 'btn__text';
        textWrapper.textContent = label;
        btn.appendChild(textWrapper);
    }

    // If it's a primary button, add the top reflection highlight element
    if (variant === 'primary') {
        const reflection = document.createElement('div');
        reflection.className = 'btn__reflection';
        btn.appendChild(reflection);
    }

    return btn;
};
