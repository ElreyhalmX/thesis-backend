import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  difficulty: string;
  servings: number;
  tips?: string[];
}

export async function generateRecipes(
  ingredients: string[],
  cookingTime: number
): Promise<Recipe[]> {
  console.log("ingredients", ingredients);
  console.log(" ");
  const prompt = `Eres un asistente culinario especializado en cocina venezolana para estudiantes universitarios con recursos limitados.

Ingredientes disponibles: ${ingredients.join(", ")}
Tiempo disponible: ${cookingTime} minutos

CONTEXTO IMPORTANTE:
- El estudiante vive solo y tiene conocimientos básicos de cocina
- Presupuesto limitado
- Servicios inestables (luz, agua, gas)
- Necesita recetas prácticas y económicas
- Ingredientes típicos venezolanos: ají dulce, auyama, plátano, topocho, arepa, caraotas, etc.

TAREA:
Genera hasta 10  recetas venezolanas diferentes que:
1. Usen principalmente los ingredientes proporcionados
2. Se puedan completar en ${cookingTime} minutos o menos
3. Sean económicas y accesibles
4. Incluyan ingredientes comunes en Venezuela
5. Tengan instrucciones claras y simples
6. Incluyan tips para preservar alimentos y sustituir ingredientes

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) en este formato exacto:
{
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Nombre de la receta",
      "description": "Descripción breve y atractiva en 1-2 oraciones",
      "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
      "instructions": ["Paso 1 detallado", "Paso 2 detallado"],
      "prepTime": 25,
      "difficulty": "Fácil",
      "servings": 2,
      "tips": ["Tip práctico 1", "Tip práctico 2"]
    }
  ]
}

IMPORTANTE: 
- El campo "difficulty" debe ser exactamente: "Fácil", "Intermedio", o "Avanzado"
- Incluye cantidades específicas en los ingredientes
- Las instrucciones deben ser pasos claros y numerados
- Los tips deben ser prácticos para estudiantes venezolanos`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Sistema: Eres un experto chef venezolano especializado en cocina práctica y económica para estudiantes universitarios. Siempre respondes con JSON válido sin formato markdown.\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
      },
    });

    const content = result.response.text();

    const parsed = JSON.parse(content);
    console.log("parsed: ", parsed);

    const recipes = (parsed.recipes || []).map(
      (recipe: any, index: number) => ({
        id: recipe.id || `recipe-${Date.now()}-${index}`,
        title: recipe.title || "Receta sin nombre",
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prepTime: recipe.prepTime || cookingTime,
        difficulty: recipe.difficulty || "Intermedio",
        servings: recipe.servings || 2,
        tips: recipe.tips || [],
      })
    );

    return recipes;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate recipes from Gemini");
  }
}
