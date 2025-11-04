# Language Code Detection Update

## Overview

Updated the real-time translation feature to automatically detect the source language from the ElevenLabs Scribe transcription data, instead of hardcoding English as the source language.

## Changes Made

### 1. Database Migration

**File**: `supabase/migrations/20251103000000_add_language_code.sql`

Added `language_code` column to the `captions` table to store the detected language for each caption.

```sql
ALTER TABLE captions ADD COLUMN IF NOT EXISTS language_code TEXT;
CREATE INDEX IF NOT EXISTS idx_captions_language_code ON captions(language_code);
```

### 2. Broadcaster Interface Updates

**File**: `components/broadcaster-interface.tsx`

- Updated `Caption` interface to include `language_code?: string`
- Modified `onPartialTranscript` callback to broadcast the `language_code` along with the text:
  ```typescript
  payload: {
    text: data.text,
    language_code: (data as any).language_code,
  }
  ```
- Modified `onFinalTranscript` callback to save the `language_code` to the database:
  ```typescript
  insert({
    event_id: event.id,
    text: data.text,
    sequence_number: sequenceNumberRef.current++,
    is_final: true,
    language_code: (data as any).language_code,
  });
  ```

### 3. Viewer Interface Updates

**File**: `components/viewer-interface.tsx`

#### State Management

- Added `sourceLanguage` state (defaults to "en")
- Tracks the detected source language from captions and broadcasts

#### Language Detection Logic

1. **On Initial Load**: Detects source language from existing captions in database

   ```typescript
   const firstCaptionWithLang = data.find(
     (caption: Caption) => caption.language_code
   );
   if (firstCaptionWithLang?.language_code) {
     setSourceLanguage(firstCaptionWithLang.language_code);
   }
   ```

2. **On New Caption**: Updates source language from realtime database updates

   ```typescript
   if (payload.new.language_code) {
     setSourceLanguage(payload.new.language_code);
   }
   ```

3. **On Partial Transcript**: Updates source language from broadcast channel
   ```typescript
   if (payload.payload.language_code) {
     setSourceLanguage(payload.payload.language_code);
   }
   ```

#### Translation Updates

- Translator now uses detected `sourceLanguage` instead of hardcoded "en"
- Translator recreates when source language changes
- Added dependency on `sourceLanguage` to translator creation effect

#### UI Updates

- Displays detected source language below the translation dropdown
- Shows: "Detected source language: XX" (only if not English)

## Benefits

### 1. Multilingual Support

- Automatically adapts to any language being spoken
- No manual source language selection needed
- Works seamlessly with ElevenLabs' multilingual transcription

### 2. Accuracy

- Uses the actual detected language from the transcription model
- Ensures translation uses the correct source language
- Improves translation quality for non-English content

### 3. User Experience

- Transparent language detection
- Visual feedback of detected language
- Automatic adjustment without user intervention

### 4. Real-Time Updates

- Source language updates as new captions arrive
- Supports language switching mid-stream
- Translator automatically recreates with new source language

## Data Flow

```
ElevenLabs Scribe Transcription
    ↓
Receives: { text, language_code }
    ↓
Broadcaster Interface
    ├─→ Saves to Database (with language_code)
    └─→ Broadcasts to Viewers (with language_code)
    ↓
Viewer Interface
    ├─→ Receives from Database
    ├─→ Receives from Broadcast
    └─→ Detects source language
    ↓
Chrome Translator API
    Uses: sourceLanguage → targetLanguage
    ↓
Translated Captions Displayed
```

## Technical Details

### Language Code Format

- Uses BCP 47 language codes (e.g., "en", "es", "fr")
- Provided by ElevenLabs Scribe API
- Compatible with Chrome Translator API

### Database Schema

```sql
captions (
  id UUID PRIMARY KEY,
  event_id UUID,
  text TEXT,
  timestamp TIMESTAMPTZ,
  sequence_number INTEGER,
  is_final BOOLEAN,
  language_code TEXT  -- NEW
)
```

### Type Safety

- Added `language_code?: string` to Caption interface
- Used type assertion `(data as any).language_code` for accessing language_code from Scribe data
- TypeScript properly typed all state and function parameters

## Testing Checklist

- [x] Build succeeds without errors
- [x] No TypeScript linter errors
- [ ] Database migration applies successfully
- [ ] Language code is stored when broadcasting
- [ ] Language code is received by viewers
- [ ] Source language detection works from database
- [ ] Source language detection works from broadcasts
- [ ] Translator uses detected source language
- [ ] Translation quality improves for non-English content
- [ ] UI displays detected source language
- [ ] Translator recreates when language changes

## Future Enhancements

1. **Language History**: Track language changes over time for analytics
2. **Language Filtering**: Allow filtering captions by language
3. **Multi-Language Sessions**: Support for sessions with multiple languages
4. **Confidence Scores**: Display language detection confidence if available
5. **Manual Override**: Allow users to manually set source language if detection is incorrect

## Migration Instructions

### For Existing Deployments

1. **Apply Database Migration**:

   ```bash
   # Using Supabase CLI
   supabase db push

   # Or run the migration manually in Supabase Dashboard
   ```

2. **Deploy Updated Code**:

   ```bash
   pnpm build
   # Deploy to your hosting platform
   ```

3. **Verify**:
   - Check that existing captions still display correctly (language_code will be NULL for old data)
   - Test with new broadcasts to verify language_code is being captured
   - Test translation with different source languages

### Backward Compatibility

- ✅ Existing captions without `language_code` will continue to work
- ✅ Translation defaults to English if no language detected
- ✅ No breaking changes to existing functionality

## Resources

- [ElevenLabs Scribe API](https://elevenlabs.io/docs/api-reference/scribe)
- [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api)
- [BCP 47 Language Tags](https://en.wikipedia.org/wiki/IETF_language_tag)
