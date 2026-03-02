import { createButton } from './button';

describe('Primary Button Component', () => {
    it('renders a button element with correct label', () => {
        const button = createButton({ label: 'SIGN IN' });

        expect(button.tagName).toBe('BUTTON');
        expect(button.className).toContain('btn-primary');
        expect(button.innerText).toBe('SIGN IN');
    });

    it('binds an onClick handler properly', () => {
        const mockOnClick = jest.fn();
        const button = createButton({ label: 'TEST', onClick: mockOnClick });

        // Simulate a user click
        button.click();

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});
