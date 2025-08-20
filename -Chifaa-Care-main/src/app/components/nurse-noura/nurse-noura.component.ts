import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nurse-noura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-noura.component.html',
  styleUrls: ['./nurse-noura.component.scss']
})
export class NurseNouraComponent implements OnInit, OnDestroy {
  isOpen = false;
  messages: Array<{ text: string; sender: 'bot' | 'user' }> = [];
  typing = false;
  inputText = '';
  private readonly CHAT_STORAGE_KEY = 'nurse_noura_chat_history';
  private readonly CHAT_TIMESTAMP_KEY = 'nurse_noura_chat_timestamp';

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') inputElRef!: ElementRef<HTMLInputElement>;

  ngOnInit() {
    console.log('NurseNoura: ngOnInit - Loading chat history...');
    this.loadChatHistory();
    
    // If no chat history exists, show the default welcome message
    if (this.messages.length === 0) {
      console.log('NurseNoura: No chat history found, showing welcome message');
      this.messages = [
        { text: '👋 Hi! I\'m Nurse Noura. How can I help you today?', sender: 'bot' }
      ];
      this.saveChatHistory();
    } else {
      console.log('NurseNoura: Loaded', this.messages.length, 'messages from history');
    }

    // Add window beforeunload listener to save chat state
    window.addEventListener('beforeunload', this.saveChatHistory.bind(this));
    
    // Add visibility change listener to save when tab becomes hidden
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  ngOnDestroy() {
    console.log('NurseNoura: ngOnDestroy - Saving chat history...');
    this.saveChatHistory();
    // Remove the event listeners
    window.removeEventListener('beforeunload', this.saveChatHistory.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  open() {
    this.isOpen = true;
    setTimeout(() => this.inputElRef?.nativeElement.focus(), 200);
  }

  close() {
    this.isOpen = false;
    this.saveChatHistory();
  }

  onSend() {
    const text = this.inputText.trim();
    if (!text) return;
    
    console.log('NurseNoura: Sending message:', text);
    this.messages.push({ text, sender: 'user' });
    this.inputText = '';
    this.scrollToBottom();
    this.saveChatHistory();

    // Simulated bot reply with typing indicator
    this.typing = true;
    this.scrollToBottom();
    setTimeout(() => {
      this.typing = false;
      const botReply = this.generateBotResponse(text);
      console.log('NurseNoura: Bot replying:', botReply);
      this.messages.push({
        text: botReply,
        sender: 'bot'
      });
      this.scrollToBottom();
      this.saveChatHistory();
    }, 900);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.onSend();
    }
  }

  clearChat() {
    console.log('NurseNoura: Clearing chat history');
    this.messages = [
      { text: '👋 Hi! I\'m Nurse Noura. How can I help you today?', sender: 'bot' }
    ];
    this.saveChatHistory();
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      console.log('NurseNoura: Tab hidden, saving chat history...');
      this.saveChatHistory();
    }
  }

  private loadChatHistory() {
    try {
      const savedChat = localStorage.getItem(this.CHAT_STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(this.CHAT_TIMESTAMP_KEY);
      console.log('NurseNoura: Raw saved chat from localStorage:', savedChat);
      console.log('NurseNoura: Chat timestamp:', savedTimestamp);
      
      if (savedChat && savedTimestamp) {
        const parsedChat = JSON.parse(savedChat);
        const timestamp = parseInt(savedTimestamp);
        const now = Date.now();
        const hoursSinceLastChat = (now - timestamp) / (1000 * 60 * 60);
        
        console.log('NurseNoura: Parsed chat history:', parsedChat);
        console.log('NurseNoura: Hours since last chat:', hoursSinceLastChat);
        
        // If chat is less than 24 hours old, load it
        if (Array.isArray(parsedChat) && parsedChat.length > 0 && hoursSinceLastChat < 24) {
          this.messages = parsedChat;
          console.log('NurseNoura: Successfully loaded', this.messages.length, 'messages');
        } else {
          console.log('NurseNoura: Chat is too old or invalid, starting fresh');
          this.messages = [];
        }
      } else {
        console.log('NurseNoura: No saved chat found in localStorage');
        this.messages = [];
      }
    } catch (error) {
      console.error('NurseNoura: Error loading chat history:', error);
      // Fallback to default message if there's an error
      this.messages = [
        { text: '👋 Hi! I\'m Nurse Noura. How can I help you today?', sender: 'bot' }
      ];
    }
  }

  private saveChatHistory() {
    try {
      const chatData = JSON.stringify(this.messages);
      const timestamp = Date.now();
      console.log('NurseNoura: Saving chat history to localStorage:', chatData);
      console.log('NurseNoura: Saving timestamp:', timestamp);
      
      localStorage.setItem(this.CHAT_STORAGE_KEY, chatData);
      localStorage.setItem(this.CHAT_TIMESTAMP_KEY, timestamp.toString());
      console.log('NurseNoura: Chat history saved successfully');
    } catch (error) {
      console.error('NurseNoura: Error saving chat history:', error);
    }
  }

  private scrollToBottom() {
    queueMicrotask(() => {
      const el = this.chatBodyRef?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }

  private generateBotResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Health-related keywords and responses
    if (message.includes('headache') || message.includes('head ache')) {
      return "I understand you're experiencing a headache. Here are some general tips:\n\n• Stay hydrated - drink plenty of water\n• Rest your eyes - take breaks from screens\n• Try gentle neck stretches\n• Consider a light snack if you haven't eaten\n\n⚠️ If it's severe, persistent, or accompanied by other symptoms, please consult a healthcare professional immediately.";
    }
    
    if (message.includes('fever') || message.includes('temperature')) {
      return "Fever can be concerning. Here's what you can do:\n\n• Rest and stay hydrated\n• Monitor your temperature regularly\n• Use cool compresses if comfortable\n• Take acetaminophen if recommended by your doctor\n\n⚠️ Seek immediate medical attention if:\n• Temperature is above 103°F (39.4°C)\n• Fever lasts more than 3 days\n• You have severe symptoms";
    }
    
    if (message.includes('cough') || message.includes('coughing')) {
      return "Coughing can be uncomfortable. Try these remedies:\n\n• Stay hydrated with warm liquids\n• Use honey (for adults and children over 1 year)\n• Try steam inhalation\n• Rest your voice\n• Elevate your head while sleeping\n\n⚠️ Contact a doctor if:\n• Cough persists more than 2 weeks\n• You have difficulty breathing\n• Cough produces blood or colored mucus";
    }
    
    if (message.includes('stomach') || message.includes('nausea') || message.includes('vomiting')) {
      return "Stomach issues can be distressing. Here are some suggestions:\n\n• Stay hydrated with small sips of water\n• Try the BRAT diet: Bananas, Rice, Applesauce, Toast\n• Avoid fatty or spicy foods\n• Rest and avoid sudden movements\n• Ginger tea may help with nausea\n\n⚠️ Seek medical help if:\n• Symptoms are severe or persistent\n• You have signs of dehydration\n• Abdominal pain is severe";
    }
    
    if (message.includes('sleep') || message.includes('insomnia') || message.includes('tired')) {
      return "Sleep is crucial for health. Try these sleep hygiene tips:\n\n• Maintain a regular sleep schedule\n• Create a relaxing bedtime routine\n• Keep your bedroom cool and dark\n• Avoid screens 1 hour before bed\n• Exercise regularly (but not close to bedtime)\n• Limit caffeine after 2 PM\n\n💡 Would you like specific relaxation techniques?";
    }
    
    if (message.includes('stress') || message.includes('anxiety') || message.includes('worried')) {
      return "Managing stress is important for your health. Here are some techniques:\n\n• Deep breathing exercises\n• Progressive muscle relaxation\n• Regular physical activity\n• Mindfulness or meditation\n• Talk to someone you trust\n• Maintain a regular routine\n\n💡 Would you like me to guide you through a breathing exercise?";
    }
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      return "Exercise is excellent for health! Here are some tips:\n\n• Start slowly and gradually increase intensity\n• Aim for 150 minutes of moderate activity weekly\n• Include strength training 2-3 times per week\n• Listen to your body - don't push through pain\n• Stay hydrated during exercise\n• Warm up and cool down properly\n\n💡 What type of exercise interests you?";
    }
    
    if (message.includes('diet') || message.includes('nutrition') || message.includes('food')) {
      return "Good nutrition is key to health. General guidelines:\n\n• Eat a variety of colorful fruits and vegetables\n• Choose whole grains over refined grains\n• Include lean proteins\n• Limit added sugars and processed foods\n• Stay hydrated with water\n• Practice portion control\n\n⚠️ For specific dietary needs, consult a registered dietitian.";
    }
    
    if (message.includes('pain') || message.includes('hurt') || message.includes('sore')) {
      return "Pain can be concerning. Here are some general approaches:\n\n• Rest the affected area\n• Apply ice for acute injuries (first 48 hours)\n• Use heat for chronic pain\n• Gentle stretching if appropriate\n• Over-the-counter pain relievers if recommended\n\n⚠️ Seek medical attention if:\n• Pain is severe or worsening\n• Pain is accompanied by other symptoms\n• Pain persists despite rest";
    }
    
    if (message.includes('hydration') || message.includes('water') || message.includes('dehydrated')) {
      return "Staying hydrated is essential! Here's what you need to know:\n\n• Aim for 8-10 glasses of water daily\n• More if you're active or in hot weather\n• Signs of dehydration: thirst, dark urine, fatigue\n• Include water-rich foods like fruits and vegetables\n• Monitor your urine color (should be light yellow)\n\n💡 Would you like tips for making water more appealing?";
    }
    
    if (message.includes('rest') || message.includes('relax')) {
      return "Rest and relaxation are vital for recovery. Try these:\n\n• Take short breaks throughout the day\n• Practice deep breathing\n• Try gentle stretching\n• Listen to calming music\n• Spend time in nature\n• Practice mindfulness\n\n💡 Would you like a guided relaxation exercise?";
    }
    
    if (message.includes('breathing') || message.includes('breathe')) {
      return "Breathing exercises can help with stress and relaxation. Here's a simple one:\n\n🌬️ Box Breathing:\n1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold for 4 counts\n5. Repeat 5-10 times\n\nThis can help calm your nervous system and reduce stress.";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "👋 Hello! I'm Nurse Noura, your virtual health assistant. I'm here to provide general health information and guidance. Remember, I can't replace professional medical advice, but I can help with:\n\n• General health tips\n• Wellness advice\n• Symptom guidance\n• Lifestyle recommendations\n\nWhat would you like to know about today?";
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return "I'm here to help with general health information! I can assist with:\n\n• Common symptoms and general care tips\n• Wellness and lifestyle advice\n• Stress and sleep management\n• Exercise and nutrition guidance\n• Basic health education\n\n⚠️ Important: I provide general information only. For specific medical concerns, always consult a healthcare professional.\n\nWhat health topic would you like to discuss?";
    }
    
    // Default response for unrecognized input
    return "Thank you for sharing that with me. While I can provide general health information and wellness tips, I want to remind you that I cannot:\n\n• Diagnose medical conditions\n• Provide specific treatment advice\n• Replace professional medical care\n\nFor your specific health concerns, please consult with a qualified healthcare provider. Is there a general health topic I can help you learn more about?";
  }
}
