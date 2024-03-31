const { SlashCommandBuilder } = require('@discordjs/builders');
const { log } = require('../utilities/logger');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user to get their avatar')
        .setRequired(false)),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      // Get the user's avatar URL
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 2048 });

      // Construct the file path for the footer icon
      const footerIconPath = path.join(__dirname, '..', 'assets', 'images', 'kspcommunity.png');

      // Reply with the user's avatar as an embed
      await interaction.reply({
        embeds: [{
          title: `${user.tag}'s Avatar`,
          image: { url: avatarURL },
          color: 0x2463422,
          footer: {
            text: 'KSP Community',
            icon_url: 'attachment://footer_icon.png',
          },
        }],
        files: [{
          attachment: footerIconPath,
          name: 'footer_icon.png',
        }],
      });

      log('Avatar command executed successfully!', 'info'); // Logging successful execution
    } catch (error) {
      log(`Error executing avatar command: ${error.message}`, 'error'); // Logging command execution errors
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
