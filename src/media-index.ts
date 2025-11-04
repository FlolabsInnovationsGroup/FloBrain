import app from "./media-app";

const port = process.env.PORT || 3000;
console.log("[boot] starting Media API...");
app.listen(port, () => {
  console.log(`[boot] Media API on :${port}`);
});
