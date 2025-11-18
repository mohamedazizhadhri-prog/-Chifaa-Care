# Calling Feature Testing Checklist

## Pre-Testing Setup

### Requirements
- [ ] Backend server running
- [ ] Socket.io server active
- [ ] Two doctor accounts created
- [ ] Both accounts logged in (different browsers/windows)
- [ ] Microphone connected and working
- [ ] Camera connected and working (for video tests)
- [ ] Good internet connection

### Browser Setup
- [ ] Test in Chrome (primary)
- [ ] Test in Firefox
- [ ] Test in Safari (if on macOS)
- [ ] Test in Edge
- [ ] Browser console open (F12) for error checking

---

## Test Cases

### 1. UI Elements Visibility ✅

#### Test: Call Buttons Visible
- [ ] Open doctor messages page
- [ ] Select a conversation
- [ ] Verify green phone button visible in header
- [ ] Verify blue video button visible in header
- [ ] Verify buttons have tooltips on hover
- [ ] Verify buttons have hover effects (scale, shadow)

**Expected Result**: Two circular buttons (green & blue) clearly visible in chat header

---

### 2. Voice Call - Outgoing ✅

#### Test: Initiate Voice Call
- [ ] Click green phone button
- [ ] Verify button becomes disabled
- [ ] Verify "Calling..." badge appears
- [ ] Verify animated phone icon in badge
- [ ] Check console for `call:request` event
- [ ] Browser should prompt for microphone permission (first time)

**Expected Result**: 
- "Calling..." indicator shows
- Button disabled
- Waiting for other doctor to accept

---

### 3. Voice Call - Incoming ✅

#### Test: Receive Voice Call
- [ ] Doctor A initiates call to Doctor B
- [ ] On Doctor B's screen, verify animated banner appears
- [ ] Banner shows: "📞 Incoming audio call from Dr. [Name]"
- [ ] Banner has pulsing animation
- [ ] Phone emoji has ringing animation
- [ ] Two buttons visible: "Accept" (green) and "Decline" (red)

**Expected Result**: 
- Prominent animated banner at top
- Clear call type and caller name
- Two action buttons

---

### 4. Voice Call - Accept ✅

#### Test: Accept Incoming Call
- [ ] Click "Accept" button on incoming call banner
- [ ] Banner disappears
- [ ] Call panel appears
- [ ] "In Call" badge shows (green with pulsing icon)
- [ ] Audio streams connect
- [ ] Can hear other doctor
- [ ] Other doctor can hear you
- [ ] "End Call" button visible

**Expected Result**: 
- Successful audio connection
- Two-way audio working
- Clear call UI

---

### 5. Voice Call - Decline ✅

#### Test: Decline Incoming Call
- [ ] Doctor A calls Doctor B
- [ ] Doctor B clicks "Decline"
- [ ] Banner disappears immediately
- [ ] On Doctor A's side: "Calling..." stops
- [ ] Call doesn't connect
- [ ] Buttons return to enabled state

**Expected Result**: 
- Call rejected cleanly
- No connection made
- UI resets properly

---

### 6. Video Call - Outgoing ✅

#### Test: Initiate Video Call
- [ ] Click blue video button
- [ ] Browser prompts for camera AND microphone permissions (first time)
- [ ] Allow both permissions
- [ ] Verify "Calling..." badge appears
- [ ] Check console for `call:request` with media: 'video'

**Expected Result**: 
- Permission prompts (first time)
- Calling indicator shows
- Waiting for answer

---

### 7. Video Call - Incoming ✅

#### Test: Receive Video Call
- [ ] Doctor A initiates video call
- [ ] On Doctor B's screen, banner shows: "Incoming video call"
- [ ] Note "video" is mentioned in banner text
- [ ] Accept/Decline buttons visible

**Expected Result**: 
- Banner clearly states "video call"
- Same acceptance flow as voice

---

### 8. Video Call - Accept ✅

