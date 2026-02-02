import { Router } from "express";
import { generateRecipeImage } from "../services/openai.js";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const { title, ingredients } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Recipe title is required" });
    }

    const imageData = await generateRecipeImage(title, ingredients || []);

    if (!imageData) {
      return res.status(500).json({ error: "Failed to generate image" });
    }

    res.json({ image: imageData });
  } catch (error) {
    console.error("Image route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
