import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { upgradeWebSocket } from "npm:hono/deno";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a01b5ee4/health", (c) => {
  return c.json({ status: "ok" });
});

// Live streaming proxy endpoints for Spring Boot integration
const liveRoutes = new Hono();

// Session management
liveRoutes.post('/sessions', async (c) => {
  try {
    const sessionData = await c.req.json();
    const sessionId = crypto.randomUUID();
    
    // Store session in KV store
    const session = {
      id: sessionId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      isLive: false,
      viewers: 0
    };
    
    await kv.set(`session:${sessionId}`, JSON.stringify(session));
    
    // Forward to Spring Boot backend if available
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const response = await fetch(`${springBootUrl}/api/live/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(session)
        });
        
        if (response.ok) {
          const springData = await response.json();
          // Update session with Spring Boot response
          await kv.set(`session:${sessionId}`, JSON.stringify({...session, ...springData}));
        }
      } catch (error) {
        console.log('Spring Boot not available, using local storage only');
      }
    }
    
    return c.json({ success: true, data: session });
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.get('/sessions/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const sessionData = await kv.get(`session:${sessionId}`);
    
    if (!sessionData) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const session = JSON.parse(sessionData);
    return c.json({ success: true, data: session });
  } catch (error) {
    console.error('Error getting session:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.post('/sessions/:sessionId/start', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const sessionData = await kv.get(`session:${sessionId}`);
    
    if (!sessionData) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const session = JSON.parse(sessionData);
    const updatedSession = {
      ...session,
      isLive: true,
      startTime: new Date().toISOString()
    };
    
    await kv.set(`session:${sessionId}`, JSON.stringify(updatedSession));
    
    // Forward to Spring Boot backend
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const requestBody = await c.req.json();
        const response = await fetch(`${springBootUrl}/api/live/sessions/${sessionId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          const springData = await response.json();
          return c.json({ success: true, data: springData });
        }
      } catch (error) {
        console.log('Spring Boot not available for start stream');
      }
    }
    
    // Mock response for development
    return c.json({ 
      success: true, 
      data: { 
        streamUrl: `wss://localhost:8080/stream/${sessionId}`,
        sessionId,
        status: 'starting'
      } 
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.post('/sessions/:sessionId/stop', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const sessionData = await kv.get(`session:${sessionId}`);
    
    if (!sessionData) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }
    
    const session = JSON.parse(sessionData);
    const updatedSession = {
      ...session,
      isLive: false,
      endTime: new Date().toISOString()
    };
    
    await kv.set(`session:${sessionId}`, JSON.stringify(updatedSession));
    
    // Forward to Spring Boot backend
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const response = await fetch(`${springBootUrl}/api/live/sessions/${sessionId}/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          }
        });
        
        if (response.ok) {
          const springData = await response.json();
          return c.json({ success: true, data: springData });
        }
      } catch (error) {
        console.log('Spring Boot not available for stop stream');
      }
    }
    
    return c.json({ success: true, data: { sessionId, status: 'stopped' } });
  } catch (error) {
    console.error('Error stopping session:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.post('/sessions/:sessionId/join', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const joinData = await c.req.json();
    
    // Forward to Spring Boot backend
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const response = await fetch(`${springBootUrl}/api/live/sessions/${sessionId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(joinData)
        });
        
        if (response.ok) {
          const springData = await response.json();
          return c.json({ success: true, data: springData });
        }
      } catch (error) {
        console.log('Spring Boot not available for join session');
      }
    }
    
    // Mock response for development
    return c.json({ 
      success: true, 
      data: { 
        streamUrl: `wss://localhost:8080/stream/${sessionId}`,
        viewerToken: crypto.randomUUID()
      } 
    });
  } catch (error) {
    console.error('Error joining session:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// WebRTC signaling endpoints
liveRoutes.post('/webrtc/offer', async (c) => {
  try {
    const offerData = await c.req.json();
    
    // Forward to Spring Boot backend
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const response = await fetch(`${springBootUrl}/api/live/webrtc/offer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(offerData)
        });
        
        if (response.ok) {
          const springData = await response.json();
          return c.json({ success: true, data: springData });
        }
      } catch (error) {
        console.log('Spring Boot not available for WebRTC offer');
      }
    }
    
    // Mock WebRTC answer for development
    return c.json({ 
      success: true, 
      data: { 
        answer: {
          type: 'answer',
          sdp: 'mock-answer-sdp'
        }
      } 
    });
  } catch (error) {
    console.error('Error processing WebRTC offer:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.post('/webrtc/ice-candidate', async (c) => {
  try {
    const candidateData = await c.req.json();
    
    // Forward to Spring Boot backend
    const springBootUrl = Deno.env.get('SPRING_BOOT_URL');
    if (springBootUrl) {
      try {
        const response = await fetch(`${springBootUrl}/api/live/webrtc/ice-candidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(candidateData)
        });
        
        if (response.ok) {
          return c.json({ success: true });
        }
      } catch (error) {
        console.log('Spring Boot not available for ICE candidate');
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing ICE candidate:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Chat endpoints
liveRoutes.post('/chat/messages', async (c) => {
  try {
    const messageData = await c.req.json();
    const messageId = crypto.randomUUID();
    
    const message = {
      id: messageId,
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    await kv.set(`message:${messageId}`, JSON.stringify(message));
    
    // Store in session chat history
    const sessionMessages = await kv.get(`chat:${messageData.sessionId}`) || '[]';
    const messages = JSON.parse(sessionMessages);
    messages.push(message);
    await kv.set(`chat:${messageData.sessionId}`, JSON.stringify(messages));
    
    return c.json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

liveRoutes.get('/chat/messages/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const messagesData = await kv.get(`chat:${sessionId}`) || '[]';
    const messages = JSON.parse(messagesData);
    
    return c.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// WebSocket for real-time updates
const wsConnections = new Map<string, WebSocket>();

liveRoutes.get('/ws/:sessionId', upgradeWebSocket((c) => {
  const sessionId = c.req.param('sessionId');
  
  return {
    onOpen: (evt, ws) => {
      console.log(`WebSocket connected for session: ${sessionId}`);
      wsConnections.set(sessionId, ws);
    },
    onMessage: (evt, ws) => {
      try {
        const data = JSON.parse(evt.data);
        console.log('WebSocket message:', data);
        
        // Broadcast to other connections in the same session
        wsConnections.forEach((connection, connSessionId) => {
          if (connSessionId === sessionId && connection !== ws) {
            connection.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    },
    onClose: () => {
      console.log(`WebSocket disconnected for session: ${sessionId}`);
      wsConnections.delete(sessionId);
    },
    onError: (evt) => {
      console.error('WebSocket error:', evt);
    }
  };
}));

// Mount live routes
app.route('/make-server-a01b5ee4/live', liveRoutes);

// Configuration endpoint for frontend
app.get('/make-server-a01b5ee4/config', (c) => {
  console.log('Config endpoint called');
  return c.json({
    springBootUrl: Deno.env.get('SPRING_BOOT_URL') || 'http://localhost:8080',
    janusGatewayUrl: Deno.env.get('JANUS_GATEWAY_URL') || 'ws://localhost:8188',
    stunServers: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302'
    ],
    turnServers: JSON.parse(Deno.env.get('TURN_SERVERS') || '[]'),
    environment: 'development'
  });
});

Deno.serve(app.fetch);