describe('Authentication Flow', () => {
    it('Loads the static login page', () => {
        // Navigate to the simple FastAPI endpoint we created
        cy.visit('/login')

        // Verify the static HTML elements exist
        cy.get('h1').should('contain', 'Login Page')
        cy.get('p').should('contain', 'This is a simple static login page for initial testing.')
    })
})
