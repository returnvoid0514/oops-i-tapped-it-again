# Music Rhythm Game - Complete Setup Guide

## Overview
This guide will walk you through setting up a complete rhythm game in Lens Studio with:
- ✅ Balls (notes) dropping in sync with music
- ✅ Visual hit lines where players tap
- ✅ Touch detection for each lane
- ✅ Score feedback system
- ✅ Snapchat compatibility

---

## Part 1: Lens Studio Scene Setup

### Step 1: Create the Camera and Canvas

1. **Camera Setup**:
   - Make sure you have an `Orthographic Camera` in your scene
   - Set the camera to look down the Z-axis
   - Position: (0, 0, 50)
   - Rotation: (0, 0, 0)

2. **Create Screen Image for UI**:
   - Right-click in Objects Panel → Add New → Screen Image
   - Name it "Canvas"
   - This will hold all your UI elements

### Step 2: Create Hit Lines (Visual Markers)

1. **Create 3 Hit Lines**:
   - In Objects Panel, right-click Canvas → Add New → Image
   - Name them:
     - `HitLine_Left`
     - `HitLine_Center`
     - `HitLine_Right`

2. **Position the Hit Lines**:
   - Select each hit line and set their Transform positions:
     - **HitLine_Left**: Position X = -8, Y = 0, Z = 0
     - **HitLine_Center**: Position X = 0, Y = 0, Z = 0
     - **HitLine_Right**: Position X = 8, Y = 0, Z = 0

3. **Style the Hit Lines**:
   - For each hit line:
     - Set Size: Width = 6, Height = 1
     - Set Color: White with alpha 0.5 (semi-transparent)
     - Add a border or glow for visibility

4. **Add HitLineFeedback Script**:
   - Select each hit line
   - In Inspector → Add Component → Script Component
   - Assign `HitLineFeedback.ts` script
   - Configure colors:
     - Normal Color: (1, 1, 1, 0.5)
     - Hit Color: (0, 1, 0, 1)

### Step 3: Create Hit Zone Manager

1. **Create Hit Zone Object**:
   - Right-click in Objects Panel → Add New → Empty Object
   - Name it "HitZoneManager"

2. **Add HitZoneManager Script**:
   - Select HitZoneManager object
   - Add Component → Script Component
   - Assign `HitZoneManager.ts`

3. **Configure Inspector References**:
   - **Conductor**: Drag your Conductor object (the object with Conductor.ts script)
   - **Note Spawner Object**: Drag your GameLogic/GameManager object (the object with NoteSpawner.ts script, NOT the prefab asset)
   - **Hit Line Left**: Drag HitLine_Left
   - **Hit Line Center**: Drag HitLine_Center
   - **Hit Line Right**: Drag HitLine_Right
   - **Camera**: Drag your Camera object
   - **Hit Window**: 0.8 (adjust for difficulty - lower is harder)

### Step 4: Configure Existing Components

1. **Update NoteSpawner**:
   - Make sure your NotePrefab is assigned
   - Verify Conductor is assigned
   - Set spawn interval (e.g., 1.0 for one note per second)

2. **Update Conductor**:
   - Assign your Audio Component
   - Set BPM (from your song, e.g., 120)
   - Set offset if needed (usually 0)

---

## Part 2: Testing in Lens Studio

### Test Checklist:

1. **Press Play in Lens Studio**:
   - Music should start playing
   - Notes should spawn and fall down
   - Hit lines should be visible at Y = 0

2. **Test Touch Detection**:
   - Tap the screen when a note crosses a hit line
   - Check the Logger panel for feedback:
     - "Score => Perfect!", "Score => Great!", "Score => Good", "Score => OK", or "❌ Miss"

3. **Verify Lane Detection**:
   - Tap left side of screen → should detect left lane
   - Tap middle → should detect center lane
   - Tap right → should detect right lane

### Common Issues:

**Notes not spawning?**
- Check that NotePrefab is assigned in NoteSpawner
- Verify Conductor is assigned and audio is playing
- Check TestSongData.ts has notes defined

**Touch not working?**
- Verify HitZoneManager has all references assigned
- Check Camera reference is correct
- Make sure noteSpawnerObject points to the object with NoteSpawner script (not the prefab asset)
- Verify the NoteSpawner object has the pool property (check logger for "has pool = true")

**Notes not in correct lanes?**
- Verify lane positions match between:
  - NoteSpawner.ts (line 80): `lane * 8.0`
  - HitZoneManager.ts: `lanePositions = [-8.0, 0.0, 8.0]`

---

## Part 3: Snapchat Integration & Testing

### Testing on Device:

1. **Preview on Device**:
   - In Lens Studio: Device → Send Lens to Snapchat
   - Open Snapchat → Camera → select your Lens
   - Test touch interaction on real device

2. **Important Snapchat Considerations**:

   **Touch Events**:
   - Snapchat fully supports `TouchStartEvent`
   - Touch position is normalized (0-1 range)
   - Multi-touch is supported

   **Performance**:
   - Keep note pool size reasonable (30 is good)
   - Use object pooling (already implemented)
   - Avoid creating/destroying objects during gameplay

   **Audio Sync**:
   - Test audio timing on device (may differ from desktop)
   - Adjust `offset` in Conductor if needed
   - Mobile devices may have audio latency

