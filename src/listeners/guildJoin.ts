import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { AuditLogEvent, Guild } from 'discord.js';
import { AUTOCODE_ENV, IS_CUSTOM_BOT } from '../helpers/provide/environment';
import { sendDMMessage } from '../lib/discord/message';
import { GuideEmbed } from '../lib/embeds';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.GuildCreate,
			enabled: true
		});
	}
	public async run(guild: Guild) {
		const guild_id = guild.id;
		const inviter = await getBotInviter(guild);
		if (IS_CUSTOM_BOT) {
			//TODO: #26 Create a nice welcome message for custom bot servers
		}
		await createNewGuild();
		if (inviter) {
			await sendGuide(inviter);
		}
		return;

		async function createNewGuild() {
			//TODO: Before releasing to production, publish the api dev to release
			return await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.create({
				guild_id: guild_id,
				inviter: inviter
			});
		}

		async function sendGuide(user_id: string) {
			await sendDMMessage(user_id, {
				embeds: [GuideEmbed]
			});
		}

		async function getBotInviter(guild: Guild): Promise<string | null> {
			//TODO: Create a working version of this permission Check
			// if (!guild.me.permissions.has('VIEW_AUDIT_LOG')) {
			// 	return null;
			// }

			try {
				const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
				const entry = auditLogs.entries.first();
				const inviter = entry!.executor!.id;
				return inviter;
			} catch (error) {
				return null;
			}
		}
	}
}
