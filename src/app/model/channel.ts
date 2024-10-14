export interface Channel {
  channelId: string;
  name: string;
}

export interface ChannelRequestDTO {
  name: string;
}

export interface ChannelResponseDTO {
  channelId: string;
  name: string;
}