### Snapchat-Specific Features:

1. **Screen Safe Area**:
   - Leave space for Snapchat UI (top/bottom bars)
   - Position game elements in the center 80% of screen

2. **Recording**:
   - Users can record while playing
   - Consider adding a "score display" for shares

3. **Portrait Mode**:
   - Design for vertical (portrait) orientation
   - Snapchat Lenses are always portrait

---

## Part 4: Advanced Features (Optional)

### Add Score Tracking:

Create `ScoreManager.ts`:

```typescript
@component
export class ScoreManager extends BaseScriptComponent {
    @input
    scoreText: Text;

    private score: number = 0;
    private combo: number = 0;

    public addScore(quality: string) {
        let points = 0;
        if (quality === "Perfect!") points = 100;
        else if (quality === "Great!") points = 75;
        else if (quality === "Good") points = 50;
        else if (quality === "OK") points = 25;

        this.score += points * (1 + this.combo * 0.1);
        this.combo++;

        this.updateDisplay();
    }

    public miss() {
        this.combo = 0;
        this.updateDisplay();
    }

    private updateDisplay() {
        if (this.scoreText) {
            this.scoreText.text = `Score: ${Math.floor(this.score)}\nCombo: ${this.combo}`;
        }
    }
}
```

### Add Visual Effects:

- Add particle effects on hit
- Animate hit lines when notes are hit
- Add miss effects (red flash)

### Add Difficulty Levels:

- Adjust `hitWindow` in HitZoneManager:
  - Easy: 1.0 (very forgiving)
  - Medium: 0.8 (default)
  - Hard: 0.5 (strict timing)
  - Expert: 0.3 (very strict)

---

## Part 5: Creating Custom Songs

### Step 1: Prepare Your Audio

1. **Audio Format**:
   - MP3 or WAV (MP3 recommended for file size)
   - Mono or Stereo
   - Keep file size under 5MB for Snapchat

2. **Find the BPM**:
   - Use an online BPM detector
   - Or use a DAW (Digital Audio Workstation)

### Step 2: Create Note Data

1. **Edit TestSongData.ts**:

```typescript
export const SongData = {
    "bpm": 128,  // Your song's BPM
    "offset": 0.0,  // Adjust if audio is delayed
    "notes": [
        { "beat": 4.0, "lane": 0 },   // lane 0 = left
        { "beat": 4.5, "lane": 1 },   // lane 1 = center
        { "beat": 5.0, "lane": 2 },   // lane 2 = right
        // Add more notes...
    ]
};
```

2. **Lane System**:
   - Lane 0 = Left (-8 units)
   - Lane 1 = Center (0 units)
   - Lane 2 = Right (+8 units)

3. **Beat Calculation**:
   - At 120 BPM: 1 beat = 0.5 seconds
   - At 140 BPM: 1 beat = 0.43 seconds
   - Formula: `beat = (time_in_seconds * BPM) / 60`

### Step 3: Tool for Creating Note Charts

You can create a simple tool to tap along to music and generate note data.

---

## Part 6: Optimization Tips

### Performance:

1. **Object Pooling** (already implemented):
   - Notes are reused, not destroyed
   - Keeps frame rate stable

2. **Limit Active Notes**:
   - Only check notes near hit line
   - Disable notes that are off-screen

3. **Audio**:
   - Use compressed audio (MP3)
   - Consider streaming for longer songs

### File Size:

1. **Lens File Size Limit**: 8MB for Snapchat
2. **Reduce Size**:
   - Compress audio
   - Use simple materials
   - Minimize texture sizes

---

## Troubleshooting

### Notes spawn but don't move:
- Check Conductor is assigned in Note.ts
- Verify audio is playing

### Touch doesn't detect notes:
- Check HitZoneManager's noteSpawnerObject points to the scene object with NoteSpawner script (NOT the prefab)
- Verify the object has multiple script components - look for "Found 2 script components" in logger
- Verify pool is public in NoteSpawner.ts (line 18)
- Check lane positions match (-8, 0, 8)
- Make sure hitWindow is reasonable (0.8 or higher for testing)

### Timing is off:
- Adjust `offset` in Conductor
- Test on device (timing may differ from desktop)
- Verify BPM is correct

### Notes spawn in wrong lanes:
- Check TestSongData.ts lane values (0, 1, 2)
- Verify lane calculation in NoteSpawner.ts line 61

---

## Next Steps

1. **Test the basic setup** - Make sure notes spawn and you can hit them
2. **Add your own song** - Replace audio and create note chart
3. **Add visual polish** - Particle effects, better UI, animations
4. **Add score system** - Track and display score
5. **Test on device** - Send to Snapchat and test on phone
6. **Share!** - Publish your Lens

---

## Support & Resources

- **Lens Studio Documentation**: https://developers.snap.com/lens-studio
- **Lens Studio Community**: https://lensstudio.snapchat.com/community
- **TypeScript API Reference**: Available in Lens Studio Help menu

---

**Good luck with your rhythm game!** 🎵🎮
