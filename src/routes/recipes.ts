import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { generateRecipes } from "../services/openai.js";
import {
    validateCookingTime,
    validateIngredients,
    validatePortions,
} from "../utils/validators.js";

const router = Router();

router.post("/generate", async (req, res, next) => {
  try {
    const { ingredients, cookingTime, portions } = req.body;

    const validatedIngredients = validateIngredients(ingredients);

    if (!validatedIngredients) {
      return res.status(400).json({
        error: "Invalid ingredients",
        message: "Please provide a valid array of ingredients",
      });
    }

    const validatedTime = validateCookingTime(cookingTime);
    const validatedPortions = validatePortions(portions);

    console.log(
      `Generating recipes for ${validatedIngredients.length} ingredients with ${validatedTime} minutes for ${validatedPortions} portions`
    );

    const recipes = await generateRecipes(
      validatedIngredients,
      validatedTime,
      validatedPortions
    );
    await supabase.rpc("increment_recipes_generated", {
      increment_by: recipes.length,
    });

    res.json({ recipes });
  } catch (error: any) {
    console.error("Error generating recipes:", error);

    if (error.message === "INVALID_INGREDIENTS") {
      return res.status(400).json({
        error: "Invalid ingredients",
        message: "Uno de los ingredientes que agregó no es un ingrediente",
      });
    }

    next(error);
  }
});

router.post("/generate-plan", async (req, res, next) => {
  try {
    const { ingredients, portions } = req.body;
    
    // Basic validation
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    // Call service
    const plan = await generateWeeklyPlan(ingredients, Number(portions) || 1);
    
    res.json({ plan });
  } catch (error) {
    console.error("Error generating plan:", error);
    next(error);
  }
});

export default router;
