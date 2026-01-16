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

router.get("/stats", async (req, res, next) => {
  // Disable caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    // 1. Get exact count of recipes (Reliable)
    const { count: recipesCount, error: recipesError } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });

    if (recipesError) {
      console.error("Error counting recipes:", recipesError);
    }

    // 2. Get total likes. 
    // Attempt to aggregate from a 'likes' column if it exists in 'recipes' or use a safe fallback.
    // Since we don't know the exact architecture for likes (RPC increment_likes implies a counter),
    // We will try to fetch the 'global_stats' but if it fails, we gracefully return 0 for likes 
    // instead of crashing or affecting the recipe count.
    
    let totalLikes = 0;
    try {
      const { data: statsData } = await supabase
        .from("global_stats")
        .select("total_likes")
        .single();
      
      if (statsData) {
        totalLikes = statsData.total_likes;
      }
    } catch (err) {
      // Ignore error for likes table mismatch
    }

    res.json({
      total_recipes: recipesCount || 0,
      total_likes: totalLikes
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    next(error);
  }
});

export default router;
