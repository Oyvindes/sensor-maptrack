import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extend vitest's expect with jest-dom matchers
expect.extend({});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Set up global test environment
const createFetchResponse = (data: any) => ({
  ok: true,
  json: async () => data,
  status: 200,
  headers: new Headers(),
});

// Mock fetch for tests
global.fetch = vi.fn().mockImplementation((url: string) =>
  Promise.resolve(createFetchResponse({}))
);

// Mock Supabase environment variables
process.env.VITE_SUPABASE_URL = 'https://pjzujrwbfwcxdnjnuhws.supabase.co';
process.env.VITE_SUPABASE_KEY = 'test_anon_key';

// Setup for handling unhandled rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection at:', reason);
});
