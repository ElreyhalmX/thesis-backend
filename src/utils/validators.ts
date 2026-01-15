export function validateIngredients(ingredients: unknown): string[] | null {
  if (!Array.isArray(ingredients)) {
    return null
  }

  if (ingredients.length === 0) {
    return null
  }

  const validIngredients = ingredients.filter(
    (item) => typeof item === 'string' && item.trim().length > 0
  )

  return validIngredients.length > 0 ? validIngredients : null
}

export function validateCookingTime(time: unknown): number {
  if (typeof time === 'number' && time > 0 && time <= 180) {
    return time
  }
  return 30 // Default to 30 minutes
}

export function validatePortions(portions: unknown): number {
  if (typeof portions === 'number' && portions > 0 && portions <= 20) {
    return portions
  }
  return 2 // Default to 2 servings
}
