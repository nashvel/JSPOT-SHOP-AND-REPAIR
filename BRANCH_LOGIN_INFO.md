# Branch Login Information

## ✅ FIXED: Branch Accounts Can Now Login

All branches now have user accounts that can log in to the system. Each branch sees only their own data.

### Login Credentials

**Main Branch (Makati)**
- Email: `makati@jspot.com`
- Password: `password`
- Role: Branch Manager

**Downtown Branch (Manila)**
- Email: `manila@jspot.com`
- Password: `password`
- Role: Branch Manager

**Uptown Branch (QC)**
- Email: `qc@jspot.com`
- Password: `password`
- Role: Branch Manager

## ✅ Data Isolation Implemented

Each branch account will only see:
- ✅ **Products**: Only products assigned to their branch (+ all services)
- ✅ **Sales**: Only sales from their branch
- ✅ **Mechanics**: Only mechanics assigned to their branch (5 per branch)
- ✅ **Job Orders**: Only job orders from their branch
- ✅ **Inventory**: Only stock levels for their branch

When a branch creates:
- **New Products/Services**: Automatically assigned to their branch only (system admin assigns to all branches)
- **New Mechanics**: Automatically assigned to their branch
- **New Sales**: Automatically recorded under their branch
- **New Job Orders**: Automatically linked to their branch

## System Admin Accounts

System admins (users without a branch_id) can see ALL data across all branches:

- **System Admin**: admin@example.com / password
- **Branch Manager** (no branch): manager@example.com / password
- **Cashier Staff** (no branch): cashier@example.com / password
- **Head Mechanic** (no branch): mechanic@example.com / password

## Creating New Branches

When you create a new branch through the admin panel:
1. A branch record is created in the `branches` table
2. A user account is automatically created with the same email/password
3. The user is assigned the "manager" role
4. The branch can immediately log in and start using the system
5. All their data will be isolated to their branch
6. New products created by the branch are only assigned to that branch

## Current Database State

- **Branches**: 3 (Makati, Manila, QC)
- **Users**: 7 (4 system admins + 3 branch accounts)
- **Mechanics**: 15 (5 per branch)
- **Products**: 7 (shared across branches, but stock is per-branch)
- **Services**: 6 (available to all branches)
- **Sales**: 50 sample sales distributed across branches

## Testing

You can now:
1. Log in as any branch account (e.g., makati@jspot.com / password)
2. Create products/services - they will be assigned to your branch only
3. Create mechanics - they will be assigned to your branch only
4. Make sales - they will be recorded under your branch only
5. View sales records - you'll only see your branch's sales
6. View mechanics - you'll only see your branch's mechanics

System admins can still see everything across all branches.
