
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // Fetch specifically the models method if available or use a workaround if needed
    // The SDK exposes listModels via the GenerativeModel or direct API fetch if needed, 
    // but the clean way in newer SDKs is sometimes hidden.
    // Let's try to infer if we can just list them or validat a model.
    // Actually, usually we can't 'list' easily with just the client in all versions, 
    // but let's try the direct API call since we have the key, just to be universally sure.
    
    // Using fetch to raw API is safer to debug "what does Google see"
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("✅ AVAILABLE MODELS:");
        data.models.forEach((m: any) => {
            if (m.name.includes("gemini")) {
                console.log(`- ${m.name.replace("models/", "")} (${m.displayName})`);
            }
        });
    } else {
        console.error("❌ Could not list models:", JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error("Failed to check models:", error);
  }
}

listModels();
