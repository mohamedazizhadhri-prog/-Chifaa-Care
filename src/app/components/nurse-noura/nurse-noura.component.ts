import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nurse-noura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nurse-noura.component.html',
  styleUrls: ['./nurse-noura.component.scss']
})
export class NurseNouraComponent {
  isOpen = false;
  messages: Array<{ text: string; sender: 'bot' | 'user' }> = [
    { text: '👋 Hi! I’m Nurse Noura. How can I help you today?', sender: 'bot' },
    { text: 'I have a mild headache since the morning. Any tips?', sender: 'user' },
    { text: 'Make sure you’re hydrated, rest your eyes, and consider a light snack. If it persists, consult a professional. Would you like some relaxation tips?', sender: 'bot' }
  ];
  typing = false;
  inputText = '';

  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') inputElRef!: ElementRef<HTMLInputElement>;

  open() {
    this.isOpen = true;
    setTimeout(() => this.inputElRef?.nativeElement.focus(), 200);
  }

  close() {
    this.isOpen = false;
  }

  onSend() {
    const text = this.inputText.trim();
    if (!text) return;
    this.messages.push({ text, sender: 'user' });
    this.inputText = '';
    this.scrollToBottom();

    // Simulated bot reply with typing indicator
    this.typing = true;
    this.scrollToBottom();
    setTimeout(() => {
      this.typing = false;
      this.messages.push({
        text: "Thanks! I’ll offer general guidance, but this doesn't replace medical advice. Would you like hydration, rest, or breathing tips?",
        sender: 'bot'
      });
      this.scrollToBottom();
    }, 900);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.onSend();
    }
  }

  private scrollToBottom() {
    queueMicrotask(() => {
      const el = this.chatBodyRef?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }
}
