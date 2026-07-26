import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Recupera o token JWT do localStorage
  const token = localStorage.getItem('token');

  // Se o token existir, adiciona o cabeçalho Authorization
  if (token) {
    const reqComToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(reqComToken);
  }

  return next(req);
};