/**
 * Creates and publishes a transient notification toast message dynamically.
 * 
 * @param {Object} options Configuration object
 * @param {string} options.msg The content text of the toast
 * @param {('success'|'info'|'warn'|'error')} [options.type='info'] The severity level dictating styling and icon
 * @param {number} [options.duration=5000] Time in milliseconds before auto-dismissal
 * @returns {HTMLElement} The created toast item
 */
export function publishToast({ msg, type = 'info', duration = 5000 }) {
    // 1. Ensure the global container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Build the toast item DOM element
    const toastItem = document.createElement('div');
    toastItem.className = `toast-item toast-item--${type}`;

    // Choose icon based on type
    let iconSvg = '';
    switch (type) {
        case 'success':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>`;
            break;
        case 'warn':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            break;
        case 'error':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            break;
        case 'info':
        default:
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            break;
    }

    let progressHtml = '';
    if (duration > 0) {
        progressHtml = `
            <div class="toast-item__progress">
                <div class="toast-item__progress-bar" style="animation-duration: ${duration}ms;"></div>
            </div>
        `;
    }

    toastItem.innerHTML = `
        <div class="toast-item__icon">${iconSvg}</div>
        <div class="toast-item__content">${msg}</div>
        <button class="toast-item__close" aria-label="Close message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        ${progressHtml}
    `;

    // 3. Append to container (triggers slide-in animation via CSS)
    container.appendChild(toastItem);

    // 4. Handle Removal Logic
    let removeTimeout;

    const removeToast = () => {
        // Clear the timeout to prevent dual execution if closed manually right before timeout
        if (removeTimeout) clearTimeout(removeTimeout);

        toastItem.classList.add('toast-item--hiding');

        // Wait for CSS slide-out animation to finish before destroying DOM node
        toastItem.addEventListener('animationend', () => {
            if (toastItem.parentNode) {
                toastItem.parentNode.removeChild(toastItem);
            }
        });

        // Fallback for tests environments ignoring animations
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
            if (toastItem.parentNode) {
                toastItem.parentNode.removeChild(toastItem);
            }
        }
    };

    // Auto-dismissal
    if (duration > 0) {
        removeTimeout = setTimeout(removeToast, duration);
    }

    // Manual dismissal
    const closeBtn = toastItem.querySelector('.toast-item__close');
    closeBtn.addEventListener('click', () => {
        removeToast();
    });

    return toastItem;
}
