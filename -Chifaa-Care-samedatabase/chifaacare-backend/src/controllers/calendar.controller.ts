import { Request, Response } from 'express';
import GoogleCalendarService from '../services/google-calendar.service';

/**
 * Initiate Google Calendar OAuth flow
 * GET /api/v1/calendar/auth
 */
export const initiateAuth = async (req: any, res: Response) => {
  try {
    const doctorId = req.user.id;
    const role = req.user.role;

    if (role !== 'DOCTOR' && role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Only doctors can connect Google Calendar',
      });
    }

    const authUrl = GoogleCalendarService.getAuthUrl(doctorId);

    res.status(200).json({
      status: 'success',
      data: { authUrl },
    });
  } catch (error: any) {
    console.error('Error initiating auth:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to initiate authorization',
    });
  }
};

/**
 * Handle OAuth callback from Google
 * GET /api/v1/calendar/oauth/callback
 */
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Authorization Failed</h2>
            <p>Missing authorization code or state</p>
            <a href="/doctor/calendar">Go back to Calendar Settings</a>
          </body>
        </html>
      `);
    }

    const doctorId = state as string;
    const result = await GoogleCalendarService.handleOAuthCallback(code as string, doctorId);

    // Redirect to frontend with success
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 400px;
            }
            h2 { color: #333; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 30px; }
            .success-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }
            .btn {
              background: #667eea;
              color: white;
              padding: 12px 30px;
              border: none;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              cursor: pointer;
            }
            .btn:hover {
              background: #5568d3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h2>Google Calendar Connected!</h2>
            <p>Your calendar has been successfully connected to ChifaaCare.</p>
            <p>Connected as: <strong>${result.email}</strong></p>
            <a href="http://localhost:4200/doctor/dashboard" class="btn">
              Go to Dashboard
            </a>
          </div>
          <script>
            // Close window after 3 seconds if opened in popup
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'calendar-connected', 
                email: '${result.email}' 
              }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2>❌ Connection Failed</h2>
          <p>${error.message || 'Failed to connect Google Calendar'}</p>
          <a href="/doctor/calendar">Try again</a>
        </body>
      </html>
    `);
  }
};

/**
 * Get calendar connection status
 * GET /api/v1/calendar/status
 */
export const getStatus = async (req: any, res: Response) => {
  try {
    const doctorId = req.user.id;
    const status = await GoogleCalendarService.getConnectionStatus(doctorId);

    res.status(200).json({
      status: 'success',
      data: status,
    });
  } catch (error: any) {
    console.error('Error getting status:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get connection status',
    });
  }
};

/**
 * Disconnect Google Calendar
 * POST /api/v1/calendar/disconnect
 */
export const disconnect = async (req: any, res: Response) => {
  try {
    const doctorId = req.user.id;
    await GoogleCalendarService.disconnect(doctorId);

    res.status(200).json({
      status: 'success',
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error: any) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to disconnect',
    });
  }
};

/**
 * List upcoming calendar events
 * GET /api/v1/calendar/events
 */
export const listEvents = async (req: any, res: Response) => {
  try {
    const doctorId = req.user.id;
    const maxResults = parseInt(req.query.maxResults as string) || 10;

    const events = await GoogleCalendarService.listUpcomingEvents(doctorId, maxResults);

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: { events },
    });
  } catch (error: any) {
    console.error('Error listing events:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to list events',
    });
  }
};

/**
 * Manually sync appointment to calendar
 * POST /api/v1/calendar/sync/:appointmentId
 */
export const syncAppointment = async (req: any, res: Response) => {
  try {
    const doctorId = req.user.id;
    const { appointmentId } = req.params;

    const result = await GoogleCalendarService.createAppointmentEvent(appointmentId, doctorId);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Appointment synced to calendar',
    });
  } catch (error: any) {
    console.error('Error syncing appointment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to sync appointment',
    });
  }
};
