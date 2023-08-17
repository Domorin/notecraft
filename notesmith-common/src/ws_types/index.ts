import { RedisChannelType } from "../redis";

export type UserPresence = {
	clientId: number | undefined;
	name: string;
	color: string;
	isYou?: boolean;
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
