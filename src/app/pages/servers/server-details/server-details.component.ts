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
  errorMessage: string = '';
  newChannelName: string = '';
  channelId: string | null = null;
  channelForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService,
    private channelService: ChannelService
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
        this.errorMessage = 'Erro ao carregar o servidor: ' + error.message;
      }
    });
  }


  createChannel(): void {
    this.errorMessage = '';

    if (this.channelForm.valid) {
      const channelRequest: ChannelRequestDTO = {
        name: this.channelForm.value.newChannelName 
      };

      const serverId = this.server?.id;
      if (!serverId) {
        this.errorMessage = 'ID do servidor não está disponível.';
        return;
      }

      this.channelService.createChannel(serverId, channelRequest).subscribe({
        next: (newChannel: ChannelResponseDTO) => {
          console.log('Novo canal criado:', newChannel);  
          this.server?.channels.push(newChannel);
          this.channelForm.reset();
        },
        error: (err) => {
          this.errorMessage = 'Erro ao criar o canal: ' + err.message;
          console.error(err);
        }
      });
    }
  }
  
}
