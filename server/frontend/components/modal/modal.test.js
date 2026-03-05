import { createModal } from './modal.js';

describe('Modal Component', () => {

    beforeEach(() => {
        // Clear DOM before each test
        document.body.innerHTML = '';
        window.__TEST_MODE__ = true; // Disable transitions
    });

    afterEach(() => {
        window.__TEST_MODE__ = false;
        jest.clearAllMocks();
    });

    it('should create modal overlay element but not mount immediately', () => {
        const modalController = createModal({ title: 'Test Title' });
        expect(modalController.getElement().classList.contains('modal-overlay')).toBe(true);
        expect(document.body.contains(modalController.getElement())).toBe(false);
    });

    it('should mount to body and add open class when open() is called', () => {
        const modalController = createModal({ title: 'Open Me' });
        modalController.open();

        const overlay = document.querySelector('.modal-overlay');
        expect(overlay).not.toBeNull();
        expect(overlay.classList.contains('modal-overlay--open')).toBe(true);

        const title = overlay.querySelector('.modal__title');
        expect(title.textContent).toBe('Open Me');
    });

    it('should remove from body when close() is called in test mode', () => {
        const modalController = createModal({ title: 'Close Me' });
        modalController.open();

        expect(document.querySelector('.modal-overlay')).not.toBeNull();

        modalController.close();

        expect(document.querySelector('.modal-overlay')).toBeNull();
    });

    it('should render HTML body content correctly', () => {
        const modalController = createModal({
            title: 'Test',
            body: '<p class="custom-para">Hello World</p>'
        });
        modalController.open();

        const bodyContainer = document.querySelector('.modal__body');
        const customPara = bodyContainer.querySelector('.custom-para');
        expect(customPara).not.toBeNull();
        expect(customPara.textContent).toBe('Hello World');
    });

    it('should render DOM element body content correctly via setBody', () => {
        const modalController = createModal({ title: 'Dynamic' });
        modalController.open();

        const div = document.createElement('div');
        div.id = 'dynamic-div';
        div.textContent = 'Dynamic Content';

        modalController.setBody(div);

        expect(document.getElementById('dynamic-div')).not.toBeNull();
        expect(document.querySelector('.modal__body').textContent).toBe('Dynamic Content');
    });

    it('should render actions in footer buttons', () => {
        const onClickMock = jest.fn();
        const modalController = createModal({
            title: 'Action Modal',
            actions: [
                { label: 'Yes', variant: 'primary', onClick: onClickMock },
                { label: 'No', variant: 'ghost' }
            ]
        });
        modalController.open();

        const buttons = document.querySelectorAll('.modal__footer .btn');
        expect(buttons.length).toBe(2);

        expect(buttons[0].querySelector('.btn__text').textContent).toBe('Yes');
        expect(buttons[1].querySelector('.btn__text').textContent).toBe('No');

        // Click Yes button
        buttons[0].click();
        expect(onClickMock).toHaveBeenCalled();
    });

    it('should apply size and variant classes', () => {
        const modalController = createModal({
            title: 'Action Modal',
            size: 'sm',
            variant: 'danger'
        });
        modalController.open();

        const modalDiv = document.querySelector('.modal');
        expect(modalDiv.classList.contains('modal--sm')).toBe(true);
        expect(modalDiv.classList.contains('modal--danger')).toBe(true);
    });

});
