const fs = require("fs");

/*
    Options fields:

    ******
    entries: [];

    - Defaults to []
    - Holds on array of objects, where each object
      describes a path and a fileName for a library
      that needs to use the .min.js file at build time.

    Eg:
        new UseminWebpackPlugin({
			entries: [
				{
					path: "node_modules/p5/lib",
					fileName: "p5"
                },
				{
					path: "node_modules/sockjs-client/dist",
					fileName: "sockjs"
				}                
			]
		})
    ******

    ******
    disabled: boolean;

    - Defaults to false
    - Set it to true to disable the whole plugin, without
      the need to remove or comment out the plugin entry in
      the Webpack config file.
    ******
*/

module.exports = class UseminWebpackPlugin {
    constructor(options) {
        if (!isPlainObject(options)) {
            throw new Error("Options for usemin-webpack-plugin can be given only via a plain JS object.");
        }

        this.options = options;
    }

    apply(compiler) {
        if (this.options && this.options.disabled) {
            return;
        }

        const entries = this.options.entries;

        compiler.hooks.beforeCompile.tapAsync("UseminWebpackPlugin", (params, callback) => {
            this.changeNormalFileWithMin(entries);
            callback();
        });

        compiler.hooks.done.tapAsync("UseminWebpackPlugin", (stats) => {
            this.changeMinFileWithNormal(entries);
        });
    }

    changeNormalFileWithMin(entries) {
        for (const entry of entries) {
            const path = entry.path;
            const fn = entry.fileName;

            if (!path || !path.length) {
                console.warn("path property not provided for the entry. Moving to the next entry.");
                continue;
            }

            if (!fs.existsSync(path)) {
                console.warn("Path '" + path + "' can't be found. Moving to the next entry.");
                continue;
            }

            if (!fn || !fn.length) {
                console.warn("fileName property not provided for the entry. Moving to the next entry.");
                continue;
            }

            let fullPath = path;
            if (fullPath[fullPath.length - 1] !== "/") fullPath += "/";

            const origFileName = fullPath + fn + ".js";
            const changedFileName = fullPath + "__" + fn + ".js";
            const minFileName = fullPath + fn + ".min.js";

            try {
                if (!fs.existsSync(origFileName)) {
                    console.warn("File '" + origFileName + "' doesn't exist. Moving to the next entry.");
                    continue;
                }
    
                if (!fs.existsSync(minFileName)) {
                    console.warn("File '" + minFileName + "' doesn't exist. Moving to the next entry.");
                    continue;
                }
    
                console.log("Changing " + origFileName + " to " + changedFileName);
                fs.renameSync(origFileName, changedFileName);
    
                console.log("Changing " + minFileName + " to " + origFileName);
                fs.renameSync(minFileName, origFileName);                
            } 
            catch (error) {
                console.error(error); 
            }
        }
    }

    changeMinFileWithNormal(entries) {
        for (const entry of entries) {
            const path = entry.path;
            const fn = entry.fileName;

            if (!path || !path.length) {
                console.warn("path property not provided for the entry. Moving to the next entry.");
                continue;
            }

            if (!fs.existsSync(path)) {
                console.warn("Path '" + path + "' can't be found. Moving to the next entry.");
                continue;
            }

            if (!fn || !fn.length) {
                console.warn("fileName property not provided for the entry. Moving to the next entry.");
                continue;
            }

            let fullPath = path;
            if (fullPath[fullPath.length - 1] !== "/") fullPath += "/";

            const origFileName = fullPath + fn + ".js";
            const changedFileName = fullPath + "__" + fn + ".js";
            const minFileName = fullPath + fn + ".min.js";

            try {
                if (!fs.existsSync(origFileName)) {
                    console.warn("File: " + origFileName + " doesn't exist. Moving to the next entry.");
                    continue;
                }

                if (!fs.existsSync(changedFileName)) {
                    console.warn("File: " + changedFileName + " doesn't exist. Moving to the next entry.");
                    continue;
                }

                console.log("Changing " + origFileName + " to " + minFileName);
                fs.renameSync(origFileName, minFileName);

                console.log("Changing " + changedFileName + " to " + origFileName);
                fs.renameSync(changedFileName, origFileName);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}

// Copied from https://github.com/sindresorhus/is-plain-obj/blob/97480673cf12145b32ec2ee924980d66572e8a86/index.js
function isPlainObject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
}