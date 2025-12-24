# Photo Upload in Contacts - Feature Documentation

## Overview
Added photo upload functionality to the Contacts page, allowing users to add photos when manually creating contacts. This complements the automatic photo capture in the Face Recognition feature.

## Feature Description

### What Was Added
Users can now upload photos when adding contacts manually through the Contacts page. This provides an alternative way to add photos for people who may not be available for face recognition scanning.

### Use Cases
1. **Pre-loading contacts**: Add photos of people before meeting them
2. **Historical contacts**: Add photos from existing pictures
3. **Remote contacts**: Add photos of people not physically present
4. **Backup method**: Alternative when face recognition is unavailable

## Implementation Details

### File Modified
**File**: `src/pages/patient/PatientContactsPage.tsx`

### Changes Made

#### 1. Added Photo State Management
```typescript
const [photoUrl, setPhotoUrl] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

**Purpose**: 
- `photoUrl`: Stores the base64-encoded image data
- `fileInputRef`: Reference to hidden file input element

#### 2. Photo Upload Handler
```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: 'Invalid File',
      description: 'Please select an image file',
      variant: 'destructive',
    });
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: 'File Too Large',
      description: 'Please select an image smaller than 5MB',
      variant: 'destructive',
    });
    return;
  }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    setPhotoUrl(result);
    toast({
      title: 'Photo Added',
      description: 'Photo uploaded successfully',
    });
  };
  reader.onerror = () => {
    toast({
      title: 'Upload Failed',
      description: 'Could not read the image file',
      variant: 'destructive',
    });
  };
  reader.readAsDataURL(file);
};
```

**Features**:
- File type validation (images only)
- File size validation (max 5MB)
- Base64 conversion for storage
- Error handling with user feedback
- Success notification

#### 3. Photo Remove Handler
```typescript
const handleRemovePhoto = () => {
  setPhotoUrl(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};
```

**Purpose**: Allows users to remove uploaded photo and reset file input

#### 4. Updated Contact Creation
```typescript
const contact = await createKnownFace({
  patient_id: patient.id,
  person_name: newContact.person_name,
  relationship: newContact.relationship || null,
  notes: newContact.notes || null,
  face_encoding: null,
  photo_url: photoUrl, // ← Added photo URL
});
```

**Change**: Now includes `photo_url` when creating contact

#### 5. Enhanced Dialog UI

**Photo Upload Section**:
```typescript
<div className="space-y-3">
  <Label className="text-base">Photo (Optional)</Label>
  <div className="flex flex-col items-center gap-3">
    {photoUrl ? (
      <div className="relative">
        <img 
          src={photoUrl} 
          alt="Contact photo" 
          className="w-32 h-32 rounded-full object-cover border-4 border-primary"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 rounded-full w-8 h-8"
          onClick={handleRemovePhoto}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <div className="w-32 h-32 rounded-full bg-muted border-4 border-dashed border-border flex items-center justify-center">
        <Camera className="w-12 h-12 text-muted-foreground" />
      </div>
    )}
    
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      className="hidden"
    />
    
    <Button
      type="button"
      variant={photoUrl ? "outline" : "default"}
      size="sm"
      onClick={() => fileInputRef.current?.click()}
      className="gap-2"
    >
      <Upload className="w-4 h-4" />
      {photoUrl ? 'Change Photo' : 'Upload Photo'}
    </Button>
    
    <p className="text-xs text-muted-foreground text-center">
      JPG, PNG or GIF (max 5MB)
    </p>
  </div>
</div>
```

**UI States**:
- **No Photo**: Shows placeholder circle with camera icon and dashed border
- **Photo Uploaded**: Shows actual photo with solid border and remove button
- **Button**: Changes text from "Upload Photo" to "Change Photo"

#### 6. Enhanced Contact Display
```typescript
{contact.photo_url ? (
  <img 
    src={contact.photo_url} 
    alt={contact.person_name}
    className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-border"
  />
) : (
  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
    <span className="text-2xl font-bold text-primary">
      {getInitials(contact.person_name)}
    </span>
  </div>
)}
```

**Display Logic**:
- If photo exists: Show actual photo
- If no photo: Show initials in colored circle (fallback)

#### 7. Dialog Cleanup
```typescript
<Button 
  type="button"
  variant="outline" 
  onClick={() => {
    setDialogOpen(false);
    setNewContact({ person_name: '', relationship: '', notes: '' });
    setPhotoUrl(null); // ← Clear photo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // ← Reset file input
    }
  }} 
  className="flex-1 h-12"
>
  Cancel
