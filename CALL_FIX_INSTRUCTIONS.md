# WebRTC Call Fix - Complete Instructions

## Issues Identified

1. **Missing offer/answer flow in doctor component** - The call:offer emission is missing the proper recipient ID
2. **ICE candidate signaling** - Using callId instead of proper user IDs in some places
3. **Call acceptance flow** - Need to ensure proper sequencing

## Fix Implementation

I'll fix both components to ensure calls work properly for both patients and doctors.

### Key Changes:

1. **Patient Component**: Already has correct implementation, just needs verification
2. **Doctor Component**: Needs fixes in:
   - `call:offer` emission to include fromUserId and toUserId
   - `call:ice-candidate` to use proper user IDs when callId not available
   - Ensure proper flow in `call:accepted` handler

### Testing Steps After Fix:

1. **Patient to Doctor Call**:
   - Patient clicks "Request Call" → "Voice only" or "Video + Voice"
   - Patient should see "Ringing..." indicator
   - Doctor should see incoming call banner
   - Doctor clicks "Accept"
   - Both should connect and see/hear each other

2. **Doctor to Patient Call**:
   - Doctor clicks "Request Call" → "Voice only" or "Video + Voice"
   - Doctor should see "Ringing..." indicator
   - Patient should see incoming call banner
   - Patient clicks "Accept"
   - Both should connect and see/hear each other

3. **Call Decline**:
   - Start a call from either side
   - Recipient clicks "Decline"
   - Caller should see call ended
   - Both return to normal chat

4. **Call End**:
   - Start a successful call
   - Either party clicks "End"
   - Call should end for both
   - Chat message should show call duration

## Common Issues & Solutions

### Issue: No Ringing
**Solution**: Check browser permissions for microphone/camera

### Issue: Call connects but no audio/video
**Solution**: 
- Verify tracks are being added to peer connection
- Check browser console for getUserMedia errors
- Ensure HTTPS is being used

### Issue: Connection fails immediately
**Solution**:
- Add TURN server for production use
- Check firewall settings
- Verify STUN servers are accessible

### Issue: One-way audio/video
**Solution**:
- Check that both sides are adding tracks properly
- Verify ontrack handler is attaching to video elements
- Check remote stream setup

## Browser Compatibility

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Requires https://
- ⚠️ Mobile browsers: May require additional handling

## Production Recommendations

1. **HTTPS Required**: WebRTC requires secure context (HTTPS)
2. **TURN Server**: Recommended for reliable connections across NAT/firewalls
3. **Error Handling**: Already implemented with try-catch blocks
4. **Connection Monitoring**: Already implemented with state change handlers
5. **User Permissions**: Browser will prompt for camera/mic access
