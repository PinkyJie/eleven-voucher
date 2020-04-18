export const environment = {
  production: true,
  readonlyFileSystem: true,
  port: process.env.PORT,
  corsWhitelist: [
    'https://eleven-voucher.web.app',
    'https://eleven-voucher.firebaseapp.com',
  ],
};
