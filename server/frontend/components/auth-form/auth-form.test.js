import { createAuthForm } from './auth-form';
import { createInputGroup } from '../input-group/input-group';

describe('Auth Form Component', () => {
    // Boilerplate setup to ensure inputs have name attributes for form payload testing
    const setupFormWithInputs = (onSubmitMock = jest.fn()) => {
        const emailInput = createInputGroup({ label: 'Email', type: 'email' });
        // Manually append a 'name' attribute to the field so the form can parse it natively
        emailInput.querySelector('.input-group__field').name = 'email';

        const passwordInput = createInputGroup({ label: 'Password', type: 'password' });
        passwordInput.querySelector('.input-group__field').name = 'password';

        const form = createAuthForm({
            id: 'test-form',
            onSubmit: onSubmitMock,
            submitLabel: 'Log In',
            children: [emailInput, passwordInput]
        });

        return { form, emailInput, passwordInput, onSubmitMock };
    };

    it('renders <form> element properly', () => {
        const { form } = setupFormWithInputs();
        expect(form.tagName).toBe('FORM');
        expect(form.className).toContain('auth-form');
        expect(form.id).toBe('test-form');

        const submitBtn = form.querySelector('button[type="submit"]');
        expect(submitBtn).toBeTruthy();
        expect(submitBtn.textContent).toBe('Log In');
    });

    it('prevents default HTTP reload behavior on submit', () => {
        const { form } = setupFormWithInputs();
        const event = new Event('submit', { cancelable: true });

        form.dispatchEvent(event);

        // If preventDefault was called, defaultPrevented should be true
        expect(event.defaultPrevented).toBe(true);
    });

    it('extracts named nested inputs correctly into an object on submit', async () => {
        const { form, emailInput, passwordInput, onSubmitMock } = setupFormWithInputs();

        // Fill out the nested inputs
        emailInput.querySelector('.input-group__field').value = 'test@example.com';
        passwordInput.querySelector('.input-group__field').value = 'securepass123';

        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        // Allow async onSubmit to resolve
        await new Promise(process.nextTick);

        expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@example.com',
            password: 'securepass123'
        }));
    });

    it('toggles loader and disables all inputs and submit button during async operation', async () => {
        let resolveSubmit;
        const mockSubmitPromise = new Promise((resolve) => {
            resolveSubmit = resolve;
        });

        const { form, emailInput, passwordInput } = setupFormWithInputs(() => mockSubmitPromise);

        const event = new Event('submit', { cancelable: true });
        form.dispatchEvent(event);

        const emailField = emailInput.querySelector('.input-group__field');
        const passwordField = passwordInput.querySelector('.input-group__field');
        const submitBtn = form.querySelector('button[type="submit"]');

        // While promise is pending...
        expect(form.classList.contains('is-submitting')).toBe(true);
        expect(emailField.disabled).toBe(true);
        expect(passwordField.disabled).toBe(true);
        expect(submitBtn.disabled).toBe(true);

        // Resolve it
        resolveSubmit();
        await new Promise(process.nextTick);

        // After completion
        expect(form.classList.contains('is-submitting')).toBe(false);
        expect(emailField.disabled).toBe(false);
        expect(passwordField.disabled).toBe(false);
        expect(submitBtn.disabled).toBe(false);
    });

    it('renders a global error banner successfully using .setGlobalError(msg)', () => {
        const { form } = setupFormWithInputs();

        expect(form.querySelector('.auth-form__global-error')).toBeNull();

        form.setGlobalError('Invalid credentials');

        const banner = form.querySelector('.auth-form__global-error');
        expect(banner).toBeTruthy();
        expect(banner.textContent).toBe('Invalid credentials');
        expect(form.classList.contains('has-global-error')).toBe(true);
    });

    it('clears global errors dynamically on the next user keystroke in any child input', () => {
        const { form, emailInput } = setupFormWithInputs();

        form.setGlobalError('Unexpected server error');
        expect(form.querySelector('.auth-form__global-error')).toBeTruthy();

        // Simulate typing inside the email input
        const emailField = emailInput.querySelector('.input-group__field');
        emailField.dispatchEvent(new Event('input', { bubbles: true }));

        // Banner should dynamically clear
        expect(form.querySelector('.auth-form__global-error')).toBeNull();
        expect(form.classList.contains('has-global-error')).toBe(false);
    });
});
