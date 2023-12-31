import { RedisChannelType } from "../redis/index.js";

export type UserPresence = {
	clientId: number | undefined;
	name: string;
	color: string;
	isYou?: boolean;
	connectedMs: number;
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
