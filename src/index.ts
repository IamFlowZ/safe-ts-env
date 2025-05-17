import { readFileSync } from 'fs';
import { z } from 'zod';
import { join } from 'path';

export const getStackProps = <T extends z.ZodObject<any>>(pathOfEnvFile: string | Array<string>, envSchema: T): z.infer<T> => {
  // Load the file from the env folder
  try {
    const envFile = readFileSync(
      Array.isArray(pathOfEnvFile)
        ? join(...pathOfEnvFile)
        : join(pathOfEnvFile)
    );
    // Parse the file into the envSchema
    const env = envSchema.parse(envFile.toJSON());
    // Return the env object
    return {
      ...env,
    };
  } catch (err) {
    process.env.DEBUG && console.error('Error loading env file:', err);
    throw err;
  }
};
