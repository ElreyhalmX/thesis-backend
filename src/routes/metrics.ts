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
    // Query the 'metrics' table for specific keys
    const { data: metricsData, error: metricsError } = await supabase
      .from("metrics")
      .select("key, value")
      .in("key", ["total_likes", "total_recipes_generated"]);

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw metricsError;
    }

    // Convert array of {key, value} to an object for easier access
    const stats: Record<string, number> = {};
    metricsData?.forEach((item) => {
      stats[item.key] = item.value;
    });

    res.json({
      total_recipes: stats["total_recipes_generated"] || 0,
      total_likes: stats["total_likes"] || 0
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    next(error);
  }
});

export default router;
