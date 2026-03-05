describe('Login Page Scenarios', () => {
    beforeEach(() => {
        // Assume backend is running on :8000
        cy.visit('http://localhost:8000/login');
    });

    it('renders the login fields and Google sign in button correctly', () => {
        cy.get('#login-form-container').should('exist');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('button[type="submit"]').contains('SIGN IN').should('be.visible');
        cy.get('.btn--social').contains('Continue with Google').should('be.visible');
    });

    // 1. Client Side Validation
    it('flashes error outlines when submitting empty inputs', () => {
        cy.get('button[type="submit"]').contains('SIGN IN').click();

        // Verify all input groups receive the error class natively via the JS validation
        cy.get('input[name="email"]').closest('.input-group').should('have.class', 'has-error');
        cy.get('input[name="password"]').closest('.input-group').should('have.class', 'has-error');
    });

    // 2. Client Side Recovery (Typing clears global error banner)
    it('clears global and field errors dynamically upon user typing', () => {
        // Setup 401 intercept first
        cy.intercept('POST', '/api/v1/login/', {
            statusCode: 401,
            body: { detail: 'Fake auth error' }
        }).as('failedLogin');

        // Submit with valid-looking credentials to trigger the API error
        cy.get('input[name="email"]').type('test@test.com');
        cy.get('input[name="password"]').type('wrongpass');
        cy.get('button[type="submit"]').click();
        cy.wait('@failedLogin');

        // Banner should appear with the error message
        cy.get('.auth-form__global-error').should('be.visible').and('contain', 'Fake auth error');

        // Type into any field -> banner should disappear (cleared by auth-form's input event listener)
        cy.get('input[name="email"]').type('m');
        cy.get('.auth-form__global-error').should('not.exist');
    });

    // 3. API Handlers and Mocking
    it('displays global red banner "Unauthorized" on 401 HTTP response', () => {
        cy.intercept('POST', '/api/v1/login/', {
            statusCode: 401,
            body: { detail: 'Incorrect email or password' }
        }).as('unauthorizedLogin');

        cy.get('input[name="email"]').type('unknown@ntt.com');
        cy.get('input[name="password"]').type('badpassword!');
        cy.get('button[type="submit"]').click();

        cy.wait('@unauthorizedLogin');

        // Verify the injected banner and the floating toast notification
        cy.get('.auth-form__global-error')
            .should('be.visible')
            .and('contain', 'Incorrect email or password');

        // The robust global toast notification should also fire for API errors
        cy.get('.toast-item--error')
            .should('be.visible')
            .and('contain', 'Incorrect email or password');
    });

    // 4. Loading States
    it('toggles inputs to disabled and shows loading spinner during async wait', () => {
        // We delay the mock response by 1 second to inspect the intermediate DOM state
        cy.intercept('POST', '/api/v1/login/', (req) => {
            req.on('response', (res) => {
                res.setDelay(1000);
                res.send({ statusCode: 401, body: { detail: 'Delayed fail' } });
            });
        }).as('delayedLogin');

        cy.get('input[name="email"]').type('delay@test.com');
        cy.get('input[name="password"]').type('Delay123!');
        cy.get('button[type="submit"]').click();

        // While waiting, assert loading state
        cy.get('button[type="submit"]').should('have.class', 'btn--loading');
        cy.get('.auth-form__loader').should('be.visible');
        cy.get('input[name="email"]').should('be.disabled');
        cy.get('input[name="password"]').should('be.disabled');

        cy.wait('@delayedLogin');

        // Assert unlocked state
        cy.get('button[type="submit"]').should('not.have.class', 'btn--loading');
        cy.get('input[name="email"]').should('not.be.disabled');
    });

    // 5. Success Path & Redirect
    it('redirects to /admin and caches JWT on valid login', () => {
        cy.intercept('POST', '/api/v1/login/', {
            statusCode: 200,
            body: {
                access_token: 'fake-jwt-token-123',
                token_type: 'bearer'
            }
        }).as('successLogin');

        cy.get('input[name="email"]').type('admin@ntt.com');
        cy.get('input[name="password"]').type('AdminPass123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@successLogin');

        // Confirm JWT caching
        cy.window().its('localStorage').invoke('getItem', 'access_token').should('eq', 'fake-jwt-token-123');

        // Assert success toast appears acknowledging the backend response
        cy.get('.toast-item--success').should('be.visible');

        // Confirm redirect to /admin
        cy.url().should('include', '/admin');
    });
});
