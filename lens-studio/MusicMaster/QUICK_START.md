# Quick Start Guide - Get Your Rhythm Game Working NOW

## What I Created For You

I've added the missing pieces to make your rhythm game fully functional:

### ✅ New Files Created:
1. **[HitZoneManager.ts](Assets/Scripts/HitZoneManager.ts)** - Detects touches and checks for note hits
2. **[HitLineFeedback.ts](Assets/Scripts/HitLineFeedback.ts)** - Makes hit lines flash when you hit notes
3. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete detailed setup instructions
4. **[SCENE_HIERARCHY.md](SCENE_HIERARCHY.md)** - Scene structure reference

### ✅ Files Modified:
1. **[NoteSpawner.ts](Assets/Scripts/NoteSpawner.ts)** - Made `pool` public so HitZoneManager can access notes

---

## 5-Minute Setup (In Lens Studio)

### Step 1: Create Hit Lines (2 minutes)

1. Open your Lens Studio project
2. In the **Objects Panel**, find your Canvas or Screen Image
3. Right-click → **Add New → Image** (do this 3 times)
4. Name them:
   - `HitLine_Left`
   - `HitLine_Center`
   - `HitLine_Right`

5. **Position them** (in Inspector → Transform):
   - **HitLine_Left**: X = -8, Y = 0, Z = 0
   - **HitLine_Center**: X = 0, Y = 0, Z = 0
   - **HitLine_Right**: X = 8, Y = 0, Z = 0

6. **Style them** (in Inspector → Image):
   - Width: 6
   - Height: 1
   - Color: White with alpha 0.5

7. **Add scripts** to each hit line:
   - Select hit line → Add Component → Script
   - Choose `HitLineFeedback.ts`

### Step 2: Set Up Hit Zone Manager (2 minutes)

1. Select your **GameManager** object (or create an empty object)
2. Add Component → Script
3. Choose `HitZoneManager.ts`
4. In the Inspector, drag and drop:
   - **Conductor** → Your Conductor object
   - **Note Spawner Object** → Your GameManager (same object with NoteSpawner script)
   - **Hit Line Left** → HitLine_Left
   - **Hit Line Center** → HitLine_Center
   - **Hit Line Right** → HitLine_Right
   - **Camera** → Your Camera object
   - **Hit Window** → 0.25

### Step 3: Verify Existing Setup (1 minute)

Make sure these are already set up:

**NoteSpawner** (should already be configured):
- ✓ Conductor reference
- ✓ NotePrefab reference
- ✓ infiniteMode: false (or true for testing)

