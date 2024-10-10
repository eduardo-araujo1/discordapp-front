import { Component, NgModule } from '@angular/core';
import { ServerResponseDTO } from '../../../model/server';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServerService } from '../../../services/server.service';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { Channel, ChannelRequestDTO } from '../../../model/channel';
import { FormsModule, NgModel } from '@angular/forms';
import { MessageDTO } from '../../../model/message';

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [CommonModule,FormsModule, RouterLink],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent {


  server: ServerResponseDTO | null = null;
  errorMessage: string = '';
  newChannelName: string = '';

  constructor(
    private route: ActivatedRoute,
     private serverService: ServerService,
     private channelService: ChannelService,
     ) {}

     ngOnInit() {
      this.route.paramMap.subscribe((params) => {
        const serverId = params.get('id');
        
        if (serverId) {
          this.loadServer(serverId);
        }
      });
    }

  loadServer(id: string) {
    this.serverService.findById(id).subscribe({
      next: (data) => {
        this.server = data;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar o servidor: ' + error.message;
      }
    });
  }

  createChannel(): void {
    if (!this.newChannelName) return;

    const channelRequest: ChannelRequestDTO = {
      name: this.newChannelName
    };

    const serverId = this.server?.id;

    if (serverId) {
      this.channelService.createChannel(serverId, channelRequest).subscribe({
        next: (newChannel: Channel) => {
          this.server?.channels.push(newChannel);
          this.newChannelName = '';
        },
        error: (err) => this.errorMessage = 'Erro ao criar o canal.'
      });
    }
  }

}
