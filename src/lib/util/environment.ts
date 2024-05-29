import { isProduction } from '#utils/env';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';
import { PermissionsBitField } from 'discord.js';
import { join, resolve } from 'path';

// DIRECTORY
export const SRC_DIR = resolve('src');
export const ROOT_DIR = join(SRC_DIR, '../');

export const DEBUG = envParseBoolean('DEBUG', true);
export const APP_ENV = envParseString('APP_ENV');

// GENERIC
export const CLIENT_NAME = envParseString('CLIENT_NAME', 'Birthdayy');
export const CLIENT_AVATAR = envParseString(
	'CLIENT_AVATAR',
	'https://cdn.discordapp.com/avatars/1039089174948626473/8d7f1e8a8b9f6e2b2f4b9a2c9b2b3a7e.webp'
);

// Values
export const BOT_SERVER_LOG = envParseString('LOG_CHANNEL_SERVER', '1077621363881300018');
export const BOT_ADMIN_LOG = envParseString('LOG_CHANNEL_ADMIN', '1077621363881300018');
export const DISCORD_INVITE = 'https://discord.birthdayy.xyz';
export const VOTE_CHANNEL_ID = isProduction ? '950683261540130816' : envParseString('LOG_CHANNEL_ADMIN');
export const VOTE_ROLE_ID = '1039089174948626473';

export const Permission_Bits = [
	PermissionsBitField.Flags.AddReactions,
	PermissionsBitField.Flags.AttachFiles,

	PermissionsBitField.Flags.ChangeNickname,
	PermissionsBitField.Flags.CreateInstantInvite,
	PermissionsBitField.Flags.CreatePrivateThreads,
	PermissionsBitField.Flags.CreatePublicThreads,

	PermissionsBitField.Flags.EmbedLinks,

	PermissionsBitField.Flags.MentionEveryone,
	PermissionsBitField.Flags.ManageChannels,
	PermissionsBitField.Flags.ManageGuildExpressions,
	PermissionsBitField.Flags.ManageMessages,
	PermissionsBitField.Flags.ManageNicknames,
	PermissionsBitField.Flags.ManageEvents,
	PermissionsBitField.Flags.ManageRoles,

	PermissionsBitField.Flags.ViewChannel,
	PermissionsBitField.Flags.ViewAuditLog,

	PermissionsBitField.Flags.SendMessages,
	PermissionsBitField.Flags.SendMessagesInThreads,

	PermissionsBitField.Flags.UseExternalEmojis,
	PermissionsBitField.Flags.UseExternalStickers
];
