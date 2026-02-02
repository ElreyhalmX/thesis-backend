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
  cookingTime: number,
  portions: number
): Promise<Recipe[]> {
  console.log("ingredients", ingredients);
  console.log(" ");
  const prompt = `Eres un asistente culinario experto.

Ingredientes proporcionados por el usuario: ${ingredients.join(", ")}

TAREA DE VALIDACIÓN (PRIORIDAD MÁXIMA):
Analiza CUIDADOSAMENTE la lista de ingredientes del usuario.
Si detectas CUALQUIER entrada que cumpla con alguna de estas condiciones:
1. NO es un ingrediente comestible real (ej: "piedra", "cemento", "amor", "esperanza").
2. Es una frase o texto aleatorio que no es un alimento.
3. Es un objeto no comestible.
4. Es un concepto abstracto.

ENTONCES, DEBES RESPONDER ÚNICAMENTE CON ESTE JSON DE ERROR:
{
  "error": "INVALID_INGREDIENTS",
  "message": "Uno de los ingredientes que agregó no es un ingrediente"
}

SI Y SOLO SI TODOS LOS INGREDIENTES SON VÁLIDOS, procede a generar las recetas siguiendo estas instrucciones:

Eres un asistente culinario especializado en cocina venezolana para estudiantes universitarios con recursos limitados.

Tiempo disponible: ${cookingTime} minutos
Porciones a preparar: ${portions} personas


CONTEXTO IMPORTANTE:
- El estudiante vive solo y tiene conocimientos básicos de cocina
- Presupuesto limitado
- Servicios inestables (luz, agua, gas)
- Necesita recetas prácticas y económicas

INSTRUCCIÓN CRÍTICA DE GESTIÓN DE RECURSOS (MUY IMPORTANTE):
1. USO ESTRICTO DE CANTIDADES: Si el usuario indica cantidades (ej: "200g de carne"), DEBES AJUSTAR la receta a esa cantidad exacta.
2. "RENDIR" LOS INGREDIENTES: Tu objetivo principal es que la comida ALCANCE para ${portions} personas con lo que hay.
   - Si hay POCOS ingredientes para la cantidad de personas (ej: 200g de carne para 5 personas), DEBES crear recetas donde el ingrediente se "estire" o "rinda" (ej: Carne molida con mucho vegetal, sopas, guisos aguados, arroz aliñado).
   - NO inventes ingredientes extra para completar. Si falta comida, reduce el tamaño de la porción recomendada pero CUMPLE con alimentar a ${portions} personas de forma simbólica o ligera.
   - Explica en los 'tips' cómo hiciste rendir el ingrediente (ej: "Se picó la carne muy pequeña para que se notara más").

RESTRICCIONES:
Las recetas DEBEN usar ÚNICAMENTE:
1. Los ingredientes que el usuario agregó: ${ingredients.join(", ")}

NO asumas que el usuario tiene sal, agua o aceite. Si no están en la lista, NO LOS USES.

NO INCLUYAS otros ingredientes.

TAREA:
Genera hasta 6 recetas venezolanas que:
1. Use ÚNICAMENTE los ingredientes del usuario.
2. Se pueda completar en ${cookingTime} minutos o menos.
3. Sea económica y accesible.
4. CALCULADA PARA ${portions} PERSONAS (Rindiendo los ingredientes al máximo si es necesario).
5. Tenga instrucciones claras y simples.
6. Incluya tips para preservar alimentos y sustituir ingredientes.
7. Incluya INFORMACIÓN NUTRICIONAL ESTIMADA por porción (calorías, proteínas, carbohidratos, grasas).

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin bloques de código) en este formato exacto:
{
  "recipes": [
    {
      "id": "recipe-1",
      "title": "Nombre de la receta",
      "description": "Descripción indicando cómo se rindieron los ingredientes si es necesario",
      "ingredients": ["ingrediente 1 con cantidad ajustada", "ingrediente 2 con cantidad"],
      "instructions": ["Paso 1 detallado", "Paso 2 detallado"],
      "prepTime": 25,
      "difficulty": "Fácil",
      "servings": ${portions},
      "tips": ["Tip sobre cómo se rindió el ingrediente", "Tip práctico 2"],
      "nutrition": {
        "calories": 450,
        "protein": "20g",
        "carbs": "45g",
        "fat": "15g"
      }
    }
  ]
}

IMPORTANTE: 
- El campo "difficulty" debe ser exactamente: "Fácil", "Intermedio", o "Avanzado"
- Incluye cantidades específicas en los ingredientes usadas para las ${portions} personas.
- Las instrucciones deben ser pasos claros y numerados.
- Los tips deben ser prácticos para estudiantes venezolanos.
- NO INCLUYAS ingredientes que NO están en la lista.
- La información nutricional es OBLIGATORIA.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Sistema: Eres un experto chef venezolano. Siempre respondes con JSON válido sin formato markdown.\n\n${prompt}`,
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

    if (parsed.error === "INVALID_INGREDIENTS") {
      throw new Error("INVALID_INGREDIENTS");
    }

    const recipes = (parsed.recipes || []).map(
      (recipe: any, index: number) => ({
        id: recipe.id || `recipe-${Date.now()}-${index}`,
        title: recipe.title || "Receta sin nombre",
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prepTime: recipe.prepTime || cookingTime,
        difficulty: recipe.difficulty || "Intermedio",
        servings: recipe.servings || portions,
        tips: recipe.tips || [],
        nutrition: recipe.nutrition || { calories: 0, protein: "0g", carbs: "0g", fat: "0g" },
      })
    );

    return recipes;
  } catch (error: any) {
    if (error.message === "INVALID_INGREDIENTS") {
      throw error;
    }
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate recipes from Gemini");
  }
}

