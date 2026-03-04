/**
 * @jest-environment jsdom
 */

import { publishToast } from './toast.js';

describe('Toast Component', () => {
    let container;

    beforeEach(() => {
        // 1. Setup JSDOM environment with the required static infrastructure
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.className = 'toast-container'; // Global container where items are mounted
        document.body.appendChild(container);

        // Tell components that we are isolated in a test context
        window.__TEST_MODE__ = true;

        // 2. Intercept native setTimeout for predictable duration testing
        jest.useFakeTimers();
    });

    afterEach(() => {
        // 1. Teardown
        document.body.innerHTML = '';
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('appends a new .toast-item into the .toast-container when published', () => {
        publishToast({ msg: 'Hello World' });

        const items = document.querySelectorAll('.toast-container .toast-item');
        expect(items.length).toBe(1);
    });

    it('renders the provided msg text accurately', () => {
        const testMessage = 'Resource uploaded successfully';
        publishToast({ msg: testMessage });

        const item = document.querySelector('.toast-item');
        expect(item.textContent).toContain(testMessage);
    });

    it('assigns the correct severity modifier class based on the type provided', () => {
        // Assert Error type
        publishToast({ msg: 'Server Failure', type: 'error' });
        let errors = document.querySelectorAll('.toast-item--error');
        expect(errors.length).toBe(1);

        // Assert Success type
        publishToast({ msg: 'Saved', type: 'success' });
        let successes = document.querySelectorAll('.toast-item--success');
        expect(successes.length).toBe(1);
    });

    it('is automatically removed from the container after exactly `duration` milliseconds', () => {
        publishToast({ msg: 'Auto dismiss me', duration: 4000 });

        // Assert it exists immediately
        expect(document.querySelectorAll('.toast-item').length).toBe(1);

        // Advance time right before the exact limit - assert it still lives
        jest.advanceTimersByTime(3999);
        expect(document.querySelectorAll('.toast-item').length).toBe(1);

        // Tick the final millisecond - assert it triggers auto-removal
        jest.advanceTimersByTime(1);
        expect(document.querySelectorAll('.toast-item').length).toBe(0);
    });

    it('immediately removes the .toast-item when the close button is clicked, preventing future execution', () => {
        publishToast({ msg: 'Manual dismiss', duration: 8000 });

        const item = document.querySelector('.toast-item');
        const closeBtn = item.querySelector('.toast-item__close'); // The physical (X) close trigger

        expect(item).not.toBeNull();
        expect(closeBtn).not.toBeNull();

        // Simulate a physical client click on the close button
        closeBtn.click();

        // Assert it is instantly removed regardless of the remaining time
        expect(document.querySelectorAll('.toast-item').length).toBe(0);

        // Safely fast-forward the remaining time to ensure no JS exceptions occur
        jest.advanceTimersByTime(8000);
    });

    it('stacks correctly by appending multiple .toast-item elements into the container when called multiple times', () => {
        publishToast({ msg: 'First Alert', duration: 5000 });
        publishToast({ msg: 'Second Alert', duration: 5000 });
        publishToast({ msg: 'Third Alert', duration: 5000 });

        const items = document.querySelectorAll('.toast-container .toast-item');

        // Assert all three notifications coexist sequentially without overwriting
        expect(items.length).toBe(3);

        // Provide assertions confirming their exact order structure matches DOM append expectation
        expect(items[0].textContent).toContain('First Alert');
        expect(items[2].textContent).toContain('Third Alert');
    });
});
