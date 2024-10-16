import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Channel, ChannelRequestDTO, ChannelResponseDTO } from '../model/channel';
import { Observable } from 'rxjs';
import { MessageDTO } from '../model/message';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private baseUrl = 'http://localhost:8080/servers';

  constructor(private http: HttpClient) {}

  createChannel(serverId: string, channelRequest: ChannelRequestDTO): Observable<ChannelResponseDTO> {
    return this.http.post<ChannelResponseDTO>(`${this.baseUrl}/${serverId}/channels`, channelRequest);
  }

  getMessages(serverId: string, channelId: string): Observable<MessageDTO[]> {
    return this.http.get<MessageDTO[]>(`${this.baseUrl}/${serverId}/channels/${channelId}/messages`);
  }

  findChannelsByServerId(serverId: string): Observable<ChannelResponseDTO[]> {
    return this.http.get<ChannelResponseDTO[]>(`${this.baseUrl}/${serverId}/channels`);
  }

  findChannelsById(serverId: string, channelId: string): Observable<ChannelResponseDTO> {
    return this.http.get<ChannelResponseDTO>(`${this.baseUrl}/${serverId}/channels/${channelId}`);
  }
  
}
