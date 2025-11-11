import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const envTest = path.join(process.cwd(), ".env.test");

// Load .env.test if it exists, otherwise set safe defaults
if (fs.existsSync(envTest)) {
  dotenv.config({ path: envTest });
} else {
  process.env.NODE_ENV = process.env.NODE_ENV || "test";
  process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "__tests__", "tmp-uploads");
}
