
process.env.DATABASE_URL = "file:./test.db";
// console.log("JEST DATABASE:", process.env.DATABASE_URL);

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
};



