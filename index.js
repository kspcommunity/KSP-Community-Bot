// Import necessary modules and dependencies
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');
const { log } = require('./utilities/logger');

// Load environment variables from .env file
config();

// Read package.json file
const packageJson = require('./package.json');

// Log package details
log(`Bot Name: ${packageJson.name}`);
log(`Version: ${packageJson.version}`);
log(`Description: ${packageJson.description}`);
log(`Author: ${packageJson.author}`);
log(`License: ${packageJson.license}`);


// Create a Discord client
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize a Collection to store commands
bot.commands = new Collection();

// Read command files from the "commands" folder
try {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  // Load commands
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.data.name, command);
  }
} catch (error) {
  log(`Error loading commands: ${error.message}`, 'error');
}

// Event: Bot is ready
bot.once('ready', async () => {
  try {
    // Log bot information
    await log(`Logged in as ${bot.user.tag}!`);
    await log(`Total servers: ${bot.guilds.cache.size}`);

    // Log information about each guild the bot is in
    bot.guilds.cache.forEach(guild => {
      const memberCount = guild.memberCount;
      log(`Guild Name: ${guild.name} | Guild ID: ${guild.id} | Member Count: ${memberCount}`);
    });

    // Decode bot intents
    const intents = bot.options.intents;
    const decodedIntents = Object.keys(GatewayIntentBits).filter(key => (intents & GatewayIntentBits[key]) !== 0);
    log(`Bot Intents: ${decodedIntents.join(', ')}`);

    // Get all existing commands registered by the bot
    const existingCommands = await bot.application.commands.fetch();

    // Delete any old commands that are no longer present
    for (const existingCommand of existingCommands.values()) {
      if (!bot.commands.has(existingCommand.name)) {
        await existingCommand.delete();
        log(`Deleted old command: ${existingCommand.name}`);
      }
    }

    // Register slash commands
    for (const command of bot.commands.values()) {
      await bot.application.commands.create(command.data);
      log(`Registered command: ${command.data.name}`);
    }

  } catch (error) {
    log(`Error during bot setup: ${error.message}`, 'error');
  }
});

// Event: Interaction is created
bot.on('interactionCreate', async (interaction) => {
  try {
    // Check if the interaction is not a valid interaction type
    if (!interaction.isCommand() && !interaction.isStringSelectMenu() && !interaction.isButton() && !interaction.isModalSubmit()) {
      return;
    }

    // Log the interaction type
    log(`Interaction type: ${interaction.type}`);

    // Handle different interaction types
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      // Log the executed command
      log(`Command executed: ${commandName}`);

      // Execute the command
      if (!bot.commands.has(commandName)) return;

      await bot.commands.get(commandName).execute(interaction);
    }
  } catch (error) {
    log(`Error handling interaction: ${error.message}`, 'error');
    // Add appropriate error handling or reply to the user with an error message
  }
});

// Log in to Discord
bot.login(process.env.BOT_TOKEN);
