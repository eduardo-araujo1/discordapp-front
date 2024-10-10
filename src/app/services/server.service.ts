import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { ServerRequestDTO, ServerResponseDTO } from '../model/server';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private apiUrl = 'http://localhost:8080/servers';

  constructor(private http: HttpClient, private authService: AuthService) { }


  registerServer(serverName: string): Observable<ServerResponseDTO> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    const token = this.authService.getAuthorizationToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const serverData: ServerRequestDTO = { serverName, userId };
    
    return this.http.post<ServerResponseDTO>(this.apiUrl, serverData, { headers });
  }

  findAll(): Observable<ServerResponseDTO[]> {
    return this.http.get<ServerResponseDTO[]>(this.apiUrl);
  }

  findById(serverId: string): Observable<ServerResponseDTO> {
    const url = `${this.apiUrl}/${serverId}`;
    return this.http.get<ServerResponseDTO>(url);
  }
}
