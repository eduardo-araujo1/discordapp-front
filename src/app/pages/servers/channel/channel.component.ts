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
import { ToastrService } from 'ngx-toastr';


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
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.serverId = params.get('id'); 
      this.channelId = params.get('channelId');
      this.userId = this.authService.getUserId();
      
      if (this.serverId && this.channelId) {
        this.messages = [];
        
        this.loadChannel(this.serverId, this.channelId);
        
        this.initWebSocketConnection(this.serverId, this.channelId);
      } else {
        console.error('Erro ao capturar o serverId ou channelId.', {
          serverId: this.serverId,
          channelId: this.channelId
        });
      }
    });
  }

  loadChannel(serverId: string, channelId: string) {
    this.channelService.findChannelsById(serverId, channelId).subscribe({
      next: (data) => {
        this.channel = data;
      },
      error: (err) => this.toastr.error('Erro ao carregar o canal:', err)
    });
  }

  initWebSocketConnection(serverId: string, channelId: string) {
    this.messagesService.disconnect();
    
    this.messagesService.connect(serverId, channelId);
    
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    
    this.messagesSubscription = this.messagesService.getMessages().subscribe({
      next: (messages: MessageDTO[]) => {
        this.messages = messages;
      },
      error: (err) => this.toastr.error('Erro ao receber mensagens:', err)
    });
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
        authorName: this.username,
        timestamp: new Date().toISOString()
      };
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