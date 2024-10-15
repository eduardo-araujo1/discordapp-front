import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageDTO } from '../model/message';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  public client: Client;
  private messageSubject: BehaviorSubject<MessageDTO[]> = new BehaviorSubject<MessageDTO[]>([]);
  messages$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient) {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') as any,
      onConnect: (frame) => {
        console.log('Connected to WebSocket', frame);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });
  }

  connect(serverId: string, channelId: string): void {
    console.log('Attempting to connect to WebSocket');
    this.client.activate();

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket', frame);
      this.subscribeToChannel(serverId, channelId);
    };
  }

  disconnect(): void {
    this.client.deactivate();
    this.messageSubject.next([]);
  }

  subscribeToChannel(serverId: string, channelId: string): void {
    const topicUrl = `/topic/servers/${serverId}/channels/${channelId}`;
    console.log(`Subscribing to channel: ${topicUrl}`);
    
    this.messageSubject.next([]);
    
    this.client.subscribe(topicUrl, (message) => {
      console.log('Received message:', message.body);
      const messageContent = JSON.parse(message.body) as MessageDTO;
      console.log('Parsed Message:', messageContent);
    
      const currentMessages = this.messageSubject.getValue();
      const updatedMessages = [...currentMessages, messageContent];
      console.log('Updated messages:', updatedMessages);
      this.messageSubject.next(updatedMessages);
    });
  }

  sendMessage(serverId: string, channelId: string, message: MessageDTO): void {
    if (!message || !serverId || !channelId) {
      console.error('Parâmetros inválidos para enviar mensagem.');
      return;
    }
  
    this.http.post<MessageDTO>(`http://localhost:8080/servers/${serverId}/channels/${channelId}/messages`, message)
      .subscribe({
        next: (response) => {
          console.log('Mensagem enviada com sucesso:', response);
        },
        error: (err) => {
          console.error('Erro ao enviar mensagem:', err);
        }
      });
  }
  addMessage(message: MessageDTO): void {
    const currentMessages = this.messageSubject.getValue();
    const updatedMessages = [...currentMessages, message];
    console.log('Mensagens atualizadas:', updatedMessages);
    this.messageSubject.next(updatedMessages);
  }

  getMessages(): Observable<MessageDTO[]> {
    return this.messageSubject.asObservable();
  }
}