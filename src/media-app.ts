import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { z } from "zod";

//
// 1️⃣  ZOD VALIDATION CONTRACT
//
const UploadFieldsSchema = z
  .object({
    user_id: z
      .string()
      .trim()
      .min(1, "user_id is required")
      .max(64, "user_id too long"),

    media_type: z
      .string()
      .trim()
      .toLowerCase()
      .refine((val) => ["image", "audio", "video"].includes(val), {
        message: "media_type must be one of: image, audio, video",
      }),
  })
  .strict(); // reject unknown fields

//
// 2️⃣  FILE STORAGE SETUP
//
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

//
// 3️⃣  EXPRESS APP
//
const app = express();
app.use(express.json());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

//
// 4️⃣  UPLOAD ROUTE WITH VALIDATION CONTRACT
//
app.post(
  "/uploads",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = UploadFieldsSchema.safeParse(req.body);
      if (!parsed.success) {
  const flat = parsed.error.flatten();
  const details: Record<string, string[]> = { ...flat.fieldErrors };
  if (flat.formErrors && flat.formErrors.length) {
    details._form = flat.formErrors; // include schema-level / unrecognized key errors
  }
  return res.status(400).json({
    code: "VALIDATION_BODY",
    details,
  });
}


      if (!req.file) {
        return res
          .status(400)
          .json({ code: "VALIDATION_BODY", details: { file: ["file is required"] } });
      }

      // Attach parsed object to req.validated (single source of truth)
      (req as any).validated = parsed.data;

      const payload = {
        ...parsed.data,
        size: req.file.size,
        final_path: req.file.path,
      };

      console.log("[UPLOAD]", JSON.stringify(payload));
      res.status(201).json(payload);
    } catch (err) {
      next(err);
    }
  }
);
if (process.env.NODE_ENV === "test") {
  app.get("/__test__/crash", (_req, _res) => {
    throw new Error("boom");
  });
}


//
// 5️⃣  GLOBAL ERROR HANDLER
//
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
// ---- Params & Query validation examples ----
const IdParams = z.object({
  id: z.string().trim().regex(/^\d+$/, "id must be numeric"),
});

const ListQuery = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

app.get("/media/:id", (req, res) => {
  const parsed = IdParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({
      code: "VALIDATION_PARAMS",
      details: parsed.error.flatten().fieldErrors,
    });
  }
  (req as any).validated = parsed.data;
  return res.json({ ok: true, id: parsed.data.id });
});

app.get("/media", (req, res) => {
  const parsed = ListQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      code: "VALIDATION_QUERY",
      details: parsed.error.flatten().fieldErrors,
    });
  }
  (req as any).validated = parsed.data;
  return res.json({ ok: true, limit: (req as any).validated.limit });
});
