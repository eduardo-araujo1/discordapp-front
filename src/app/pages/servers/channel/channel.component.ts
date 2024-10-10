import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { ChannelResponseDTO } from '../../../model/channel';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
 
  channel: ChannelResponseDTO | null = null;
  serverId: string | null = null;
  channelId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.serverId = params.get('serverId');
      this.channelId = params.get('channelId');

      if (this.serverId && this.channelId) {
        this.loadChannel(this.serverId, this.channelId);
      }
    });
  }

  loadChannel(serverId: string, channelId: string) {
    this.channelService.findChannelsById(serverId, channelId).subscribe({
      next: (data) => this.channel = data,
      error: (err) => console.error('Erro ao carregar o canal:', err)
    });
  }
}