import { publishToast } from './toast.js';
import './style.css'; // Optional local import if Storybook globally doesn't have it, but our preview.js will import it globally anyway

export default {
    title: 'Components/Toast',
    tags: ['autodocs'],
    argTypes: {
        msg: { control: 'text' },
        type: {
            control: { type: 'select' },
            options: ['success', 'info', 'warn', 'error']
        },
        duration: { control: { type: 'range', min: 1000, max: 10000, step: 1000 } }
    },
};

/**
 * Storybook Template matching standard implementation flow.
 * Note: Since toasts slide into a fixed global container, this template simply renders a button to trigger it.
 */
const Template = ({ msg, type, duration }) => {
    const mainWrapper = document.createElement('div');
    mainWrapper.style.padding = '3rem';
    mainWrapper.style.minHeight = '300px';

    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'btn--primary';
    triggerBtn.textContent = 'Publish Toast';
    triggerBtn.style.padding = '0.75rem 1.5rem';

    // Click publishes the notification using actual prod logic
    triggerBtn.addEventListener('click', () => {
        publishToast({ msg, type, duration });
    });

    mainWrapper.appendChild(triggerBtn);

    // Quick disclaimer that it renders at the bottom-right
    const text = document.createElement('p');
    text.style.color = 'var(--text-muted)';
    text.style.marginTop = '1rem';
    text.textContent = `Click the button to publish a ${type} toast. It will slide in from the bottom-right.`;
    mainWrapper.appendChild(text);

    return mainWrapper;
};

export const Info = Template.bind({});
Info.args = {
    msg: 'A new software update is available. Please refresh the dashboard.',
    type: 'info',
    duration: 5000,
};

export const Success = Template.bind({});
Success.args = {
    msg: 'User identity successfully verified and local cache has been cleared!',
    type: 'success',
    duration: 5000,
};

export const Warning = Template.bind({});
Warning.args = {
    msg: 'Your session will expire in 2 minutes. Actions may not be saved.',
    type: 'warn',
    duration: 5000,
};

export const Error = Template.bind({});
Error.args = {
    msg: 'Failed to synchronize with the external Identity Provider. 401 Unauthorized.',
    type: 'error',
    duration: 8000,
};

export const StackedDemo = () => {
    const btn = document.createElement('button');
    btn.className = 'btn--primary';
    btn.textContent = 'Publish Multiple Items';
    btn.style.padding = '0.75rem 1.5rem';

    btn.addEventListener('click', () => {
        publishToast({ msg: 'Step 1: Checking credentials...', type: 'info', duration: 3000 });

        setTimeout(() => {
            publishToast({ msg: 'Step 2: Database warning identified.', type: 'warn', duration: 4500 });
        }, 800);

        setTimeout(() => {
            publishToast({ msg: 'Process failed entirely.', type: 'error', duration: 7000 });
        }, 1600);
    });

    return btn;
};