#### Test: Accept Video Call
- [ ] Click "Accept"
- [ ] Call panel appears with video section
- [ ] Local video stream shows (your camera)
- [ ] Remote video stream shows (other doctor's camera)
- [ ] Videos displayed in grid (side by side)
- [ ] Local video is mirrored (selfie view)
- [ ] Can see other doctor
- [ ] Can hear other doctor
- [ ] Other doctor can see and hear you

**Expected Result**: 
- Both video streams working
- Audio working
- Clean video UI

---

### 9. End Call ✅

#### Test: End Call from Either Side
- [ ] During active call, click "End Call" button
- [ ] Call panel disappears
- [ ] Video/audio streams stop
- [ ] Status indicator disappears
- [ ] Call buttons return to enabled state
- [ ] Can start new call immediately
- [ ] Other doctor's call ends too

**Expected Result**: 
- Clean disconnect
- UI resets
- Can make new calls

---

### 10. Call States ✅

#### Test: Button States
- [ ] **Idle**: Buttons enabled, no badges
- [ ] **Dialing**: Buttons disabled, "Calling..." badge
- [ ] **In Call**: Buttons disabled, "In Call" badge
- [ ] **Call Ended**: Buttons re-enabled, badges removed

**Expected Result**: 
- Proper state management
- Clear visual feedback

---

### 11. Multiple Call Scenarios ✅

#### Test: Sequential Calls
- [ ] Make call, end it
- [ ] Make another call immediately
- [ ] Accept incoming call, end it
- [ ] Make another call
- [ ] Verify no leftover state issues

**Expected Result**: 
- Can make multiple calls in sequence
- No memory leaks or stuck states

---

### 12. Error Scenarios ⚠️

#### Test: Offline Doctor
- [ ] Doctor B goes offline
- [ ] Doctor A tries to call Doctor B
- [ ] Verify appropriate handling

**Expected**: Graceful failure (may need improvement)

#### Test: Permission Denied
- [ ] Click call button
- [ ] Deny microphone/camera permission
- [ ] Verify error handling

**Expected**: Error message or cleanup

#### Test: Network Issues
- [ ] Start call
- [ ] Disconnect internet briefly
- [ ] Verify call handling

**Expected**: Call drops, UI resets

---

### 13. UI/UX Tests ✅

#### Test: Animations
- [ ] "Calling..." phone icon shakes
- [ ] "In Call" icon pulses
- [ ] Incoming banner has pulsing shadow
- [ ] Phone emoji in banner rotates (rings)
- [ ] Button hover effects work (scale, shadow)
- [ ] Status badges fade in smoothly

**Expected Result**: 
- Smooth, professional animations
- No janky movements

#### Test: Responsive Design
- [ ] Test on different screen sizes
- [ ] Buttons remain accessible
- [ ] Call panel adapts to screen

**Expected Result**: 
- Works on various screen sizes

---

### 14. Console Checks ✅

#### Test: No Console Errors
- [ ] Open browser console (F12)
- [ ] Make a call
- [ ] Accept a call
- [ ] End a call
- [ ] Check for errors

**Expected Result**: 
- No errors in console
- Only info/debug logs

---

### 15. Cross-Browser Testing ✅

#### Test: Multiple Browsers
- [ ] Chrome to Chrome
- [ ] Chrome to Firefox
- [ ] Firefox to Chrome
- [ ] Safari to Chrome (if available)
- [ ] Edge to Chrome

**Expected Result**: 
- Calls work across browsers
- Video/audio compatible

---

## Performance Tests

### 16. Performance Metrics

#### Test: Call Setup Time
- [ ] Click call button
- [ ] Time until "Calling..." appears
- [ ] Should be instant (<100ms)

#### Test: Connection Time
- [ ] Accept call
- [ ] Time until audio/video starts
- [ ] Should be quick (<2-3 seconds)

#### Test: Memory Usage
- [ ] Monitor browser memory
- [ ] Make several calls
- [ ] End calls
- [ ] Verify no memory leaks

**Expected Result**: 
- Fast responses
- No memory issues

---

## Accessibility Tests

### 17. Keyboard Navigation

#### Test: Tab Navigation
- [ ] Use Tab key to navigate
- [ ] Can reach call buttons
- [ ] Can use Enter to activate
- [ ] Can navigate incoming call buttons

**Expected Result**: 
- Full keyboard accessibility

### 18. Screen Reader

#### Test: Screen Reader Support
- [ ] Enable screen reader
- [ ] Navigate to call buttons
- [ ] Verify button labels are read
- [ ] Status badges have readable text

**Expected Result**: 
- Accessible to screen readers

---

## Edge Cases

### 19. Rapid Actions

#### Test: Quick Clicks
- [ ] Click call button rapidly multiple times
- [ ] Verify only one call initiates
- [ ] No duplicate calls

**Expected Result**: 
- Proper rate limiting

### 20. Page Refresh During Call

#### Test: Refresh Page
- [ ] Start a call
- [ ] Refresh page (F5)
- [ ] Verify call ends cleanly
- [ ] No stuck state

**Expected Result**: 
- Clean disconnect on refresh

---

## Final Checklist

### Documentation Review
- [ ] README updated
- [ ] User guide created
- [ ] Technical docs accurate
- [ ] Changelog updated

### Code Review
- [ ] No console.log spam
- [ ] Proper error handling
- [ ] Code comments adequate
- [ ] No hardcoded values

### Deployment Readiness
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed

---

## Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1      | UI Visibility | ✅/❌ | |
| 2      | Voice Out | ✅/❌ | |
| 3      | Voice In | ✅/❌ | |
| ...    | ... | ... | |

Overall Status: ✅ PASS / ❌ FAIL
Issues Found: _________
```

---

## Issues to Report

If any test fails, report:
1. **Test number and name**
2. **Browser and version**
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Console errors (if any)**
6. **Screenshots/video**

---

## Sign-off

- [ ] All critical tests passed
- [ ] Documentation complete
- [ ] Ready for deployment

**Tested by**: ___________
**Date**: ___________
**Signature**: ___________
