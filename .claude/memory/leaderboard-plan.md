# Saved Plan: Shared Multiplayer Leaderboard for MusicMaster

**Status**: Planned, not yet implemented
**Branch**: cc-leaderboard

## Overview
Add a shared multiplayer leaderboard using Lens Studio's **ConnectedLensModule** and **RealtimeStoreSystem** that displays top player scores across all connected players.

## Architecture
- Uses `ConnectedLensModule` to create/join multiplayer sessions
- Uses `RealtimeStoreSystem` for shared data storage
- Store: **Unowned** (anyone can edit) + **Persist** persistence

## Files to Create
1. `Assets/Scripts/LeaderboardManager.ts` - Session + data management
2. `Assets/Scripts/LeaderboardUI.ts` - Display panel

## Files to Modify
1. `Assets/Scripts/HitZoneManager.ts` - Add score submission
2. `Assets/Scripts/SongEndDetector.ts` - Trigger leaderboard display

## Scene Setup
- Add ConnectedLensModule asset in Resources
- Create LeaderboardPanel with ScreenTransform + 10 Text entries

## Full Plan Location
See: `C:\Users\CiliaC\.claude\plans\immutable-cooking-catmull.md`
