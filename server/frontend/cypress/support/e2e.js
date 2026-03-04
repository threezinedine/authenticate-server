// Import custom commands
import './commands';

// Global beforeEach hook
beforeEach(() => {
    // Wipe client storage to ensure clean state across specific E2E test runs
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // We can also set up global cy.intercept() here if we want to mock network responses globally
});
