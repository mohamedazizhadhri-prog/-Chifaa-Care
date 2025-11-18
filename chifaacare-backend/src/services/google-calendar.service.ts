import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

class GoogleCalendarService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/calendar/oauth/callback'
    );
  }

  /**
   * Generate OAuth URL for doctor to authorize
   */
  getAuthUrl(doctorId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: doctorId, // Pass doctor ID for callback
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async handleOAuthCallback(code: string, doctorId: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Get user info to verify email
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      // Store tokens in database
      await prisma.user.update({
        where: { id: doctorId },
        data: {
          googleCalendarToken: tokens.access_token,
          googleCalendarRefresh: tokens.refresh_token,
          googleCalendarExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });

      return {
        success: true,
        email: data.email,
      };
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      throw new Error('Failed to complete Google Calendar authorization');
    }
  }

  /**
   * Get OAuth client with doctor's stored tokens
   */
  private async getAuthenticatedClient(doctorId: string) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        googleCalendarToken: true,
        googleCalendarRefresh: true,
        googleCalendarExpiry: true,
      },
    });

    if (!doctor?.googleCalendarToken) {
      throw new Error('Doctor has not connected Google Calendar');
    }

    this.oauth2Client.setCredentials({
      access_token: doctor.googleCalendarToken,
      refresh_token: doctor.googleCalendarRefresh || undefined,
      expiry_date: doctor.googleCalendarExpiry?.getTime(),
    });

    // Check if token is expired and refresh if needed
    const now = new Date();
    if (doctor.googleCalendarExpiry && doctor.googleCalendarExpiry < now) {
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        // Update stored tokens
        await prisma.user.update({
          where: { id: doctorId },
          data: {
            googleCalendarToken: credentials.access_token,
            googleCalendarExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          },
        });

        this.oauth2Client.setCredentials(credentials);
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw new Error('Failed to refresh Google Calendar token. Please reconnect.');
      }
    }

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create calendar event for appointment
   */
  async createAppointmentEvent(appointmentId: string, doctorId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const calendar = await this.getAuthenticatedClient(doctorId);

      const event: CalendarEvent = {
        summary: `Consultation with ${appointment.patient.firstName} ${appointment.patient.lastName}`,
        description: `
Reason: ${appointment.reason}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}
Patient Email: ${appointment.patient.email}
Patient Phone: ${appointment.patient.phone || 'Not provided'}
        `.trim(),
        start: {
          dateTime: appointment.appointmentDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: appointment.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: appointment.patient.email },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      // Store calendar event ID in appointment
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          notes: `${appointment.notes || ''}\n[Google Calendar Event ID: ${response.data.id}]`.trim(),
        },
      });

      return {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
      };
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  /**
   * Update calendar event when appointment is rescheduled
   */
  async updateAppointmentEvent(appointmentId: string, doctorId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Extract event ID from notes
      const eventIdMatch = appointment.notes?.match(/\[Google Calendar Event ID: ([^\]]+)\]/);
      if (!eventIdMatch) {
        // No existing event, create new one
        return this.createAppointmentEvent(appointmentId, doctorId);
      }

      const eventId = eventIdMatch[1];
      const calendar = await this.getAuthenticatedClient(doctorId);

      const event: CalendarEvent = {
        summary: `Consultation with ${appointment.patient.firstName} ${appointment.patient.lastName}`,
        description: `
Reason: ${appointment.reason}
${appointment.notes ? `Notes: ${appointment.notes}` : ''}
Patient Email: ${appointment.patient.email}
Patient Phone: ${appointment.patient.phone || 'Not provided'}
        `.trim(),
        start: {
          dateTime: appointment.appointmentDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: appointment.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          { email: appointment.patient.email },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
        sendUpdates: 'all',
      });

      return {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
      };
    } catch (error: any) {
      console.error('Error updating calendar event:', error);
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  /**
   * Delete calendar event when appointment is cancelled
   */
  async deleteAppointmentEvent(appointmentId: string, doctorId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Extract event ID from notes
      const eventIdMatch = appointment.notes?.match(/\[Google Calendar Event ID: ([^\]]+)\]/);
      if (!eventIdMatch) {
        console.log('No calendar event found for this appointment');
        return { success: true, message: 'No calendar event to delete' };
      }

      const eventId = eventIdMatch[1];
      const calendar = await this.getAuthenticatedClient(doctorId);

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all', // Notify attendees
      });

      return { success: true, eventId };
    } catch (error: any) {
      console.error('Error deleting calendar event:', error);
      // Don't throw error, just log it
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if doctor has connected calendar
   */
  async isConnected(doctorId: string): Promise<boolean> {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { googleCalendarToken: true },
    });

    return !!doctor?.googleCalendarToken;
  }

  /**
   * Get doctor's calendar connection status
   */
  async getConnectionStatus(doctorId: string) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: {
        googleCalendarToken: true,
        googleCalendarExpiry: true,
      },
    });

    if (!doctor?.googleCalendarToken) {
      return { connected: false };
    }

    try {
      const calendar = await this.getAuthenticatedClient(doctorId);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        connected: true,
        email: data.email,
        expiresAt: doctor.googleCalendarExpiry,
      };
    } catch (error) {
      return { connected: false, error: 'Token invalid or expired' };
    }
  }

  /**
   * Disconnect calendar (remove tokens)
   */
  async disconnect(doctorId: string) {
    await prisma.user.update({
      where: { id: doctorId },
      data: {
        googleCalendarToken: null,
        googleCalendarRefresh: null,
        googleCalendarExpiry: null,
      },
    });

    return { success: true };
  }

  /**
   * List upcoming events from doctor's calendar
   */
  async listUpcomingEvents(doctorId: string, maxResults: number = 10) {
    try {
      const calendar = await this.getAuthenticatedClient(doctorId);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error('Error listing calendar events:', error);
      throw new Error(`Failed to list calendar events: ${error.message}`);
    }
  }
}

export default new GoogleCalendarService();
