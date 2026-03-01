import './button.css';

export const createButton = ({ label, onClick }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = label;
    btn.className = 'btn-primary';

    if (onClick) {
        btn.addEventListener('click', onClick);
    }

    return btn;
};
