// 1: Get inputs
function getInput(name) {
    return $(`[name=${name}]`);
}

const allInputs = $("input");
const inputAuthType = getInput("AUTH_TYPE");
const inputDefaultSmtpName = getInput("DEFAULT_SMTP_NAME");
const inputAllowLongSession = getInput("ALLOW_LONG_SESSION");

// This needs a better name
function onlyShowRestIfFirstHasValue(jqueryString) {
    const first = $(jqueryString + ":first");
    const otherElements = $(jqueryString + ":not(:first)").parent("fieldset");

    setInputAndRun(first, (value) => {
        ifValueHideOrShow(value.trim() != "", otherElements);
    })
}
onlyShowRestIfFirstHasValue("[name^=GMAIL]");

// 2: Helper functions
function setInputAndRun(jqueryElem, func, checkbox=false) {
    jqueryElem.on("input", function(e) {
        let value;
        if (!checkbox) {
            value = jqueryElem.val();
        } else {
            value = jqueryElem.is(":checked");
        }
        func(value)
    });
    // TODO: dry
    let value;
    if (!checkbox) {
        value = jqueryElem.val();
    } else {
        value = jqueryElem.is(":checked");
    }
    func(value);
}

function ifValueHideOrShow(boolean, jqueryElem) {
    console.log(jqueryElem)
    console.log(boolean)
    console.log("--")
    if (boolean) {
        jqueryElem.show(400);
    } else {
        jqueryElem.hide(400);
    }
}

// On input
function onInputAuthType(value) {
    ifValueHideOrShow(value == "LDAP", $("[id^=LDAP_AUTH_]"));
    ifValueHideOrShow(value == "IMAP", $("[id^=IMAP_AUTH_]"));    
}

function onInputDefaultSmtpName(value) {
    const elems = $("[id^=DEFAULT_SMTP_]:not([id=DEFAULT_SMTP_NAME])")
    
    if (value && value.trim() != "") {
        elems.show(400);
    } else {
        elems.hide(400);
    }
}

function onInputAllowLongSession(value) {
    ifValueHideOrShow(value == true, $("[id=LONG_SESSION_LIFETIME]"))
}

function onClickGenerate(value) {
    let text = "";
    console.log("length")

    allInputs.each(function(i) {
        const input = $(this);
        const value = input.attr("type") != "checkbox" ? input.val() : input.is(":checked");

        text += `${input.attr("name")}=${value}\n`;
        console.log(text);
    });

    $("#result").val(text)
}

setInputAndRun(inputAuthType, onInputAuthType);
setInputAndRun(inputDefaultSmtpName, onInputDefaultSmtpName);
setInputAndRun(inputAllowLongSession, onInputAllowLongSession, true);

$("#generate").on("click", onClickGenerate);
onClickGenerate();