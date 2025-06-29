const buildV1Prompt = (userData) => {
  const {
    lastMeals,
    location,
    favouriteCuisines,
    dietaryRestrictions,
    anythingToAvoid,
    recentOrders,
    currentTime,
  } = userData;

  const recentOrdersString = (recentOrders || [])
    .map((order) => `On ${order.orderDate}, I ordered: ${order.items.join(', ')}`)
    .join('; ');

  return `A user has provided the following information for food suggestions.
      Current Time: ${currentTime}
      Location: ${location.city}, ${location.state}, ${location.country}
      Favourite Cuisines: ${favouriteCuisines.join(', ')}
      Last Meals: ${lastMeals.join(', ')}
      Recent Orders: ${recentOrdersString || 'No recent orders'}
      Dietary Restrictions: ${(dietaryRestrictions || []).length > 0 ? dietaryRestrictions.join(', ') : 'No dietary restrictions'}
      Items to Avoid: ${(anythingToAvoid || []).length > 0 ? anythingToAvoid.join(', ') : 'No items to avoid'}

      Based on this comprehensive profile, please suggest three distinct and appealing food options for their next meal. The suggestions should be creative, complementary to their recent meals, and respectful of all their preferences and restrictions.`;
};

const buildV2Prompt = (userData) => {
  const {
    lastMeals,
    location,
    favouriteCuisines,
    dietaryRestrictions,
    anythingToAvoid,
    recentOrders,
    currentTime,
  } = userData;

  const recentOrdersString = (recentOrders || [])
    .map((order) => `On ${order.orderDate}, ordered: ${order.items.join(', ')}`)
    .join('; ');

  return `Suggest 3 meal ideas for a user with these details:
- Time: ${currentTime}
- Location: ${location.city}, ${location.country}
- Likes: ${favouriteCuisines.join(', ')}
- History: Ate ${lastMeals.join(', ')} recently. Recent orders include: ${recentOrdersString || 'No recent orders'}.
- Restrictions: Avoids ${(anythingToAvoid || []).join(', ') || 'No items to avoid'}. Dietary needs: ${(dietaryRestrictions || []).join(', ') || 'No dietary restrictions'}.

Give creative, distinct, and complementary suggestions.`;
};

const buildV3Prompt = (userData) => {
    const {
        lastMeals,
        location,
        favouriteCuisines,
        dietaryRestrictions,
        anythingToAvoid,
        recentOrders,
        currentTime,
    } = userData;

    const recentOrdersString = (recentOrders || [])
        .map((order) => `On ${order.orderDate}, ordered: ${order.items.join(', ')}`)
        .join('; ');

    return `You are an expert culinary assistant for the "WhatShouldIEat" app. 
    Your task is to generate personalized meal recommendations based on comprehensive user data.
    User Context:

    lastMeals: ${lastMeals.join(', ')}
    location: { "city": "${location.city}", "state": "${location.state}", "country": "${location.country}" }
    favouriteCuisines: ${favouriteCuisines.join(', ')}
    dietaryRestrictions: ${(dietaryRestrictions || []).join(', ') || 'No dietary restrictions'}
    anythingToAvoid: ${(anythingToAvoid || []).join(', ') || 'No items to avoid'}
    recentOrders: ${recentOrdersString || 'No recent orders'}
    Current Time: ${currentTime}

    Your Goal: Generate a list of exactly six meal suggestions for the user's next meal based on the current time.

    Requirements:
    - Analyze Holistically: Consider all provided user data. The recentOrders and lastMeals give you a strong signal of what to avoid suggesting right now.
    - Familiar Suggestions (4 options): These should align with the user's favouriteCuisines but be different from their recent meals.
    - Adventurous Suggestions (2 options): These should be meals from other cuisines that are likely available in the user's ${location.city}. They should not be from the favouriteCuisines list.
    - Respect Restrictions: All suggestions must strictly adhere to dietaryRestrictions and anythingToAvoid.
    - Generate Rich Content: For each suggestion, provide a short personalized reason, a longer description of the meal, and relevant tags.
    - All suggestions must be appropriate for the user's next meal based on the current time.
    
    Output Format: Respond with ONLY a valid JSON array of objects. Each object in the array must have the following structure:
    
    {
        "mealName": "Efo Riro with Semo",
        "cuisine": "Nigerian",
        "simpleReason": "A classic Nigerian staple that's savory and full of greens. ≤90 chars",
        "mealDescription": "Efo Riro is a rich vegetable soup made with spinach, peppers, and palm oil, often served with a swallow like Semo. It's known for its deep, savory flavor. ≤250 chars",
        "tags": ["Vegetable-Rich", "Savory", "Local Favorite"],
        "suggestionType": "familiar" | "adventurous"
    }
`;
};

const prompts = {
  v1: buildV1Prompt,
  v2: buildV2Prompt,
  v3: buildV3Prompt,
};

const buildPrompt = (userData, version = 'v1') => {
  const builder = prompts[version] || prompts.v1;
  return builder(userData);
};

module.exports = { buildPrompt };
