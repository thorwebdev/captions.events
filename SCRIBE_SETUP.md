# ElevenLabs Scribe Realtime Transcription Setup

This guide walks you through setting up and using the ElevenLabs Scribe realtime transcription feature in your application.

## Prerequisites

- An ElevenLabs account with API access
- Node.js and pnpm installed
- Supabase project configured

## Setup Steps

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign in to your account
3. Navigate to your profile settings
4. Copy your API key

### 2. Configure Environment Variables

Add your ElevenLabs API key to your `.env.local` file:

```bash
# ElevenLabs API Key (server-side only)
ELEVENLABS_API_KEY=your_api_key_here
```

**Important:** Never expose your API key to the client. The API key is only used server-side to generate single-use tokens.

### 3. Install Dependencies

The required packages have already been installed:

- `@elevenlabs/react` - React SDK for ElevenLabs Scribe

### 4. Database Setup

Ensure your Supabase database has the necessary tables and policies. The captions table should already be set up with:

- Real-time subscriptions enabled
- Row Level Security policies for viewing and inserting captions

## How It Works

### Architecture

1. **Token Generation (Server-side)**

   - The `/api/scribe-token` endpoint generates single-use tokens
   - Tokens are valid for 15 minutes
   - Only authenticated users who own the event can generate tokens

2. **Broadcaster Interface**

   - Uses the `useScribe` hook from `@elevenlabs/react`
   - Captures audio from the microphone
   - Receives partial and final transcripts in real-time
   - Detects language using Chrome's Language Detector API
   - Saves final transcripts with language_code to Supabase

3. **Viewer Interface**
   - Subscribes to Supabase realtime updates
   - Displays the latest caption in a large, readable format
   - Shows caption history below

### Key Features

- **Ultra-low latency**: Partial transcripts appear in milliseconds
- **Real-time sync**: Captions are saved to Supabase and broadcast to all viewers
- **Microphone controls**: Start/stop recording with a single click
- **Live preview**: Broadcasters see what viewers see in real-time
- **Caption history**: All captions are stored and displayed in chronological order
- **Real-time translation**: Viewers can translate captions to their preferred language using Chrome's built-in AI (Chrome 138+)

## Real-Time Language Detection

The broadcaster interface uses Chrome's built-in [Language Detector API](https://developer.chrome.com/docs/ai/language-detection) to automatically detect the language of spoken transcripts in real-time.

### How It Works

1. **Automatic Detection**: As transcripts are generated, Chrome's Language Detector API analyzes the text
2. **Confidence-Based**: Only detections with >50% confidence are used
3. **Real-Time Updates**: Language is detected and updated continuously during recording
4. **Fallback Support**: Falls back to ElevenLabs Scribe's language_code if detection fails
5. **Visual Feedback**: Shows detected language badge during recording

### Benefits

- **Privacy-First**: All detection happens on-device
- **Accurate**: Uses dedicated language detection models
- **Fast**: Typically 10-50ms per detection
- **Non-Intrusive**: Works silently in the background
- **Reliable**: Automatic fallback to Scribe's language detection

For detailed technical documentation, see [CHROME_LANGUAGE_DETECTOR.md](./CHROME_LANGUAGE_DETECTOR.md)

## Real-Time Translation Feature

The viewer interface includes support for **on-device translation** using Chrome's built-in Translator API. This feature allows viewers to translate captions into their preferred language in real-time, without sending data to external servers.

### Browser Requirements

