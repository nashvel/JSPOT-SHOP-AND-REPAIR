# Offline-First POS Architecture

This document explains how the offline/online data synchronization works in this POS system.

## Overview

The system uses a **local-first** approach where all data is stored locally in the browser using **IndexedDB**, then synced to **Supabase** (cloud database) when online.

## Tech Stack

- **IndexedDB** (via Dexie.js) - Local browser database
- **Supabase** - Cloud PostgreSQL database
- **React** - UI framework
- **Vite** - Build tool with PWA plugin

## Architecture Components

### 1. Local Database (IndexedDB)

**File:** `src/lib/db.ts`

Uses Dexie.js wrapper for IndexedDB with these tables:
- `categories` - Product categories
- `products` - Product inventory
- `transactions` - Sales transactions
- `roles` - User roles/permissions
- `users` - User accounts

Each record has a `synced: boolean` flag to track sync status.

```typescript
export interface OfflineTransaction {
  id: string
  items: Array<{...}>
  total: number
  paymentMethod: 'cash' | 'gcash'
  status: 'completed' | 'refunded'
  createdAt: Date
  synced: boolean  // ← Tracks if synced to cloud
}
```

### 2. Cloud Database (Supabase)

**File:** `supabase/schema.sql`

PostgreSQL tables with same structure as local DB:
- Uses TEXT ids (not UUID) to match local IDs
- All tables have RLS (Row Level Security) enabled
- Public access policies for demo (should be restricted in production)

### 3. Sync Logic

**File:** `src/lib/sync.ts`

Two main functions:

#### A. Push to Cloud (`syncToSupabase`)

Sends unsynced local data to Supabase:

```typescript
export async function syncToSupabase() {
  // 1. Check if online
  if (!navigator.onLine) return { success: false }
  
  // 2. Get unsynced items
  const unsyncedProducts = await db.products.filter(p => !p.synced).toArray()
  
  // 3. Send to Supabase
  const { error } = await supabase.from('products').upsert(unsyncedProducts)
  
  // 4. Mark as synced only if successful
  if (!error) {
    await Promise.all(unsyncedProducts.map(p => 
      db.products.update(p.id, { synced: true })
    ))
  }
}
```

#### B. Fetch from Cloud (`fetchFromSupabase`)

Downloads data from Supabase to local DB:

```typescript
export async function fetchFromSupabase() {
  // 1. Fetch from Supabase
  const { data: products } = await supabase.from('products').select('*')
  
  // 2. Add to local DB if not exists
  for (const p of products) {
    const existing = await db.products.get(p.id)
    if (!existing) {
      await db.products.add({...p, synced: true})
    }
  }
}
```

### 4. Auto-Sync Setup

**File:** `src/main.tsx` and `src/App.tsx`

```typescript
// Auto-sync when browser goes online
window.addEventListener('online', () => {
  syncToSupabase()
})

// Auto-sync every 5 minutes
setInterval(() => {
  if (navigator.onLine) {
    syncToSupabase()
  }
}, 5 * 60 * 1000)

// Sync on app startup
useEffect(() => {
  if (navigator.onLine) {
    syncToSupabase()  // Push local changes
    fetchFromSupabase()  // Pull cloud data
  }
}, [])
```

### 5. Transaction Flow

**File:** `src/components/Cart.tsx`

When a sale is completed:

```typescript
const handleConfirmPayment = async () => {
  // 1. Create transaction with synced: false
  const transaction = {
    id: crypto.randomUUID(),
    items: [...],
    total: total,
    synced: false  // ← Always false initially
  }
  
  // 2. Save to local DB
  await db.transactions.add(transaction)
  
  // 3. Deduct stock locally
  await db.products.update(productId, { 
    stock: newStock,
    synced: false  // ← Mark product as needing sync
  })
  
  // 4. Trigger sync if online
  if (navigator.onLine) {
    syncToSupabase()
  }
}
```

### 6. Online/Offline Indicator

**File:** `src/components/Layout.tsx`

Shows connection status in header:

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  window.addEventListener('online', () => setIsOnline(true))
  window.addEventListener('offline', () => setIsOnline(false))
}, [])

// Display
{isOnline ? <Wifi /> : <WifiOff />}
```

### 7. Manual Sync Buttons

**File:** `src/pages/Settings.tsx`

Two-way sync controls:

```typescript
// Push to Cloud
<button onClick={syncToSupabase}>Push to Cloud</button>

// Fetch from Cloud
<button onClick={fetchFromSupabase}>Fetch from Cloud</button>
```

## Data Flow Diagram

```
┌─────────────────┐
│   User Action   │
│  (Make Sale)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Local DB      │
│  (IndexedDB)    │
│  synced: false  │
└────────┬────────┘
         │
         ▼
    Is Online?
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌────────┐  Wait
│ Sync   │  for
│ to     │  online
│ Cloud  │  event
└───┬────┘    │
    │         │
    ▼         │
