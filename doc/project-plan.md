# AI Music Beat Game - Project Plan

## Overview

An AI-powered music beat game built for the **Play Everywhere: Build with Snap Games Lensathon**.

- **Category:** 2D Games
- **Platform:** Lens Studio → Snapchat
- **Deadline:** February 2, 2026 @ 11:45pm PST
- **Prize Pool:** $30,000 total

## Team

| Role | Responsibility |
|------|----------------|
| Dev 1 | AI/backend services & cloud storage |
| Dev 2 | Core gameplay & Lens Studio integration |
| Artist | All visual assets & UI/UX design |

## Game Concept

- Users generate AI music based on their input
- Beat map is automatically generated from the music
- Players tap to the rhythm for points
- Generated games can be shared with friends
- Leaderboard tracks high scores per song
- **PvP mode:** Challenge friends to real-time battles

---

# Feature Priority

## 🔴 Core Features (Must Have)
- AI music generation from user input
- Beat detection & beat map generation
- Rhythm gameplay (tap to beat)
- Scoring system
- Leaderboard integration
- Share songs with friends
- **Offline/Solo mode** with pre-generated tracks (no internet needed to play)

## 🟡 PvP Mode (High Priority)
- Real-time 1v1 battles on same song
- Live opponent score display
- End-game comparison
- Uses Sync Framework (built-in)

## 🟢 Song Library (OPTIONAL - Stretch Goal)
- Browse previously generated songs
- Filter by genre, popularity, creator
- Play count tracking
- **Only implement if ahead of schedule**

---

# Lens Studio Built-in Features (Use These!)

## Leaderboard Component ✅
**No backend needed!** Lens Studio provides a complete leaderboard solution:
- Add from Asset Library → Custom Components → Leaderboard Component
- Includes Score Widget (compact banner showing top 3 friends)
- Bitmoji avatars and real-time rankings
- API: `submitScoreAsync(score)`, `show()`, `hide()`
- Automatic friend rankings built-in

**LeaderboardInfo** - Headless version if you want custom UI with dynamic tags like `{currentUserScore}`, `{displayName[0]}`, etc.

> ⚠️ **Note:** Using leaderboard restricts some APIs (location, mic access, birthdate). Plan accordingly.

## Remote Service Module (for AI API calls) ✅
- Call external APIs directly from Lens Studio
- Use for AI music generation API calls
- **Limit:** ~800KB response size, keep to 1-3 concurrent calls
- Pattern: `RemoteApiRequest.create()` → `performApiRequest()`

## Remote Assets (for dynamic audio) ✅
- Load audio at runtime from Lens Cloud
- **Limit:** 10MB per asset, 500MB per organization
- Does NOT count toward Lens size limit
- Must upload to Lens Cloud first (not arbitrary URLs)
- Use `RemoteReferenceAsset.downloadAsset()` to load

## Connected Lenses / Sync Framework (for PvP) ✅
- Share via invitation (opens friend list) or Snapcode
- Up to 64 participants per session
- Sync Framework component for multiplayer state
- Real-time data sync between players
- Games now integrated into Chat drawer

## Audio Component
- Supports MP3 format
- Recommend: mono, <15 seconds for optimization
- Can play multiple sounds simultaneously
- Spatial audio available if needed

---

# 5-Weekend Development Plan

## Weekend 1: Research & Foundation

### All Team
- Set up Lens Studio, run sample projects (especially Platformer Game sample)
- Finalize game concept: tap circles, rhythm lane, or other mechanic?
- **Test the Leaderboard Component** - add it to a test project, verify it works
- **Test Sync Framework** - simple data sync between two devices
- Define AI music generation approach

### Dev 1
- Research AI music generation APIs (Suno, Udio, Mubert)
  - Check output format, latency, cost
  - Test if response fits Remote Service Module limits (~800KB)
- Research beat detection (librosa, Essentia) - will run server-side
- Set up backend (Firebase/Supabase) for storing generated tracks

### Dev 2
- Build basic 2D scene in Lens Studio
- Implement tap detection using Touch Input
- **Test Remote Service Module** - make a simple API call
- **Test Remote Assets** - upload and load a test audio file
- **Test Sync Framework** - sync a simple variable between devices
- Understand Audio Component playback

### Artist
- Create mood boards and art direction
- Design core visual elements: background, tap targets, UI mockups
- Design PvP UI mockups (opponent score display, vs screen)
- Export test assets in Lens Studio compatible formats

**Deliverable:** Working tap prototype + successful Remote Assets audio test + Leaderboard Component added + Sync Framework tested + AI API chosen

---

## Weekend 2: Core Gameplay Loop

### Dev 1
- Build AI music generation pipeline on backend:
  - Endpoint: receive user input → call AI API → get audio
  - Run beat detection on generated audio → extract timestamps
  - Upload audio to Lens Cloud as Remote Asset
  - Return: Remote Asset ID + beat map JSON

### Dev 2
- Implement beat map system:
  - Parse beat timestamps from backend
  - Spawn tap targets synced to beats
