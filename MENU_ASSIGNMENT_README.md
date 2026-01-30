# Menu Assignment Script

## Overview
This script assigns appropriate menus to all users in the JSPOT system based on their role.

## Usage

```bash
php assign_all_menus.php
```

## What It Does

### System Admin Users (users without branch_id)
Receives **ALL 13 menus**:
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

### Branch Users (users with branch_id)
Receives **8 operational menus**:
1. Overview (Dashboard)
2. Point of Sale
3. Job Orders
4. Sales Record
5. Return Approval
6. Products & Services
7. Inventory Management
8. Mechanics

**Excluded from Branch Users:**
- Branch Locations (Admin only)
- Branch Accounts (Admin only)
- Users (Admin only)
- Settings (Admin only)
- Analytics & Reports (Admin only)

## When to Run

Run this script:
- After creating new users
- After adding new menus to the system
- When menu assignments get out of sync
- After running `php artisan migrate:fresh --seed`

## Output

The script provides:
- Step-by-step progress
- User-by-user assignment confirmation
- Summary statistics
- Complete menu list

## Example Output

```
╔════════════════════════════════════════════════╗
║     JSPOT Menu Assignment Script              ║
╚════════════════════════════════════════════════╝

📋 Step 1: Loading menus...
✓ Found 13 menus

👑 Step 2: Assigning menus to System Admin users...
  ✓ System Admin (admin@example.com) - 13 menus

🏢 Step 3: Assigning menus to Branch users...
  ✓ Main Branch (Makati) - Main Branch (Makati) - 8 menus

╔════════════════════════════════════════════════╗
║              ASSIGNMENT SUMMARY                ║
╠════════════════════════════════════════════════╣
║ Total Menus:        13                       ║
║ System Admin Users: 4                        ║
║ Branch Users:       3                        ║
╚════════════════════════════════════════════════╝

✅ SUCCESS! All menus have been assigned.
```

## Notes

- The script uses `sync()` which replaces all existing menu assignments
- Safe to run multiple times
- No data loss - only updates menu assignments
- Automatically detects user types based on `branch_id` field
