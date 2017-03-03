const booleanMap = {
    "true": true, "false": false,
    "True": true, "False": false,
};

const pathRegex = /^(?:[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])(?:\.[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])*$/;

function makeSetter(path: string, context: any) {
    if (!path || !pathRegex.test(path)) {
        throw new Error(`Input name "${path}" is invalid"`);
    }

    const parts = path.split(/[\.\[\]]/g).filter(s => s.length > 0);
    const prefixCount = parts.length - 1;
    let obj = context;

    for (let i = 0; i < prefixCount; i++) {
        const prop = parts[i];
        if (!obj[prop]) {
            obj[prop] = isNaN(parseInt(parts[i + 1])) ? {} : [];
        };
        obj = obj[prop];
    }
    const part = parts[parts.length - 1];

    return function (value: string | boolean) {
        if (typeof value === "string") {
            const oldValue = obj[part];
            if (typeof oldValue === "number") {
                const number = parseFloat(value);
                obj[part] = isNaN(number) ? null : number;
            } else if (typeof oldValue === "boolean") {
                obj[part] = value ? booleanMap[value] : null;
            } else {
                obj[part] = value;
            }
        } else {
            obj[part] = value;
        }
    }
}

let bindTextInput = function (input: HTMLInputElement | HTMLTextAreaElement, context: {}) {
    const setter = makeSetter(input.getAttribute("name"), context);
    input.addEventListener("input", () => {
        setter(input.value);
    });
    input.addEventListener("change", () => {
        setter(input.value);
    });
    setter(input.value);
    input.className += " .__observe-form_bound";
}

function bindChangeInput(element: HTMLInputElement | HTMLSelectElement, context: {}) {
    const setter = makeSetter(element.getAttribute("name"), context);
    element.addEventListener("change", () => {
        setter(element.value);
    });
    setter(element.value);
    element.className += " .__observe-form_bound";
}

function bindCheckbox(checkbox: HTMLInputElement, context: {}) {
    const setter = makeSetter(checkbox.getAttribute("name"), context);
    checkbox.addEventListener("change", () => {
        setter(checkbox.checked);
    });
    setter(checkbox.checked);
    checkbox.className += " .__observe-form_bound";
}

const textSelector = (
    "input[type=text][name]:not(.__observe-form_bound)," +
    "input[type=password][name]:not(.__observe-form_bound)," +
    "input[type=email][name]:not(.__observe-form_bound)," +
    "input[type=number][name]:not(.__observe-form_bound)," +
    "input[type=range][name]:not(.__observe-form_bound)," +
    "input[type=search][name]:not(.__observe-form_bound)," +
    "input[type=tel][name]:not(.__observe-form_bound)," +
    "input[type=url][name]:not(.__observe-form_bound)," +
    "textarea[name]:not(.__observe-form_bound)"
);

const changeSelector = (
    "input[type=radio][name]:not(.__observe-form_bound)," +
    "input[type=file][name]:not(.__observe-form_bound)," +
    "input[type=hidden][name]:not(.__observe-form_bound)," +
    "select[name]:not(.__observe-form_bound)"
);

const checkboxSelector = "input[type=checkbox][name]:not(.__observe-form_bound)";

function bindSubtree(root: HTMLElement, context: {}) {
    const textInputs = root.querySelectorAll(textSelector);
    for (let i = 0; i < textInputs.length; i++) {
        bindTextInput(textInputs[i] as any, context);
    }
    const changeInputs = root.querySelectorAll(changeSelector);
    for (let i = 0; i < changeInputs.length; i++) {
        bindChangeInput(changeInputs[i] as any, context);
    }
    const checkboxes = root.querySelectorAll(checkboxSelector);
    for (let i = 0; i < checkboxes.length; i++) {
        bindCheckbox(checkboxes[i] as any, context);
    }
}

export function observeForm(form: HTMLElement, context = {}) {
    bindSubtree(form, context);
    const observer = new MutationObserver(() => {
        bindSubtree(form, context);
    });
    observer.observe(form, {
        childList: true,
        subtree: true,
    });
    return context;
}