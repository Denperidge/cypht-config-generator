import fs from "fs";

const REG = new RegExp(/(\/\*(?<comment>(.|\n)*?)\*\/(.|\n)*?)?env\('(?<key>.*?)'(, *?(?<default>.*?))?\)/, "g")
const REGEX_REMOVE_FIRST_COMMENT = new RegExp(/\/\*(.|\n)*?\*\//);
const REGEX_VALID_VALUES = new RegExp(/Valid values.*?\n(?<values>(.|\n)*)/);
const CACHE_DIR = ".cache/"
const FILES = ["app.php", "database.php", "2fa.php", "carddav.php", "dynamic_login.php", "github.php", "ldap.php", "oauth2.php", "recaptcha.php", "wordpress.php"]


fs.mkdirSync(CACHE_DIR, {recursive: true})

// TODO DB_SOCKET, USER_SETTINGS_DIR

/**
 * Messy no-dependency function to either use cache or fetch into cache
 * 
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function cacheOrFetch(url) {
    return new Promise(function(resolve, reject){
        const filename = url.substring(url.lastIndexOf("/") + 1);
        const path = CACHE_DIR + filename;
        if (fs.existsSync(path)) {
            resolve(fs.readFileSync(path, {encoding: "utf-8"}));
        } else {
            fetch(url).then(async (response) => {
                response.text().then((content) => {
                    fs.writeFileSync(path, content, {encoding: "utf-8"})
                    resolve(content);
                })
            }).catch((err) => {
                console.error(err)
                reject(err);
            })
        }
    });
}

function cleanComment(comment) {
    let commentLines = comment.replace("\n\n", "\n").split("\n    |")
    commentLines = commentLines.map(value => value.trim())
    commentLines = commentLines.filter(value => value != "");
    return commentLines.join("\n");
}

/**
 * 
 * @param {string} page 
 * @returns {Array<object>}
 */
async function parsePage(url) {
    let page = await cacheOrFetch(url);
    if (url.endsWith("app.php")) {
        page = page.replace(REGEX_REMOVE_FIRST_COMMENT, "");
        fs.writeFileSync(CACHE_DIR + "test.php", page, {encoding: "utf-8"})

    }


    const matches = page.matchAll(REG);
    let match;
    const array = [];
    while ((match = matches.next()).done !== true) {
        const groups = match.value.groups;
    
        const key = groups.key;
        let valueDefault = groups.default ? groups.default.trim() : null;
        const comment = groups.comment ? cleanComment(groups.comment) : null;
    
    
        let inputType;
        if (valueDefault) {
            try {
                const number = parseInt(valueDefault)
                if (!isNaN(number)) {
                    inputType = "number";
                }
            }
            catch {}
            if (valueDefault === "false" || valueDefault === "true") {
                inputType = "checkbox";
            }
            if (valueDefault.startsWith("'") && valueDefault.endsWith("'")) {
                valueDefault = valueDefault.replace(/^'/m, "").replace(/'$/, "")
                inputType = "text";
            } 
        } else {
            // Manual overrides
            switch (key) {
                case "DEFAULT_SMTP_TLS":
                case "LDAP_AUTH_TLS":
                case "DEFAULT_SMTP_TLS":
                case "DEFAULT_SMTP_NO_AUTH":
                case "AUTO_CREATE_PROFILE":
                case "ALWAYS_MOBILE_UI":
                case "ENCRYPT_AJAX_REQUESTS":
                case "ENCRYPT_LOCAL_STORAGE":
                    inputType = "checkbox";
                    break;
    
                case "DEFAULT_SMTP_NAME":
                case "DEFAULT_SMTP_SERVER":
                case "ADMIN_USERS":
                case "COOKIE_DOMAIN":
                case "COOKIE_PATH":
                case "DEFAULT_EMAIL_DOMAIN":
                case "REDIRECT_AFTER_LOGIN":
                case "AUTH_CLASS":
                case "API_LOGIN_KEY":
                case "MEMCACHED_USER":
                case "SESSION_CLASS":
                    inputType = "text";
                    break;
                
                case "DB_PASS":  // database.php
                case "REDIS_PASS":
                case "MEMCACHED_PASS":
                case "APP_2FA_SECRET":  // 2fa.php
                    inputType = "password";
                    break;
                
                case "DEFAULT_SMTP_PORT":
                    inputType = "number";
                    break;
            }
        }

        if (key.includes("SECRET")) {
            inputType = "password";  
        }
    
        if (inputType === undefined) {
            console.log("Unknown input type")
            console.error(key)
            console.error(valueDefault)
        }


        let setValues = null;
        if (comment) {
            const match = REGEX_VALID_VALUES.exec(comment);
            if (match) {
                let unfilteredValues = match.groups.values.split("\n")
                const values = [];
                let customAdded = false;
                for (let i = 0; i < unfilteredValues.length; i++) {
                    const val = unfilteredValues[i];
                    if (customAdded) {
                        values.push(values.pop().trim() + " " + val.trim());
                        continue;
                    }
                    // Manual override
                    if (!val.startsWith("langauge codes")) { 
                        values.push(val)
                        // As of now, custom is the last option & tends to have multi-line explanations
                        if (val.startsWith("custom")) {
                            customAdded = true;
                        } 
                    }
                }
                if (values.length > 0) {
                    setValues = values.map((commentLine) => {
                        const value = {};
                        value.value = commentLine.substring(0, commentLine.indexOf(" "));
                        value.description = commentLine.substring(commentLine.indexOf(" ")).trim()
                        return value;
                    })
                    inputType = "select";
                }
            }
        }
    
        array.push({
            key: key,
            valueDefault: valueDefault,
            comment: comment,
            commentHtml: comment ? comment.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;") : null,
            inputType: inputType,
            setValues: setValues
        })
    }
    return array;
}

export default async function (configData) {
    const options = {};
    
    for (let i=0; i < FILES.length; i++) {
        const file = FILES[i];
        const data = await parsePage("https://github.com/cypht-org/cypht/raw/master/config/" + file);
        options[file] = data;
    }

    
    return {FILES: FILES, options: options}
}
