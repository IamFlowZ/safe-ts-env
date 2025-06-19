"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const getEnv = (pathOfEnvFile, envSchema) => {
    // Load the file from the env folder
    try {
        const envFile = (0, fs_1.readFileSync)(Array.isArray(pathOfEnvFile)
            ? (0, path_1.join)(...pathOfEnvFile)
            : (0, path_1.join)(pathOfEnvFile));
        // Parse the file into the envSchema
        const env = envSchema.parse(envFile.toJSON());
        // Return the env object
        return {
            ...env,
        };
    }
    catch (err) {
        process.env.DEBUG && console.error('Error loading env file:', err);
        throw err;
    }
};
exports.getEnv = getEnv;
//# sourceMappingURL=index.js.map