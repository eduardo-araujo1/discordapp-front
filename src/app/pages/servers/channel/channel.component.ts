import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { ChannelResponseDTO } from '../../../model/channel';
import { ActivatedRoute } from '@angular/router';
import { MessageDTO } from '../../../model/message';
import { Subscription } from 'rxjs';
import { MessagesService } from '../../../services/messages.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
 
  channel: ChannelResponseDTO | null = null;
  serverId: string | null = null;
  channelId: string | null = null;
  userId: string | null = null;
  username: string | null = null;
  messages: MessageDTO[] = [];
  newMessage: string = '';
  private messagesSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private messagesService: MessagesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.serverId = params.get('id'); 
      this.channelId = params.get('channelId');
      this.userId = this.authService.getUserId();
    
      console.log('Server ID:', this.serverId);
      console.log('Channel ID:', this.channelId);
      console.log('User ID:', this.userId);
    
      if (this.serverId && this.channelId) {
        this.loadChannel(this.serverId, this.channelId);
        this.initWebSocketConnection(this.serverId, this.channelId);
      } else {
        console.error('Erro ao capturar o serverId ou channelId.', {
          serverId: this.serverId,
          channelId: this.channelId
        });
      }
    });
  
    this.messagesSubscription = this.messagesService.getMessages().subscribe({
      next: (messages: MessageDTO[]) => {
        console.log('Novas mensagens recebidas:', messages);
        this.messages = messages;
        console.log('Mensagens atualizadas no componente:', this.messages);
      },
      error: (err) => console.error('Erro ao receber mensagens:', err)
    });
  }

  loadChannel(serverId: string, channelId: string) {
    this.channelService.findChannelsById(serverId, channelId).subscribe({
      next: (data) => {
        this.channel = data;
      },
      error: (err) => console.error('Erro ao carregar o canal:', err)
    });
  }

  initWebSocketConnection(serverId: string, channelId: string) {
    console.log('Iniciando conexão WebSocket');
    this.messagesService.connect(serverId, channelId);
  }

  ngOnDestroy() {
    console.log('ChannelComponent being destroyed');
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.messagesService.disconnect();
  }

  sendMessage() {
    if (this.newMessage.trim() && this.serverId && this.channelId && this.userId) {
      const chatMessage: MessageDTO = {
        content: this.newMessage,
        authorId: this.userId,
        authorName: this.username, // Se você quiser incluir o nome do autor
        timestamp: new Date().toISOString()  // Adicionando timestamp
      };
      console.log('Sending message:', chatMessage);
      this.messagesService.sendMessage(this.serverId, this.channelId, chatMessage);
      this.newMessage = '';
    } else {
      console.error('Invalid message or missing IDs', {
        message: this.newMessage,
        serverId: this.serverId,
        channelId: this.channelId,
        userId: this.userId
      });
    }
  }
}