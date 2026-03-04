import { createButton } from '/static/components/button/button.js';

/**
 * createAuthForm creates a form container that handles async submissions,
 * payload extraction, and global error states.
 * 
 * @param {Object} props
 * @param {string} props.id - Form ID
 * @param {Function} props.onSubmit - Async callback receiving extracted JSON payload
 * @param {string} props.submitLabel - Text for the generated submit button
 * @param {Array<HTMLElement>} props.children - Array of DOM elements (e.g., input groups) to insert
 */
export const createAuthForm = ({ id, onSubmit, submitLabel = 'Submit', children = [] }) => {
    const form = document.createElement('form');
    if (id) form.id = id;
    form.className = 'auth-form';
    form.setAttribute('novalidate', '');

    const content = document.createElement('div');
    content.className = 'auth-form__content';
    children.forEach(child => content.appendChild(child));
    form.appendChild(content);

    const submitBtn = createButton({
        label: submitLabel,
        variant: 'primary',
        type: 'submit'
    });

    // Override the button implementation's root element to have full block behavior for the form
    submitBtn.style.width = '100%';
    form.appendChild(submitBtn);

    let errorBanner = null;

    form.setGlobalError = (msg) => {
        if (msg) {
            if (!errorBanner) {
                errorBanner = document.createElement('div');
                errorBanner.className = 'auth-form__error-banner';
                form.insertBefore(errorBanner, form.firstChild);
            }
            errorBanner.textContent = msg;
            form.classList.add('has-global-error');
        } else {
            if (errorBanner && form.contains(errorBanner)) {
                form.removeChild(errorBanner);
                errorBanner = null;
            }
            form.classList.remove('has-global-error');
        }
    };

    const toggleSubmitting = (isSubmitting) => {
        const textNode = submitBtn.querySelector('.btn__text');

        if (isSubmitting) {
            form.classList.add('is-submitting');
            submitBtn.classList.add('btn--loading');
            submitBtn.disabled = true;
            if (textNode) textNode.innerHTML = '<span class="auth-form__loader"></span>';
        } else {
            form.classList.remove('is-submitting');
            submitBtn.classList.remove('btn--loading');
            submitBtn.disabled = false;
            if (textNode) textNode.textContent = submitLabel;
        }

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.disabled = isSubmitting);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = {};
        for (const [key, value] of formData.entries()) {
            payload[key] = value;
        }

        if (onSubmit) {
            try {
                toggleSubmitting(true);
                await onSubmit(payload);
            } catch (err) {
                // If it's an API error or validation fail, stop spinning so user can fix it
                toggleSubmitting(false);

                if (err.message !== 'ValidationFailed') {
                    console.error("Form Submission Error: ", err);
                }
            }
        }
    });

    form.addEventListener('input', () => {
        if (form.classList.contains('has-global-error')) {
            form.setGlobalError('');
        }
    });

    return form;
};