┌────────┐    │
│ Mark   │◄───┘
│ synced │
│ = true │
└────────┘
```

## Key Features

### ✅ Works Offline
- All operations (sales, inventory) work without internet
- Data stored locally in browser
- No data loss

### ✅ Auto-Sync
- Syncs when connection restored
- Syncs every 5 minutes when online
- Syncs after each transaction (if online)

### ✅ Multi-Device Sync
- Push local changes to cloud
- Fetch changes from other devices
- Stock updates sync across devices

### ✅ Conflict Resolution
- Cloud stock is source of truth
- Last write wins for transactions
- No duplicate transactions (UUID ids)

## Environment Variables

**File:** `.env`

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These must be set in Cloudflare Pages environment variables for production.

## Installation Steps for New Project

1. **Install Dependencies**
```bash
npm install dexie dexie-react-hooks @supabase/supabase-js
```

2. **Copy Files**
- `src/lib/db.ts` - Database schema
- `src/lib/sync.ts` - Sync logic
- `src/lib/supabase.ts` - Supabase client

3. **Setup Supabase**
- Create project at supabase.com
- Run `supabase/schema.sql` in SQL Editor
- Copy URL and anon key to `.env`

4. **Initialize in App**
```typescript
import { seedDatabase } from './lib/seed'
import { setupAutoSync } from './lib/sync'

useEffect(() => {
  seedDatabase()  // Create default data
  setupAutoSync()  // Enable auto-sync
}, [])
```

5. **Add Sync Buttons**
```typescript
import { syncToSupabase, fetchFromSupabase } from './lib/sync'

<button onClick={syncToSupabase}>Push to Cloud</button>
<button onClick={fetchFromSupabase}>Fetch from Cloud</button>
```

## Testing Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Make a sale - it works!
5. Go back "Online"
6. Data syncs automatically

## Common Issues

### Issue: Transactions not syncing
**Cause:** `synced: true` set before actual sync
**Fix:** Only set `synced: true` after successful Supabase response

### Issue: Duplicate data on multiple devices
**Cause:** Same IDs generated on different devices
**Fix:** Use `crypto.randomUUID()` for unique IDs

### Issue: Stock conflicts
**Cause:** Multiple devices editing same product
**Fix:** Cloud stock is source of truth, fetch before editing

## Production Checklist

- [ ] Set Supabase environment variables in Cloudflare
- [ ] Enable RLS policies in Supabase (restrict public access)
- [ ] Add authentication (currently uses local auth)
- [ ] Add conflict resolution for concurrent edits
- [ ] Add sync error handling and retry logic
- [ ] Add data validation before sync
- [ ] Monitor sync failures in production

## 8. Local Backup System

**File:** `src/lib/backup.ts`

Provides multiple backup layers for data safety:

### A. Manual Backup (Primary)

Export all data to JSON file:

```typescript
export async function exportBackup() {
  // 1. Get all data from IndexedDB
  const [categories, products, transactions, roles, users] = await Promise.all([
    db.categories.toArray(),
    db.products.toArray(),
    db.transactions.toArray(),
    db.roles.toArray(),
    db.users.toArray(),
  ])

  // 2. Create backup object
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: { categories, products, transactions, roles, users }
  }

  // 3. Download as JSON file
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
}
```

### B. Manual Restore

Import data from JSON file:

```typescript
export async function importBackup(file: File) {
  // 1. Read and parse JSON
  const text = await file.text()
  const backup = JSON.parse(text)

  // 2. Validate structure
  if (!backup.version || !backup.data) {
    throw new Error('Invalid backup file')
  }

  // 3. Import data (merge, don't overwrite existing)
  for (const product of backup.data.products) {
    const existing = await db.products.get(product.id)
    if (!existing) {
      await db.products.add(product)
    }
  }
  // ... same for other tables
}
```

### C. Scheduled Auto-Download

Automatically download backup at scheduled time:

```typescript
// Settings stored in localStorage
interface BackupSettings {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string // e.g., "23:00"
  lastBackup: string // ISO timestamp
}

// Check every minute if backup is due
setInterval(() => {
  const settings = getBackupSettings()
  if (!settings.enabled) return

  const now = new Date()
  const [hour, minute] = settings.time.split(':')
  
  if (now.getHours() === parseInt(hour) && 
      now.getMinutes() === parseInt(minute) &&
      shouldBackupToday(settings)) {
    
    // Auto-download backup
    exportBackup()
    
    // Update last backup time
    updateLastBackupTime()
    
    // Show notification
    showNotification('Backup downloaded to your device')
  }
}, 60000) // Check every minute
```

### D. Emergency Auto-Backup (localStorage)

Daily backup to localStorage as fallback:

```typescript
export async function autoBackup() {
  // Save to localStorage (limited to ~5-10MB)
  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      categories: await db.categories.toArray(),
      products: await db.products.toArray(),
      transactions: await db.transactions.toArray()
    }
  }
  
  localStorage.setItem('pos-emergency-backup', JSON.stringify(backup))
}

