"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var booleanMap = {
    "true": true, "false": false,
    "True": true, "False": false,
};
var pathRegex = /^(?:[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])(?:\.[a-zA-Z][a-zA-Z0-9]*|\[[0-9]+\])*$/;
var boundClassMarker = "__observe-form_bound";
function makeSetter(path, formClass, context) {
    if (!path || !pathRegex.test(path)) {
        throw new Error("Input name \"" + path + "\" is invalid\"");
    }
    var selector = "." + formClass + " [name=\"" + path + "\"]." + boundClassMarker;
    var parts = path.split(/[\.\[\]]/g).filter(function (s) { return s.length > 0; });
    var prefixCount = parts.length - 1;
    var obj = context;
    for (var i = 0; i < prefixCount; i++) {
        var part = parts[i];
        if (!obj[part]) {
            obj[part] = isNaN(parseInt(parts[i + 1])) ? {} : [];
        }
        obj = obj[part];
    }
    var prop = parts[parts.length - 1];
    var propValue = obj[prop];
    Object.defineProperty(obj, prop, {
        enumerable: true,
        configurable: true,
        get: function () {
            return propValue;
        },
        set: function (value) {
            propValue = value;
            var elements = document.querySelectorAll(selector);
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element) {
                    if (element.type === "checkbox") {
                        element.checked = value;
                    }
                    else if (element.type === "radio") {
                        element.checked = (element.value === value);
                    }
                    else {
                        element.value = value;
                    }
                }
            }
        },
    });
    return function (value) {
        if (typeof value === "string") {
            if (typeof propValue === "number") {
                var number = parseFloat(value);
                obj[prop] = isNaN(number) ? null : number;
            }
            else if (typeof propValue === "boolean") {
                obj[prop] = value ? booleanMap[value] : null;
            }
            else {
                obj[prop] = value;
            }
        }
        else {
            obj[prop] = value;
        }
    };
}
function bindTextInput(input, formClass, context) {
    var setter = makeSetter(input.getAttribute("name"), formClass, context);
    input.addEventListener("input", function () {
        setter(input.value);
    });
    input.addEventListener("change", function () {
        setter(input.value);
    });
    setter(input.value);
    input.className += " " + boundClassMarker;
}
function bindChangeInput(element, formClass, context) {
    var setter = makeSetter(element.getAttribute("name"), formClass, context);
    element.addEventListener("change", function () {
        setter(element.value);
    });
    setter(element.value);
    element.className += " " + boundClassMarker;
}
function bindCheckbox(checkbox, formClass, context) {
    var setter = makeSetter(checkbox.getAttribute("name"), formClass, context);
    checkbox.addEventListener("change", function () {
        setter(checkbox.checked);
    });
    setter(checkbox.checked);
    checkbox.className += " " + boundClassMarker;
}
function bindHiddenInput(input, formClass, context) {
    var setter = makeSetter(input.getAttribute("name"), formClass, context);
    setter(input.value);
    input.className += " " + boundClassMarker;
}
var textSelector = ("input[type=text][name]:not(." + boundClassMarker + ")," +
    ("input[type=password][name]:not(." + boundClassMarker + "),") +
    ("input[type=email][name]:not(." + boundClassMarker + "),") +
    ("input[type=number][name]:not(." + boundClassMarker + "),") +
    ("input[type=range][name]:not(." + boundClassMarker + "),") +
    ("input[type=search][name]:not(." + boundClassMarker + "),") +
    ("input[type=tel][name]:not(." + boundClassMarker + "),") +
    ("input[type=url][name]:not(." + boundClassMarker + "),") +
    ("textarea[name]:not(." + boundClassMarker + ")"));
var changeSelector = ("input[type=radio][name]:not(." + boundClassMarker + ")," +
    ("input[type=file][name]:not(." + boundClassMarker + "),") +
    ("select[name]:not(." + boundClassMarker + ")"));
var checkboxSelector = "input[type=checkbox][name]:not(." + boundClassMarker + ")";
var hiddenSelector = "input[type=hidden][name]:not(." + boundClassMarker + ")";
function bindSubtree(root, formClass, context) {
    // console.log("bindSubtree");
    var textInputs = root.querySelectorAll(textSelector);
    for (var i = 0; i < textInputs.length; i++) {
        bindTextInput(textInputs[i], formClass, context);
    }
    var changeInputs = root.querySelectorAll(changeSelector);
    for (var i = 0; i < changeInputs.length; i++) {
        bindChangeInput(changeInputs[i], formClass, context);
    }
    var checkboxes = root.querySelectorAll(checkboxSelector);
    for (var i = 0; i < checkboxes.length; i++) {
        bindCheckbox(checkboxes[i], formClass, context);
    }
    var hiddens = root.querySelectorAll(hiddenSelector);
    for (var i = 0; i < hiddens.length; i++) {
        bindHiddenInput(hiddens[i], formClass, context);
    }
}
var boundFormIndex = 1;
function observeForm(form, context) {
    if (context === void 0) { context = {}; }
    var formClass = boundClassMarker + "-" + (boundFormIndex++);
    form.className += " " + formClass;
    bindSubtree(form, formClass, context);
    if ("MutationObserver" in window) {
        var observer = new MutationObserver(function () {
            bindSubtree(form, formClass, context);
        });
        observer.observe(form, {
            childList: true,
            subtree: true,
        });
    }
    else if ("MutationEvent" in window) {
        var schedule_1 = ("setImmediate" in window) ? setImmediate : setTimeout;
        var taskScheduled_1 = false;
        form.addEventListener("DOMSubtreeModified", function () {
            if (!taskScheduled_1) {
                taskScheduled_1 = true;
                schedule_1(function () {
                    bindSubtree(form, formClass, context);
                    taskScheduled_1 = false;
                });
            }
        });
    }
    return context;
}
exports.observeForm = observeForm;
