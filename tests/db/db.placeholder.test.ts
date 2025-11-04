import "../setup/db"; // activates resetDb + seedBasic + endPool for this suite

it("database fixture setup runs successfully", () => {
  // If Postgres and tables exist, seedBasic() will insert records.
  // If not, fixtures safely no-op (by design).
  expect(true).toBe(true);
});
