import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


export const HttpErrorInterceptor: HttpInterceptorFn = (request, next) => {

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
    //   if (error?.status === 403 && !request?.url?.includes('/refreshtoken')) {
    //     return this.authService.refreshToken().pipe(
    //       switchMap(
    //         () => next.handle(this.addAuthenticationToken(request)) // TODO next.handle(request)
    //       ),
    //       catchError(() => {
    //         this.authService.logout();
    //         this.router.navigate(['/login']);
    //         return EMPTY;
    //       })
    //     );
    //   }

    //   if ([401, 403]?.includes(error.status)) {
    //     this.authService.logout();
    //     this.router.navigate(['/login']);
    //     return throwError(() => error?.error); // EMPTY;
    //   }

      return throwError(() => new Error(error?.toString()) ); //error?.error
    })
  );

}