- Build scoring system (timing accuracy → points)
- Integrate with Leaderboard Component:
  - Call `submitScoreAsync(score)` on game end
  - Show Score Widget during gameplay
- **Start PvP foundation:**
  - Set up Sync Framework in project
  - Sync player scores in real-time (basic)

### Artist
- Create game assets: tap targets (normal, hit, miss states)
- Design background/environment art
- Create UI elements: score display, combo counter, multiplier
- Create PvP elements: opponent score bar, "VS" graphics

**Deliverable:** Playable rhythm game with hardcoded beat map + Leaderboard working + AI pipeline on backend + basic score sync working

---

## Weekend 3: Integration & PvP

### Dev 1
- Complete backend API:
  - Generate music → detect beats → upload to Lens Cloud → return asset ID
- Implement song storage with unique IDs
- Create API endpoint for fetching existing songs by ID
- Test end-to-end flow from Lens Studio

### Dev 2
- Integrate Remote Service Module to call backend
- Load audio dynamically via Remote Assets
- Connect everything: user input → generate → load → play → score
- **Complete PvP mode:**
  - Session creation (invite friend)
  - Synchronized game start (countdown)
  - Real-time score sync during gameplay
  - Display opponent's score/combo live
- Test sharing via Snapchat's native share (Lens link)

### Artist
- Create main menu UI (Generate new vs Play offline tracks)
- Create generation UI (genre/mood selection)
- Design loading states (while AI generates)
- Design results/game-over screen
- **Create PvP screens:**
  - Invite/waiting for friend screen
  - Countdown screen
  - In-game opponent display
  - PvP results comparison screen
- Add polish: animations, transitions

**Deliverable:** End-to-end flow working + PvP mode functional

---

## Weekend 4: Polish & Optional Features

### Dev 1
- **Offline/Solo mode:** Bundle 5-10 pre-generated tracks with beat maps
  - These load instantly without API calls
  - Good for demo, offline play, or when AI generation is slow
- Optimize backend performance
- Handle edge cases (API failures, timeouts)
- 🟢 **OPTIONAL:** Implement song library API endpoints
- 🟢 **OPTIONAL:** Add metadata to songs (creator name, genre, play count)

### Dev 2
- Implement offline track selection UI (pick from bundled songs)
- Polish leaderboard integration:
  - Show leaderboard after game ends
  - Customize Score Widget appearance if needed
- **Polish PvP:**
  - Handle disconnections gracefully
  - Add rematch option
  - Test latency edge cases
- Performance optimization (preload assets, smooth animations)
- Bug fixing from playtesting
- 🟢 **OPTIONAL:** Implement song library UI (browse songs)

### Artist
- Final art polish on all screens
- Add juice: particles, screen shake, visual flair
- Create tutorial/onboarding visuals
- Prepare assets for demo video
- 🟢 **OPTIONAL:** Design song library browse screen

**Deliverable:** Feature-complete game with polished PvP, sharing, and leaderboard (+ song library if time permits)

---

## Weekend 5: Testing, Submission & Marketing

### All Team
- Extensive playtesting, bug fixing
- Test on multiple devices / Snapchat versions
- **Test PvP with real friends** on different networks
- Prepare submission materials

### Dev 1
- Backend stability checks
- Monitor for any issues
- Ensure Lens Cloud assets are properly uploaded
- Backup/recovery procedures

### Dev 2
- Final bug fixes
- Publish Lens to Snapchat (public)
- Test the published Lens end-to-end
- Verify leaderboard, sharing, and PvP work in production

### Artist
- Create demo video for submission (showcase PvP!)
- Make promotional assets (thumbnails, screenshots)
- Final UI tweaks based on testing feedback

**Deliverable:** Published game on Snapchat + Devpost submission complete

---

# Technical Architecture

## Lens Studio Components to Use

| Component | Purpose |
|-----------|---------|
| Leaderboard Component | Score tracking, friend rankings (built-in!) |
| Sync Framework | PvP real-time sync (built-in!) |
| Remote Service Module | Call backend AI API |
| Remote Assets | Load generated audio at runtime |
| Audio Component | Play music |
| Touch Input | Detect taps |
| Canvas + Orthographic Camera | 2D game rendering |

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVER                            │
└─────────────────────────────────────────────────────────────────┘

Endpoints:
  POST /generate
    Input: { genre, mood, tempo }
    Process:
      1. Call AI Music API (Suno/Udio/Mubert)
      2. Run beat detection (librosa)
      3. Upload audio to Lens Cloud
      4. Store metadata in database
    Output: { songId, remoteAssetId, beatMap }

  GET /song/:id
    Output: { remoteAssetId, beatMap, metadata }

  🟢 OPTIONAL:
  GET /songs
    Output: List of available songs (for song library)

  GET /songs?genre=xxx&sort=popular
    Output: Filtered/sorted song list
