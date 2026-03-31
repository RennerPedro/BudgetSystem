process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-e2e';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://budget_user:budget_pass@127.0.0.1:5432/budget_db';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
