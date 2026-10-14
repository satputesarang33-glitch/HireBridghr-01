/**
 * Real-Time Notification Stream Service (SSE)
 * Provides Server-Sent Events endpoint for immediate client live updates.
 */

class NotificationStreamService {
  constructor() {
    this.clients = new Set();
  }

  /**
   * Express Route Handler for SSE connection
   */
  handleConnection(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const client = { id: clientId, res };
    this.clients.add(client);

    console.log(`📡 [SSE] Client connected: ${clientId} (Total active: ${this.clients.size})`);

    // Initial heartbeat
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", clientId, timestamp: new Date().toISOString() })}\n\n`);

    // Keepalive ping every 25 seconds
    const pingInterval = setInterval(() => {
      res.write(`: ping\n\n`);
    }, 25000);

    req.on("close", () => {
      clearInterval(pingInterval);
      this.clients.delete(client);
      console.log(`📡 [SSE] Client disconnected: ${clientId} (Total active: ${this.clients.size})`);
    });
  }

  /**
   * Broadcast an event to all connected clients
   */
  broadcast(eventType, payload) {
    const data = JSON.stringify({
      type: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    console.log(`📡 [SSE BROADCAST] Event: "${eventType}" to ${this.clients.size} clients`);

    for (const client of this.clients) {
      try {
        client.res.write(`event: ${eventType}\ndata: ${data}\n\n`);
      } catch (err) {
        console.error("Failed to write to SSE client, removing:", err.message);
        this.clients.delete(client);
      }
    }
  }
}

export const notificationStreamService = new NotificationStreamService();
