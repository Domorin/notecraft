import { RedisChannelType } from "../../common/redis/redis";
// TODO: probably move this to common

export type UserPresence = {
	clientId: number | undefined;
	name: string;
	color: string;
};

export type CustomMessage =
	| { type: "connectionMetadata"; activeConnections: number }
	| ({
			type: "noteMetadataUpdate";
	  } & RedisChannelType["NoteMetadataUpdate"])
	| {
			type: "presencesUpdated";
			users: UserPresence[];
	  };
