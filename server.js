const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Initialize OpenAI API
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI(apiKey);

// Store user preferences in memory (use a database for production)
let userPreferences = [];
let nationality = 'Nigerian';
let mealOptions = ['Non-Vegetarian', 'Protein', 'Healthy', 'Fitfam'];
let allergies = ['None'];
let diet = 'None';
let culture = ['Nigerian'];

// Endpoint to get food suggestions
app.post('/api/suggest-food', async (req, res) => {

  const { previousFoods } = req.body;
//   const previousFoods = ['Pizza', 'Burger', 'Pasta'];
  try {
    const prompt = `I'm am ${nationality} and prefer ${culture} means Based on the previous foods: ${previousFoods.join(
      ', '
    )}, suggest three new food options that are different but complementary. These foods should be ${mealOptions.join(
      ', '
    )}, ${allergies.join(
      ', '
    )}, ${diet} and ${culture} based.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const suggestions = response.choices[0].message.content.trim().split('\n').filter(Boolean)

    // const suggestions = response.data.choices[0].text.trim().split('\n').filter(Boolean);
    res.json({ suggestions });

    console.log(suggestions);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating suggestions');
  }
});

// Save user preferences
app.post('/api/save-preference', (req, res) => {
  const { food } = req.body;
  userPreferences.push(food);
  res.status(200).send('Preference saved!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