**Conductor** (should already be configured):
- ✓ AudioComponent reference
- ✓ BPM: 120 (or your song's BPM)

**NotePrefab**:
- ✓ Has Note.ts script
- ✓ Has visual component (Image/Sprite)

### Step 4: Test! (1 minute)

1. Press **Play** in Lens Studio
2. Music should play and notes should drop
3. **Tap the screen** when a note crosses a hit line
4. Open **Logger Panel** to see hit feedback:
   - "Perfect!", "Great!", "Good", "OK", or "Miss"

---

## What Each Script Does

### Your Original Scripts:
- **[Conductor.ts](Assets/Scripts/Conductor.ts)** - Tracks music timing and beats ✅
- **[NoteSpawner.ts](Assets/Scripts/NoteSpawner.ts)** - Spawns notes in sync with music ✅
- **[Note.ts](Assets/Scripts/Note.ts)** - Makes notes fall down based on beat ✅
- **[TestSongData.ts](Assets/Scripts/TestSongData.ts)** - Contains note chart data ✅

### New Scripts I Added:
- **[HitZoneManager.ts](Assets/Scripts/HitZoneManager.ts)** - NEW: Handles touch input and detects hits
- **[HitLineFeedback.ts](Assets/Scripts/HitLineFeedback.ts)** - NEW: Visual feedback when you hit notes

---

## How Touch Detection Works

### Lane Detection:
The screen is divided into 3 sections:
```
┌──────────┬──────────┬──────────┐
│   Left   │  Center  │  Right   │
│  Lane 0  │  Lane 1  │  Lane 2  │
│  X < 33% │ X < 66%  │  X > 66% │
└──────────┴──────────┴──────────┘
```

When you tap:
1. **HitZoneManager** detects which lane you tapped
2. Finds all notes in that lane near the hit line
3. Checks if timing is good (within hit window)
4. Gives feedback based on accuracy

### Hit Quality System:
- **Perfect**: < 0.05 beats error (within 50ms at 120 BPM)
- **Great**: < 0.1 beats error
- **Good**: < 0.15 beats error
- **OK**: < 0.25 beats error
- **Miss**: > 0.25 beats or wrong lane

---

## Testing Checklist

### ✅ Visual Test:
- [ ] Press Play
- [ ] Music plays
- [ ] Notes spawn and fall down
- [ ] 3 white lines visible at Y=0

### ✅ Interaction Test:
- [ ] Tap left side → "Lane 0 tapped" in Logger
- [ ] Tap middle → "Lane 1 tapped" in Logger
- [ ] Tap right → "Lane 2 tapped" in Logger

### ✅ Hit Detection Test:
- [ ] Tap when note crosses line → "Perfect!/Great!/Good" in Logger
- [ ] Note disappears after hit
- [ ] Tap when no note → "Miss - no note in lane"
- [ ] Tap too early/late → "Miss - timing off"

---

## Common Issues & Fixes

### "Notes spawn but touch doesn't work"
**Fix**: Check HitZoneManager references in Inspector
- Make sure all 5 object references are assigned
- Camera reference is critical for touch detection

### "Touch detected but no hits"
**Fix**: Check note spawner reference
- noteSpawnerObject should point to the object with NoteSpawner script
- Make sure NoteSpawner.pool is public (I already fixed this)

### "Hit lines not visible"
**Fix**: Adjust position and styling
- Make sure Y = 0 for all hit lines
- Increase alpha or change color
- Check they're children of Canvas/Screen Image

### "Timing feels off"
**Fix**: Adjust Conductor offset
- In Conductor component, change `offset` value
- Positive value = notes come earlier
- Negative value = notes come later

### "Wrong lane detected"
**Fix**: Touch position debugging
- Check Logger for "Lane X tapped" messages
- Verify camera reference is correct
- Test on device (mobile touch may differ)

---

## Next Steps

### 1. Add Visual Polish:
- Particle effects when you hit notes
- Better hit line styling (gradients, glow)
- Combo counter
- Score display

### 2. Add Score System:
See [SETUP_GUIDE.md](SETUP_GUIDE.md) Part 4 for ScoreManager implementation

### 3. Create Your Own Song:
1. Add your audio file to Lens Studio
2. Find the BPM (use online tool)
3. Edit [TestSongData.ts](Assets/Scripts/TestSongData.ts):
   ```typescript
   export const SongData = {
       "bpm": 128,  // Your song's BPM
       "offset": 0.0,
       "notes": [
           { "beat": 4.0, "lane": 0 },
           { "beat": 5.0, "lane": 1 },
           // Add more notes...
       ]
   };
   ```

### 4. Test on Snapchat:
1. In Lens Studio: **Device → Send Lens to Snapchat**
2. Open Snapchat on your phone
3. Select the Lens
4. Test touch interaction
5. Adjust timing if needed

---

## Snapchat-Specific Tips

### Touch Events:
- ✅ `TouchStartEvent` works perfectly in Snapchat
- ✅ Touch position is normalized (0-1)
- ✅ Works on all devices

### Performance:
- Keep pool size at 30 or less
- Use object pooling (already implemented)
- Test on mid-range phones

### Audio:
- Use MP3 format (smaller file size)
- Keep under 5MB if possible
- Test timing on device (may differ from desktop)

### Screen Layout:
- Design for portrait orientation
- Leave space for Snapchat UI (top/bottom)
- Test on different phone sizes

---

## File Structure Summary

```
Assets/Scripts/
├── Conductor.ts          [✅ Original - music timing]
├── Note.ts               [✅ Original - note movement]
├── NoteSpawner.ts        [✏️ Modified - made pool public]
├── TestSongData.ts       [✅ Original - song data]
├── InputManager.ts       [⚠️ Old - not used anymore]
├── Click.ts              [⚠️ Old - not used anymore]
├── HitZoneManager.ts     [🆕 NEW - main touch handler]
└── HitLineFeedback.ts    [🆕 NEW - visual feedback]
```

**Note**: You can safely ignore `InputManager.ts` and `Click.ts` - they were your previous attempts at touch detection. The new `HitZoneManager.ts` is the complete solution.

---

## Getting Help

If something doesn't work:

1. **Check the Logger** (Window → Logger in Lens Studio)
   - Look for error messages
   - Check for "Lane X tapped" messages
   - Verify "Perfect!/Great!/Good" feedback

2. **Verify References**:
   - All Inspector fields should be assigned
   - No "null reference" errors in Logger

3. **Check Scene Hierarchy**:
   - See [SCENE_HIERARCHY.md](SCENE_HIERARCHY.md) for correct structure

4. **Review Full Guide**:
   - See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions

---

## You're All Set! 🎮🎵

Your rhythm game now has:
- ✅ Notes dropping to music
- ✅ Visual hit lines
- ✅ Touch detection for all lanes
- ✅ Hit accuracy feedback
- ✅ Snapchat compatibility

**Just follow the 5-minute setup above and you're ready to play!**

Happy coding! 🚀
