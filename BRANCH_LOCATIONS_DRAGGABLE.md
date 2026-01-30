# Branch Locations - Draggable Markers Feature ✅

## Overview
Branch locations can now be set and updated by dragging markers directly on the map. The "Add Branch" button has been removed from the locations page since branches are created in the Branch Accounts section.

## Changes Made

### 1. Removed "Add Branch" Button
- Removed the button from Branch Locations page header
- Users should create branches in "Branch Accounts" section
- Branches automatically appear in Branch Locations once created

### 2. Draggable Markers
- All branch markers on the map are now draggable
- Drag a marker to reposition it
- Coordinates update automatically when marker is dropped
- Visual feedback shows "Drag to reposition" in popup

### 3. Features

#### Drag & Drop Functionality
- Click and hold any marker
- Drag to new location
- Release to save new coordinates
- Automatic save to database

#### Visual Indicators
- **Green pin**: Branch has coordinates set
- **Amber pin**: Branch needs coordinates (shown in list only)
- **Updating indicator**: Shows "Updating location..." when saving
- **Highlighted row**: Branch being updated has blue background

#### Popup Information
- Shows "Drag to reposition" instruction with move icon
- Branch name and details
- Main branch badge
- Status badge (OPEN)
- Link to manage branch

### 4. Branch List Below Map

#### For Branches WITH Coordinates
- Green pin icon
- Shows exact coordinates (e.g., 14.5547, 121.0244)
- "Edit" link to manage branch

#### For Branches WITHOUT Coordinates
- Amber pin icon
- Shows "Set location in edit" badge
- "Edit" link to set coordinates manually

### 5. Workflow

#### Creating a New Branch
1. Go to "Branch Accounts"
2. Click "Add Branch"
3. Fill in branch details
4. Coordinates are optional during creation
5. Branch appears in "Branch Locations"

#### Setting Coordinates
**Option 1: Drag on Map**
- Go to "Branch Locations"
- Find the branch (if it has initial coordinates)
- Drag the marker to exact location
- Coordinates save automatically

**Option 2: Manual Entry**
- Go to "Branch Accounts"
- Click "Edit" on the branch
- Enter latitude and longitude manually
- Save changes

**Option 3: Set Initial Location**
- When creating/editing branch
- Enter approximate coordinates
- Fine-tune by dragging on map

### 6. Technical Details

#### Backend
- Uses existing `admin.branches.update` route
- Sends only latitude and longitude
- Preserves all other branch data
- Uses `preserveScroll: true` for smooth UX

#### Frontend
- Uses Leaflet's draggable marker feature
- `useRef` hook for marker reference
- `useMemo` for event handlers
- Real-time coordinate updates

### 7. User Experience

#### Smooth Updates
- No page reload when dragging
- Instant visual feedback
- Error handling with alerts
- Scroll position preserved

#### Clear Status
- Color-coded pins (green = set, amber = needs setting)
- Updating indicator in header
- Highlighted row during update
- Helpful messages for branches without coordinates

### 8. Benefits
✅ Intuitive drag-and-drop interface
✅ No need to manually enter coordinates
✅ Visual confirmation of location
✅ Automatic saving
✅ Works with existing branch creation flow
✅ Handles branches without coordinates gracefully
✅ Clear visual indicators for status

### 9. Empty State
When no branches exist:
- Shows "No branches yet" message
- Links to "Branch Accounts" to create one
- Encourages proper workflow

## Testing
1. Create a branch in "Branch Accounts"
2. Go to "Branch Locations"
3. Drag the marker to a new position
4. Verify coordinates update in the list
5. Refresh page to confirm persistence
6. Test with branches that have no coordinates

## Notes
- Branches without coordinates won't appear on map
- They will show in the list below with amber indicator
- Users can set coordinates by editing the branch
- Once coordinates are set, marker becomes draggable on map
