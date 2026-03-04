import { createAuthForm } from '/static/components/auth-form/auth-form.js';
import { createInputGroup } from '/static/components/input-group/input-group.js';
import { createButton } from '/static/components/button/button.js';
import { createDivider } from '/static/components/divider/divider.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('register-form-container');

    // 1. Setup Input Groups
    const nameInput = createInputGroup({
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    });
    nameInput.querySelector('.input-group__field').name = 'full_name';

    const emailInput = createInputGroup({
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
    });
    emailInput.querySelector('.input-group__field').name = 'email';

    const passwordInput = createInputGroup({
        label: 'Password',
        type: 'password',
        placeholder: 'Create a password',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
    });
    passwordInput.querySelector('.input-group__field').name = 'password';

    // 2. Setup Social Buttons & Divider
    const googleBtnContainer = document.createElement('div');
    googleBtnContainer.style.marginTop = 'var(--space-md)';
    const googleBtn = createButton({
        label: 'Sign up with Google',
        variant: 'social',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>',
        onClick: () => { window.location.href = '/api/auth/google/login'; }
    });
    googleBtn.style.width = '100%';
    googleBtnContainer.appendChild(googleBtn);

    const divider = createDivider("OR");

    // 3. Define the async API Handler for Registration
    const handleRegisterSubmit = async (payload) => {
        try {
            // Simulated network latency
            await new Promise(r => setTimeout(r, 1000));

            const response = await fetch('/api/v1/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                authForm.setGlobalError(errorData.detail || 'Registration failed. Try again.');
                return;
            }

            // Successfully registered, ideally auto-login or redirect to /login
            window.location.href = '/login?registered=true';
        } catch (error) {
            authForm.setGlobalError('Network error connecting to the authentication server.');
        }
    };

    // 4. Assemble the Form Layout
    const authForm = createAuthForm({
        id: 'register-form',
        submitLabel: 'CREATE ACCOUNT',
        onSubmit: handleRegisterSubmit,
        children: [
            nameInput,
            emailInput,
            passwordInput
        ]
    });

    // Inject the fully built DOM graph
    container.appendChild(authForm);

    // Put social buttons BELOW the form to match login page consistency
    container.appendChild(divider);
    container.appendChild(googleBtnContainer);
});
