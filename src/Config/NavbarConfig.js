// Configuration object for navbar visibility on different routes
const navbarConfig = {
  // Public routes
  '/': true,                    // Home page
  '/login': false,              // Login page
  '/register': false,           // Register page
  '/properties': true,          // Properties listing page
  '/property/:id': true,        // Individual property page
  '/about': true,              // About page
  '/contact': true,            // Contact page
  '/nearby-properties': true,  // Nearby properties page
  
  // Agent routes
  '/agent/profile': true,       // Agent profile page
  '/agent/properties': true,    // Agent properties page
  '/add-property': false,       // Add property page
  '/agent/edit-property': true, // Edit property page
  
  // Admin routes
  '/admin/dashboard': true,     // Admin dashboard
  '/admin/users': true,         // Users management
  '/admin/properties': true,    // Properties management
  '/edit-property/:id': false,  // Edit property page
  
  // Default value for routes not specified
  default: true
};

export const shouldShowNavbar = (pathname) => {
  // Check if the exact path exists in config
  if (navbarConfig.hasOwnProperty(pathname)) {
    return navbarConfig[pathname];
  }

  // Check for dynamic routes (routes with parameters)
  const dynamicRoutes = Object.keys(navbarConfig).filter(route => route.includes(':'));
  for (const route of dynamicRoutes) {
    const routePattern = new RegExp('^' + route.replace(/:[\w-]+/g, '[\\w-]+') + '$');
    if (routePattern.test(pathname)) {
      return navbarConfig[route];
    }
  }

  // Return default value if no match is found
  return navbarConfig.default;
};

export default navbarConfig;
