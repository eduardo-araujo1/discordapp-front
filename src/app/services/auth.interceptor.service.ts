import { HttpEvent,HttpHandlerFn,HttpInterceptorFn,HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export const AuthInterceptorService: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token');

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request);
};