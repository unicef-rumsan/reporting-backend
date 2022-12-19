var request = require("supertest");

describe("Test the documentation path", () => {
  test("It should respond to the GET method", async () => {
    request = request("http://localhost:4900");
    const res = await request.get("/documentation");
    expect(res.statusCode).toBe(200);
  });
});
