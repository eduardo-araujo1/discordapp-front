import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDTO, LoginResponseDTO, RegisterDTO } from '../model/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) { }


  login(loginDto: LoginDTO): Observable<LoginResponseDTO>{
    return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, loginDto);
  }

  register(registerDto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, registerDto)
  }

  getAuthorizationToken(){
    const token = window.localStorage.getItem('token');
    return token; 
   }

   isUserAuthorized() {
    const token = this.getAuthorizationToken()
    const isAuthorized = !!token
    console.log('User is authorized:', isAuthorized)
    return isAuthorized
  }

  getUserId(): string | null {
    const token = this.getAuthorizationToken();
    if (!token) return null;

    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    const payloadData = JSON.parse(decodedPayload);

    return payloadData.userId;
  }

  logout() {
    window.localStorage.removeItem('token');
  }
   
}
