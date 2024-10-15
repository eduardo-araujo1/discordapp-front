import { Component, NgModule } from '@angular/core';
import { ServerResponseDTO } from '../../../model/server';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServerService } from '../../../services/server.service';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { ChannelRequestDTO, ChannelResponseDTO } from '../../../model/channel';
import { ReactiveFormsModule, NgModel, FormGroup, FormControl, Validators } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list'
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-server-details',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule],
  templateUrl: './server-details.component.html',
  styleUrl: './server-details.component.scss'
})
export class ServerDetailsComponent {

  server: ServerResponseDTO | null = null;
  newChannelName: string = '';
  channelId: string | null = null;
  channelForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService,
    private channelService: ChannelService,
    private toastr: ToastrService
  ) {
    this.channelForm = new FormGroup({
      newChannelName: new FormControl('', [Validators.required, Validators.minLength(2)])
    });
  }

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
        this.toastr.error('Erro ao carregar o servidor: ' + error.message);
      }
    });
  }

  createChannel(): void {
    if (this.channelForm.valid) {
      const channelRequest: ChannelRequestDTO = {
        name: this.channelForm.value.newChannelName 
      };

      const serverId = this.server?.id;
      if (!serverId) {
        this.toastr.error('ID do servidor não está disponível.');
        return;
      }

      this.channelService.createChannel(serverId, channelRequest).subscribe({
        next: (newChannel: ChannelResponseDTO) => {
          this.server?.channels.push(newChannel);
          this.toastr.success(`Canal "${newChannel.name}" criado com sucesso!`);
          this.channelForm.reset();
        },
        error: (err) => {
          this.toastr.error('Erro ao criar o canal: ' + err.message);
        }
      });
    }
  }
}