import { createAuthForm } from './auth-form';
import { createInputGroup } from '../input-group/input-group';
import '../../assets/global.css';

export default {
    title: 'Components/Auth Form',
    tags: ['autodocs'],
    parameters: {
        backgrounds: {
            default: 'dark',
            values: [{ name: 'dark', value: '#0a0a0b' }],
        },
    }
};

const userSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
const lockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

const createTestInputs = () => {
    const emailInput = createInputGroup({
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        iconSvg: userSvg
    });
    emailInput.querySelector('input').name = 'email';

    const passwordInput = createInputGroup({
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        iconSvg: lockSvg
    });
    passwordInput.querySelector('input').name = 'password';

    return [emailInput, passwordInput];
};

export const InitialState = () => {
    return createAuthForm({
        id: 'initial-form',
        submitLabel: 'Sign In',
        children: createTestInputs(),
        onSubmit: async (payload) => {
            console.log('Submitted Payload:', payload);
        }
    });
};

export const ValidatingState = () => {
    const inputs = createTestInputs();
    inputs[0].setError('Please enter a valid email'); // mock error onto child

    return createAuthForm({
        id: 'validating-form',
        submitLabel: 'Sign In',
        children: inputs
    });
};

export const SubmittingState = () => {
    const form = createAuthForm({
        id: 'submitting-form',
        submitLabel: 'Sign In',
        children: createTestInputs(),
        onSubmit: () => new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds to show loader
    });

    // Auto-trigger submit for Storybook display
    setTimeout(() => {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);

    return form;
};

export const GlobalErrorState = () => {
    const form = createAuthForm({
        id: 'error-form',
        submitLabel: 'Sign In',
        children: createTestInputs(),
    });

    form.setGlobalError('Invalid username or password. Please try again.');

    return form;
};

export const SuccessState = () => {
    const form = createAuthForm({
        id: 'success-form',
        submitLabel: 'Sign In',
        children: createTestInputs(),
        onSubmit: async () => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        }
    });

    // Override standard button logic to simulate what a real redirect might look like briefly
    form.addEventListener('submit', () => {
        setTimeout(() => {
            const btn = form.querySelector('button');
            btn.innerHTML = '✔ Success!';
            btn.style.backgroundColor = 'var(--sys-success, #10b981)';
            btn.style.borderColor = 'var(--sys-success, #10b981)';
        }, 1100);
    });

    return form;
};
