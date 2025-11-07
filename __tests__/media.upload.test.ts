import path from "path";
import fs from "fs";
import request from "supertest";
// Silence console.log during tests
const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

// Put uploads in a temp folder during tests
process.env.UPLOAD_DIR = path.join(process.cwd(), "__tests__", "tmp-uploads");

import app from "../src/media-app";

beforeAll(() => {
  fs.rmSync(process.env.UPLOAD_DIR!, { recursive: true, force: true });
  fs.mkdirSync(process.env.UPLOAD_DIR!, { recursive: true });
});

afterAll(() => {
  fs.rmSync(process.env.UPLOAD_DIR!, { recursive: true, force: true });
});

describe("POST /uploads", () => {
  it("201 accepts file + valid fields", async () => {
    const file = path.join(__dirname, "fixtures", "tiny.png");
    const res = await request(app)
      .post("/uploads")
      .field("user_id", "user_1")
      .field("media_type", "image")
      .attach("file", file)
      .expect(201);

    expect(res.body.user_id).toBe("user_1");
    expect(res.body.media_type).toBe("image");
    expect(res.body.size).toBeGreaterThan(0);
    expect(res.body.final_path).toContain(path.join("__tests__", "tmp-uploads"));
    expect(fs.existsSync(res.body.final_path)).toBe(true);
  });

  it("400 if missing file", async () => {
    const res = await request(app)
      .post("/uploads")
      .field("user_id", "user_1")
      .field("media_type", "image")
      .expect(400);

    // ✅ Updated for new error format
    expect(res.body.code).toBe("VALIDATION_BODY");
    expect(res.body.details.file[0]).toBe("file is required");
  });

  it("400 if invalid fields", async () => {
    const file = path.join(__dirname, "fixtures", "tiny.png");
    const res = await request(app)
      .post("/uploads")
      .field("user_id", "")            // invalid
      .field("media_type", "badtype")  // invalid enum
      .attach("file", file)
      .expect(400);

    // ✅ Updated for new error format
    expect(res.body.code).toBe("VALIDATION_BODY");
    expect(res.body.details.user_id?.length).toBeGreaterThan(0);
    expect(res.body.details.media_type?.length).toBeGreaterThan(0);
  });
});
  it("normalizes media_type (trims + lowercases)", async () => {
    const file = path.join(__dirname, "fixtures", "tiny.png");
    const res = await request(app)
      .post("/uploads")
      .field("user_id", "  user_1  ")     // has spaces
      .field("media_type", "  IMAGE  ")   // uppercase + spaces
      .attach("file", file)
      .expect(201);

    expect(res.body.user_id).toBe("user_1");   // trimmed
    expect(res.body.media_type).toBe("image"); // lowercased
  });
  it("400 rejects unknown fields (.strict())", async () => {
    const file = path.join(__dirname, "fixtures", "tiny.png");
    const res = await request(app)
      .post("/uploads")
      .field("user_id", "user_1")
      .field("media_type", "image")
      .field("unexpected", "oops") // ❌ not allowed by schema
      .attach("file", file)
      .expect(400);

    expect(res.body.code).toBe("VALIDATION_BODY");
expect(Array.isArray(res.body.details._form)).toBe(true);
expect(res.body.details._form.length).toBeGreaterThan(0);
// Optional:
// expect(res.body.details._form[0]).toMatch(/Unrecognized key/i);

  });
