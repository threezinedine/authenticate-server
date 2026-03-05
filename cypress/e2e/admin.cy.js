describe('Admin Page Scenarios', () => {
    // 1. Route Protection (No Token)
    it('redirects to /login when visiting /admin directly without an access_token', () => {
        // Ensure no token exists
        cy.clearLocalStorage('access_token');

        // Attempt to visit protected route
        cy.visit('http://localhost:8000/admin');

        // Should be automatically redirected
        cy.url().should('include', '/login');

        // Ensure we are physically on the login page visually
        cy.get('#login-form-container').should('be.visible');
    });

    // 2. Route Protection (Invalid/Expired Token)
    it('redirects to /login and shows an expiration message when API calls return 401 on /admin', () => {
        // Seed a fake token to bypass initial client-side check
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake.expired.token');
        });

        // Intercept the initial data load that the admin page will predictably make
        // (Mocking an endpoint like GET /api/v1/users/me)
        cy.intercept('GET', '/api/v1/users/me', {
            statusCode: 401,
            body: { detail: 'Token has expired' }
        }).as('expiredSessionCheck');

        // Visit the admin page
        cy.visit('http://localhost:8000/admin');

        // Wait for the app to attempt to fetch its secure data
        cy.wait('@expiredSessionCheck');

        // Should be automatically redirected when the 401 is intercepted globally
        cy.url().should('include', '/login');

        // Ensure the expiration banner is visible to inform the user
        cy.get('.auth-form__global-error')
            .should('be.visible')
            .and('contain', 'Session expired. Please log in again.');
    });
    // 3. Normal User Access Restriction
    it('redirects a non-admin user (role: user) to /login when they try to access /admin', () => {
        // Seed a valid-looking token for a normal user
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake.normaluser.token');
        });

        // The backend should return 403 for non-admin tokens on the session check
        cy.intercept('GET', '/api/v1/users/me', {
            statusCode: 403,
            body: { detail: 'Insufficient permissions' }
        }).as('forbiddenCheck');

        cy.visit('http://localhost:8000/admin');

        cy.wait('@forbiddenCheck');

        cy.url().should('include', '/login');

        cy.get('.auth-form__global-error')
            .should('be.visible')
            .and('contain', 'Insufficient permissions. Admin access required.');
    });
});