// Run daily
setInterval(autoBackup, 24 * 60 * 60 * 1000)
```

### E. Restore Emergency Backup

```typescript
export async function restoreEmergencyBackup() {
  const backupStr = localStorage.getItem('pos-emergency-backup')
  if (!backupStr) throw new Error('No emergency backup found')
  
  const backup = JSON.parse(backupStr)
  
  // Restore data to IndexedDB
  for (const item of backup.data.products) {
    await db.products.put(item)
  }
  // ... restore other tables
}
```

## Backup Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              Backup System                      │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Manual     │ │Scheduled │ │  Emergency   │
│   Backup     │ │Auto-Down │ │  localStorage│
│              │ │  load    │ │   Backup     │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │               │
       ▼              ▼               ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ User clicks  │ │Daily at  │ │  Runs daily  │
│ "Export"     │ │11:00 PM  │ │ background   │
└──────┬───────┘ └────┬─────┘ └──────┬───────┘
       │              │               │
       ▼              ▼               ▼
┌──────────────────────────────────────────────┐
│     Downloads/pos-backup-2026-02-01.json     │
│              (Device Storage)                │
└──────────────────────────────────────────────┘
```

## Backup Settings UI

**File:** `src/pages/Settings.tsx`

```typescript
<div className="card p-5">
  <h2 className="font-medium mb-4">Backup & Restore</h2>
  
  {/* Manual Controls */}
  <div className="space-y-3 mb-6">
    <button onClick={exportBackup} className="btn-primary w-full">
      Export Backup Now
    </button>
    <button onClick={() => fileInput.click()} className="btn-secondary w-full">
      Import Backup
    </button>
    <input type="file" accept=".json" onChange={handleImport} hidden />
  </div>

  {/* Scheduled Backup */}
  <div className="border-t pt-4">
    <h3 className="font-medium mb-3">Scheduled Auto-Download</h3>
    <label className="flex items-center gap-2 mb-3">
      <input type="checkbox" checked={backupEnabled} onChange={toggleBackup} />
      Enable automatic backup downloads
    </label>
    
    {backupEnabled && (
      <>
        <select value={frequency} onChange={setFrequency} className="input mb-2">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        
        <input 
          type="time" 
          value={backupTime} 
          onChange={setBackupTime} 
          className="input mb-2"
        />
        
        <p className="text-sm text-[var(--text-muted)]">
          Last backup: {lastBackupDate || 'Never'}
        </p>
      </>
    )}
  </div>

  {/* Emergency Backup */}
  <div className="border-t pt-4 mt-4">
    <h3 className="font-medium mb-2">Emergency Backup</h3>
    <p className="text-sm text-[var(--text-muted)] mb-3">
      Last emergency backup: {emergencyBackupDate || 'Never'}
    </p>
    <button onClick={restoreEmergencyBackup} className="btn-secondary w-full">
      Restore Emergency Backup
    </button>
  </div>
</div>
```

## Backup File Format

```json
{
  "version": "1.0",
  "timestamp": "2026-02-01T23:00:00.000Z",
  "data": {
    "categories": [
      {
        "id": "cat-1",
        "name": "Beverages",
        "icon": "Coffee",
        "synced": true
      }
    ],
    "products": [
      {
        "id": "prod-1",
        "sku": "BEV001",
        "name": "Coffee",
        "price": 50,
        "stock": 100,
        "categoryId": "cat-1",
        "synced": true
      }
    ],
    "transactions": [
      {
        "id": "trans-123",
        "items": [...],
        "total": 150,
        "paymentMethod": "cash",
        "status": "completed",
        "createdAt": "2026-02-01T10:30:00.000Z",
        "synced": true
      }
    ],
    "roles": [...],
    "users": [...]
  }
}
```

## Backup Best Practices

### When to Backup

1. **Daily Auto-Download** (11:00 PM) - Scheduled backup
2. **Before Major Changes** - Manual backup before bulk edits
3. **Weekly Manual** - User-initiated full backup
4. **Before Updates** - Backup before app updates

### Where to Store Backups

1. **Device Storage** - Downloads folder (primary)
2. **Cloud Storage** - Google Drive, Dropbox (user uploads manually)
3. **USB Drive** - For physical backup
4. **Email** - Send backup file to yourself

### Backup Retention

- Keep last 7 daily backups
- Keep last 4 weekly backups
- Keep last 12 monthly backups
- User can delete old backups manually

## Data Safety Layers

```
Layer 1: IndexedDB (Browser Storage)
   ↓ Persists when phone off
   
Layer 2: Supabase Cloud (Online Sync)
   ↓ Syncs when online
   
Layer 3: localStorage Emergency Backup
   ↓ Daily auto-backup (5-10MB limit)
   
Layer 4: Scheduled JSON Downloads
   ↓ Daily/weekly downloads to device
   
Layer 5: Manual Backups
   ↓ User-controlled exports
```

## Summary

This architecture provides:
- **Offline-first**: Works without internet
- **Auto-sync**: Syncs when online
- **Multi-device**: Share data across devices
- **Multiple Backup Layers**: 5 layers of data protection
- **Scheduled Backups**: Automatic downloads at set times
- **Emergency Recovery**: localStorage fallback
- **User Control**: Manual export/import anytime
- **Simple**: Easy to understand and maintain
- **Scalable**: Can handle thousands of transactions

The key is the `synced` flag that tracks what needs to be uploaded to the cloud, plus multiple backup layers for maximum data safety!
