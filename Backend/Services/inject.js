const fs = require("fs");
const path = require("path");

const LANG = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../Boilerplate/languages.json"),
        "utf8"
    )
);

function injectBoilerplate(lang, userCode, imports = [], inputType = 'int[]') {
    if (!LANG[lang]) throw new Error("Unsupported language");
    
    const importBlock = Array.isArray(imports) && imports.length
        ? imports.join("\n")
        : "";

    // Get the appropriate template based on input type
    const template = LANG[lang].templates[inputType] || LANG[lang].templates['int[]'];

    return template
        .join("\n")
        .replace("{{USER_IMPORTS}}", importBlock)
        .replace("{{USER_CODE}}", userCode);
}

function getLangConfig(lang) {
    if (!LANG[lang]) throw new Error("Unsupported language");
    return LANG[lang];
}

module.exports = { injectBoilerplate, getLangConfig };