</Button>
```

**Purpose**: Ensures photo state is cleared when dialog is closed

## User Experience

### Adding a Contact with Photo

**Step 1: Open Dialog**
- Click "Add Contact" button in header
- Dialog opens with empty form

**Step 2: Upload Photo (Optional)**
- Click "Upload Photo" button
- File picker opens
- Select image file (JPG, PNG, or GIF)
- Photo appears in circular preview

**Step 3: Enter Details**
- Enter person's name (required)
- Enter relationship (optional)
- Enter notes (optional)

**Step 4: Save**
- Click "Add Contact" button
- Contact saved with photo
- Dialog closes
- Contact appears in list with photo

### Changing/Removing Photo

**Change Photo**:
1. Click "Change Photo" button
2. Select new image
3. New photo replaces old one

**Remove Photo**:
1. Click X button on photo
2. Photo removed
3. Placeholder appears
4. Can upload new photo

## Validation & Error Handling

### File Type Validation
**Check**: File must be an image
**Error**: "Invalid File - Please select an image file"
**Accepted**: JPG, PNG, GIF, WebP, etc.

### File Size Validation
**Check**: File must be under 5MB
**Error**: "File Too Large - Please select an image smaller than 5MB"
**Reason**: Prevents database bloat and performance issues

### Upload Error Handling
**Check**: File read operation succeeds
**Error**: "Upload Failed - Could not read the image file"
**Causes**: Corrupted file, permission issues, browser limitations

### Form Validation
**Check**: Name field is not empty
**Behavior**: "Add Contact" button disabled until name entered
**Reason**: Name is required field for contact

## Visual Design

### Photo Preview States

**State 1: No Photo**
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                 │
│    ┌─────┐      │
│    │ 📷  │      │  ← Camera icon
│    └─────┘      │
│                 │
└─ ─ ─ ─ ─ ─ ─ ─ ─┘
  Dashed border

[Upload Photo]  ← Primary button
```

**State 2: Photo Uploaded**
```
┌─────────────────┐
│                 │
│   ┏━━━━━━━┓     │
│   ┃ Photo ┃  ❌ │  ← Remove button
│   ┗━━━━━━━┛     │
│                 │
└─────────────────┘
  Solid border

[Change Photo]  ← Outline button
```

### Contact List Display

**With Photo**:
```
┌────────────────────────────────┐
│ ┏━━━━┓  John Smith            │
│ ┃    ┃  Friend                │
│ ┗━━━━┛  Met at the park       │
│         Added Dec 24, 2025     │
└────────────────────────────────┘
```

**Without Photo**:
```
┌────────────────────────────────┐
│ ┌────┐  Jane Doe              │
│ │ JD │  Doctor                │
│ └────┘  Family physician      │
│         Added Dec 24, 2025     │
└────────────────────────────────┘
```

## Technical Specifications

### Image Storage
- **Format**: Base64-encoded data URL
- **Storage**: Database text field (`known_faces.photo_url`)
- **Size**: Typically 50-500KB per image (depends on original size)
- **Encoding**: Preserves original format (JPEG, PNG, etc.)

### File Input Configuration
```typescript
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleFileSelect}
  className="hidden"
/>
```

**Attributes**:
- `type="file"`: File upload input
- `accept="image/*"`: Only show image files in picker
- `className="hidden"`: Visually hidden, triggered by button
- `ref={fileInputRef}`: Programmatic access

### Base64 Conversion
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const result = e.target?.result as string;
  setPhotoUrl(result);
};
reader.readAsDataURL(file);
```

**Process**:
1. Create FileReader instance
2. Set onload callback
3. Read file as data URL
4. Result is base64 string with MIME type prefix
5. Example: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

### Image Display
```typescript
<img 
  src={photoUrl} 
  alt={contact.person_name}
  className="w-16 h-16 rounded-full object-cover"
/>
```

**CSS Classes**:
- `w-16 h-16`: Fixed 64x64 pixel size
- `rounded-full`: Circular shape
- `object-cover`: Crop to fit, maintain aspect ratio
- `border-2 border-border`: Subtle border

## Comparison: Face Recognition vs Manual Upload

| Feature | Face Recognition | Manual Upload |
|---------|-----------------|---------------|
| **Method** | Camera capture | File upload |
| **Timing** | Real-time detection | Anytime |
| **Source** | Live camera feed | Existing photos |
| **Face Data** | Includes descriptor | No descriptor |
| **Recognition** | Enables face matching | Visual reference only |
| **Use Case** | In-person meetings | Pre-loading, remote |
| **Photo Quality** | Depends on camera | Depends on file |
| **Convenience** | Automatic | Manual |

### When to Use Each

**Use Face Recognition When**:
- Person is physically present
- Want automatic recognition
- Need face descriptor for matching
- Real-time identification needed

**Use Manual Upload When**:
- Person not physically present
- Have existing photos
- Pre-loading contacts
- Face recognition unavailable
- Just need visual reference

## Data Flow

### Upload Flow
```
User clicks "Upload Photo"
  ↓