```

## PvP Architecture (Sync Framework)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PvP SYNC DATA                               │
└─────────────────────────────────────────────────────────────────┘

Synced Properties:
  - playerScore: number      (updates on each hit)
  - playerCombo: number      (current combo count)
  - isReady: boolean         (for synchronized start)
  - gameState: string        (waiting/playing/finished)

Flow:
  1. Player 1 creates session, invites Player 2
  2. Both players load same song (by songId)
  3. Both set isReady = true
  4. Countdown syncs, game starts simultaneously
  5. Scores sync in real-time during gameplay
  6. Game ends → show comparison screen
```

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. CREATE/SELECT MODE
   User chooses:
   [A] Generate new song (select genre/mood)
       ↓
       Lens calls backend via Remote Service Module
       ↓
       Backend: AI Music API → Beat Detection → Upload to Lens Cloud
       ↓
       Return: Song ID + Beat Map

   [B] Play offline/bundled track (no internet needed)
       ↓
       Load pre-bundled audio + beat map instantly

   Then:
   [Solo] Start game immediately
   [PvP]  Invite friend → Wait for join → Countdown → Start

2. PLAY MODE
   Audio plays + Beat targets spawn synced to timestamps
       ↓
   User taps targets → Score calculated
       ↓
   [PvP] Score syncs to opponent in real-time
       ↓
   Game ends → submitScoreAsync(score) to Leaderboard
       ↓
   [Solo] Show results + Leaderboard
   [PvP]  Show head-to-head comparison + Rematch option

3. SHARE MODE
   User shares Lens via Snapchat (native sharing)
       ↓
   Friend opens Lens → Can play same songs or start PvP
       ↓
   Compete on shared leaderboard
```

---

# Key Technical Decisions

| Decision | Recommendation |
|----------|----------------|
| AI Music API | Suno API (best quality) or Mubert (faster, cheaper) |
| Beat Detection | librosa (Python) - run on backend |
| Backend | Firebase Functions + Firestore (easy Lens Cloud integration) |
| Audio Format | MP3, mono, keep clips short for fast loading |
| Sharing | Native Snapchat Lens sharing (simplest) |
| PvP Sync | Sync Framework (built-in, handles networking) |

---

# Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| AI music API latency | Pre-generate popular tracks; show loading animation |
| Remote Asset upload complexity | Test in Weekend 1; have manual upload fallback |
| Beat detection accuracy | Test early; allow manual adjustment of sensitivity |
| Audio file size | Compress to MP3, mono, reasonable bitrate |
| Leaderboard API restrictions | Don't rely on mic/location - not needed for this game |
| PvP latency/desync | Sync Framework handles prediction; test early |
| PvP disconnection | Show "opponent disconnected" message; award win |

---

# What's Simplified by Lens Studio

| Feature | Before (Custom) | After (Built-in) |
|---------|-----------------|------------------|
| Leaderboard | Build backend, UI, auth | Just add component ✅ |
| Score submission | Custom API | `submitScoreAsync()` ✅ |
| Friend rankings | Complex social graph | Automatic ✅ |
| Sharing | Deep links, QR codes | Native Snapchat share ✅ |
| Audio loading | Custom streaming | Remote Assets ✅ |
| PvP networking | WebSockets, state sync | Sync Framework ✅ |
| PvP invites | Custom invite system | Built-in friend invite ✅ |

---

# Judging Criteria Alignment

| Criteria | How We Score |
|----------|-------------|
| **Technological Implementation** | AI music generation, beat detection, PvP sync, Remote Service Module |
| **Design** | Clean 2D art, intuitive tap mechanics, satisfying feedback, PvP UI |
| **Fun** | Rhythm games + AI variety + friend competition + live PvP battles |
| **Idea Quality** | AI-generated personalized music games with real-time PvP is novel |

---

# Submission Checklist

- [ ] Game published publicly on Snapchat
- [ ] Lens link obtained
- [ ] Demo video created and uploaded (include PvP footage!)
- [ ] Devpost submission completed
- [ ] All team members listed
- [ ] Category selected (2D Games)
- [ ] Description and screenshots added
- [ ] Test leaderboard works in production
- [ ] Test sharing works in production
- [ ] Test PvP works in production
- [ ] 🟢 OPTIONAL: Song library feature included

---

# Resources

- [Lens Studio Documentation](https://developers.snap.com/lens-studio)
- [Leaderboard Component Guide](https://developers.snap.com/lens-studio/features/user-context/leaderboard)
- [LeaderboardInfo Component](https://developers.snap.com/lens-studio/features/games/leaderboard-info)
- [Remote Service Module](https://developers.snap.com/lens-studio/features/remote-apis/remote-service-module)
- [Remote Assets Overview](https://developers.snap.com/lens-studio/features/lens-cloud/remote-assets-overview)
- [Audio Component](https://developers.snap.com/lens-studio/features/audio/playing-audio)
- [Connected Lenses / Sync Framework](https://developers.snap.com/lens-studio/features/connected-lenses/connected-lenses-templates/sync-framework)
- [Snap Games Lensathon](https://snapgames.devpost.com/)
