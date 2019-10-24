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

    ******
    noLogs: boolean;

    - Defaults to true
    - Set it to true to disable writing all the logs during the
      WebPack build process.
    ******    
*/

module.exports = class UseminWebpackPlugin {
    constructor(options) {
        if (!isPlainObject(options)) {
            throw new Error("Options for usemin-webpack-plugin can be given only via a plain JS object.");
        }

        this.options = options;
        this.entries = options.entries || [];
        this.disabled = options.disabled || false;
        this.noLogs = options.noLogs || true;
    }

    apply(compiler) {
        if (this.disabled) {
            return;
        }

        this.filesWereChanged = false;

        // Check if webpack 4+ hooks available, otherwise use the old plugin system.
        const hooks = compiler.hooks;
        if (hooks) {
            hooks.beforeCompile.tapAsync("UseminWebpackPlugin", (_, callback) => {
                this.changeNormalFileWithMin(this.entries);
                callback();
            });
    
            hooks.done.tapAsync("UseminWebpackPlugin", () => {
                // The files weren't initially changed (eg. because of an error).
                // Nothing to do.
                if (!this.filesWereChanged) return;
                this.changeMinFileWithNormal(this.entries);
            });
        }
        else {
            compiler.plugin("beforeCompile", (_, callback) => {
                this.changeNormalFileWithMin(this.entries);
                if (callback) callback();
            });

            compiler.plugin("done", () => {
                // The files weren't initially changed (eg. because of an error).
                // Nothing to do.
                if (!this.filesWereChanged) return;
                this.changeMinFileWithNormal(this.entries);
            });
        }
    }

    changeNormalFileWithMin(entries) {
        for (const entry of entries) {
            const path = entry.path;
            const fn = entry.fileName;

            if (!path || !path.length) {
                if (!this.noLogs) console.warn("path property not provided for the entry. Moving to the next entry.");
                continue;
            }

            if (!fs.existsSync(path)) {
                if (!this.noLogs) console.warn("Path '" + path + "' can't be found. Moving to the next entry.");
                continue;
            }

            if (!fn || !fn.length) {
                if (!this.noLogs) console.warn("fileName property not provided for the entry. Moving to the next entry.");
                continue;
            }

            let fullPath = path;
            if (fullPath[fullPath.length - 1] !== "/") fullPath += "/";

            const origFileName = fullPath + fn + ".js";
            const changedFileName = fullPath + "__" + fn + ".js";
            const minFileName = fullPath + fn + ".min.js";

            try {
                if (!fs.existsSync(origFileName)) {
                    if (!this.noLogs) console.warn("File '" + origFileName + "' doesn't exist. Moving to the next entry.");
                    continue;
                }

                if (!fs.existsSync(minFileName)) {
                    if (!this.noLogs) console.warn("File '" + minFileName + "' doesn't exist. Moving to the next entry.");
                    continue;
                }

                if (!this.noLogs) console.log("Changing " + origFileName + " to " + changedFileName);
                fs.renameSync(origFileName, changedFileName);

                if (!this.noLogs) console.log("Changing " + minFileName + " to " + origFileName);
                fs.renameSync(minFileName, origFileName);

                this.filesWereChanged = true;
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
                if (!this.noLogs) console.warn("path property not provided for the entry. Moving to the next entry.");
                continue;
            }

            if (!fs.existsSync(path)) {
                if (!this.noLogs) console.warn("Path '" + path + "' can't be found. Moving to the next entry.");
                continue;
            }

            if (!fn || !fn.length) {
                if (!this.noLogs) console.warn("fileName property not provided for the entry. Moving to the next entry.");
                continue;
            }

            let fullPath = path;
            if (fullPath[fullPath.length - 1] !== "/") fullPath += "/";

            const origFileName = fullPath + fn + ".js";
            const changedFileName = fullPath + "__" + fn + ".js";
            const minFileName = fullPath + fn + ".min.js";

            try {
                if (!fs.existsSync(origFileName)) {
                    if (!this.noLogs) console.warn("File: " + origFileName + " doesn't exist. Moving to the next entry.");
                    continue;
                }

                if (!fs.existsSync(changedFileName)) {
                    if (!this.noLogs) console.warn("File: " + changedFileName + " doesn't exist. Moving to the next entry.");
                    continue;
                }

                if (!this.noLogs) console.log("Changing " + origFileName + " to " + minFileName);
                fs.renameSync(origFileName, minFileName);

                if (!this.noLogs) console.log("Changing " + changedFileName + " to " + origFileName);
                fs.renameSync(changedFileName, origFileName);

                this.filesWereChanged = false;
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}

// Code taken from
// https://github.com/sindresorhus/is-plain-obj/blob/97480673cf12145b32ec2ee924980d66572e8a86/index.js
function isPlainObject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
}