# ReviewCompany Frontend

A modern React-based review and company rating platform (similar to Glassdoor) with admin capabilities, dark mode support, and responsive design.

## Quick Start

### Prerequisites
- Node.js 18+ (see `NODE_VERSION.md`)
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Production Build

```bash
npm run build  # Build for production
npm run preview  # Preview production build locally
```

## Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **State Management**: TanStack React Query v5
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables (dark mode support)
- **Backend API**: Rails REST API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx       # Navigation bar
│   ├── MainLayout.jsx   # Main layout wrapper
│   ├── AdminLayout.jsx  # Admin panel layout
│   ├── AdminRoute.jsx   # Admin-only route protection
│   ├── ProtectedRoute.jsx # Authentication protection
│   ├── ReviewList.jsx   # Display reviews
│   ├── ReviewItem.jsx   # Single review card
│   ├── CreateReviewForm.jsx # Review creation
│   ├── ReplyList.jsx    # Comment threads
│   ├── ReplyItem.jsx    # Single comment
│   ├── CreateReplyForm.jsx # Comment creation
│   ├── StarRating.jsx   # Star rating component
│   ├── ThemeToggle.jsx  # Dark/light mode toggle
│   ├── ConfirmModal.jsx # Confirmation dialog
│   ├── Footer.jsx       # Footer component
│   └── *.css            # Component styles
├── pages/               # Page components
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # Authentication
│   ├── Register.jsx     # User registration
│   ├── Profile.jsx      # User profile & activity
│   ├── AllCompanies.jsx # Company listings
│   ├── CompanyDetail.jsx # Company profile & reviews
│   ├── WriteReview.jsx  # Review creation page
│   ├── About.jsx        # About page
│   ├── Contact.jsx      # Contact information
│   ├── FAQ.jsx          # Frequently asked questions
│   ├── Guidelines.jsx   # Community guidelines
│   ├── Terms.jsx        # Terms of service
│   ├── Privacy.jsx      # Privacy policy
│   ├── Sitemap.jsx      # Site navigation
│   ├── admin/           # Admin panel pages
│   │   ├── AdminDashboard.jsx    # Admin overview
│   │   ├── AdminReviews.jsx      # Review moderation
│   │   ├── AdminUsers.jsx        # User management
│   │   ├── AdminCompanies.jsx    # Company management
│   │   └── index.js              # Admin exports
│   └── *.css            # Page styles
├── services/            # API integration
│   ├── api.js           # Axios instance & interceptors
│   ├── authService.js   # Authentication API calls
│   ├── companyService.js # Company API calls
│   ├── reviewService.js # Review API calls
│   ├── replyService.js  # Reply API calls
│   ├── userService.js   # User API calls
│   ├── favoriteService.js # Favorite management
│   └── adminService.js  # Admin-only API calls
├── hooks/               # Custom React hooks
│   ├── useCompanies.js  # Fetch companies list
│   ├── useCompany.js    # Fetch single company
│   ├── useReviews.js    # Fetch reviews
│   ├── useRecentReviews.js # Fetch recent reviews
│   ├── useFavorites.js  # Fetch user favorites
│   ├── useFavoriteMutations.js # Add/remove favorites
│   ├── useReviewMutations.js # Create/update/delete reviews
│   ├── useReviewMutationsExtended.js # Extended review operations
│   ├── useReplyMutations.js # Reply operations
│   ├── useCompanyMutations.js # Company operations
│   ├── useUserActivity.js # User activity stats
│   └── index.js         # Hook exports
├── contexts/            # React Context providers
│   ├── AuthContext.jsx  # Authentication state
│   └── ThemeContext.jsx # Dark mode state
├── config/              # Configuration
│   └── api.js           # API base URL & constants
├── App.jsx              # Main app component
├── App.css              # Global app styles
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Key Features

### Authentication
- User registration and login
- JWT token-based authentication (stored in localStorage)
- Protected routes for authenticated users
- Session persistence

### Companies
- Browse all companies
- View detailed company profiles
- Company rating and review statistics
- Add/remove company favorites

### Reviews
- Write detailed reviews with star ratings
- Filter reviews by rating and date
- Like/dislike functionality
- Edit and delete own reviews

### Comments/Replies
- Reply to reviews with comments
- Nested discussion threads
- Edit and delete own replies

### User Profile
- View user activity and statistics
- Manage favorite companies
- Track written reviews
- User account settings

### Admin Panel
- **Dashboard**: Overview of key metrics
- **Review Moderation**: Approve/reject/delete reviews
- **User Management**: View and manage user accounts
- **Company Management**: Create/update/delete companies

### Dark Mode
- System preference detection
- Manual theme toggle
- CSS variables for theme colors
- Persistent user preference

### Responsive Design
- Mobile-first approach
- Flexible layouts
- Touch-friendly interactions
- Works on all screen sizes

## Environment Variables

Create `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_TENANT=asia
```

## API Integration

The application communicates with a Rails backend API. All HTTP requests are made through the `apiClient` in `src/services/api.js`:

- **Base URL**: Configured via `VITE_API_BASE_BASE_URL`
- **Authentication**: JWT token in Authorization header
- **Error Handling**: Automatic retry logic and error messages
- **Multi-tenant**: Tenant ID in `X-API-TENANT` header

## Development

```bash
npm run dev      # Start development server (port 5173)
npm run lint     # Run ESLint code checker
npm run build    # Build for production
npm run preview  # Preview production build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality with ESLint |

## Troubleshooting

### Connection Issues
1. Verify backend is running on configured port
2. Check `VITE_API_BASE_URL` in `.env`
3. Inspect Network tab in browser DevTools

### Authentication Problems
1. Check localStorage for `access_token`
2. Verify token in API request headers
3. Check API response in Network tab

### CORS Errors
1. Ensure backend allows frontend origin
2. Check backend CORS configuration
3. Verify API request headers

### Dark Mode Not Working
1. Check localStorage for `theme` key
2. Verify CSS custom properties are defined
3. Inspect `data-theme` attribute on `<html>` element

## Contributing

- Follow existing code patterns and component structure
- Use hooks for state management
- Keep components small and focused
- Add proper error handling
- Test on multiple devices/screen sizes

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com)

## License

[Add license information]