export async function generateWeeklyPlan(
  ingredients: string[],
  portions: number
): Promise<any[]> {
  /* New Prompt for Full Recipe Generation */
  const prompt = `Eres un experto planificador nutricional para estudiantes venezolanos.
  
  Ingredientes disponibles: ${ingredients.join(", ")}
  Porciones: ${portions}

  TAREA:
  Genera un PLAN SEMANAL de 5 días (Lunes a Viernes) específicamente para el ALMUERZO.
  Debes generar EXACTAMENTE 5 recetas completas.
  
  REGLAS:
  1.NO INCLUYAS ingredientes que NO están en la lista de ingredientes del usuario.
  2. DEBES "RENDIR" LOS INGREDIENTES: Ajusta las porciones para que alcancen para ${portions} personas durante los 5 días. Si hay poca comida, crea platos donde el ingrediente principal se estire (sopas, arroces mixtos).
  3. Prioriza el NO desperdicio.
  4. Deben ser 5 almuerzos distintos, uno para cada día de la semana laboral.
  
  Responde con JSON formato:
  {
    "plan": [
      {
        "day": "Lunes",
        "recipe": {
            "title": "Nombre",
            "description": "Descrip...",
            "ingredients": ["ing1", "ing2"],
            "instructions": ["paso1", "paso2"],
            "difficulty": "Fácil",
            "prepTime": 30,
            "servings": ${portions},
            "tips": ["tip1"],
            "nutrition": { "calories": 400, "protein": "20g", "carbs": "50g", "fat": "10g" }
        },
        "rationale": "Usa el pollo sobrante"
      }
      ... (Martes, Miércoles, Jueves, Viernes)
    ]
  }
`;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `Sistema: JSON Only. Full Recipes.\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7 }
    });
    
    const content = result.response.text();
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
    const parsed = JSON.parse(cleanContent);
    return parsed.plan || [];
  } catch (error) {
    console.error("Weekly Plan Error:", error);
    return [];
  }
}

import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

export async function generateRecipeImage(recipeTitle: string, ingredients: string[] = []): Promise<string | null> {
  const modelName = "gemini-2.5-flash-image"; 
  
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     
     const ingredientsText = ingredients.length > 0 ? ` using ONLY these ingredients: ${ingredients.join(", ")}` : "";
     
     const prompt = `Create a photorealistic, high-quality food photography image of a Venezuelan dish named: "${recipeTitle}"${ingredientsText}. 
     IMPORTANT: The dish must ONLY contain the listed ingredients. Do not add ingredients not listed. 
     The image should look delicious, professional, and authentic, suitable for a recipe card.`;

     const response = await ai.models.generateContent({
       model: modelName,
       contents: prompt,
     });

     // Check candidates for inline data
     if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                // Compression Step with Sharp
                try {
                    const originalBuffer = Buffer.from(part.inlineData.data, 'base64');
                    
                    const compressedBuffer = await sharp(originalBuffer)
                        .resize(800) // Resize width to 800px (standard web size)
                        .jpeg({ quality: 80, mozjpeg: true }) // Compress to JPEG 80%
                        .toBuffer();

                    const base64Compressed = compressedBuffer.toString('base64');
                    return `data:image/jpeg;base64,${base64Compressed}`;

                } catch (compressionError) {
                    console.error("Compression Failed, returning original:", compressionError);
                     // Fallback to original if sharp fails
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
     }
     
     return null;
  } catch (error) {
     console.error("Gemini Native Image Gen Error:", error);
     return null;
  }
}
