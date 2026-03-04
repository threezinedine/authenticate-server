export const createInputGroup = ({ label, type = 'text', placeholder, iconSvg, errorMessage, onChange, inputs, conditions }) => {
    // 1. Create Main Container
    const container = document.createElement('div');
    container.className = 'input-group';

    // Toggle error modifier class if an error message exists
    if (errorMessage) {
        container.classList.add('has-error');
    }

    // 2. Create Label
    if (label) {
        const labelEl = document.createElement('label');
        labelEl.className = 'input-group__label';
        labelEl.textContent = label;
        container.appendChild(labelEl);
    }

    // Prepare Error Message Text Container (needed early for `onChange` bindings)
    const errorEl = document.createElement('span');
    errorEl.className = 'input-group__error-text';
    if (errorMessage) {
        errorEl.textContent = errorMessage;
    }

    // Normalize inputs list (supports either a single scalar config or an array)
    const inputConfigs = inputs || [{ type, placeholder, iconSvg, onChange }];

    // Create Row Container if there's multiple
    const rowEl = document.createElement('div');
    if (inputConfigs.length > 1) {
        rowEl.className = 'input-group__row';
    }

    // Iterate over configurations
    inputConfigs.forEach((config) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-group__wrapper';

        if (config.iconSvg) {
            const iconEl = document.createElement('div');
            iconEl.className = 'input-group__icon';
            iconEl.innerHTML = config.iconSvg;
            wrapper.appendChild(iconEl);
        }

        const inputEl = document.createElement('input');
        inputEl.className = 'input-group__field';
        inputEl.type = config.type || 'text';
        if (config.placeholder) {
            inputEl.placeholder = config.placeholder;
        }

        if (config.onChange) {
            inputEl.addEventListener('input', (e) => config.onChange(e.target.value, container, errorEl));
        }

        wrapper.appendChild(inputEl);
        if (inputConfigs.length > 1) {
            rowEl.appendChild(wrapper);
        } else {
            container.appendChild(wrapper); // single append without row
        }
    });

    if (inputConfigs.length > 1) {
        container.appendChild(rowEl);
    }

    // Append error at the end
    container.appendChild(errorEl);

    // Expose helper dynamically
    container.setError = (msg) => {
        if (msg) {
            container.classList.add('has-error');
            errorEl.textContent = msg;
        } else {
            container.classList.remove('has-error');
            errorEl.textContent = '';
        }
    };

    // Append validation conditions if multiple conditions are specified (e.g. password strength rules)
    let conditionsMap = {};
    if (conditions && conditions.length > 0) {
        const conditionsContainer = document.createElement('div');
        conditionsContainer.className = 'input-group__conditions';

        const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        const dotSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"></circle></svg>';

        conditions.forEach(cond => {
            const condEl = document.createElement('div');
            condEl.className = `input-group__condition ${cond.isMet ? 'met' : 'unmet'}`;

            const iconSpan = document.createElement('span');
            iconSpan.className = 'condition-icon';
            iconSpan.innerHTML = cond.isMet ? checkSvg : dotSvg;

            const textSpan = document.createElement('span');
            textSpan.className = 'condition-text';
            textSpan.textContent = cond.text;

            condEl.appendChild(iconSpan);
            condEl.appendChild(textSpan);
            conditionsContainer.appendChild(condEl);

            conditionsMap[cond.id] = { el: condEl, icon: iconSpan, checkSvg, dotSvg };
        });

        container.appendChild(conditionsContainer);

        // Expose helper to toggle individual nested conditions
        container.updateCondition = (id, isMet) => {
            if (conditionsMap[id]) {
                const { el, icon, checkSvg, dotSvg } = conditionsMap[id];
                el.className = `input-group__condition ${isMet ? 'met' : 'unmet'}`;
                icon.innerHTML = isMet ? checkSvg : dotSvg;
            }
        };
    }

    return container;
};
