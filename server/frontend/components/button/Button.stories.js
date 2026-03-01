import { createButton } from './button';

export default {
    title: 'Components/Button',
    tags: ['autodocs'],
    render: (args) => createButton(args),
    argTypes: {
        label: { control: 'text' },
        onClick: { action: 'onClick' },
    },
};

export const Primary = {
    args: {
        label: 'SIGN IN',
    },
};
