import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    // Tempo extra para requisições HTTP ao backend
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    // Tamanho da viewport para testes desktop
    viewportWidth: 1280,
    viewportHeight: 720,
    // Não faz failsafe de erros JS da aplicação (Angular pode emitir warnings)
    chromeWebSecurity: false,
    // Grava vídeo dos testes
    video: true,
    // Screenshots apenas em falha
    screenshotOnRunFailure: true,
  },
});
