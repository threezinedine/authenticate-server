// Global design tokens + reset
import '../assets/global.css';

// Component stylesheets
import '../components/button/style.css';
import '../components/input-group/style.css';
import '../components/auth-form/style.css';
import '../components/divider/style.css';
import '../components/glass-panel/style.css';
import '../components/title-glow/style.css';
import '../components/auth-layout/style.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
};

export default preview;