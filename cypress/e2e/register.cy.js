describe('Registration Page Scenarios', () => {
    beforeEach(() => {
        // Navigate to the registration page before each test
        cy.visit('/register');
    });

    it('renders 3D glass panel and adjacent NTT logo cleanly', () => {
        // Assert visual layout rendering
        cy.get('.auth-logo-large img').should('be.visible').and('have.attr', 'alt', 'NTT Logo');
        cy.get('.glass-panel--3d').should('be.visible');
        cy.get('.title-glow').contains('SIGN UP').should('be.visible');
    });

    it('flashes error outlines when submitting empty fields', () => {
        cy.get('button[type="submit"]').contains('CREATE ACCOUNT').click();

        // Verify all input groups receive the error class natively via the JS validation
        cy.get('input[name="full_name"]').closest('.input-group').should('have.class', 'has-error');
        cy.get('input[name="email"]').closest('.input-group').should('have.class', 'has-error');
        cy.get('input[name="password"]').closest('.input-group').should('have.class', 'has-error');
    });

    it('fires email pattern rejection logic for malformed emails', () => {
        // Fill full name and password correctly, but corrupt the email
        cy.get('input[name="full_name"]').type('John Doe');
        cy.get('input[name="email"]').type('not-a-valid-email.com');
        cy.get('input[name="password"]').type('StrongPass!123');

        cy.get('button[type="submit"]').click();

        // Verify specifically the email field flashes red
        cy.get('input[name="email"]').closest('.input-group').should('have.class', 'has-error');
        // Name and password should NOT have errors
        cy.get('input[name="full_name"]').closest('.input-group').should('not.have.class', 'has-error');
    });

    it('displays global red UI banner tracking "Invalid data" on 400 Bad Request', () => {
        // Intercept backend API call to force a 400 failure
        cy.intercept('POST', '/api/v1/register/', {
            statusCode: 400,
            body: { detail: "Invalid data provided in payload" }
        }).as('registerFail');

        // Submit valid local data to bypass JS validation and hit the network stub
        cy.get('input[name="full_name"]').type('John Doe');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('ValidPass123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerFail');

        // Assert global banner appears inside the form block with the error text
        cy.get('.auth-form__error-banner')
            .should('be.visible')
            .and('contain', 'Invalid data provided in payload');
    });

    it('displays global red banner "Account already exists" on API Conflict', () => {
        cy.intercept('POST', '/api/v1/register/', {
            statusCode: 409, // Conflict
            body: { detail: "Account already exists" }
        }).as('registerConflict');

        cy.get('input[name="full_name"]').type('John Doe');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('ValidPass123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerConflict');

        cy.get('.auth-form__error-banner')
            .should('be.visible')
            .and('contain', 'Account already exists');
    });

    it('toggles inputs to disabled and shows loading spinner during async wait', () => {
        // Delay the network response by 2 seconds so we can test the intermediate DOM state
        cy.intercept('POST', '/api/v1/register/', (req) => {
            req.reply({
                delay: 2000,
                statusCode: 200,
                body: { status: "success" }
            });
        }).as('delayedRegister');

        cy.get('input[name="full_name"]').type('John Doe');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('ValidPass123!');

        // As soon as we click submit...
        cy.get('button[type="submit"]').click();

        // Verify intermediate IS SUBMITTING state
        cy.get('input[name="full_name"]').should('be.disabled');
        cy.get('input[name="email"]').should('be.disabled');
        cy.get('input[name="password"]').should('be.disabled');
        cy.get('button[type="submit"]').should('be.disabled');

        // Check that the button morphed into a loader
        cy.get('button[type="submit"]').should('have.class', 'btn--loading');

        // After resolution, inputs should theoretically re-enable or the page will redirect
        cy.wait('@delayedRegister');
    });

    it('redirects to /login with success query param on valid registration', () => {
        // Fast mock for successful network
        cy.intercept('POST', '/api/v1/register/', {
            statusCode: 200,
            body: { status: "success" }
        }).as('registerSuccess');

        cy.get('input[name="full_name"]').type('John Doe');
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('ValidPass123!');
        cy.get('button[type="submit"]').click();

        cy.wait('@registerSuccess');

        // Assert final redirection logic
        cy.url().should('include', '/login?registered=true');
    });
});
