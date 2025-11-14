# Testing Checklist - Doctor Messaging System

## Pre-Testing Setup

### Backend Setup
- [ ] Backend server is running (`npm run dev` in chifaacare-backend)
- [ ] Database is connected and accessible
- [ ] Socket.io server is running (check logs)
- [ ] At least 2 doctor accounts exist in database

### Frontend Setup
- [ ] Frontend dev server is running (`npm start`)
- [ ] Navigate to `http://localhost:4200`
- [ ] Login as a doctor account
- [ ] Navigate to Doctor Portal → Messages

## Phase 1: Basic Messaging Tests

### Test 1.1: View Messages Tab
- [ ] Click "Messages with Doctors" tab
- [ ] Tab switches successfully
- [ ] No console errors appear
- [ ] UI loads properly

### Test 1.2: Doctor List
- [ ] Click "New chat" button
- [ ] Doctor picker dropdown appears
- [ ] Other doctors are listed (not yourself)
- [ ] Doctor names and specializations shown
- [ ] Can close picker by clicking button again

### Test 1.3: Start New Conversation
- [ ] Click on a doctor in the picker
- [ ] Conversation opens in center panel
- [ ] Message input is visible and active
- [ ] Doctor picker closes automatically
- [ ] Conversation appears in left sidebar

### Test 1.4: Send First Message
- [ ] Type a message in the input field
- [ ] Press Enter (or click send button)
- [ ] Message appears in chat area (blue, right-aligned)
- [ ] Message shows in conversation list preview
- [ ] "Just now" timestamp appears
- [ ] No errors in console

### Test 1.5: Receive Message (Dual Browser Test)
**Setup: Open two browser windows**
- Window 1: Doctor A logged in
- Window 2: Doctor B logged in

**Steps:**
- [ ] Doctor A sends message to Doctor B
- [ ] Message appears instantly in Doctor B's window
- [ ] Message is left-aligned (gray) in Doctor B's view
- [ ] Unread count badge appears in Doctor B's sidebar
- [ ] Sound notification plays (optional)

