# type-safe-env

A TypeScript library that provides type-safe environment configuration.

## Installation

```bash
npm install type-safe-env
```

## Features

- **Type Safety**: Leverage TypeScript's type system to ensure your environment configurations are correctly typed
- **Runtime Validation**: Use Zod schemas to validate environment configurations at runtime
- **Flexible Path Handling**: Support for both string and array path formats
- **Error Handling**: Built-in error handling with optional debug logging
- **Zero Configuration**: Simple API that works out of the box

## Usage

### Basic Example

```typescript
import { getEnv } from 'type-safe-env';
import { z } from 'zod';

// Define your environment schema using Zod
const envSchema = z.object({
  name: z.string(),
  region: z.string(),
  stage: z.enum(['dev', 'staging', 'prod']),
  instanceCount: z.number().int().positive(),
});

// Load and validate your environment configuration
const checkedEnv = getEnv('path/to/env/file.json', envSchema);

// TypeScript knows the exact shape of checkedEnv
console.log(checkedEnv.name); // string
console.log(checkedEnv.region); // string
console.log(checkedEnv.stage); // 'dev' | 'staging' | 'prod'
console.log(checkedEnv.instanceCount); // number
```

### Using Array Path

You can also provide the path as an array of path segments:

```typescript
const checkedEnv = getEnv(['path', 'to', 'env', 'file.json'], envSchema);
```

### Using with `process.env`
```typescript

const checkedEnv = getEnv('path/to/env/file.json', envSchema);

process.env = {
  ...process.env,
  ...Object.fromEntries(
    Object.entries(checkedEnv).map(([key, value]) => [key, String(value)])
  )
}
```

### Using with CDK
```typescript

// Define your environment schema using Zod
const envSchema = z.object({
  name: z.string(),
  region: z.string(),
  stage: z.enum(['dev', 'staging', 'prod']),
  instanceCount: z.number().int().positive(),
});
const checkedEnv = getEnv('path/to/env/file.json', envSchema);

const stackProps = {
  ...process.env,
  ...Object.fromEntries(
    Object.entries(checkedEnv).map(([key, value]) => [key, String(value)])
  )
}

// Use in your CDK stack
new MyStack(app, 'MyStack', stackProps);
```

### Error Handling

The library will throw an error if:

- The environment file cannot be found or read
- The file content doesn't match the provided schema

You can enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=true npm run start
```

## API Reference

### `getEnv<T>`

Loads and validates environment configuration from a file.

#### Parameters

- `pathOfEnvFile`: `string | Array<string>` - Path to the environment file
- `envSchema`: `z.ZodObject<any>` - Zod schema for validating the environment configuration

#### Returns

- `z.infer<T>` - The validated environment configuration with inferred types from the schema

#### Throws

- `Error` - If the file cannot be found or read
- `z.ZodError` - If the file content doesn't match the provided schema

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
