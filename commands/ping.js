const { SlashCommandBuilder } = require('@discordjs/builders');
const { log } = require('../utilities/logger'); // Importing the logger module

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot performance and ping information'),
  async execute(interaction) {
    try {
      const startTime = Date.now();
      const message = await interaction.reply({ content: 'Pinging...', ephemeral: true });

      const endTime = Date.now();
      const ping = endTime - startTime;

      // Edit the original response with bot performance and ping information as an embed
      await interaction.editReply({
        embeds: [{
          color: 2463422,
          fields: [
            { name: 'Ping', value: `${ping}ms`, inline: true },
          ],
        }],
      });

      log('Ping command executed successfully!', 'info'); // Logging successful execution
    } catch (error) {
      log(`Error executing ping command: ${error.message}`, 'error'); // Logging command execution errors
      await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
