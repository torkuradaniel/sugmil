const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const { buildPrompt } = require('./utils/promptBuilder');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Initialize OpenAI API
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI(apiKey);

// Endpoint to get food suggestions based on user profile
app.post('/api/suggest-food', async (req, res) => {
  const {
    lastMeals,
    location,
    favouriteCuisines,
    dietaryRestrictions,
    anythingToAvoid,
    recentOrders,
    currentTime,
  } = req.body;

  // Basic validation to ensure all required fields are present
  if (
    !lastMeals ||
    !location ||
    !favouriteCuisines ||
    !currentTime
  ) {
    return res.status(400).json({ error: 'Missing one or more required fields.' });
  }

  try {
    const promptVersion = process.env.PROMPT_VERSION || 'v3';
    const prompt = buildPrompt(req.body, promptVersion);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'user', 
          content: [
            { 
              type: "text", 
              text: prompt
            } ]
        },
      ],

      response_format: {
        type: "json_object",
      }
      // max_completion_tokens: 1000,
    //  response_format: { type: "json_schema", json_schema: {
    //     "name": "json_schema",
    //     "description": "A meal suggestion based on user preferences",
    //     "strict": true,
    //     "schema": {
    //       "$schema": "https://json-schema.org/draft/2020-12/schema",
    //       "title": "MealSuggestion",
    //       "type": "object",
    //       "properties": {
    //         "mealName": {
    //           "type": "string"
    //         },
    //         "cuisine": {
    //           "type": "string"
    //         },
    //         "simpleReason": {
    //           "type": "string",
    //           "maxLength": 90
    //         },
    //         "mealDescription": {
    //           "type": "string",
    //           "maxLength": 250
    //         },
    //         "tags": {
    //           "type": "array",
    //           "items": {
    //             "type": "string"
    //           }
    //         },
    //         "suggestionType": {
    //           "type": "string",
    //           "enum": ["familiar", "adventurous"]
    //         }
    //       },
    //       "required": [
    //         "mealName",
    //         "cuisine",
    //         "simpleReason",
    //         "mealDescription",
    //         "tags",
    //         "suggestionType"
    //       ],
    //       "additionalProperties": false
    //     }
    //      }}
    });

    const suggestions = JSON.parse(response.choices[0].message.content);

    // const suggestions = response.data.choices[0].text.trim().split('\n').filter(Boolean);
    res.json({ suggestions });

    console.log(suggestions);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating suggestions');
  }
});

// Save user preferences
app.post('/api/extract-order-details', upload.array('images', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No image files uploaded.');
  }

  try {
    const prompt = `You are an intelligent assistant specializing in extracting structured data from images. A user has uploaded one or more images of food order receipts or menus. 
                 Your task is to analyze all the images and consolidate the extracted order details into a single structured JSON response.  
                 Please provide the response as a valid JSON object containing a single key, "orders", which should be an array of order objects. Each order object must have the following structure: 
                
                 - "orderDate": A string representing the date of the order (e.g., "2025-06-27"). Don't hallucinate dates. return null if the date is not found. 
                 - "items": An array of strings, where each string is an item in the order. Don't hallucinate items. return null if the items are not found. 
                 Example Output:   
                 "orders": [ 
                              {"orderDate": "2025-06-27", "items": ["Rice and Beans", "Fish"]},      
                              {"orderDate": "2025-06-25", "items": ["Fried and Jollof rice", "Chicken"]}
                           ] 
                 Analyze all the attached images and provide the extracted data in this exact JSON format.`;

    const content = [{ type: 'text', text: prompt }];

    for (const file of req.files) {
      const base64Image = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64Image}` },
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const structuredResponse = JSON.parse(response.choices[0].message.content);
    res.json(structuredResponse);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image.');
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
