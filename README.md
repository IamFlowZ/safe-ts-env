# type-safe-cdk-env

A TypeScript library that provides type-safe environment configuration for AWS CDK stacks using Zod for schema validation.

## Installation

```bash
npm install type-safe-cdk-env
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
import { getStackProps } from 'type-safe-cdk-env';
import { z } from 'zod';

// Define your environment schema using Zod
const envSchema = z.object({
  name: z.string(),
  region: z.string(),
  stage: z.enum(['dev', 'staging', 'prod']),
  instanceCount: z.number().int().positive(),
});

// Load and validate your environment configuration
const stackProps = getStackProps('path/to/env/file.json', envSchema);

// TypeScript knows the exact shape of stackProps
console.log(stackProps.name); // string
console.log(stackProps.region); // string
console.log(stackProps.stage); // 'dev' | 'staging' | 'prod'
console.log(stackProps.instanceCount); // number

// Use in your CDK stack
new MyStack(app, 'MyStack', stackProps);
```

### Using Array Path

You can also provide the path as an array of path segments:

```typescript
const stackProps = getStackProps(['path', 'to', 'env', 'file.json'], envSchema);
```

### Error Handling

The library will throw an error if:

- The environment file cannot be found or read
- The file content doesn't match the provided schema

You can enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=true npm run cdk deploy
```

## API Reference

### `getStackProps<T>`

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