### Test 1.6: Mark Messages as Read
- [ ] Click on conversation with unread messages
- [ ] Messages load in center panel
- [ ] Unread badge disappears from sidebar
- [ ] Read receipts update (✓✓ on sender's side)

### Test 1.7: Search Functionality
- [ ] Type doctor name in search box
- [ ] Conversation list filters in real-time
- [ ] Clear search to show all conversations
- [ ] Search by message content works

## Phase 2: Real-Time Features

### Test 2.1: Online Status
- [ ] Online doctors show green dot
- [ ] Offline doctors show gray dot
- [ ] Status updates when doctors login/logout
- [ ] Status visible in chat header

### Test 2.2: Message Synchronization
- [ ] Send messages from Doctor A
- [ ] Messages appear instantly for Doctor B
- [ ] Send messages from Doctor B
- [ ] Messages appear instantly for Doctor A
- [ ] Messages stay in correct order

### Test 2.3: Multiple Conversations
- [ ] Start conversations with 3 different doctors
- [ ] All conversations appear in sidebar
- [ ] Can switch between conversations
- [ ] Messages stay separated by conversation
- [ ] Unread counts track correctly

## Phase 3: Audio Calling Tests

### Test 3.1: Initiate Audio Call
- [ ] Open a conversation
- [ ] Click "Request Call" button
- [ ] Dropdown menu appears
- [ ] Click "Voice only"
- [ ] "Ringing..." status appears
- [ ] Ringing sound plays
- [ ] Socket event sent (check Network tab)

### Test 3.2: Receive Audio Call
**In second browser window:**
- [ ] Orange banner appears at top
- [ ] Shows "Incoming audio call from [Doctor Name]"
- [ ] Ringing sound plays
- [ ] Accept and Decline buttons visible

### Test 3.3: Accept Audio Call
- [ ] Click "Accept" button
- [ ] Ringing sound stops
- [ ] Call panel appears
- [ ] "AUDIO" badge shows
- [ ] Microphone permission requested
- [ ] Can hear other party
- [ ] "End Call" button visible

### Test 3.4: Audio Call Quality
- [ ] Audio is clear (no distortion)
- [ ] No significant delay
- [ ] Volume is appropriate
- [ ] Both parties can hear each other
- [ ] Can send messages during call

### Test 3.5: End Audio Call
- [ ] Click "End Call" button
- [ ] Call panel closes
- [ ] Microphone stops (indicator disappears)
- [ ] Resources cleaned up
- [ ] Can start another call immediately

### Test 3.6: Decline Audio Call
- [ ] Receive incoming call
- [ ] Click "Decline" button
- [ ] Banner disappears
- [ ] Ringing stops
- [ ] Caller sees "Call declined" (in console)
- [ ] No resources held

## Phase 4: Video Calling Tests

### Test 4.1: Initiate Video Call
- [ ] Open a conversation
- [ ] Click "Request Call"
- [ ] Click "Video + Voice"
- [ ] "Ringing..." appears
- [ ] Ringing sound plays

### Test 4.2: Receive Video Call
- [ ] Orange banner appears
- [ ] Shows "Incoming video call"
- [ ] Ringing sound plays
- [ ] Accept/Decline buttons visible

### Test 4.3: Accept Video Call
- [ ] Click "Accept"
- [ ] Call panel appears
- [ ] "VIDEO" badge shows
- [ ] Camera permission requested
- [ ] Local video appears (left side)
- [ ] Remote video appears (right side)
- [ ] Local video is mirrored
- [ ] Both videos display correctly

### Test 4.4: Video Call Quality
- [ ] Video is clear and smooth
- [ ] Audio is synchronized
- [ ] Frame rate is acceptable (no lag)
- [ ] Both parties visible
- [ ] Can adjust camera if needed

### Test 4.5: During Video Call
- [ ] Can send text messages
- [ ] Messages appear in chat area
- [ ] Chat scrolls properly
- [ ] Video doesn't interrupt
- [ ] All controls responsive

### Test 4.6: End Video Call
- [ ] Click "End Call"
- [ ] Videos stop
- [ ] Camera light turns off
- [ ] Resources released
- [ ] Call panel closes

## Phase 5: Edge Cases & Error Handling

### Test 5.1: Network Issues
- [ ] Disable internet briefly
- [ ] Reconnects automatically
- [ ] Messages queue and send when reconnected
- [ ] Appropriate error messages shown

### Test 5.2: Permission Denied
- [ ] Block microphone permission
- [ ] Appropriate error message
- [ ] Can retry with permissions
- [ ] Doesn't break UI

### Test 5.3: Call Interruption
- [ ] Start a call
- [ ] Close browser tab during call
- [ ] Other party receives "call ended"
- [ ] Resources cleaned up

### Test 5.4: Simultaneous Calls
- [ ] Receive call while in another call
- [ ] Appropriate handling (queue or reject)
- [ ] No conflicts or crashes

### Test 5.5: Long Messages
- [ ] Send very long message (1000+ chars)
- [ ] Message wraps correctly
- [ ] Scrolling works properly
- [ ] No UI breaking

### Test 5.6: Rapid Messaging
- [ ] Send 20 messages quickly
- [ ] All messages appear
- [ ] Correct order maintained
- [ ] No performance issues

## Phase 6: UI/UX Tests

### Test 6.1: Responsive Design
- [ ] Resize browser window
- [ ] Layout adjusts appropriately
- [ ] Mobile view works (< 768px)
- [ ] All features accessible

### Test 6.2: Dark/Light Mode
- [ ] Test in both modes (if applicable)
- [ ] Text is readable
- [ ] Colors contrast properly

### Test 6.3: Keyboard Navigation
- [ ] Tab through interface
- [ ] Can send message with Enter
- [ ] Shift+Enter adds new line
- [ ] Focus indicators visible

### Test 6.4: Visual Feedback
- [ ] Hover effects work
- [ ] Active states clear
- [ ] Loading indicators show
- [ ] Transitions smooth

## Phase 7: Performance Tests

### Test 7.1: Load Time
- [ ] Page loads in < 3 seconds
- [ ] Conversations load quickly
- [ ] No blocking operations

### Test 7.2: Memory Usage
- [ ] Open DevTools → Performance
- [ ] Monitor memory over 5 minutes
- [ ] No memory leaks
- [ ] Memory stabilizes

### Test 7.3: Many Conversations
- [ ] Create 10+ conversations
- [ ] Scrolling is smooth
- [ ] Switching is instant
- [ ] No lag in UI

## Phase 8: Browser Compatibility

### Test 8.1: Chrome
- [ ] All features work
- [ ] Video/audio quality good
- [ ] No console errors

### Test 8.2: Firefox
- [ ] All features work
- [ ] WebRTC functions properly
- [ ] UI renders correctly

### Test 8.3: Safari
- [ ] All features work
- [ ] Permissions work
- [ ] Styles correct

### Test 8.4: Edge
- [ ] All features work
- [ ] No compatibility issues

## Phase 9: Security Tests

### Test 9.1: Authentication
- [ ] Can't access without login
- [ ] Redirects to login if needed
- [ ] Token validation works

### Test 9.2: Authorization
- [ ] Can only see own conversations
- [ ] Can't access other's messages
- [ ] Doctor-only access enforced

### Test 9.3: Input Validation
- [ ] XSS prevention works
- [ ] SQL injection prevented
- [ ] Special characters handled

## Phase 10: Integration Tests

### Test 10.1: With Patient Messages
- [ ] Can switch between tabs
- [ ] Patient messages still work
- [ ] No conflicts

### Test 10.2: With Notifications
- [ ] Notifications appear
- [ ] Badge counts accurate
- [ ] Click opens conversation

### Test 10.3: With Profile
- [ ] Doctor profiles load
- [ ] Specializations show
- [ ] Status updates

## Final Verification

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compiles cleanly
- [ ] Linter passes

### Documentation
- [ ] README.md reviewed
- [ ] Quick Start guide followed
- [ ] Implementation summary read

### Deployment Readiness
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security measures in place

## Test Results Summary

**Total Tests**: ~150+

**Date Tested**: _______________

**Tested By**: _______________

**Pass Rate**: _____% (_____ passed / _____ total)

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Minor Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notes
_____________________________________________________
_____________________________________________________
_____________________________________________________

### Approval
- [ ] Ready for staging
- [ ] Ready for production
- [ ] Needs fixes before deployment

**Approved By**: _______________

**Date**: _______________

---

## Quick Test (5 Minutes)

If you're short on time, run these essential tests:

1. [ ] Login as doctor
2. [ ] Navigate to doctor messages
3. [ ] Start new conversation
4. [ ] Send a message
5. [ ] Receive a message (second browser)
6. [ ] Make an audio call
7. [ ] Make a video call
8. [ ] End call

If all 8 pass, system is functional. Run full tests before production.
