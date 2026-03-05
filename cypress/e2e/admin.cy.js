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

    // 4. Logout Protection
    it('redirects to /login if a user tries to access /admin directly after logging out', () => {
        // Assume user is logged in initially
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'valid.token.for.logout.test');
        });

        // Mock the initial successful authentication check
        cy.intercept('GET', '/api/v1/users/me', {
            statusCode: 200,
            body: { id: 1, email: 'admin@test.com', role: 'admin' }
        }).as('sessionCheck');

        // Visit admin dashboard
        cy.visit('http://localhost:8000/admin');
        cy.wait('@sessionCheck');
        cy.url().should('include', '/admin');

        // Simulate clicking the logout button (assuming it exists in the SideMenu)
        cy.get('.sidemenu__logout-btn').click();

        // The modal should appear
        cy.get('.modal').should('be.visible');
        cy.get('.modal__title').should('contain', 'Log out');

        // Click the actual 'Log out' confirm button inside the modal
        // It has the .btn--danger class
        cy.get('.modal .btn--danger').last().click();

        // 1. Assert we are redirected to the login screen
        cy.url().should('include', '/login');

        // 2. Assert the local storage token has been completely wiped
        cy.window().then((win) => {
            expect(win.localStorage.getItem('access_token')).to.be.null;
        });

        // 3. Attempt to visit /admin directly again after logging out
        cy.visit('http://localhost:8000/admin');

        // 4. Assert protection bounces us back out to /login
        cy.url().should('include', '/login');
    });
});
