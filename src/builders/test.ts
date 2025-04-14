import { Interaction } from 'discord.js';

declare const interaction: Interaction;

declare const getFlags: (interaction: Interaction, flag) => string[];

if (interaction.isChatInputCommand()) {
  // InteractionReplyOptions: Replying to a chat input command
  interaction.reply({
    content: 'This is a reply to a chat input command.',
    ephemeral: true // Makes the reply visible only to the user
  });

  // InteractionEditReplyOptions: Editing a reply to a chat input command
  interaction.editReply({
    content: 'This is an edited reply to a chat input command.'
  });
} else if (interaction.isButton()) {
  // InteractionReplyOptions: Replying to a button interaction
  interaction.reply({
    content: 'You clicked a button!',
    ephemeral: true
  });
} else if (interaction.isAnySelectMenu()) {
  // InteractionReplyOptions: Replying to a select menu interaction
  interaction.reply({
    content: 'You selected an option from the menu!',
    ephemeral: true
  });
}
