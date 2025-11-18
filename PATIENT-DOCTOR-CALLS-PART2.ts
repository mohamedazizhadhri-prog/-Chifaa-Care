// PART 2: Socket Listeners and Messaging Methods
// Add these methods to the DoctorMessagesComponentWithCalls class

private setupSocketListeners() {
  console.log('[Doctor Messages] Setting up socket listeners...');
  
  this.socketService.on<any>('message:new', (m) => {
    if (!m) return;
    console.log('[Doctor Messages] New message received:', m);
    
    const isSelf = m.senderId === this.currentDoctorId;
    const isToMe = m.recipientId === this.currentDoctorId;
    if (!isSelf && !isToMe) return;

    const now = Date.now();
    if (isSelf && (now - this.lastMessageSentTime) < 2000) {
      console.log('[Doctor Messages] Ignoring own message from socket (just sent)');
      return;
    }

    const otherId = isSelf ? m.recipientId : m.senderId;
    const mapped: Message = {
      id: m.id,
      senderId: m.senderId,
      recipientId: m.recipientId,
      text: m.content,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: m.isRead || false,
      senderName: isSelf ? 'You' : (m.senderName || 'Patient')
    };

    if (this.selectedChatId === otherId && this.selectedChat) {
      const exists = this.selectedChat.messages.some((msg: Message) => msg.id === mapped.id);
      if (!exists) {
        this.selectedChat.messages.push(mapped);
        this.selectedChat.lastMessage = mapped.text;
        this.selectedChat.lastMessageTime = new Date().toISOString();
        this.shouldScrollToBottom = true;
        
        if (isToMe && !isSelf) {
          this.messageService.markThreadRead(this.currentDoctorId, otherId).subscribe();
        }
      }
    } else {
      const chat = this.allChats.find(c => c.id === otherId);
      if (chat) {
        if (isToMe && !isSelf) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
        chat.lastMessage = m.content;
        chat.lastMessageTime = new Date().toISOString();
        
        this.allChats = [chat, ...this.allChats.filter(c => c.id !== otherId)];
        this.filterChats();
      } else if (isToMe && !isSelf) {
        this.loadConversations();
      }
    }
  });

  this.socketService.on<any>('presence:update', (p: { userId: string; online: boolean }) => {
    const chat = this.allChats.find(c => c.id === p.userId);
    if (chat) {
      chat.isOnline = p.online;
      if (this.selectedChat && this.selectedChat.id === p.userId) {
        this.selectedChat.isOnline = p.online;
      }
    }
  });

  this.socketService.on<any>('message:read', (data: { userId: string; otherUserId: string }) => {
    if (data.otherUserId === this.currentDoctorId && this.selectedChat?.id === data.userId) {
      this.selectedChat.messages.forEach((msg: Message) => {
        if (msg.senderId === this.currentDoctorId) {
          msg.isRead = true;
        }
      });
    }
  });
}

sendMessage() {
  if (!this.newMessage.trim() || !this.selectedChat || !this.currentDoctorId || !this.selectedChatId) {
    return;
  }
  
  const content = this.newMessage.trim();
  const tempId = `temp-${Date.now()}`;
  
  this.lastMessageSentTime = Date.now();
  
  const tempMessage: Message = {
    id: tempId,
    senderId: this.currentDoctorId,
    recipientId: this.selectedChatId,
    text: content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    senderName: 'You'
  };
  
  this.selectedChat.messages.push(tempMessage);
  this.selectedChat.lastMessage = content;
  this.selectedChat.lastMessageTime = new Date().toISOString();
  this.shouldScrollToBottom = true;
  
  const messageToSend = this.newMessage;
  this.newMessage = '';
  
  this.messageService.sendMessage(this.currentDoctorId, this.selectedChatId, content).subscribe({
    next: (res) => {
      const m = res.data.message;
      const index = this.selectedChat!.messages.findIndex((msg: Message) => msg.id === tempId);
      if (index !== -1) {
        this.selectedChat!.messages[index] = {
          id: m.id,
          senderId: m.senderId,
          recipientId: m.recipientId,
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: m.isRead,
          senderName: 'You'
        };
      }
    },
    error: (err) => {
      console.error('[Doctor Messages] Error sending message:', err);
      const index = this.selectedChat!.messages.findIndex((msg: Message) => msg.id === tempId);
      if (index !== -1) {
        this.selectedChat!.messages.splice(index, 1);
      }
      this.newMessage = messageToSend;
      this.lastMessageSentTime = 0;
      alert('Failed to send message. Please try again.');
    }
  });
}

selectChat(chatId: string) {
  console.log('[Doctor Messages] Selecting chat:', chatId);
  this.selectedChatId = chatId;
  this.selectedChat = this.allChats.find(chat => chat.id === chatId) || null;
  
  if (!this.selectedChat || !this.currentDoctorId) return;
  this.loadMessages(chatId);
  
  if (this.selectedChat.unreadCount > 0) {
    this.messageService.markThreadRead(this.currentDoctorId, chatId).subscribe(() => {
      if (this.selectedChat) {
        this.selectedChat.unreadCount = 0;
      }
    });
  }
  
  setTimeout(() => {
    this.messageInput?.nativeElement.focus();
  }, 100);
}

private loadMessages(chatId: string) {
  if (this.isLoadingMessages) return;
  this.isLoadingMessages = true;
  
  this.messageService.getThread(this.currentDoctorId, chatId).subscribe({
    next: (res) => {
      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        text: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: m.isRead,
        senderName: m.senderId === this.currentDoctorId ? 'You' : this.selectedChat?.patientName
      }));
      
      if (this.selectedChat && this.selectedChat.id === chatId) {
        this.selectedChat.messages = mapped;
        this.shouldScrollToBottom = true;
      }
      this.isLoadingMessages = false;
    },
    error: (err) => {
      console.error('[Doctor Messages] Error loading messages:', err);
      this.isLoadingMessages = false;
    }
  });
}

// Utility methods
filterChats() {
  if (!this.searchQuery.trim()) {
    this.filteredChats = [...this.allChats];
  } else {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredChats = this.allChats.filter(chat => 
      chat.patientName.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    );
  }
}

formatTime(time: string): string {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

getUnreadCount(): number {
  return this.allChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
}

private scrollToBottom() {
  try {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  } catch (err) {
    console.error('[Doctor Messages] Error scrolling:', err);
  }
}

getPatientName(userId: string | null): string {
  if (!userId) return 'Unknown';
  const chat = this.allChats.find(c => c.id === userId);
  return chat ? chat.patientName : 'Unknown Patient';
}
