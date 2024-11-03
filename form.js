// Helper functions
/**
 * Gets input value, compatible with text/number inputs and checkboxes
 * 
 * @param {JQueryElement} jqueryElem what jQuery element to get the value from
 * @param {Boolean} checkbox whether the jQuery element is a checkbox
 * @returns {string|Boolean}
 */
function getInputValue(jqueryElem, checkbox=false) {
    if (!checkbox) {
        return jqueryElem.val();
    } else {
        return jqueryElem.is(":checked");
    }
}

/**
 * Adds a label under the passed jQuery element,
 * notifying that changing it will change presented options
 * 
 * @param {JQueryElem} jqueryElem jQuery element to add the label after
 * @param {String} prefix Prefix to add to "in the above input will change other presented options!"
 * @default "Entering a value"
 */
function addExpandLabel(jqueryElem, prefix="Entering a value") {
    jqueryElem.after(`<small>${prefix} in the above input will change other presented options!</small>`)
}

// Thanks to https://stackoverflow.com/a/75419102 for the jsdoc notation
/**
 * Runs provided func with input value as argument when...
 * - Provided event trigger (default: input)
 * - Setting the value
 * Additionally, it uses addExpandLabel on the element
 * 
 * @param {JQueryElem} jqueryElem what jQuery element to get the value from
 * @param {(value:String|Boolean) => void} func the function to run on event & run. The input value will be passed as first/only argument
 * @param {Boolean} checkbox whether the jQuery element is a checkbox
 * @default false
 * @param {String} event which event to attach to
 * @default "input"
 * @param {String|undefined} prefix @see addExpandLabel
 * 
 */
function setInputAndRun(jqueryElem, func, checkbox=false, event="input", prefix=undefined) {
    addExpandLabel(jqueryElem, prefix);
    jqueryElem.on(event, function(e) {
        func(getInputValue(jqueryElem, checkbox));
    });
    func(getInputValue(jqueryElem, checkbox));
}

/**
 * What it says on the tin: if passed boolean is true,
 * show passed JQuery elements. Else, hide them.
 * 
 * @param {Boolean} boolean whether to show or hide the passed jQuery elements
 * @param {JQueryElem} jqueryElem which jQuery element(s) to show/hide depending on boolean
 */
function ifTrueShowElseHide(boolean, jqueryElem) {
    if (boolean) {
        jqueryElem.show(400);
    } else {
        jqueryElem.hide(400);
    }
}


// This function needs a better name
/**
 * From jquery selector string, get the first element.
 * If the first element/input has value, show the other elements from the selector.
 * Otherwise, hide them 
 * 
 * @param {String} jqueryString - jQuery selector string. `:first` & `:not(:first)`
 *                                will be appended to select the right elements
 * 
 * Note: this function should not be run for things that only
 * appear in their own module file (e.g. RECAPTCHA, WORDPRESS)
 */
function onlyShowRestIfFirstHasValue(jqueryString) {
    const first = $(jqueryString + ":first");
    const otherElements = $(jqueryString + ":not(:first)").parent("fieldset");

    setInputAndRun(first, (value) => {
        ifTrueShowElseHide(value.trim() != "", otherElements);
    })
}


/* Specific events */

// Show related auth fields depending on whether they are selected
function onInputAuthType(value) {
    ifTrueShowElseHide(value == "LDAP", $("[id^=LDAP_AUTH_]"));
    ifTrueShowElseHide(value == "IMAP", $("[id^=IMAP_AUTH_]"));    
}

// Show LONG_SESSION_LIFETIME when ALLOW_LONG_SESSION is enabled
function onInputAllowLongSession(value) {
    ifTrueShowElseHide(value == true, $("[id=LONG_SESSION_LIFETIME]"))
}

// Generate .env file into #result when #generate is clicked
function onClickGenerate(value) {
    let text = "";

    const allInputs = $("input, select");
    allInputs.each(function(i) {
        const input = $(this);
        console.log(input.attr("name"))
        const value = input.attr("type") != "checkbox" ? input.val() : input.is(":checked");

        text += `${input.attr("name")}=${value}\n`;
    });

    $("#result").val(text)
}


/* Main */
onlyShowRestIfFirstHasValue("[name^=DEFAULT_SMTP_]");
onlyShowRestIfFirstHasValue("[name^=GMAIL_]");
onlyShowRestIfFirstHasValue("[name^=OUTLOOK_]");

setInputAndRun($("[name=AUTH_TYPE"), onInputAuthType, false, "input", "Selecting LDAP or IMAP");
setInputAndRun($("[name=ALLOW_LONG_SESSION]"), onInputAllowLongSession, true);
setInputAndRun($("#generate"), onClickGenerate, false, "click")

$(".reset").on("click", function(e) {
    const target = $(e.target);
    target.siblings("input[type='checkbox']").each(function() {
        const sibling = $(this);
        sibling.prop("checked", sibling.data("default"))}).change().trigger("input");
    target.siblings("input[type!='checkbox'], select").each(function() {
        const sibling = $(this);
        sibling.val(sibling.data("default")).change().trigger("input");
    });
});