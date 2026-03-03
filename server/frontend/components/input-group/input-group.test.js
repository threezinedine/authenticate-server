import { createInputGroup } from './input-group';

describe('Input Group Component', () => {
    it('renders a single input correctly', () => {
        const group = createInputGroup({
            label: 'Email',
            type: 'email',
            placeholder: 'test@example.com'
        });

        expect(group.className).toBe('input-group');

        const labelEl = group.querySelector('.input-group__label');
        expect(labelEl).toBeTruthy();
        expect(labelEl.textContent).toBe('Email');

        const inputEl = group.querySelector('input.input-group__field');
        expect(inputEl).toBeTruthy();
        expect(inputEl.type).toBe('email');
        expect(inputEl.placeholder).toBe('test@example.com');
    });

    it('renders an icon when provided', () => {
        const iconSvg = '<svg class="test-icon"></svg>';
        const group = createInputGroup({
            label: 'With Icon',
            iconSvg
        });

        const iconEl = group.querySelector('.input-group__icon');
        expect(iconEl).toBeTruthy();
        expect(iconEl.innerHTML).toBe(iconSvg);
    });

    it('supports multiple inputs in a grid row', () => {
        const group = createInputGroup({
            label: 'Full Name',
            inputs: [
                { type: 'text', placeholder: 'First' },
                { type: 'text', placeholder: 'Last' }
            ]
        });

        const rowEl = group.querySelector('.input-group__row');
        expect(rowEl).toBeTruthy();

        const inputEls = group.querySelectorAll('input.input-group__field');
        expect(inputEls.length).toBe(2);
        expect(inputEls[0].placeholder).toBe('First');
        expect(inputEls[1].placeholder).toBe('Last');
    });

    it('triggers the onChange handler on input event', () => {
        const mockOnChange = jest.fn();
        const group = createInputGroup({
            label: 'Test Input',
            onChange: mockOnChange
        });

        const inputEl = group.querySelector('input.input-group__field');
        inputEl.value = 'hello';

        // Simulate input event
        inputEl.dispatchEvent(new Event('input'));

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith('hello', group, expect.any(HTMLElement));
    });

    it('can dynamically set and clear error messages', () => {
        const group = createInputGroup({
            label: 'Test Error'
        });

        const errorEl = group.querySelector('.input-group__error-text');

        // Initial state
        expect(group.classList.contains('has-error')).toBe(false);
        expect(errorEl.textContent).toBe('');

        // Set Error
        group.setError('Invalid value');
        expect(group.classList.contains('has-error')).toBe(true);
        expect(errorEl.textContent).toBe('Invalid value');

        // Clear Error
        group.setError('');
        expect(group.classList.contains('has-error')).toBe(false);
        expect(errorEl.textContent).toBe('');
    });

    it('applies initial error state if provided during creation', () => {
        const group = createInputGroup({
            label: 'Test Error',
            errorMessage: 'Init Error'
        });

        const errorEl = group.querySelector('.input-group__error-text');

        expect(group.classList.contains('has-error')).toBe(true);
        expect(errorEl.textContent).toBe('Init Error');
    });

    it('renders and updates multiple validation conditions correctly', () => {
        const group = createInputGroup({
            label: 'Password',
            conditions: [
                { id: 'c1', text: 'Condition 1', isMet: false },
                { id: 'c2', text: 'Condition 2', isMet: true }
            ]
        });

        const conditions = group.querySelectorAll('.input-group__condition');
        expect(conditions.length).toBe(2);

        expect(conditions[0].classList.contains('unmet')).toBe(true);
        expect(conditions[0].querySelector('.condition-text').textContent).toBe('Condition 1');

        expect(conditions[1].classList.contains('met')).toBe(true);
        expect(conditions[1].querySelector('.condition-text').textContent).toBe('Condition 2');

        // Update condition
        group.updateCondition('c1', true);
        expect(conditions[0].classList.contains('met')).toBe(true);
        expect(conditions[0].classList.contains('unmet')).toBe(false);
    });
});
