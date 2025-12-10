import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

router.post("/like", async (req, res, next) => {
  try {
    await supabase.rpc("increment_likes");
    res.status(200).json({ message: "Like recorded" });
  } catch (error: any) {
    console.error("Error generating recipes:", error);
  }
});

export default router;
