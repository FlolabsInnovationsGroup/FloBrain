import { Router, Request, Response } from "express";

const router = Router();

// simple in-memory user store (just for demo)
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

  const newUser = { id: String(users.length + 1), email, password };
  users.push(newUser);

  return res.json({
    accessToken: "dummy-token-" + newUser.id,
    user: { id: newUser.id, email: newUser.email },
  });
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({
    accessToken: "dummy-token-" + user.id,
    user: { id: user.id, email: user.email },
  });
});

// GET /api/auth/me  (used on page refresh)
router.get("/me", (req: Request, res: Response) => {
  const firstUser = users[0];
  if (!firstUser) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  return res.json({ id: firstUser.id, email: firstUser.email });
});

export default router;
