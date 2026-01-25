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

CONDIMENTOS Y ADEREZOS BÁSICOS DISPONIBLES (NO AGREGAR A LA LISTA DEL USUARIO):
- Sal
- Aceite (vegetal o de oliva)
- Pimienta negra
- Comino
- Agua

CONTEXTO IMPORTANTE:
- El estudiante vive solo y tiene conocimientos básicos de cocina
- Presupuesto limitado
- Servicios inestables (luz, agua, gas)
- Necesita recetas prácticas y económicas

INSTRUCCIÓN CRÍTICA - MUY IMPORTANTE:
Las recetas DEBEN usar ÚNICAMENTE:
1. Los ingredientes que el usuario agregó: ${ingredients.join(", ")}
2. Los condimentos básicos listados arriba (sal, aceite, pimienta, comino, agua)

NO INCLUYAS otros ingredientes que no estén en estas dos listas. Si no puedes hacer una receta con solo estos ingredientes, NO LA INCLUYAS.

TAREA:
Genera hasta 10 recetas venezolanas diferentes que:
1. Usen ÚNICAMENTE los ingredientes del usuario + condimentos básicos
2. Se puedan completar en ${cookingTime} minutos o menos
3. Sean económicas y accesibles
4. Cada receta debe ser calculada para ${portions} personas (NO generar ${portions} recetas, sino hasta 10 recetas donde cada una alcance para ${portions} comensales).
5. Tengan instrucciones claras y simples
6. Incluyan tips para preservar alimentos y sustituir ingredientes
7. Incluyan INFORMACIÓN NUTRICIONAL ESTIMADA por porción (calorías, proteínas, carbohidratos, grasas)

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
      "tips": ["Tip práctico 1", "Tip práctico 2"],
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
- Incluye cantidades específicas en los ingredientes
- Las instrucciones deben ser pasos claros y numerados
- Los tips deben ser prácticos para estudiantes venezolanos
- NO INCLUYAS ingredientes que NO están en la lista de ingredientes del usuario
- La información nutricional es OBLIGATORIA`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });
    // const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' })

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
  Genera un PLAN SEMANAL (Lunes a Viernes) para el ALMUERZO.
  Para cada día, DEBES generar una RECETA COMPLETA detallada (no solo resumen).
  
  REGLAS:
  1. Puedes sugerir ingredientes comunes baratos adicionales.
  2. Prioriza el NO desperdicio.
  3. Cada día debe tener un almuerzo distinto.
  
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
    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });
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