File picker opens
  ↓
User selects image file
  ↓
Validate file type (image/*)
  ↓
Validate file size (< 5MB)
  ↓
FileReader reads file
  ↓
Convert to base64 data URL
  ↓
Store in photoUrl state
  ↓
Display in preview
  ↓
User clicks "Add Contact"
  ↓
Save to database (photo_url field)
  ↓
Display in contact list
```

### Display Flow
```
Load contacts from database
  ↓
For each contact:
  ↓
  Check if photo_url exists
  ↓
  If yes: Display <img> with photo
  ↓
  If no: Display initials in circle
```

## Browser Compatibility

### File API Support
✅ Chrome 90+
✅ Safari 14+
✅ Firefox 88+
✅ Edge 90+

### FileReader API Support
✅ All modern browsers
✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Base64 Image Support
✅ Universal support
✅ Works in all browsers

## Performance Considerations

### File Size Limit
**Limit**: 5MB maximum
**Reason**: 
- Prevents database bloat
- Ensures fast page loads
- Maintains good UX

**Typical Sizes**:
- Phone photo: 1-3MB
- Compressed JPEG: 100-500KB
- PNG screenshot: 500KB-2MB

### Base64 Overhead
**Increase**: ~33% larger than binary
**Example**: 1MB file → 1.33MB base64
**Trade-off**: Simplicity vs size

### Memory Usage
**During Upload**: File held in memory temporarily
**After Upload**: Stored as string in state
**After Save**: Cleared from state
**Impact**: Minimal for single image

## Security Considerations

### File Type Validation
**Client-side**: `accept="image/*"` attribute
**JavaScript**: Check `file.type.startsWith('image/')`
**Purpose**: Prevent non-image uploads

### File Size Validation
**Check**: `file.size > 5 * 1024 * 1024`
**Purpose**: Prevent large file attacks

### XSS Prevention
**Risk**: Malicious image files
**Mitigation**: Base64 encoding, no script execution
**Safe**: Images rendered as data URLs

## Future Enhancements (Optional)

### Possible Improvements
1. **Image Compression**: Reduce file size before storage
2. **Crop Tool**: Allow users to crop/adjust photos
3. **Multiple Photos**: Support multiple photos per contact
4. **Cloud Storage**: Upload to Supabase Storage instead of base64
5. **Drag & Drop**: Drag images directly into upload area
6. **Webcam Capture**: Take photo with webcam
7. **Photo Gallery**: View all contact photos in gallery
8. **Bulk Upload**: Upload multiple contacts with photos

### Not Implemented (Out of Scope)
- Image editing features
- Advanced compression
- Cloud storage integration
- Webcam capture
- Drag and drop

## Testing Checklist

✅ **Upload Functionality**
- Click "Upload Photo" → File picker opens
- Select image → Photo appears in preview
- Select non-image → Error message shown
- Select large file (>5MB) → Error message shown

✅ **Photo Management**
- Click "Change Photo" → Can select new image
- Click X button → Photo removed
- Cancel dialog → Photo state cleared
- Save contact → Photo saved to database

✅ **Display**
- Contact with photo → Shows actual photo
- Contact without photo → Shows initials
- Photo loads correctly → No broken images
- Circular crop → Photo fits properly

✅ **Validation**
- Empty name → Button disabled
- With name → Button enabled
- Photo optional → Can save without photo
- Photo with name → Both saved correctly

✅ **Error Handling**
- Invalid file type → Clear error message
- File too large → Clear error message
- Upload fails → Clear error message
- All errors → User can retry

## Summary

### What Was Added
✅ Photo upload button in Add Contact dialog
✅ Photo preview with remove functionality
✅ File type and size validation
✅ Base64 conversion and storage
✅ Photo display in contact list
✅ Fallback to initials when no photo

### User Benefits
✅ Can add photos from existing images
✅ Can pre-load contacts before meeting
✅ Visual reference for all contacts
✅ Alternative to face recognition
✅ Simple, intuitive interface

### Technical Quality
✅ All lint checks passing
✅ Proper error handling
✅ User-friendly feedback
✅ Clean, maintainable code
✅ Consistent with existing patterns

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: 2025-12-24
**Version**: 1.0.0
**File Modified**: `src/pages/patient/PatientContactsPage.tsx`
