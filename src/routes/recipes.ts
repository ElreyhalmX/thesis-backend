import { Router } from 'express'
import { generateRecipes } from '../services/openai.js'
import { validateIngredients, validateCookingTime } from '../utils/validators.js'

const router = Router()

router.post('/generate', async (req, res, next) => {
  try {
    const { ingredients, cookingTime } = req.body

    const validatedIngredients = validateIngredients(ingredients)
    
    if (!validatedIngredients) {
      return res.status(400).json({ 
        error: 'Invalid ingredients',
        message: 'Please provide a valid array of ingredients'
      })
    }

    const validatedTime = validateCookingTime(cookingTime)

    console.log(`Generating recipes for ${validatedIngredients.length} ingredients with ${validatedTime} minutes`)

    const recipes = await generateRecipes(validatedIngredients, validatedTime)
    
    res.json({ recipes })
  } catch (error) {
    console.error('Error generating recipes:', error)
    next(error)
  }
})

export default router
