# Super Admin Feature

## Overview
The Super Admin feature provides the highest level of access in the system, allowing designated users to create and manage System Admin accounts. The Super Admin Panel is **hardcoded in the sidebar** and only visible to users with the "Super Admin" role.

## Super Admin Accounts

Two super admin accounts have been created:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Nashvel | nashvel@jspot.com | password | Super Admin |
| Brandon | brandon@jspot.com | password | Super Admin |

## Implementation

### Role-Based Access
- Super Admin is a **role** stored in the `users.role` field (not a boolean flag)
- Value: `"Super Admin"` (exact match required)
- Super Admin Panel is **hardcoded in AuthenticatedLayout.tsx**, not stored in menus table

### Hardcoded Sidebar Menu
The Super Admin Panel appears automatically in the sidebar for users with role = "Super Admin":
- **Location**: `resources/js/Layouts/AuthenticatedLayout.tsx`
- **Group**: ADMINISTRATION
- **Icon**: Shield
- **Route**: `/admin/super-admin`
- **Visibility**: Only when `user.role === 'Super Admin'`

## Features

### Super Admin Panel
- **Route**: `/admin/super-admin`
- **Access**: Only users with role "Super Admin"

### Capabilities

1. **Create System Admin Accounts**
   - Create new system administrators with selectable roles:
     - Admin
     - Sub Admin  
     - Cashier
   - All created admins automatically get 13 menus assigned
   - System admins can manage all branches and operations

2. **Manage Roles**
   - Direct link to the existing roles management page
   - Create and manage roles for branch users

3. **View System Administrators**
   - List all system admin accounts (excludes super admins)
   - See role, menu count, and creation date for each admin
   - View creation dates

4. **Edit System Admins**
   - Update admin name, email, and role
   - Change passwords (optional)
   - Cannot modify super admin accounts

5. **Delete System Admins**
   - Remove system admin accounts
   - Cannot delete super admin accounts
   - Cannot delete your own account

## Access Control

### Super Admin Restrictions
- Only users with `role = 'Super Admin'` can access the Super Admin Panel
- Super admin accounts cannot be modified or deleted through the panel
- Super admins have access to all 13 menus + hardcoded Super Admin Panel

### System Admin vs Super Admin

| Feature | System Admin | Super Admin |
|---------|-------------|-------------|
| Manage Branches | ✓ | ✓ |
| Access POS | ✓ | ✓ |
| View Analytics | ✓ | ✓ |
| Manage Users | ✓ | ✓ |
| Create System Admins | ✗ | ✓ |
| Access Super Admin Panel | ✗ | ✓ (hardcoded) |
| Total Menus | 13 | 13 + 1 hardcoded |

## Database Structure

### Users Table
- `role` (string): User role including "Super Admin"
- `branch_id` (nullable): Super admins have `null` branch_id

### Menus
Total of **13 menus** in database:
1. Overview (Dashboard)
2. Point of Sale
3. Job Orders
4. Sales Record
5. Return Approval
6. Products & Services
7. Inventory Management
8. Branch Locations
9. Branch Accounts
10. Mechanics
11. Users
12. Settings
13. Analytics & Reports

**Note**: Super Admin Panel is NOT in the menus table - it's hardcoded in the sidebar component.

## Implementation Details

### No Migration for Super Admin Panel
- Super Admin Panel is hardcoded, not stored in database
- Only the 13 operational menus are in the menus table
- This keeps the Super Admin Panel always available and not editable

### Seeder
- `SuperAdminSeeder.php` - Creates the two super admin accounts with role "Super Admin"
- Assigns all 13 menus to super admins

### Controller
- `SuperAdminController.php` - Handles CRUD operations for system admins
- All methods check `auth()->user()->role === 'Super Admin'` for authorization
- Validates role field when creating/updating admins

### Frontend
- `resources/js/Pages/Admin/SuperAdmin/Index.tsx` - Super Admin Panel UI
- Features hardcoded module cards for "Create Accounts" and "Create Role"
- Lists all system administrators with edit/delete actions
- Modal for creating/editing system admins with role dropdown
- `resources/js/Layouts/AuthenticatedLayout.tsx` - Hardcoded Super Admin Panel menu item

## Available Roles for System Admins

When creating system admins, you can assign these roles:
- **Admin** - Full system administrator
- **Sub Admin** - Secondary administrator
- **Cashier** - Cashier role

## Testing

To test the super admin functionality:

1. Login with super admin credentials:
   - Email: `nashvel@jspot.com` or `brandon@jspot.com`
   - Password: `password`

2. Check sidebar - you should see "ADMINISTRATION" group with "Super Admin Panel"

3. Navigate to the Super Admin Panel

4. Test creating a new system admin:
   - Click "Create New Admin" button
   - Fill in name, email, password, and select role
   - Submit the form
   - Verify the new admin appears in the list with 13 menus

5. Test editing a system admin:
   - Click the edit icon on any system admin
   - Update the information and role
   - Submit and verify changes

6. Test deleting a system admin:
   - Click the delete icon on any system admin
   - Confirm the deletion
   - Verify the admin is removed

## Security Notes

- Super admin accounts are protected from modification/deletion
- Only super admins can access the Super Admin Panel (403 error for others)
- Password changes are optional when editing (leave blank to keep current)
- All operations use SweetAlert2 for user-friendly confirmations
- Menu assignments are automatic for new system admins
- Super Admin Panel cannot be removed from sidebar (hardcoded)

## Key Differences from Previous Implementation

1. **Role-based instead of boolean flag**: Uses `role = 'Super Admin'` instead of `is_super_admin = true`
2. **Hardcoded sidebar menu**: Super Admin Panel is in the layout component, not in menus table
3. **Always visible**: Cannot be hidden or removed through database changes
4. **13 menus in database**: Super Admin Panel doesn't count toward menu total
5. **Role dropdown**: System admins can be assigned different roles (Admin, Sub Admin, Cashier)
