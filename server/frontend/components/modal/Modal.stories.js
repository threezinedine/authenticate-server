import { createModal } from './modal.js';
import { publishToast } from '../toast/toast.js';

import './style.css';
import '../button/style.css';

export default {
    title: 'Components / Modal',
    tags: ['autodocs'],
    argTypes: {
        title: { control: 'text' },
        body: { control: 'text' },
        variant: {
            control: { type: 'select' },
            options: ['default', 'danger', 'info'],
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg'],
        },
        closeOnOverlay: { control: 'boolean' },
        closeOnEsc: { control: 'boolean' }
    },
    // We mount a button to trigger the modal, as the modal itself mounts to `<body>`
    render: (args) => {
        const container = document.createElement('div');
        container.style.padding = '2rem';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';

        const triggerBtn = document.createElement('button');
        triggerBtn.className = 'btn btn--primary';
        triggerBtn.textContent = 'Open Modal';

        triggerBtn.addEventListener('click', () => {
            const modal = createModal({
                ...args,
                onClose: () => publishToast({ msg: 'Modal closed', type: 'info' })
            });
            modal.open();
        });

        container.appendChild(triggerBtn);
        return container;
    }
};

export const Default = {
    args: {
        title: 'Confirm Configuration',
        body: 'Are you sure you want to apply these settings? This action will overwrite your current configuration parameters.',
        variant: 'default',
        size: 'md',
        actions: [
            { label: 'Cancel', variant: 'ghost' },
            {
                label: 'Confirm',
                variant: 'primary',
                onClick: () => publishToast({ msg: 'Settings applied successfully', type: 'success' })
            }
        ]
    }
};

export const DangerConfirm = {
    args: {
        title: 'Delete User Account',
        body: 'This action is irreversible. All data associated with alex@example.com will be permanently removed.',
        variant: 'danger',
        size: 'sm',
        actions: [
            { label: 'Cancel', variant: 'ghost' },
            {
                label: 'Delete',
                variant: 'danger',
                onClick: async ({ close }) => {
                    return new Promise((resolve) => setTimeout(() => {
                        publishToast({ msg: 'User deleted safely', type: 'success' });
                        resolve();
                    }, 500));
                }
            }
        ]
    }
};

export const InfoDisclosure = {
    args: {
        title: 'System Update Completed',
        body: 'Version 2.4.1 has been successfully deployed across all cluster nodes. See the changelog for details.',
        variant: 'info',
        size: 'md',
        actions: [
            { label: 'Got it', variant: 'primary' }
        ]
    }
};

export const ScrollableContent = {
    args: {
        title: 'Terms of Service',
        body: `
            <div style="padding-bottom: 2rem;">
                <p>Please read these terms carefully before using our services.</p>
                <br/>
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
                <br/>
                <h3>2. Modifications</h3>
                <p>We reserve the right to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.</p>
                <br/>
                <h3>3. Content</h3>
                <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.</p>
                <br/>
                <h3>4. Accounts</h3>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
                <br/>
                <h3>5. Intellectual Property</h3>
                <p>The Service and its original content, features and functionality are and will remain the exclusive property of NTT and its licensors.</p>
                <br/>
                <h3>6. Termination</h3>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.</p>
                <br/>
                <h3>7. Limitation Of Liability</h3>
                <p>In no event shall NTT, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.</p>
            </div>
        `,
        variant: 'default',
        size: 'lg',
        actions: [
            { label: 'Decline', variant: 'ghost' },
            { label: 'Accept Terms', variant: 'primary' }
        ]
    }
};
