import { createButton } from './button';

describe('Button Component', () => {
    it('renders a primary button element with correct label', () => {
        const button = createButton({ label: 'SIGN IN', variant: 'primary' });

        expect(button.tagName).toBe('BUTTON');
        expect(button.className).toContain('btn--primary');
        expect(button.querySelector('.btn__text').textContent).toBe('SIGN IN');
        expect(button.querySelector('.btn__reflection')).toBeTruthy();
    });

    it('renders a social button element with an icon', () => {
        const button = createButton({ label: 'Google', variant: 'social', iconSvg: '<svg></svg>' });

        expect(button.className).toContain('btn--social');
        expect(button.querySelector('.btn__icon')).toBeTruthy();
        expect(button.querySelector('.btn__text').textContent).toBe('Google');
        expect(button.querySelector('.btn__reflection')).toBeFalsy();
    });

    it('binds an onClick handler properly', () => {
        const mockOnClick = jest.fn();
        const button = createButton({ label: 'TEST', onClick: mockOnClick });

        // Simulate a user click
        button.click();

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});
