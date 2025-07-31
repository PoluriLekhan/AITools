# Admin Components

This directory contains reusable components for the admin dashboard.

## Components

### AdminLoading
A loading component with a rotating circle spinner for the admin dashboard.

**Props:**
- `message?: string` - Custom loading message (default: "Loading admin dashboard...")

### AdminAccessDenied
An access denied component for unauthorized users.

**Props:**
- `userEmail?: string | null` - The email of the logged-in user

### AdminHeader
A header component for the admin dashboard.

**Props:**
- `userEmail: string` - The email of the admin user

### AdminSection
A reusable section wrapper for admin dashboard sections.

**Props:**
- `title: string` - Section title
- `loading?: boolean` - Show loading state
- `children: React.ReactNode` - Section content
- `className?: string` - Additional CSS classes

### AdminTable
A reusable table component for displaying admin data.

**Props:**
- `headers: string[]` - Table headers
- `children: React.ReactNode` - Table rows
- `className?: string` - Additional CSS classes

### AdminButton
A reusable button component for admin actions.

**Props:**
- `onClick: () => void` - Click handler
- `variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'` - Button style
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `disabled?: boolean` - Disabled state
- `children: React.ReactNode` - Button content
- `className?: string` - Additional CSS classes

### AdminErrorBoundary
An error boundary component to handle errors gracefully.

**Props:**
- `children: React.ReactNode` - Wrapped components

## Usage

```tsx
import { 
  AdminLoading, 
  AdminAccessDenied, 
  AdminHeader, 
  AdminSection, 
  AdminTable, 
  AdminButton,
  AdminErrorBoundary 
} from '@/components/admin';

// Wrap your admin page with error boundary
<AdminErrorBoundary>
  <AdminHeader userEmail={user.email} />
  <AdminSection title="Users" loading={loading}>
    <AdminTable headers={["Name", "Email", "Actions"]}>
      {/* Table rows */}
    </AdminTable>
  </AdminSection>
</AdminErrorBoundary>
```

## Features

- **Lazy Loading**: All components are lazy-loaded for better performance
- **Error Handling**: Built-in error boundary for graceful error handling
- **Loading States**: Consistent loading indicators with rotating spinners
- **Responsive Design**: Mobile-friendly responsive layout
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Accessibility**: Proper ARIA labels and keyboard navigation support 