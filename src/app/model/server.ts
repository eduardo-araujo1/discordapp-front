import { ChannelResponseDTO } from "./channel";

export interface ServerRequestDTO {
  serverName: string;
  userId: string;
}

export interface ServerResponseDTO {
  id: string;
  serverName: string;
  channels: ChannelResponseDTO[];
  createdAt: string;
}