- **Google Chrome 138 or later** with built-in AI features enabled
- For more information, visit: [Chrome Translator API Documentation](https://developer.chrome.com/docs/ai/translator-api)

### How Translation Works

1. **Feature Detection**: The viewer interface automatically detects if the browser supports the Translator API
2. **Source Language Detection**: Automatically detects the spoken language from ElevenLabs transcription data
3. **Language Selection**: Viewers can choose from 14+ supported languages via a dropdown menu
4. **Model Download**: On first use of a language pair, Chrome downloads the translation model (progress is shown)
5. **On-Device Translation**: All translation happens locally in the browser for maximum privacy and speed
6. **Real-Time Updates**: Both final captions and partial transcripts are translated as they arrive

### Supported Languages

- English
- Spanish
- French
- German
- Italian
- Portuguese
- Dutch
- Russian
- Japanese
- Korean
- Chinese (Simplified)
- Arabic
- Hindi
- Turkish

### Translation Benefits

- **Privacy First**: All translation happens on the user's device - no data sent to external servers
- **Fast & Responsive**: On-device processing means instant translations with no network latency
- **Works Offline**: Once models are downloaded, translation works even without internet
- **No API Costs**: Uses Chrome's built-in AI, no translation API fees
- **Seamless Experience**: Translations update in real-time as new captions arrive
- **Automatic Language Detection**: Source language is automatically detected from transcription data - no manual selection needed
- **Multilingual Support**: Automatically adapts when the spoken language changes during a session

### Browser Compatibility

If the Chrome Translator API is not available:

- An informational message is displayed to the viewer
- Original captions are still shown normally
- A link to documentation is provided for users to learn about browser requirements

## Usage

### For Broadcasters

1. Navigate to your event's broadcast page: `/broadcast/[uid]`
2. Click "Start Recording" to begin transcription
3. Speak into your microphone
4. Partial transcripts (italic, light background) appear as you speak
5. Final transcripts (solid background) are saved when you pause
6. Click "Stop Recording" to end the session

### For Viewers

1. Navigate to the viewer page: `/view/[uid]`
2. The latest caption appears prominently at the top
3. Caption history is shown below
4. Captions update automatically in real-time
5. (Optional) Select a target language from the dropdown to translate captions in real-time

## Configuration Options

### Microphone Settings

The broadcaster interface uses these microphone settings:

- `echoCancellation: true` - Reduces echo
- `noiseSuppression: true` - Reduces background noise
- `autoGainControl: true` - Normalizes audio levels

### Model

The implementation uses `scribe_realtime_v2`, which provides:

- High accuracy
- Low latency
- Support for multiple audio formats
- Automatic voice activity detection

## Troubleshooting

### Token Generation Fails

- Verify your `ELEVENLABS_API_KEY` is set correctly in `.env.local`
- Ensure you're authenticated and own the event
- Check the server logs for detailed error messages

### Microphone Not Working

- Grant microphone permissions in your browser
- Check your browser's security settings
- Ensure you're using HTTPS (required for microphone access)

### Captions Not Appearing

- Verify the Supabase connection is working
- Check that realtime subscriptions are enabled in your Supabase project
- Open the browser console to see any error messages

### Captions Not Syncing to Viewers

- Ensure Row Level Security policies allow public reads on the captions table
- Check that realtime is enabled on the captions table
- Verify the event_id matches between broadcaster and viewer

### Translation Not Working

- Ensure you're using **Google Chrome 138 or later**
- Check that Chrome's built-in AI features are enabled (visit `chrome://flags`)
- Look for the flag: "Enables optimization guide on device" and "Prompt API for Gemini Nano"
- The first time you select a language, Chrome needs to download the translation model (this may take a few moments)
- Check the browser console for any translation errors
- Try selecting "Original (No Translation)" and then reselecting your target language

### Translation Model Download Stuck

- Check your internet connection (models are downloaded on first use)
- Clear Chrome's cache and restart the browser
- Try a different language pair
- Models are cached after first download and work offline thereafter

## API Reference

### `/api/scribe-token`

Generates a single-use token for ElevenLabs Scribe.

**Query Parameters:**

- `eventUid` (optional): The event UID to verify ownership

**Response:**

```json
{
  "token": "single_use_token_here"
}
```

**Errors:**

- `401 Unauthorized`: User is not authenticated
- `403 Forbidden`: User does not own the event
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server configuration error

## Security Considerations

1. **API Key Protection**: The API key is never exposed to the client
2. **Single-use Tokens**: Tokens are generated per session and expire after 15 minutes
3. **Authentication**: Only authenticated users can generate tokens
4. **Authorization**: Only event owners can generate tokens for their events
5. **Row Level Security**: Supabase policies control who can insert captions

## Performance

- **Latency**: Partial transcripts typically appear within 100-200ms
- **Accuracy**: ScribeRealtime v2 provides state-of-the-art accuracy
- **Bandwidth**: Audio is streamed efficiently in chunks
- **Scalability**: Supabase realtime handles multiple concurrent viewers

## Next Steps

Consider adding:

- Export captions to various formats (SRT, VTT, TXT)
- Custom styling options for captions
- Speaker identification
- ~~Multi-language support~~ ✅ **Implemented with Chrome Translator API**
- ~~Language detection for automatic source language identification~~ ✅ **Implemented with language_code from transcription**
- Offline caption viewing
- Language confidence scores and manual override
- Caption history filtering by language

## Support

For issues with:

- **ElevenLabs API**: Contact [ElevenLabs Support](https://elevenlabs.io/support)
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **This Implementation**: Review the code and console logs for debugging

## Resources

- [ElevenLabs Scribe Documentation](https://elevenlabs.io/docs/api-reference/scribe)
- [ElevenLabs React SDK](https://www.npmjs.com/package/@elevenlabs/react)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Chrome Language Detector API](https://developer.chrome.com/docs/ai/language-detection)
- [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
