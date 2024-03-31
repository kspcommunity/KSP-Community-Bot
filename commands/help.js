const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');

// Importing the logger module
const { log } = require('../utilities/logger');

// Define the help command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get information about available commands'),

  // Execute function for the help command
  async execute(interaction) {
    try {
      // Retrieve the list of commands from the bot's commands collection
      const commands = interaction.client.commands;

      // Create an array of embed fields
      const fields = commands.map(command => ({
        name: `**/${command.data.name}**`,
        value: command.data.description,
        inline: false,
      }));

      // Construct the file path for the footer icon
      const footerIconPath = path.join(__dirname, '..', 'assets', 'images', 'kspcommunity.png');

      // Create an embed object with footer
      const embed = {
        title: 'Available Commands',
        fields: fields,
        color: 2463422,
        footer: {
          text: 'KSP Community',
          icon_url: 'attachment://footer_icon.png',
        },
      };

      // Respond to the user with the embed and attach the footer icon
      await interaction.reply({
        embeds: [embed],
        files: [{
          attachment: footerIconPath,
          name: 'footer_icon.png',
        }],
      });

      log('Help command executed successfully!', 'info'); // Logging successful execution
    } catch (error) {
      log(`Error executing help command: ${error.message}`, 'error'); // Logging command execution errors
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
