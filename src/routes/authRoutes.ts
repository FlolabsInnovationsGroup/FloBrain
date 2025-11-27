import { Router, Request, Response } from "express";

const router = Router();

const users: { id: string; email: string; password: string }[] = [];

// POST /api/auth/register
router.post("/register", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = { id: String(users.length + 1), email, password };
  users.push(user);

  return res.json({
    accessToken: "dummy-token-" + user.id,
    user: { id: user.id, email: user.email },
  });
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    accessToken: "dummy-token-" + user.id,
    user: { id: user.id, email: user.email },
  });
});

export default router;
