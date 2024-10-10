export interface ServerRequestDTO {
  serverName: string;
  userId: string;
}

export interface ServerResponseDTO {
  id: string;
  serverName: string;
  channels: any[];
  createdAt: string;
}
