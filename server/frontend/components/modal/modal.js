import { publishToast } from '../toast/toast.js'; // Optional: if we want to show toasts from modal actions, though we mainly need button.
import { createButton } from '../button/button.js';

/**
 * Creates and mounts a modal dialog dialog.
 * 
 * @param {Object} props
 * @param {string} props.title - Modal header title
 * @param {string|HTMLElement} props.body - Content to render inside the modal body
 * @param {'default'|'danger'|'info'} [props.variant='default'] - Visual accent variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Max-width sizing
 * @param {Array} [props.actions=[]] - Array of action objects { label, variant, onClick, closeAfter }
 * @param {Function} [props.onClose] - Callback when modal is completely closed
 * @param {boolean} [props.closeOnOverlay=true] - Whether clicking the backdrop closes the modal
 * @param {boolean} [props.closeOnEsc=true] - Whether the Escape key closes the modal
 * @returns {Object} { open, close, setBody, getElement }
 */
export const createModal = ({
    title = '',
    body = '',
    variant = 'default',
    size = 'md',
    actions = [],
    onClose,
    closeOnOverlay = true,
    closeOnEsc = true
}) => {
    // 1. Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // 2. Create Modal Shell
    const modal = document.createElement('div');
    modal.className = `modal modal--${size} modal--${variant}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (title) {
        // Simple slugify for ID
        const titleId = `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 9)}`;
        modal.setAttribute('aria-labelledby', titleId);
    }

    // 3. Header
    const header = document.createElement('div');
    header.className = 'modal__header';

    const titleEl = document.createElement('h2');
    titleEl.className = 'modal__title';
    if (modal.hasAttribute('aria-labelledby')) {
        titleEl.id = modal.getAttribute('aria-labelledby');
    }
    titleEl.textContent = title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal__close-btn';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // 4. Body
    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'modal__body';

    const setBody = (content) => {
        bodyContainer.innerHTML = ''; // Clear existing
        if (typeof content === 'string') {
            bodyContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyContainer.appendChild(content);
        }
    };
    setBody(body);
    modal.appendChild(bodyContainer);

    // 5. Footer (Actions)
    let footer = null;
    if (actions && actions.length > 0) {
        footer = document.createElement('div');
        footer.className = 'modal__footer';

        actions.forEach(action => {
            const btn = createButton({
                label: action.label,
                variant: action.variant || 'primary',
                onClick: async (e) => {
                    if (action.onClick) {
                        try {
                            await action.onClick({ close: controller.close }, e);
                        } catch (err) {
                            console.error('Modal action error:', err);
                        }
                    }
                    if (action.closeAfter !== false) {
                        controller.close();
                    }
                }
            });
            footer.appendChild(btn);
        });
        modal.appendChild(footer);
    }

    overlay.appendChild(modal);

    // --- State and Handlers ---
    let isOpen = false;
    let previouslyFocusedElement = null;

    const handleEsc = (e) => {
        if (closeOnEsc && e.key === 'Escape' && isOpen) {
            controller.close();
        }
    };

    const handleOverlayClick = (e) => {
        if (closeOnOverlay && e.target === overlay && isOpen) {
            controller.close();
        }
    };

    // Focus Trap Logic
    const handleTab = (e) => {
        if (e.key !== 'Tab' || !isOpen) return;

        // Retrieve focusable elements inside the modal
        const focusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };


    const controller = {
        open: () => {
            if (isOpen) return;
            isOpen = true;

            previouslyFocusedElement = document.activeElement;

            document.body.appendChild(overlay);

            // Force reflow
            void overlay.offsetWidth;

            overlay.classList.add('modal-overlay--open');

            // Set up event listeners
            document.addEventListener('keydown', handleEsc);
            document.addEventListener('keydown', handleTab);
            overlay.addEventListener('mousedown', handleOverlayClick); // mousedown avoids dragging issues

            // Focus first element or close button
            setTimeout(() => {
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    closeBtn.focus();
                }
            }, 50); // Small delay to ensure DOM attachment and transition start
        },

        close: () => {
            if (!isOpen) return;
            isOpen = false;

            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('keydown', handleTab);
            overlay.removeEventListener('mousedown', handleOverlayClick);

            overlay.classList.remove('modal-overlay--open');
            overlay.classList.add('modal-overlay--closing');

            // Wait for transition to finish
            const handleTransitionEnd = (e) => {
                if (e.target === overlay) {
                    overlay.removeEventListener('transitionend', handleTransitionEnd);
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                    overlay.classList.remove('modal-overlay--closing');

                    if (previouslyFocusedElement) {
                        previouslyFocusedElement.focus();
                    }

                    if (onClose) onClose();
                }
            };

            // Fallback for test environments without transitions
            if (typeof window !== 'undefined' && window.__TEST_MODE__) {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                if (onClose) onClose();
                return;
            }

            overlay.addEventListener('transitionend', handleTransitionEnd);
        },

        setBody,

        getElement: () => overlay
    };

    closeBtn.addEventListener('click', controller.close);

    return controller;
};
