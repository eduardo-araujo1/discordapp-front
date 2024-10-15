import { Component } from '@angular/core';
import { ServerResponseDTO } from '../../model/server';
import { ServerService } from '../../services/server.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list'
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule, RouterLink,  MatCardModule, MatListModule, MatIconModule],
  templateUrl: './servers.component.html',
  styleUrl: './servers.component.scss'
})
export class ServersComponent {
  servers: ServerResponseDTO[] = [];
  errorMessage: string = '';

  constructor(private serverService: ServerService) { }

  ngOnInit() {
    this.loadServers();
  }

  loadServers() {
    this.serverService.findAll().subscribe({
      next: (data) => {
        this.servers = data;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar os servidores: ' + error.message;
      }
    });
  }
}
