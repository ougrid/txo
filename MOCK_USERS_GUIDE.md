# Mock User Authentication System

## Overview

The MiniSeller application includes a secure mock user system for development and demonstration purposes. This system allows easy testing of authentication features without requiring a backend database.

## Mock User Accounts

The following test accounts are automatically created when you first attempt to log in:

### 1. Administrator Account
- **Email**: `admin@miniseller.com`
- **Password**: `Admin123!`
- **Role**: Administrator
- **Description**: Platform administrator with full access to all features and analytics
- **Profile**: Comprehensive user profile with social links and complete contact information

### 2. Shop Owner Account
- **Email**: `demo@shopowner.com`
- **Password**: `Demo123!`
- **Role**: Shop Owner
- **Description**: Thai e-commerce shop owner specializing in fashion and accessories
- **Profile**: Realistic Thai business owner profile with local phone number and social media presence

### 3. Seller Account
- **Email**: `seller@thaistore.co.th`
- **Password**: `Seller123!`
- **Role**: Seller
- **Description**: Electronics and gadgets seller with 5+ years e-commerce experience
- **Profile**: Focus on revenue optimization and customer analytics

### 4. Data Analyst Account
- **Email**: `analyst@datacorp.th`
- **Password**: `Analyst123!`
- **Role**: Data Analyst
- **Description**: Professional analyst helping Thai e-commerce businesses optimize operations
- **Profile**: LinkedIn and Twitter presence with professional analytics background

## Security Features

### Password Security
- All passwords are hashed using bcryptjs with 12 salt rounds
- No plain text passwords are stored anywhere in the system
- Secure password comparison using bcrypt verification

### Session Management
- Cryptographically secure session tokens using crypto.getRandomValues()
- Configurable session duration (24 hours default, 30 days with "Remember Me")
- Automatic session expiration and cleanup
- Server-side cookie support for middleware route protection

### Data Storage
- All user data stored securely in localStorage
- No external data transmission
- Data persistence across browser sessions
- Cross-tab synchronization for real-time updates

## Development Helper

### Mock Credentials Helper Component
- **Location**: Bottom-right corner of authentication pages
- **Visibility**: Development and staging environments only (hidden in production)
- **Features**:
  - One-click credential filling
  - Role-based user selection
  - Quick access to all test accounts
  - Security warning for development use only

### Usage Instructions
1. Navigate to the sign-in page (`/signin`)
2. Click the "🔑 Test Users" button in the bottom-right corner
3. Select any user account and click "Use" to auto-fill credentials
4. Click "Sign in" to authenticate with the selected account

## Implementation Details

### Automatic Initialization
- Mock users are created automatically on first login attempt
- No manual setup required
- Prevents duplicate user creation
- Console logging for development tracking

### User Data Structure
Each mock user includes:
- Unique user ID and email address
- Realistic Thai contact information
- Social media profile links
- Professional biography and role description
- Creation and last login timestamps
- Secure password hash

### Integration Points
- **AuthService**: Core authentication logic with mock user initialization
- **SignInForm**: Integrated credentials helper for easy testing
- **SignUpForm**: Also includes credentials helper for consistency
- **AuthContext**: Seamless integration with application authentication state

## Production Considerations

### Security Notes
- Mock users are only for development and demonstration
- All development helpers are automatically hidden in production builds
- Real production deployment should integrate with proper backend authentication
- Current system provides complete functionality for client-side persistence

### Migration Path
When transitioning to production backend:
1. Replace localStorage with API calls
2. Implement JWT token management
3. Add refresh token functionality
4. Integrate with database user storage
5. Remove mock user initialization code

## Testing Scenarios

### Authentication Flow Testing
- Test login with different user roles
- Verify session persistence and "Remember Me" functionality
- Test password validation and error handling
- Verify logout and session cleanup

### Profile Management Testing
- Test profile editing with different user types
- Verify social links management
- Test error handling and validation
- Check real-time UI updates after profile changes

### Role-Based Access Testing
- Test different user roles accessing various features
- Verify route protection with different authentication states
- Test middleware integration with mock users
- Check cross-tab session synchronization

## API Reference

### Getting Mock Credentials Programmatically
```typescript
import { AuthService } from '@/services/auth';

// Get all mock user credentials
const mockCredentials = AuthService.getMockUserCredentials();

// Returns array of:
// { email: string, password: string, role: string }
```

### Manual User Creation
Mock users are automatically created, but the initialization can be triggered manually:
```typescript
// This is called automatically during login
await AuthService.initializeMockUsers();
```

## Troubleshooting

### Common Issues
1. **Users not appearing**: Clear localStorage and attempt login again
2. **Credentials not working**: Ensure you're using the exact email and password combinations
3. **Helper not visible**: Check that you're in development mode (NODE_ENV !== 'production')
4. **Session issues**: Clear browser cookies and localStorage, then try again

### Reset Mock Data
To reset all mock users and start fresh:
1. Open browser developer tools
2. Go to Application/Storage tab
3. Clear localStorage for the domain
4. Refresh the page and attempt login to recreate mock users

This mock authentication system provides a complete, secure, and user-friendly way to test and demonstrate the MiniSeller platform's authentication features without requiring external dependencies.
