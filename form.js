// 1: Get inputs
function getInput(name) {
    return $(`[name=${name}]`);
}

const inputAuthType = getInput("AUTH_TYPE");
const inputDefaultSmtpName = getInput("DEFAULT_SMTP_NAME");
const inputAllowLongSession = getInput("ALLOW_LONG_SESSION");


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

function ifValueHideOrShow(value, expected, jqueryElem) {
    if (value == expected) {
        jqueryElem.show(400);
    } else {
        jqueryElem.hide(400);
    }
}

// On input
function onInputAuthType(value) {
    ifValueHideOrShow(value, "LDAP", $("[id^=LDAP_AUTH]"));
    ifValueHideOrShow(value, "IMAP", $("[id^=IMAP_AUTH]"));    
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
    ifValueHideOrShow(value, true, $("[id=LONG_SESSION_LIFETIME]"))
}

setInputAndRun(inputAuthType, onInputAuthType);
setInputAndRun(inputDefaultSmtpName, onInputDefaultSmtpName);
setInputAndRun(inputAllowLongSession, onInputAllowLongSession, true);
