import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { z } from "zod";

const UploadFieldsSchema = z.object({
  user_id: z.string().min(1, "user_id is required"),
  media_type: z.enum(["image", "audio", "video"]),
});

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/uploads", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UploadFieldsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    if (!req.file) {
      return res.status(400).json({ error: "file is required" });
    }

    const payload = {
      user_id: parsed.data.user_id,
      media_type: parsed.data.media_type,
      size: req.file.size,
      final_path: req.file.path,
    };

    console.log("[UPLOAD]", JSON.stringify(payload));
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
