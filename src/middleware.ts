import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;
  
  if (pathname.startsWith('/zh/')) {
    context.locals.locale = 'zh';
  } else {
    context.locals.locale = 'en';
  }
  
  return next();
});