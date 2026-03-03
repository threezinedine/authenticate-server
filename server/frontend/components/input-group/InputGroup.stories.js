import { createInputGroup } from './input-group';
import '../../assets/global.css'; // Ensure CSS variables load for the component rendering in the story

export default {
    title: 'Components/Input Group',
    tags: ['autodocs'],
    render: (args) => createInputGroup(args),
    argTypes: {
        label: { control: 'text' },
        type: {
            control: { type: 'select' },
            options: ['text', 'email', 'password'],
        },
        placeholder: { control: 'text' },
        iconSvg: { control: 'text' },
        errorMessage: { control: 'text' },
    },
    // Adding a dark background for the story to display the glowing contrast accurately
    parameters: {
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0a0a0b' },
                { name: 'light', value: '#f8fafc' },
            ],
        },
    }
};

const userSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

const lockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;

export const Email = {
    args: {
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email',
        iconSvg: userSvg
    },
};

export const Password = {
    args: {
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        iconSvg: lockSvg
    },
};

export const WithError = {
    args: {
        ...Email.args,
        label: 'Email Address',
        errorMessage: 'Please enter a valid email address.',
    }
};

export const InteractiveValidation = {
    args: {
        ...Email.args,
        label: 'Type invalid email to trigger error',
        // Example dynamic change handler injected for Storybook interactive demo
        onChange: (value, containerRef, errorRef) => {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!isValid && value.length > 0) {
                containerRef.setError("Invalid email format detected.");
            } else {
                containerRef.setError(""); // Clears error
            }
        }
    }
};

export const MultipleInputs = {
    args: {
        label: 'Full Name',
        inputs: [
            {
                type: 'text',
                placeholder: 'First Name',
                iconSvg: userSvg
            },
            {
                type: 'text',
                placeholder: 'Last Name'
            }
        ]
    }
};

export const PasswordWithConditions = {
    args: {
        label: 'Create Password',
        type: 'password',
        placeholder: '••••••••',
        iconSvg: lockSvg,
        conditions: [
            { id: 'length', text: 'At least 8 characters', isMet: false },
            { id: 'uppercase', text: 'One uppercase letter', isMet: false },
            { id: 'number', text: 'One number', isMet: false }
        ],
        onChange: (value, container) => {
            container.updateCondition('length', value.length >= 8);
            container.updateCondition('uppercase', /[A-Z]/.test(value));
            container.updateCondition('number', /[0-9]/.test(value));
        }
    }
};
