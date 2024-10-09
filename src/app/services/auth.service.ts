import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDTO, LoginResponseDTO, RegisterDTO } from '../model/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  logout() {
    throw new Error('Method not implemented.');
  }
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
    if (isAuthorized) {
      console.log('Token:', token)
    }
    return isAuthorized
  }
   
}
