# Kuddl Partner Portal - Complete Documentation

## Quick Links
- [Architecture Overview](#architecture-overview)
- [Partner Signup Flow](#partner-signup-flow)
- [Profile Completion](#profile-completion)
- [Dashboard Features](#dashboard-features)
- [API Documentation](#api-documentation)

## Architecture Overview

### Tech Stack
- React 18 + TypeScript
- Vite (Build tool)
- React Router v6
- Tailwind CSS
- Axios
- Context API

### Project Structure
```
src/
├── api/client.ts           # Axios config
├── components/
│   ├── auth/              # Login, signup
│   ├── modals/            # Profile modal
│   ├── layout/            # Dashboard layout
│   └── ...
├── pages/                 # Route pages
├── contexts/              # Auth context
└── config/api.ts          # API endpoints
```

## Partner Signup Flow

### 1. Landing Page → Login
- User clicks "Become a Partner"
- Redirects to `/login`

### 2. Signup Form
**Fields:**
- Full Name (required, min 3 chars)
- Email (required, unique check)
- Phone (required, 10 digits, +91 auto-added)
- Password (required, min 8 chars, 1 uppercase, 1 number)
- Confirm Password (must match)

**API:** `POST /api/auth/register`

**On Success:**
- Tokens stored in localStorage
- Redirect to dashboard
- Profile modal opens

### 3. Profile Completion (5 Steps)

#### Step 1: Personal Info
- Profile photo (required, max 5MB)
- Date of birth (18-70 years)
- Gender (male/female/other)
- Pincode (6 digits, auto-fills city/state)
- Address (optional)

#### Step 2: Services
- Primary categories (min 1)
- Specific services (min 1)
- Age groups (min 1)
- Experience (dropdown)
- Description (50-500 chars)
- Languages (min 1)

#### Step 3: Documents
- PAN Card (upload + OCR)
- Aadhaar Card (upload + OCR)
- Auto-extract data

#### Step 4: Face Verification
- Blink detection
- Liveness check
- Face match with documents

#### Step 5: Banking
- Account holder name
- Bank name
- Account number (9-18 digits)
- IFSC code (11 chars)
- Account type (savings/current)
- UPI ID (optional)

**API:** `POST /api/partner/complete-profile`

## Dashboard Features

### 1. Dashboard Home
**Metrics:**
- Total bookings
- Active bookings
- Total earnings
- Average rating

**Widgets:**
- Recent bookings table
- Earnings chart
- Quick actions

### 2. Bookings (`/bookings`)
**Features:**
- Filter by status
- Search by customer
- Accept/reject bookings
- Start/complete service

**Actions:**
- Pending → Accept/Reject
- Confirmed → Start/Cancel
- In Progress → Complete
- Completed → View details

### 3. Earnings (`/earnings`)
**Features:**
- Total earnings overview
- Payment history
- Withdrawal requests (min ₹500)
- Export to CSV/PDF

### 4. Reviews (`/reviews`)
**Features:**
- Rating summary
- Review list with photos
- Reply to reviews (max 500 chars)

### 5. Services (`/services`)
**Features:**
- Service list
- Toggle active/inactive
- Edit pricing
- Set availability

### 6. Profile (`/profile`)
**Tabs:**
1. Personal Info (edit profile)
2. Services (manage services)
3. Documents (view/reupload)
4. Banking (edit bank details)
5. Settings (notifications, password)

## API Documentation

### Base URL
- Development: `https://api.kuddlkin.co`
- Production: `https://api.kuddlkin.co`

### Authentication
All protected routes require:
```
Headers: {
  Authorization: 'Bearer {token}'
}
```

### Key Endpoints

#### Auth
- `POST /api/auth/register` - Signup
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/check-email` - Check email exists
- `GET /api/check-phone` - Check phone exists

#### Partner
- `POST /api/partner/complete-profile` - Complete profile
- `GET /api/partner/profile` - Get profile
- `PUT /api/partner/profile` - Update profile
- `GET /api/partner/services` - Get services
- `PUT /api/partner/services/{id}` - Update service

#### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings/{id}/accept` - Accept booking
- `POST /api/bookings/{id}/reject` - Reject booking
- `POST /api/bookings/{id}/start` - Start service
- `POST /api/bookings/{id}/complete` - Complete service

#### Earnings
- `GET /api/earnings` - Get earnings
- `POST /api/earnings/withdraw` - Request withdrawal
- `GET /api/earnings/payments` - Payment history

#### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews/{id}/reply` - Reply to review

#### Upload
- `POST /api/upload` - Upload file (images/documents)
- `POST /api/documents/upload` - Upload with OCR

## Field Validation Rules

### Email
- Format: `user@domain.com`
- Unique check via API
- Real-time validation

### Phone
- Format: 10 digits (6-9 start)
- Auto-prefix: +91
- Unique check via API

### Password
- Min 8 characters
- 1 uppercase letter
- 1 number
- 1 special char (recommended)

### Pincode
- Exactly 6 digits
- API call to fetch city/state
- Serviceable area check

### Account Number
- 9-18 digits
- Numeric only
- Confirmation required

### IFSC Code
- 11 characters
- Format: ABCD0123456
- Auto-uppercase

### UPI ID
- Format: name@bank
- Optional field

## State Management

### AuthContext
```typescript
{
  isAuthenticated: boolean,
  user: {
    id: string,
    email: string,
    phone: string,
    role: 'partner' | 'admin',
    profileComplete: boolean
  },
  login: (credentials) => Promise<void>,
  logout: () => void,
  updateUser: (data) => void
}
```

### Local Storage
- `token` - JWT access token
- `refreshToken` - Refresh token
- `user` - User object

## Environment Variables

### `.env.development`
```
VITE_API_URL=https://api.kuddlkin.co
VITE_R2_PUBLIC_URL=https://...r2.dev
VITE_ENVIRONMENT=development
```

### `.env.production`
```
VITE_API_URL=https://api.kuddlkin.co
VITE_R2_PUBLIC_URL=https://...r2.dev
VITE_ENVIRONMENT=production
```

## Development Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Key Features

### 1. Auto-save Profile Progress
- Profile completion saves after each step
- Can resume later
- Data persisted in backend

### 2. Real-time Validation
- Email/phone uniqueness check
- Pincode verification
- Document OCR extraction

### 3. Secure Authentication
- JWT tokens
- Refresh token rotation
- Auto-logout on token expiry

### 4. File Upload
- Images to R2 storage
- Max 5MB per file
- Supported: JPG, PNG, PDF

### 5. Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Works on all devices

## Security Features

### 1. Password Security
- Bcrypt hashing (backend)
- Min 8 characters
- Complexity requirements

### 2. Document Verification
- OCR data extraction
- Face liveness detection
- Document-face matching

### 3. Banking Security
- Account number masking
- OTP for changes
- Password confirmation required

### 4. API Security
- JWT authentication
- CORS enabled
- Rate limiting (backend)

## Error Handling

### Network Errors
- Retry mechanism
- Timeout handling
- User-friendly messages

### Validation Errors
- Real-time field validation
- Clear error messages
- Prevent form submission

### API Errors
- 401: Auto-logout
- 403: Permission denied
- 404: Not found
- 500: Server error

## Performance Optimizations

### 1. Code Splitting
- Route-based splitting
- Lazy loading components
- Reduced bundle size

### 2. Image Optimization
- Compress before upload
- Lazy loading images
- WebP format support

### 3. Caching
- API response caching
- LocalStorage for user data
- Service worker (future)

## Testing

### Manual Testing Checklist
- [ ] Signup flow
- [ ] Login flow
- [ ] Profile completion
- [ ] Document upload
- [ ] Booking management
- [ ] Earnings tracking
- [ ] Profile editing

## Deployment

### Build Command
```bash
npm run build
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Environment Setup
1. Set environment variables in Netlify
2. Configure build settings
3. Deploy from Git

## Support & Maintenance

### Common Issues

**1. Profile Modal Not Opening**
- Check `user.profileComplete` flag
- Verify AuthContext state
- Check console for errors

**2. File Upload Failing**
- Check file size (max 5MB)
- Verify file format
- Check network connection

**3. API Errors**
- Verify token in localStorage
- Check API URL in .env
- Verify backend is running

### Contact
For issues or questions:
- Email: connect@tendernest.world
- GitHub: [Repository Issues]

---

**Last Updated:** November 18, 2025
**Version:** 2.0.0
# Trigger deployment
