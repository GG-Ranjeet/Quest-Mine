import { db } from '../db/db.js';
import { users, userInventories, items } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const CRAFTING_RECIPES = [
  {
    id: 'recipe_iron_plate',
    resultItemId: 'eq1', // Iron Plate
    costCoins: 50,
    ingredients: [{ itemId: 'ore_iron', quantity: 3 }]
  },
  {
    id: 'recipe_crystal_guard',
    resultItemId: 'eq2', // Crystal Guard
    costCoins: 150,
    ingredients: [{ itemId: 'ore_diamond', quantity: 1 }, { itemId: 'ore_iron', quantity: 2 }]
  },
  {
    id: 'recipe_ring_of_focus',
    resultItemId: 'eq4', // Ring of Focus
    costCoins: 80,
    ingredients: [{ itemId: 'ore_gold', quantity: 2 }]
  },
  {
    id: 'recipe_wayfinder_charm',
    resultItemId: 'eq6', // Wayfinder Charm
    costCoins: 500,
    ingredients: [{ itemId: 'ore_diamond', quantity: 3 }, { itemId: 'ore_gold', quantity: 5 }]
  }
];

export const craftItem = async (req, res) => {
  const { recipeId } = req.body;
  
  try {
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = allUsers[0];

    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    if (user.coins < recipe.costCoins) {
      return res.status(400).json({ error: 'Not enough coins' });
    }

    const inventory = await db.select().from(userInventories).where(eq(userInventories.userId, user.id));

    // Validate ingredients
    for (const reqIngredient of recipe.ingredients) {
      const invItem = inventory.find(i => i.itemId === reqIngredient.itemId);
      if (!invItem || invItem.quantity < reqIngredient.quantity) {
        return res.status(400).json({ error: `Not enough material: ${reqIngredient.itemId}` });
      }
    }

    // Deduct coins
    await db.update(users).set({ coins: user.coins - recipe.costCoins }).where(eq(users.id, user.id));

    // Deduct ingredients
    for (const reqIngredient of recipe.ingredients) {
      const invItem = inventory.find(i => i.itemId === reqIngredient.itemId);
      const newQuantity = invItem.quantity - reqIngredient.quantity;
      if (newQuantity <= 0) {
        await db.delete(userInventories).where(and(eq(userInventories.userId, user.id), eq(userInventories.itemId, reqIngredient.itemId)));
      } else {
        await db.update(userInventories).set({ quantity: newQuantity }).where(and(eq(userInventories.userId, user.id), eq(userInventories.itemId, reqIngredient.itemId)));
      }
    }

    // Add resulting item
    const existingResult = inventory.find(i => i.itemId === recipe.resultItemId);
    if (existingResult) {
      await db.update(userInventories).set({ quantity: existingResult.quantity + 1 }).where(and(eq(userInventories.userId, user.id), eq(userInventories.itemId, recipe.resultItemId)));
    } else {
      await db.insert(userInventories).values({
        userId: user.id,
        itemId: recipe.resultItemId,
        quantity: 1
      });
    }

    res.json({ success: true, message: 'Crafted successfully!' });
  } catch (error) {
    console.error('Error crafting:', error);
    res.status(500).json({ error: 'Server error during crafting' });
  }
};
