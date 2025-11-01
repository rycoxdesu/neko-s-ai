const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIHelper {
  constructor(modelName = 'models/gemini-1.5-flash') {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async generateText(prompt, options = {}) {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
        }
      });
      
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI text:', error);
      throw error;
    }
  }

  async generateTextStream(prompt, options = {}) {
    try {
      const result = await this.model.generateContentStream({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
        }
      });

      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
      }
      
      return fullText;
    } catch (error) {
      console.error('Error generating AI text stream:', error);
      throw error;
    }
  }
}

module.exports = AIHelper;