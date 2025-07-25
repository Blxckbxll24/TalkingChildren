# TalkingChildren Wear OS Application

## Overview
This is a complete Android Wear OS application that replicates the functionality of the ESP32 TalkingChildren device. The app allows users to navigate through predefined message categories and record custom audio messages.

## Features

### Main Categories
- **Básico**: Basic daily messages
  - "Hola, buenos días"
  - "Necesito ayuda"
  - "Muchas gracias"

- **Emociones**: Emotional expressions
  - "Me siento feliz"
  - "Necesito apoyo"
  - "Estoy agradecido"

- **Necesidades**: Essential needs
  - "Necesito ir al baño"
  - "Tengo hambre"
  - "Tengo sed"

### Audio Functionality
- **Record Audio**: Tap any message to record a custom audio version
- **Playback**: Recorded messages show a 🎵 icon and can be played back
- **Storage**: Audio files are stored locally in 3GP format

## Technical Implementation

### Architecture
- **MainActivity.kt**: Main screen displaying the three categories
- **MessagesActivity.kt**: Shows messages for selected category
- **AudioRecorderActivity.kt**: Handles audio recording and playback
- **AudioManager.kt**: Manages audio file operations

### Permissions Required
- `RECORD_AUDIO`: For recording voice messages
- `WRITE_EXTERNAL_STORAGE`: For saving audio files
- `READ_EXTERNAL_STORAGE`: For reading audio files

### Storage
Audio files are stored in the app's private directory under:
```
/data/data/com.talkingchildren/files/TalkingChildren/
```

File naming convention: `cat_{categoryId}_msg_{messageIndex}.3gp`

## Building the Application

### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK API Level 30+
- Wear OS SDK components

### Build Steps
1. Open the project in Android Studio
2. Sync Gradle files
3. Connect a Wear OS device or start an emulator
4. Run the `wear` module

### Gradle Build
```bash
./gradlew :wear:assembleDebug
```

## Installation
1. Enable Developer Options on your Wear OS device
2. Install via ADB:
```bash
adb install wear/build/outputs/apk/debug/wear-debug.apk
```

## Usage
1. Launch the TalkingChildren app on your Wear OS device
2. Select a category (Básico, Emociones, or Necesidades)
3. Tap on any message to open the recorder
4. Press "Grabar Audio" to record your voice
5. Press "Reproducir" to play back recorded audio
6. Messages with recordings show a 🎵 icon

## Wear OS Optimizations
- Circular display optimization with FrameLayout
- Large touch targets suitable for small screens
- Dark theme optimized for OLED displays
- Minimal text with clear visual indicators

## File Structure
```
wear/
├── src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/talkingchildren/
│   │   ├── MainActivity.kt
│   │   ├── MessagesActivity.kt
│   │   ├── AudioRecorderActivity.kt
│   │   └── AudioManager.kt
│   └── res/
│       ├── layout/
│       ├── values/
│       └── xml/
└── build.gradle
```