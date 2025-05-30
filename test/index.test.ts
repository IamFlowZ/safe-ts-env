import { z } from 'zod';
import { getStackProps } from '../src';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock the fs and path modules
jest.mock('fs');
jest.mock('path');

describe('getStackProps', () => {
  // Store the original process.env.DEBUG
  const originalDebug = process.env.DEBUG;

  // Mock console.error
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Reset DEBUG environment variable
    delete process.env.DEBUG;
  });

  afterAll(() => {
    // Restore the original process.env.DEBUG
    process.env.DEBUG = originalDebug;
    // Restore console.error
    mockConsoleError.mockRestore();
  });

  // 1. Success case - when the file exists and matches the schema
  it('should return parsed data when file exists and matches schema', () => {
    // Define test data
    const testData = { name: 'test-stack', region: 'us-west-2' };
    const mockBuffer = {
      toJSON: jest.fn().mockReturnValue(testData),
    };

    // Mock readFileSync to return our test data
    (readFileSync as jest.Mock).mockReturnValue(mockBuffer);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema
    const schema = z.object({
      name: z.string(),
      region: z.string(),
    });

    // Call the function
    const result = getStackProps('path/to/env/file', schema);

    // Assertions
    expect(readFileSync).toHaveBeenCalledWith('path/to/env/file');
    expect(mockBuffer.toJSON).toHaveBeenCalled();
    expect(result).toEqual(testData);
  });

  // 2. Error case - when the file doesn't exist
  it('should throw an error when file does not exist', () => {
    // Mock readFileSync to throw an error
    const fileError = new Error('File not found');
    (readFileSync as jest.Mock).mockImplementation(() => {
      throw fileError;
    });
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema
    const schema = z.object({
      name: z.string(),
      region: z.string(),
    });

    // Call the function and expect it to throw
    expect(() => {
      getStackProps('non/existent/file', schema);
    }).toThrow(fileError);

    // Verify readFileSync was called
    expect(readFileSync).toHaveBeenCalledWith('non/existent/file');
    // Verify console.error was not called (DEBUG is false)
    expect(console.error).not.toHaveBeenCalled();
  });

  // 3. Error case - when the file exists but doesn't match the schema
  it('should throw an error when file content does not match schema', () => {
    // Define invalid test data (missing required field)
    const invalidData = { name: 'test-stack' }; // missing 'region'
    const mockBuffer = {
      toJSON: jest.fn().mockReturnValue(invalidData),
    };

    // Mock readFileSync to return our invalid data
    (readFileSync as jest.Mock).mockReturnValue(mockBuffer);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema with required fields
    const schema = z.object({
      name: z.string(),
      region: z.string(), // This will cause validation to fail
    });

    // Call the function and expect it to throw
    expect(() => {
      getStackProps('path/to/env/file', schema);
    }).toThrow(z.ZodError);

    // Verify readFileSync was called
    expect(readFileSync).toHaveBeenCalledWith('path/to/env/file');
    expect(mockBuffer.toJSON).toHaveBeenCalled();
  });

  // 4. Test handling of string path vs array path
  it('should handle string path correctly', () => {
    // Define test data
    const testData = { name: 'test-stack' };
    const mockBuffer = {
      toJSON: jest.fn().mockReturnValue(testData),
    };

    // Mock readFileSync and join
    (readFileSync as jest.Mock).mockReturnValue(mockBuffer);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema
    const schema = z.object({
      name: z.string(),
    });

    // Call the function with string path
    getStackProps('path/to/file', schema);

    // Verify join was called correctly
    expect(join).toHaveBeenCalledWith('path/to/file');
  });

  it('should handle array path correctly', () => {
    // Define test data
    const testData = { name: 'test-stack' };
    const mockBuffer = {
      toJSON: jest.fn().mockReturnValue(testData),
    };

    // Mock readFileSync and join
    (readFileSync as jest.Mock).mockReturnValue(mockBuffer);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema
    const schema = z.object({
      name: z.string(),
    });

    // Call the function with array path
    getStackProps(['path', 'to', 'file'], schema);

    // Verify join was called correctly with spread array
    expect(join).toHaveBeenCalledWith('path', 'to', 'file');
  });

  // 5. Test that DEBUG environment variable controls error logging
  it('should log errors when DEBUG is set', () => {
    // Set DEBUG environment variable
    process.env.DEBUG = 'true';

    // Mock readFileSync to throw an error
    const fileError = new Error('File not found');
    (readFileSync as jest.Mock).mockImplementation(() => {
      throw fileError;
    });

    // Define schema
    const schema = z.object({
      name: z.string(),
    });

    // Call the function and expect it to throw
    expect(() => {
      getStackProps('path/to/file', schema);
    }).toThrow(fileError);

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Error loading env file:',
      fileError,
    );
  });

  it('should not log errors when DEBUG is not set', () => {
    // Ensure DEBUG is not set
    delete process.env.DEBUG;

    // Mock readFileSync to throw an error
    const fileError = new Error('File not found');
    (readFileSync as jest.Mock).mockImplementation(() => {
      throw fileError;
    });

    // Define schema
    const schema = z.object({
      name: z.string(),
    });

    // Call the function and expect it to throw
    expect(() => {
      getStackProps('path/to/file', schema);
    }).toThrow(fileError);

    // Verify console.error was not called
    expect(console.error).not.toHaveBeenCalled();
  });

  // Test handling of nested object in schema
  it('should correctly parse nested objects in the schema', () => {
    // Define test data with nested object
    const testData = {
      name: 'test-stack',
      config: {
        timeout: 300,
        retries: 3,
      },
    };
    const mockBuffer = {
      toJSON: jest.fn().mockReturnValue(testData),
    };

    // Mock readFileSync to return our test data
    (readFileSync as jest.Mock).mockReturnValue(mockBuffer);
    (join as jest.Mock).mockImplementation((...args) => args.join('/'));

    // Define schema with nested object
    const schema = z.object({
      name: z.string(),
      config: z.object({
        timeout: z.number(),
        retries: z.number(),
      }),
    });

    // Call the function
    const result = getStackProps('path/to/env/file', schema);

    // Assertions
    expect(readFileSync).toHaveBeenCalledWith('path/to/env/file');
    expect(mockBuffer.toJSON).toHaveBeenCalled();
    expect(result).toEqual(testData);
    expect(result.config.timeout).toBe(300);
    expect(result.config.retries).toBe(3);
  });
});
