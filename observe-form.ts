const booleanMap = {
    "true": true, "false": false,
    "True": true, "False": false,
};

const pathRegex = /^(?:[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])(?:\.[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])*$/;

const boundClassMarker = "__observe-form_bound";

function makeSetter(path: string, formClass: string, context: {}) {
    if (!path || !pathRegex.test(path)) {
        throw new Error(`Input name "${path}" is invalid"`);
    }

    const selector = `.${formClass} [name="${path}"].${boundClassMarker}`;
    const parts = path.split(/[\.\[\]]/g).filter(s => s.length > 0);
    const prefixCount = parts.length - 1;
    let obj = context;

    for (let i = 0; i < prefixCount; i++) {
        const part = parts[i];
        if (!obj[part]) {
            obj[part] = isNaN(parseInt(parts[i + 1])) ? {} : [];
        }
        obj = obj[part];
    }
    
    const prop = parts[parts.length - 1];
    let propValue = obj[prop];
    
    Object.defineProperty(obj, prop, {
        enumerable: true,
        get() {
            return propValue;
        },
        set(value: string | number | boolean) {
            propValue = value;

            const elements = document.querySelectorAll(selector);
            
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLInputElement;
                if (element) {
                    if (element.type === "checkbox") {
                        element.checked = value as boolean;
                    } else if (element.type === "radio") {
                        element.checked = (element.value === value);
                    } else {
                        element.value = value as string;
                    }
                }
            }
        },
    });

    return function (value: string | boolean) {
        if (typeof value === "string") {
            if (typeof propValue === "number") {
                const number = parseFloat(value);
                obj[prop] = isNaN(number) ? null : number;
            } else if (typeof propValue === "boolean") {
                obj[prop] = value ? booleanMap[value] : null;
            } else {
                obj[prop] = value;
            }
        } else {
            obj[prop] = value;
        }
    };
}

function bindTextInput (
    input: HTMLInputElement | HTMLTextAreaElement, formClass: string, context: {}
) {
    const setter = makeSetter(input.getAttribute("name"), formClass, context);
    input.addEventListener("input", () => {
        setter(input.value);
    });
    input.addEventListener("change", () => {
        setter(input.value);
    });
    setter(input.value);
    input.className += " " + boundClassMarker;
}

function bindChangeInput(
    element: HTMLInputElement | HTMLSelectElement, formClass: string, context: {}
) {
    const setter = makeSetter(element.getAttribute("name"), formClass, context);
    element.addEventListener("change", () => {
        setter(element.value);
    });
    setter(element.value);
    element.className += " " + boundClassMarker;
}

function bindCheckbox(checkbox: HTMLInputElement, formClass: string, context: {}) {
    const setter = makeSetter(checkbox.getAttribute("name"), formClass, context);
    checkbox.addEventListener("change", () => {
        setter(checkbox.checked);
    });
    setter(checkbox.checked);
    checkbox.className += " " + boundClassMarker;
}

function bindHiddenInput(input: HTMLInputElement, formClass: string, context: {}) {
    const setter = makeSetter(input.getAttribute("name"), formClass, context);
    setter(input.value);
    input.className += " " + boundClassMarker;
}

const textSelector = (
    `input[type=text][name]:not(.${boundClassMarker}),` +
    `input[type=password][name]:not(.${boundClassMarker}),` +
    `input[type=email][name]:not(.${boundClassMarker}),` +
    `input[type=number][name]:not(.${boundClassMarker}),` +
    `input[type=range][name]:not(.${boundClassMarker}),` +
    `input[type=search][name]:not(.${boundClassMarker}),` +
    `input[type=tel][name]:not(.${boundClassMarker}),` +
    `input[type=url][name]:not(.${boundClassMarker}),` +
    `textarea[name]:not(.${boundClassMarker})`
);
const changeSelector = (
    `input[type=radio][name]:not(.${boundClassMarker}),` +
    `input[type=file][name]:not(.${boundClassMarker}),` +
    `select[name]:not(.${boundClassMarker})`
);
const checkboxSelector = `input[type=checkbox][name]:not(.${boundClassMarker})`;
const hiddenSelector = `input[type=hidden][name]:not(.${boundClassMarker})`;

function bindSubtree(root: HTMLElement, formClass: string, context: {}) {
    const textInputs = root.querySelectorAll(textSelector);
    for (let i = 0; i < textInputs.length; i++) {
        bindTextInput(textInputs[i] as any, formClass, context);
    }
    const changeInputs = root.querySelectorAll(changeSelector);
    for (let i = 0; i < changeInputs.length; i++) {
        bindChangeInput(changeInputs[i] as any, formClass, context);
    }
    const checkboxes = root.querySelectorAll(checkboxSelector);
    for (let i = 0; i < checkboxes.length; i++) {
        bindCheckbox(checkboxes[i] as any, formClass, context);
    }
    const hiddens = root.querySelectorAll(hiddenSelector);
    for (let i = 0; i < hiddens.length; i++) {
        bindHiddenInput(hiddens[i] as any, formClass, context);
    }
}

let boundFormIndex = 1;

export function observeForm(form: HTMLElement, context = {}) {
    const formClass = boundClassMarker + "-" + (boundFormIndex++);
    form.className += " " + formClass;

    bindSubtree(form, formClass, context);
    const observer = new MutationObserver(() => {
        bindSubtree(form, formClass, context);
    });
    observer.observe(form, {
        childList: true,
        subtree: true,
    });
    return context;
}