import { createAuthForm } from '/static/components/auth-form/auth-form.js';
import { createInputGroup } from '/static/components/input-group/input-group.js';
import { createButton } from '/static/components/button/button.js';
import { createDivider } from '/static/components/divider/divider.js';
import { publishToast } from '/static/components/toast/toast.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loadeded")
    const container = document.getElementById('login-form-container');

    // 1. Setup Input Groups
    const emailInput = createInputGroup({
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
    });
    // Add specific name to be parsed by FormData
    emailInput.querySelector('.input-group__field').name = 'email';

    const passwordInput = createInputGroup({
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    });
    passwordInput.querySelector('.input-group__field').name = 'password';

    // 2. Setup Social Buttons & Divider
    const googleBtnContainer = document.createElement('div');
    googleBtnContainer.style.marginTop = 'var(--space-md)';
    const googleBtn = createButton({
        label: 'Continue with Google',
        variant: 'social',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>',
        onClick: () => { window.location.href = '/api/auth/google/login'; }
    });
    // Set width 100% for social button layout
    googleBtn.style.width = '100%';
    googleBtnContainer.appendChild(googleBtn);

    const divider = createDivider("OR");

    // 3. Define the async API Handler
    const handleLoginSubmit = async (payload) => {
        let hasErrors = false;

        // Reset old errors visually on subcomponents
        const allGroups = [emailInput, passwordInput];
        allGroups.forEach(group => group.classList.remove('has-error'));

        // Client-side validation: Empty Check
        if (!payload.email || payload.email.trim() === '') {
            emailInput.classList.add('has-error');
            hasErrors = true;
        }

        if (!payload.password || payload.password.trim() === '') {
            passwordInput.classList.add('has-error');
            hasErrors = true;
        }

        if (hasErrors) {
            // Throwing an error stops the toggleSubmitting loader sequence in auth-form.js
            throw new Error('ValidationFailed');
        }

        try {
            // Simulated network latency
            await new Promise(r => setTimeout(r, 1000));

            const response = await fetch('/api/v1/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                authForm.setGlobalError(errorData.detail || 'Login failed.');
                publishToast({ msg: errorData.detail || 'Login failed.', type: 'error', duration: 5000 });
                // Re-throw so auth-form.js catch block calls toggleSubmitting(false) to unlock spinner
                throw new Error(errorData.detail || 'Login failed.');
            }

            const data = await response.json();

            // Handle Successful Login specific caching
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }

            publishToast({ msg: 'Authentication successful! Redirecting...', type: 'success', duration: 2500 });

            // Navigate to dashboard /admin
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } catch (error) {
            // Only show "network error" for true fetch failures (offline, DNS, etc.)
            // API errors (4xx/5xx) are handled above and already have their message set.
            if (!error.message.includes('Failed to fetch')) {
                // Re-throw so auth-form.js's outer catch can call toggleSubmitting(false)
                throw error;
            }
            authForm.setGlobalError('Network error connecting to the authentication server.');
            publishToast({ msg: 'Network error connecting to the authentication server.', type: 'error', duration: 5000 });
        }
    };

    // 4. Assemble the Form Layout
    const authForm = createAuthForm({
        id: 'login-form',
        submitLabel: 'SIGN IN',
        onSubmit: handleLoginSubmit,
        children: [
            emailInput,
            passwordInput
        ]
    });

    // Inject the fully built DOM graph!
    container.appendChild(authForm);

    // Put social buttons BELOW the form since it's the standard flow
    container.appendChild(divider);
    container.appendChild(googleBtnContainer);

    // 5. Read any cross-page session messages (e.g. 'Session expired' from /admin redirect)
    const redirectMsg = sessionStorage.getItem('auth_redirect_msg');
    if (redirectMsg) {
        authForm.setGlobalError(redirectMsg);
        publishToast({ msg: redirectMsg, type: 'error', duration: 5000 });
        sessionStorage.removeItem('auth_redirect_msg');
    }
});
