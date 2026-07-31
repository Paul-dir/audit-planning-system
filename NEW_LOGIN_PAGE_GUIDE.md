# New MOR Login Page - Complete Guide

## Overview
A modern, professional login page specifically designed for the MOR Identity API integration. Clean, responsive, and enterprise-grade.

## Features

### 🎨 Design
- **Modern & Minimalist** - Clean interface with professional branding
- **Two-Column Layout** - Left panel with features, right panel with login form
- **Responsive** - Mobile-friendly with adaptive design
- **Dark Theme** - Enterprise-grade dark UI matching audit system branding
- **Smooth Animations** - Subtle transitions and hover effects

### 🔐 Security Features
- Email + Password authentication
- Show/Hide password toggle
- Remember me functionality (saves email)
- SSL/HTTPS ready
- MOR Identity API integration badge
- Session security information

### 📱 User Experience
- Auto-focus on email field
- Enter key support (press Enter to login)
- Real-time error validation
- Loading state with spinner
- Clear error messages
- Forgot password link
- Support contact link

### ✨ Brand Integration
- Ministry of Revenue branding
- Audit Planning System logo
- Feature highlights on left panel
- Professional color scheme (green accent #4caf50)

## Component Structure

```
MORLoginPage.jsx
├── Left Panel (Desktop only)
│   ├── Logo & Branding
│   ├── Features List (4 items)
│   └── Security Footer
└── Right Panel
    ├── Header
    ├── Login Form
    │   ├── Email Input
    │   ├── Password Input
    │   ├── Remember Me
    │   ├── Error Message
    │   └── Sign In Button
    ├── Divider
    ├── Footer Links
    │   ├── Forgot Password
    │   └── Support Contact
    └── Security Badge
```

## How to Use

### 1. **Default - MOR Identity API Mode** (Production)
```bash
# .env
VITE_USE_MOR_IDENTITY=true
VITE_MOR_IDENTITY_URL=https://mor-org-forge.lovable.app/api/public/v1

npm run dev

# Users see: Email + Password login form
# Users must have MOR credentials
```

### 2. **For Development/Testing** (Optional)
```bash
# .env
VITE_USE_MOR_IDENTITY=false

npm run dev

# Users see: Alternative user selection UI from original LoginForm.jsx
# Can use mock users from local data
```

## Integration with App.jsx

The new login page is automatically used when users are not authenticated:

```javascript
// In AppContent component:
return (
  <RegionalProvider userRole={currentRole}>
    {isAuthenticated ? renderRoleView() : <MORLoginPage />}
  </RegionalProvider>
);
```

## Styling Details

### Color Scheme
- **Primary Green**: `#4caf50` - Action buttons, accents
- **Dark Background**: `#0a1428` - Main background
- **Secondary Dark**: `#1c2128` - Card backgrounds
- **Text**: `#f0f6fc` - Light text on dark
- **Muted Text**: `#8b949e` - Secondary information
- **Error Red**: `#ff7b7b` - Error messages

### Responsive Breakpoints
- **Desktop**: Full two-column layout
- **Tablet**: Right panel only
- **Mobile**: Single column, full width

### Typography
- **Headings**: Font weight 700, letter-spacing -0.5px
- **Labels**: Font weight 600, uppercase, 0.5px letter-spacing
- **Body**: Regular weight, 14px base size

## Features Displayed (Left Panel)

1. **🛡️ Secure Authentication**
   - Enterprise-grade security with MOR Identity API

2. **⚡ Fast & Efficient**
   - Streamlined audit planning and case management

3. **🔗 Integrated**
   - Seamless integration with your organization

4. **📊 Analytics**
   - Real-time audit metrics and reporting

## Form Fields

### Email Input
- Type: email
- Placeholder: "you@mor.gov.et"
- Icon: envelope
- Validation: Required, valid email format
- Auto-focus on page load

### Password Input
- Type: password (toggleable to text)
- Placeholder: "Your password"
- Icon: lock
- Show/Hide toggle button
- Validation: Required, non-empty

### Remember Me
- Checkbox to save email
- Stored in: `localStorage['mor_remembered_email']`
- Persists across sessions

## Error Handling

### Error Display
```javascript
{(authError || error) && (
  <div>
    {/* Red background box with error icon and message */}
    {errorMessage}
  </div>
)}
```

### Common Errors
- "Please enter your email address" - Email is empty
- "Please enter your password" - Password is empty
- Authentication API errors - Display from AuthContext
- Network errors - Display connection issues

## Button States

### Enabled (Active)
- Green gradient background
- Blue shadow effect
- Cursor: pointer
- Hover: lifts up slightly

### Disabled
- Gray background (#555)
- No shadow
- Cursor: not-allowed
- Opacity: 0.6

### Loading
- Shows spinner icon
- Button text: "Signing In..."
- Disabled state
- Spinner animation

## Keyboard Support

### Enter Key
- Submits form when pressed in any input field
- Only works if email and password are filled

### Tab Navigation
- Full keyboard navigation support
- Logical tab order through form elements
- Focus indicators visible

## Security Features

### Data Protection
- Passwords stored only in memory during login
- Email optionally saved to localStorage
- No sensitive data in URL
- HTTPS/SSL ready

### Session Management
- Auto-logout on token expiration
- Secure token refresh (30 min interval)
- Clear logout on error

### MOR Integration
- Validates credentials against MOR Identity API
- Receives org context from backend
- Automatic role-based access control

## Testing Checklist

- [ ] Email validation works
- [ ] Password toggle shows/hides password
- [ ] Remember me saves email to localStorage
- [ ] Form clears errors when user types
- [ ] Enter key submits form
- [ ] Error messages display correctly
- [ ] Loading spinner shows during authentication
- [ ] Responsive design works on mobile
- [ ] Links (Forgot password, Support) functional
- [ ] Left panel hidden on mobile
- [ ] Tab navigation works correctly

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Accessibility

### WCAG 2.1 Level AA
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Error messages associated with inputs
- [ ] Icon labels provided
- [ ] Form labels properly associated

### Screen Reader Support
- Form labels accessible
- Error messages announced
- Button states clear
- Loading state communicated

## Future Enhancements

1. **Two-Factor Authentication**
   - Add 2FA support after password verification

2. **Social Login**
   - SSO integration options

3. **Biometric Authentication**
   - Fingerprint/Face ID support

4. **Password Reset**
   - Self-service password recovery

5. **Account Lockout**
   - Rate limiting after failed attempts

6. **Audit Logging**
   - Log all login attempts

## Troubleshooting

### Issue: Always shows in API mode
**Solution**: Check `VITE_USE_MOR_IDENTITY=true` in .env and restart dev server

### Issue: Cannot see left panel on desktop
**Solution**: Ensure window width > 768px and browser supports flex layout

### Issue: Email not being remembered
**Solution**: Check browser localStorage is enabled and not in private mode

### Issue: Enter key not submitting
**Solution**: Ensure both email and password fields are filled before pressing Enter

---

**Component**: `src/components/MORLoginPage.jsx`
**Status**: ✅ Production Ready
**Last Updated**: July 31, 2026
