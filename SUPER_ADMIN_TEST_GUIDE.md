# Super Admin Testing Guide

## Quick Start

### 1. Login as Super Admin
Navigate to your application login page and use these credentials:

**Option 1:**
- Email: `nashvel@jspot.com`
- Password: `password`

**Option 2:**
- Email: `brandon@jspot.com`
- Password: `password`

### 2. Access Super Admin Panel
After logging in, you should see "Super Admin Panel" in your sidebar navigation with a Shield icon under the "Administration" group.

Click on it to access the panel at: `/admin/super-admin`

## Test Scenarios

### Test 1: View Super Admin Panel
**Expected Result:**
- See two hardcoded module cards:
  - "Create Accounts" (Indigo color)
  - "Create Role" (Purple color)
- See a list of system administrators (if any exist)
- Each admin shows: Name, Email, Module count, Created date, Edit/Delete actions

### Test 2: Create a New System Admin
1. Click the "Create New Admin" button in the "Create Accounts" card
2. Fill in the form:
   - Name: `Test Admin`
   - Email: `testadmin@jspot.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create"

**Expected Result:**
- Success notification appears
- New admin appears in the list
- Admin shows "13 modules" badge
- Modal closes automatically

### Test 3: Edit a System Admin
1. Click the Edit icon (pencil) on any system admin in the list
2. Update the name to: `Test Admin Updated`
3. Leave password fields blank (to keep current password)
4. Click "Update"

**Expected Result:**
- Success notification appears
- Admin name updates in the list
- Modal closes automatically

### Test 4: Delete a System Admin
1. Click the Delete icon (trash) on any system admin
2. Confirm the deletion in the SweetAlert dialog

**Expected Result:**
- Confirmation dialog appears
- After confirming, success notification shows
- Admin is removed from the list

### Test 5: Access Create Role
1. Click the "Manage Roles" button in the "Create Role" card

**Expected Result:**
- Redirects to the existing roles management page at `/admin/roles`

### Test 6: Verify Menu Access
Check your sidebar navigation. You should see all 14 menus:

**Essentials:**
- Overview

**Operations:**
- Point of Sale
- Job Orders
- Sales Record
- Return Approval

**Inventory:**
- Products & Services
- Inventory Management

**Management:**
- Branch Locations
- Branch Accounts
- Mechanics
- Users
- Settings

**Analytics:**
- Analytics & Reports

**Administration:**
- Super Admin Panel ← Only visible to super admins

### Test 7: Security Check - Try to Access as Regular User
1. Logout from super admin account
2. Login as a regular system admin or branch user
3. Try to access `/admin/super-admin` directly

**Expected Result:**
- 403 Forbidden error
- "Unauthorized. Only Super Admins can access this page."

### Test 8: Verify Auto-Menu Assignment
1. Create a new system admin (as in Test 2)
2. Logout and login with the new admin credentials
3. Check the sidebar navigation

**Expected Result:**
- New admin should see 13 menus (all except Super Admin Panel)
- Should have access to all operational features

## Verification Checklist

- [ ] Super Admin Panel appears in sidebar for super admins only
- [ ] Can create new system admin accounts
- [ ] New admins automatically get 13 menus assigned
- [ ] Can edit existing system admin accounts
- [ ] Can delete system admin accounts
- [ ] Cannot delete super admin accounts (nashvel/brandon)
- [ ] Cannot delete your own account
- [ ] Password change is optional when editing
- [ ] Create Role button links to roles page
- [ ] Regular users cannot access Super Admin Panel
- [ ] All notifications work correctly (SweetAlert2)
- [ ] Modal opens/closes properly
- [ ] Form validation works

## Common Issues

### Issue: Super Admin Panel not showing in sidebar
**Solution:** 
- Verify you're logged in as nashvel@jspot.com or brandon@jspot.com
- Run: `php artisan cache:clear`
- Check database: `SELECT * FROM users WHERE is_super_admin = 1`

### Issue: 403 Error when accessing panel
**Solution:**
- Verify the logged-in user has `is_super_admin = true`
- Check the database directly

### Issue: New admin doesn't have menus
**Solution:**
- Check the SuperAdminController store method
- Verify menu assignment code is executing
- Run: `php artisan tinker` and check: `User::find(ID)->menus()->count()`

### Issue: Cannot delete system admin
**Solution:**
- Verify you're not trying to delete a super admin
- Verify you're not trying to delete yourself
- Check browser console for errors

## Database Verification

Run these commands to verify the setup:

```bash
# Check super admin accounts
php artisan tinker --execute="echo User::where('is_super_admin', true)->count();"

# Check Super Admin menu exists
php artisan tinker --execute="echo Menu::where('route', 'admin.super-admin.index')->count();"

# Check total menus
php artisan tinker --execute="echo Menu::count();"
```

Expected results:
- Super admins: 2
- Super Admin menu: 1
- Total menus: 14

## Success Criteria

The Super Admin feature is working correctly if:
1. ✓ Both super admin accounts can login
2. ✓ Super Admin Panel is visible and accessible
3. ✓ Can create new system admin accounts
4. ✓ New admins get 13 menus automatically
5. ✓ Can edit and delete system admins
6. ✓ Super admin accounts are protected
7. ✓ Regular users cannot access the panel
8. ✓ All UI elements work smoothly
9. ✓ Notifications appear correctly
10. ✓ No console errors or warnings
