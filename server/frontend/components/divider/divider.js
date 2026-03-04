export const createDivider = (text = "OR") => {
    const divider = document.createElement('div');
    divider.className = 'divider';

    // Create the text span inside
    const span = document.createElement('span');
    span.innerText = text;
    divider.appendChild(span);

    return divider;
};
