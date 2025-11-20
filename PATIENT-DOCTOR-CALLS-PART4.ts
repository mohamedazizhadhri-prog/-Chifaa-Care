// PART 4: Data Loading Methods (Conversations and Patients)
// Add these methods to the DoctorMessagesComponentWithCalls class

private loadConversations() {
  console.log('[Doctor Messages] Loading conversations for doctor:', this.currentDoctorId);
  
  if (!this.currentDoctorId) {
    console.error('[Doctor Messages] No doctor ID available!');
    return;
  }
  
  this.messageService.getConversations(this.currentDoctorId).subscribe({
    next: (res) => {
      console.log('[Doctor Messages] API Response:', res);
      console.log('[Doctor Messages] Total conversations loaded:', res.data.conversations.length);
      
      const patientConversations = res.data.conversations.filter((c: any) => {
        const role = (c.role || '').toUpperCase().trim();
        return role === 'PATIENT' || role === 'USER';
      });
      
      console.log('[Doctor Messages] Patient conversations after filter:', patientConversations.length);
      
      if (patientConversations.length === 0) {
        console.warn('[Doctor Messages] No patient conversations found!');
        this.allChats = res.data.conversations.map((c: any) => ({
          id: c.otherUserId,
          patientName: `${c.name} [${c.role}]`,
          lastMessage: c.lastMessage || 'No messages yet',
          lastMessageTime: c.lastMessageTime || new Date().toISOString(),
          unreadCount: c.unreadCount || 0,
          isOnline: false,
          messages: []
        }));
      } else {
        this.allChats = patientConversations.map((c: any) => ({
          id: c.otherUserId,
          patientName: c.name || 'Unknown Patient',
          lastMessage: c.lastMessage || 'No messages yet',
          lastMessageTime: c.lastMessageTime || new Date().toISOString(),
          unreadCount: c.unreadCount || 0,
          isOnline: false,
          messages: []
        }));
      }
      
      this.allChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime).getTime();
        const timeB = new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      });
      
      this.filterChats();
      
      if (this.allChats.length > 0 && !this.selectedChatId) {
        console.log('[Doctor Messages] Auto-selecting first chat:', this.allChats[0].patientName);
        setTimeout(() => {
          this.selectChat(this.allChats[0].id);
        }, 100);
      }
    },
    error: (err) => {
      console.error('[Doctor Messages] Error loading conversations:', err);
    }
  });
}

private loadPatients() {
  console.log('[Doctor Messages] Loading patients...');
  
  this.patientService.getPatients().subscribe({
    next: (list) => {
      this.patients = list || [];
      console.log('[Doctor Messages] Patients loaded:', this.patients.length);
    },
    error: (err) => {
      console.error('[Doctor Messages] Error loading patients:', err);
    }
  });
}

togglePatientPicker() {
  this.showPatientPicker = !this.showPatientPicker;
  if (this.showPatientPicker && this.patients.length === 0) {
    this.loadPatients();
  }
}

startChatWithPatient(p: PatientUser) {
  const patientId = p.id;
  const name = `${p.firstName} ${p.lastName}`.trim() || 'Patient';

  let chat = this.allChats.find(c => c.id === patientId);
  if (!chat) {
    chat = {
      id: patientId,
      patientName: name,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isOnline: false,
      messages: []
    };
    this.allChats.unshift(chat);
    this.filterChats();
  }

  this.showPatientPicker = false;
  this.searchQuery = '';
  this.filterChats();
  this.selectChat(patientId);
}

viewPatientProfile() {
  console.log('[Doctor Messages] Viewing profile of', this.selectedChat?.patientName);
  if (this.selectedChatId) {
    this.router.navigate(['/doctor/patients', this.selectedChatId]);
  }
}

attachFile() {
  console.log('[Doctor Messages] Attach file clicked');
  // TODO: Implement file attachment
}
