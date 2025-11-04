import { resetDb, seedBasic, endPool } from "../fixtures/db";

beforeAll(async () => {
  await resetDb();
  await seedBasic();
});

afterAll(async () => {
  await endPool();
});
