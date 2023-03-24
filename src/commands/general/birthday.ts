import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, BOOK, FAIL, IMG_CAKE, SUCCESS } from '../../helpers/provide/environment';
import { container } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import replyToInteraction from '../../helpers/send/response';
import thinking from '../../lib/discord/thinking';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { BirthdayCMD } from '../../lib/commands/birthday';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { hasUserGuildPermissions } from '../../helpers/provide/permission';
import { inlineCode, roleMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Birthday Command',
	subcommands: [
		{
			name: 'register',
			chatInputRun: 'birthdayRegister',
		},
		{
			name: 'remove',
			chatInputRun: 'birthdayRemove',
		},
		{
			name: 'list',
			chatInputRun: 'birthdayList',
		},
		{
			name: 'update',
			chatInputRun: 'birthdayUpdate',
		},
		{
			name: 'show',
			chatInputRun: 'birthdayShow',
		},
		{
			name: 'test',
			chatInputRun: 'birthdayTest',
		},
	],
})
export class BirthdayCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
		});
	}

	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await BirthdayCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('You don\'t have the permission to register other users birthdays.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const date = getDateFromInteraction(interaction);
		if (isNullOrUndefinedOrEmpty(date) || date.isValidDate === false) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('The date you entered is not valid.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const user = await container.client.users.fetch(user_id);

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (!isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: ARROW_RIGHT + ` This user's birthday is already registerd. Use </birthday update:${935174192389840896n}>`,
					}),
				],
				ephemeral: true,
			});
		}

		try {
			await container.utilities.birthday.create(date.date, interaction.guild, user);

			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${BOOK} Birthday Registered`,
						description: `${ARROW_RIGHT} ${inlineCode(`The birthday of ${user.username} was successfully registered.`)}`,
						fields: [
							{
								name: 'Date',
								value: getBeautifiedDate(date.date),
								inline: true,
							},
						],
						thumbnail_url: IMG_CAKE,
					}),
				],
				ephemeral: true,
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while registering the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('You don\'t have the permission to remove other users birthdays.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('This user has no birthday registered.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		try {
			await container.utilities.birthday.delete.ByGuildAndUser(guild_id, author_id);

			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${BOOK} Birthday Removed`,
						description: `${ARROW_RIGHT} The birthday of ${roleMention(user_id)} was successfully removed.`,
					}),
				],
				ephemeral: true,
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while removing the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const guild_id = interaction.guildId;
		const { embed, components } = await generateBirthdayList(1, guild_id);

		const generatedEmbed = await generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components: components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const guild_id = interaction.guildId;
		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('This user doesn\'t have a birthday registered.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const embed = await generateEmbed({
			title: `${BOOK} Birthday`,
			description: `${ARROW_RIGHT} ${roleMention(birthday.user_id)}'s birthday is at the ${getBeautifiedDate(birthday.birthday)}.`,
			thumbnail_url: IMG_CAKE,
		});

		return replyToInteraction(interaction, { embeds: [embed], ephemeral: true });
	}

	public async birthdayUpdate(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('You don\'t have the permission to update other users birthdays.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('This user doesn\'t have a birthday registered.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		const date = getDateFromInteraction(interaction);

		if (isNullOrUndefinedOrEmpty(date.date)) {
			const embed = await generateEmbed({
				title: `${FAIL} Failed`,
				description: `${ARROW_RIGHT} ${inlineCode('Please provide a valid date')}`,
			});

			return replyToInteraction(interaction, { embeds: [embed], ephemeral: true });
		}

		try {
			await container.utilities.birthday.update.BirthdayByUserAndGuild(guild_id, user_id, date.date);

			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${SUCCESS} Success`,
						description: `${ARROW_RIGHT} I updated the Birthday from ${roleMention(birthday.user_id)} to the ${getBeautifiedDate(
							date.date,
						)}. 🎂`,
					}),
				],
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					await generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occurred while updating the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const guildID = interaction.guildId;
		const userID = interaction.user.id;

		if (!(await hasUserGuildPermissions(interaction, userID, ['ManageRoles']))) {
			const embed = await generateEmbed({
				title: `${FAIL} Failed`,
				description: `${ARROW_RIGHT} ${inlineCode('You don\'t have the permission to run this command.')}`,
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		await container.tasks.run('BirthdayReminderTask', { userID, guildID, isTest: true });
		const embed = await generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} ${inlineCode('Birthday Test Run!')}`,
		});
		await replyToInteraction(interaction, { embeds: [embed] });
	}
}
