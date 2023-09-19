import { BirthdayyBotId, OwnerID } from '#utils/constants';
import { isProduction } from '#utils/env';
import { DEBUG, ROOT_DIR } from '#utils/environment';
import type { BotList } from '@devtomio/plugin-botlist';
import type { InfluxOptions } from '@kaname-png/plugin-influxdb';
import { LogLevel, container, type ClientLoggerOptions } from '@sapphire/framework';
import type { ServerOptions } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import type { ScheduledTaskHandlerOptions } from '@sapphire/plugin-scheduled-tasks';
import { Integrations, type NodeOptions } from '@sentry/node';
import { envIsDefined, envParseArray, envParseNumber, envParseString } from '@skyra/env-utilities';
import type { QueueOptions } from 'bullmq';
import {
	ActivityType,
	GatewayIntentBits,
	PresenceUpdateStatus,
	type ClientOptions,
	type PresenceData,
	type WebhookClientData,
} from 'discord.js';

export const OWNERS = envParseArray('BOT_OWNER', [OwnerID.Chillihero, OwnerID.Swiizyy]);

function parseApi(): ServerOptions {
	return {
		prefix: envParseString('API_EXTENSION', ''),
		origin: '*',
		listenOptions: { port: envParseNumber('API_PORT', 4000) },
		automaticallyConnect: false,
	};
}

function parseBotListOptions(): BotList.Options {
	return {
		clientId: BirthdayyBotId.Birthdayy,
		debug: DEBUG,
		shard: true,
		autoPost: {
			enabled: isProduction,
		},
		keys: {
			topGG: envParseString('TOPGG_TOKEN', ''),
			discordListGG: envParseString('DISCORDLIST_TOKEN', ''),
			discordBotList: envParseString('DISCORDBOTLIST_TOKEN', ''),
		},
	};
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'generic:key_not_found',
		fetchLanguage: async (context) => {
			if (!context.guild) {
				return 'en-US';
			}

			const guild = await container.prisma.guild.findFirst({
				where: { guildId: context.guild.id },
			});
			return guild?.language || 'en-US';
		},
	};
}

function parseBullOptions(): QueueOptions {
	return {
		connection: {
			port: envParseNumber('REDIS_PORT'),
			password: envParseString('REDIS_PASSWORD'),
			host: envParseString('REDIS_HOST'),
			db: envParseNumber('REDIS_DB'),
			username: envParseString('REDIS_USERNAME'),
		},
	};
}

function parseScheduledTasksOptions(): ScheduledTaskHandlerOptions {
	return {
		queue: 'birthdayy',
		bull: parseBullOptions(),
	};
}

function parsePresenceOptions(): PresenceData {
	return {
		status: PresenceUpdateStatus.Online,
		activities: [
			{
				name: '/birthday set 🎂',
				type: ActivityType.Watching,
			},
		],
	};
}

function parseLoggerOptions(): ClientLoggerOptions {
	return {
		level: DEBUG ? LogLevel.Debug : LogLevel.Info,
		instance: container.logger,
	};
}

export const SENTRY_OPTIONS: NodeOptions = {
	debug: DEBUG,
	integrations: [new Integrations.Http({ breadcrumbs: true, tracing: true })],
};

function parseSentryOptions() {
	return {
		loadSentryErrorListeners: true,
		root: ROOT_DIR,
		options: SENTRY_OPTIONS,
	};
}

export function parseAnalytics(): InfluxOptions {
	return {
		loadDefaultListeners: true,
	};
}

export const CLIENT_OPTIONS: ClientOptions = {
	analytics: parseAnalytics(),
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
	loadDefaultErrorListeners: true,
	logger: parseLoggerOptions(),
	shards: 'auto',
	api: parseApi(),
	botList: parseBotListOptions(),
	i18n: parseInternationalizationOptions(),
	tasks: parseScheduledTasksOptions(),
	presence: parsePresenceOptions(),
	sentry: parseSentryOptions(),
};

function parseWebhookError(): WebhookClientData | null {
	if (!envIsDefined('DISCORD_ERROR_WEBHOOK_ID', 'DISCORD_ERROR_WEBHOOK_TOKEN')) return null;

	return {
		id: envParseString('DISCORD_ERROR_WEBHOOK_ID'),
		token: envParseString('DISCORD_ERROR_WEBHOOK_TOKEN'),
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
