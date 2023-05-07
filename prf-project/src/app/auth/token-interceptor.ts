import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle token expiration and refresh the token
          return this.authService.refreshToken().pipe(
            tap((newToken: string) => {
              this.authService.setToken(newToken);
            }),
            switchMap((newToken: string) => {
              req = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next.handle(req);
            }),
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                // Log the expired token
                console.log('Expired token:', token);

                // Handle token expiration and refresh the token
                return this.authService.refreshToken().pipe(
                  tap((newToken: string) => {
                    this.authService.setToken(newToken);
                  }),
                  switchMap((newToken: string) => {
                    // Log the new token
                    console.log('New token:', newToken);

                    req = req.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`,
                      },
                    });
                    return next.handle(req);
                  }),
                  catchError((error: HttpErrorResponse) => {
                    return throwError(error);
                  })
                );
              }
              return throwError(error);
            })

          );
        }
        return throwError(error);
      })
    );
  }
}
