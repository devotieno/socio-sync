<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Social Media Posting Web Application - Copilot Instructions

This is a comprehensive Social Media Posting Web Application built with Next.js, Firebase, and social media APIs. Please follow these guidelines when generating code:

## Tech Stack
- **Frontend/Backend**: Next.js 14+ with App Router and TypeScript
- **Authentication**: Firebase Authentication with NextAuth.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage for media files
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Yup validation
- **Social Media APIs**: Twitter v2, Facebook Graph API, Instagram Graph API, LinkedIn API, TikTok API, YouTube Data API v3

## Key Features to Support
1. **User Authentication**: Email/password and Google OAuth
2. **Social Media Integration**: OAuth connections for multiple platforms
3. **Post Management**: Create, edit, delete, and schedule posts
4. **Media Upload**: Support for images and videos
5. **Analytics Dashboard**: Basic engagement metrics
6. **Responsive Design**: Mobile-first approach
7. **Error Handling**: Graceful API rate limit handling

## Code Conventions
- Use TypeScript with strict type checking
- Follow Next.js App Router patterns
- Implement proper error boundaries and loading states
- Use Firebase v9+ modular SDK
- Implement proper authentication guards
- Use Tailwind CSS for styling with responsive utilities
- Follow React best practices (hooks, functional components)
- Implement proper form validation and user feedback
- Use async/await for API calls with proper error handling

## Security Considerations
- Never expose API keys in client-side code
- Encrypt stored social media tokens
- Implement proper CORS configuration
- Use Firebase Security Rules
- Validate all user inputs
- Implement rate limiting for API routes

## File Organization
- Components in `src/components/` with clear naming
- API routes in `src/app/api/`
- Utilities in `src/utils/`
- Types in `src/types/`
- Custom hooks in `src/hooks/`
- Firebase configuration in `src/lib/`

When suggesting code, prioritize:
1. Type safety
2. Error handling
3. User experience
4. Performance optimization
5. Security best practices
