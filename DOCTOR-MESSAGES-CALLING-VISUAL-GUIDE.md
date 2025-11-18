# Visual Guide: Doctor Calling Feature

## Location
The calling buttons are located in the **chat header** next to the doctor's name, on the right side.

```
┌─────────────────────────────────────────────────────────────┐
│ [Doctor Avatar] Dr. John Smith                  🟢📞  🔵📹 │
│                 ● Online                                     │
└─────────────────────────────────────────────────────────────┘
```

## Button Overview

### 1. Voice Call Button (Green Phone Icon)
- **Color**: Green gradient
- **Icon**: Phone (📞)
- **Action**: Starts audio-only call
- **Tooltip**: "Start voice call"

### 2. Video Call Button (Blue Video Icon)
- **Color**: Blue gradient  
- **Icon**: Video camera (📹)
- **Action**: Starts video + audio call
- **Tooltip**: "Start video call"

## Call States

### Idle State (No Call)
```
┌────────────────────────────────────────────┐
│ Chat Header                    [🟢] [🔵]  │
└────────────────────────────────────────────┘
Both buttons are active and clickable
```

### Dialing State (Calling...)
```
┌────────────────────────────────────────────────────────────┐
│ Chat Header              [🟢] [🔵]  ⚠️ 📞 Calling...      │
└────────────────────────────────────────────────────────────┘
Buttons are disabled, animated "Calling..." indicator shown
```

### Active Call State (In Call)
```
┌────────────────────────────────────────────────────────────┐
│ Chat Header              [🟢] [🔵]  ✅ 📞 In Call         │
└────────────────────────────────────────────────────────────┘
Buttons are disabled, "In Call" indicator shown

┌────────────────────────────────────────────┐
│ Call Panel - AUDIO                         │
│ ┌──────────────┐ ┌──────────────┐         │
│ │ Your Video   │ │ Their Video  │         │
│ └──────────────┘ └──────────────┘         │
│         [End Call] 🔴                      │
└────────────────────────────────────────────┘
```

### Incoming Call Banner
```
┌─────────────────────────────────────────────────────────────┐
│ 📞 Incoming audio call from Dr. Sarah Johnson              │
│                            [✅ Accept]    [❌ Decline]      │
└─────────────────────────────────────────────────────────────┘
Animated banner with pulsing effect and ringing phone icon
```

## User Flow

### Scenario 1: Making a Call
1. Doctor A opens chat with Doctor B
2. Doctor A sees call buttons in header
3. Doctor A clicks green button for voice OR blue button for video
4. "Calling..." indicator appears
5. Doctor B receives incoming call banner
6. Doctor B clicks "Accept"
7. Call connects, call panel appears
8. Both doctors can now communicate
9. Either doctor clicks "End Call" to disconnect

### Scenario 2: Receiving a Call
1. Doctor B is in messages page
2. Doctor A initiates a call
3. Animated banner appears at top: "📞 Incoming [type] call from Dr. [Name]"
4. Doctor B sees two options:
   - **Accept** (Green): Join the call
   - **Decline** (Red): Reject the call
5. If accepted: Call panel appears with streams
6. If declined: Banner disappears

## Important Notes

### Permissions
- When you click a call button for the **first time**, your browser will ask for:
  - **Microphone permission** (required for all calls)
  - **Camera permission** (required for video calls only)
- You must **allow** these permissions for calls to work

### Requirements
- Both doctors must be **online**
- Both doctors must be in the **messages page**
- Good internet connection recommended
- Modern browser with WebRTC support

### Features
- ✅ Real-time audio communication
- ✅ Real-time video communication
- ✅ Call status indicators
- ✅ Easy one-click calling
- ✅ Accept/Decline incoming calls
- ✅ End call anytime

### Not Included (Future)
- ❌ Call recording
- ❌ Call history
- ❌ Screen sharing
- ❌ Mute/unmute controls
- ❌ Camera toggle during call

## Troubleshooting

### "Buttons are disabled/grayed out"
- You might already be in a call
- Wait for current call to end or refresh the page

### "No video/audio"
- Check browser permissions
- Make sure camera/microphone are not in use by another app
- Try refreshing the page
- Check if hardware is properly connected

### "Other doctor can't hear me"
- Check microphone permissions in browser
- Check if microphone is muted in system settings
- Try speaking closer to the microphone

### "Can't see video"
- Check camera permissions in browser
- Make sure camera is not covered
- Ensure good lighting
- Check if camera is being used by another app

## Browser Support
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)
