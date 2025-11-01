# Neko's Circle AI Discord Bot

An AI-powered Discord bot using Google's Gemini Pro model for intelligent conversations.

## Features

- AI-powered conversations using Google's Gemini Pro
- Slash commands for easy interaction
- Mention-based responses
- MongoDB integration for future features

## Commands

- `/ai [prompt]` - Chat with the AI assistant using Gemini Pro
- `/help` - Show help information about the bot

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your bot token and API keys

3. Start the bot:
   ```bash
   npm start
   ```

## Configuration

- The bot can be configured through `config/config.json`
- Environment variables are stored in `.env`

## Requirements

- Node.js 16.6.0 or higher
- Discord.js v14
- Google Generative AI SDK
- A Discord bot token
- Google Gemini API key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request