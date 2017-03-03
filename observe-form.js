"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var booleanMap = {
    "true": true, "false": false,
    "True": true, "False": false,
};
var pathRegex = /^(?:[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])(?:\.[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])*$/;
function makeSetter(path, context) {
    if (!path || !pathRegex.test(path)) {
        throw new Error("Input name \"" + path + "\" is invalid\"");
    }
    var parts = path.split(/[\.\[\]]/g).filter(function (s) { return s.length > 0; });
    var prefixCount = parts.length - 1;
    var obj = context;
    for (var i = 0; i < prefixCount; i++) {
        var prop = parts[i];
        if (!obj[prop]) {
            obj[prop] = isNaN(parseInt(parts[i + 1])) ? {} : [];
        }
        ;
        obj = obj[prop];
    }
    var part = parts[parts.length - 1];
    return function (value) {
        if (typeof value === "string") {
            var oldValue = obj[part];
            if (typeof oldValue === "number") {
                var number = parseFloat(value);
                obj[part] = isNaN(number) ? null : number;
            }
            else if (typeof oldValue === "boolean") {
                obj[part] = value ? booleanMap[value] : null;
            }
            else {
                obj[part] = value;
            }
        }
        else {
            obj[part] = value;
        }
    };
}
var bindTextInput = function (input, context) {
    var setter = makeSetter(input.getAttribute("name"), context);
    input.addEventListener("input", function () {
        setter(input.value);
    });
    input.addEventListener("change", function () {
        setter(input.value);
    });
    setter(input.value);
    input.className += " .__observe-form_bound";
};
function bindChangeInput(element, context) {
    var setter = makeSetter(element.getAttribute("name"), context);
    element.addEventListener("change", function () {
        setter(element.value);
    });
    setter(element.value);
    element.className += " .__observe-form_bound";
}
function bindCheckbox(checkbox, context) {
    var setter = makeSetter(checkbox.getAttribute("name"), context);
    checkbox.addEventListener("change", function () {
        setter(checkbox.checked);
    });
    setter(checkbox.checked);
    checkbox.className += " .__observe-form_bound";
}
var textSelector = ("input[type=text][name]:not(.__observe-form_bound)," +
    "input[type=password][name]:not(.__observe-form_bound)," +
    "input[type=email][name]:not(.__observe-form_bound)," +
    "input[type=number][name]:not(.__observe-form_bound)," +
    "input[type=range][name]:not(.__observe-form_bound)," +
    "input[type=search][name]:not(.__observe-form_bound)," +
    "input[type=tel][name]:not(.__observe-form_bound)," +
    "input[type=url][name]:not(.__observe-form_bound)," +
    "textarea[name]:not(.__observe-form_bound)");
var changeSelector = ("input[type=radio][name]:not(.__observe-form_bound)," +
    "input[type=file][name]:not(.__observe-form_bound)," +
    "input[type=hidden][name]:not(.__observe-form_bound)," +
    "select[name]:not(.__observe-form_bound)");
var checkboxSelector = "input[type=checkbox][name]:not(.__observe-form_bound)";
function bindSubtree(root, context) {
    var textInputs = root.querySelectorAll(textSelector);
    for (var i = 0; i < textInputs.length; i++) {
        bindTextInput(textInputs[i], context);
    }
    var changeInputs = root.querySelectorAll(changeSelector);
    for (var i = 0; i < changeInputs.length; i++) {
        bindChangeInput(changeInputs[i], context);
    }
    var checkboxes = root.querySelectorAll(checkboxSelector);
    for (var i = 0; i < checkboxes.length; i++) {
        bindCheckbox(checkboxes[i], context);
    }
}
function observeForm(form, context) {
    if (context === void 0) { context = {}; }
    bindSubtree(form, context);
    var observer = new MutationObserver(function () {
        bindSubtree(form, context);
    });
    observer.observe(form, {
        childList: true,
        subtree: true,
    });
    return context;
}
exports.observeForm = observeForm;
