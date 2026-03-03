import './style.css';

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

    const content = document.createElement('div');
    content.className = 'auth-form__content';
    children.forEach(child => content.appendChild(child));
    form.appendChild(content);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-primary';
    submitBtn.textContent = submitLabel;
    form.appendChild(submitBtn);

    let errorBanner = null;

    form.setGlobalError = (msg) => {
        if (msg) {
            if (!errorBanner) {
                errorBanner = document.createElement('div');
                errorBanner.className = 'auth-form__global-error';
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
        if (isSubmitting) {
            form.classList.add('is-submitting');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="auth-form__loader"></span>';
        } else {
            form.classList.remove('is-submitting');
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
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
            } finally {
                toggleSubmitting(false);
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
