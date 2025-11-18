export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: number
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado'
  servings: number
  tips?: string[]
}

export interface GenerateRecipesRequest {
  ingredients: string[]
  cookingTime: number
}

export interface GenerateRecipesResponse {
  recipes: Recipe[]
}
