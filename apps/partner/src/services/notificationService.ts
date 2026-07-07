/**
 * Notification Service for Partner Portal
 * Handles real-time notifications via WebSocket and API calls
 */

import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  recipientId: string;
  recipientType: 'admin' | 'partner' | 'customer';
  senderId?: string;
  senderType?: 'admin' | 'partner' | 'customer' | 'system';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  actionUrl?: string;
  createdAt: string;
}

export class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;
  private userType: 'partner' | 'admin' = 'partner';

  constructor() {
    this.setupEventListeners();
  }

  // Initialize WebSocket connection
  connect(userId: string, userType: 'partner' | 'admin' = 'partner') {
    this.userId = userId;
    this.userType = userType;
    
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8787'}/ws`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
      this.scheduleReconnect();
    }
  }

  // Setup WebSocket event handlers
  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('📡 Connected to notification service');
      this.reconnectAttempts = 0;
      
      // Join user-specific room
      if (this.userId && this.userType) {
        const room = this.userType === 'admin' ? 'admin' : `${this.userType}_${this.userId}`;
        this.send('join_room', {
          room,
          userId: this.userId,
          userType: this.userType
        });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('📡 Disconnected from notification service');
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: any) {
    const { type, notification, room, message } = data;

    switch (type) {
      case 'new_notification':
        this.handleNewNotification(notification);
        break;
      case 'notification_read':
        this.emit('notification_read', data);
        break;
      case 'all_notifications_read':
        this.emit('all_notifications_read');
        break;
      case 'joined_room':
        console.log(`✅ Joined notification room: ${room}`);
        break;
      case 'pong':
        // Handle ping/pong for connection health
        break;
      default:
        console.log('Unknown notification message type:', type);
    }
  }

  // Handle new notification
  private handleNewNotification(notification: Notification) {
    console.log('📬 New notification received:', notification);
    
    // Show toast notification
    this.showToastNotification(notification);
    
    // Emit to listeners
    this.emit('new_notification', notification);
    
    // Play notification sound (optional)
    this.playNotificationSound(notification.priority);
  }

  // Show toast notification
  private showToastNotification(notification: Notification) {
    const toastOptions = {
      duration: this.getToastDuration(notification.priority),
      position: 'top-right' as const,
    };

    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.message, toastOptions);
        break;
      case 'high':
        toast.success(notification.message, toastOptions);
        break;
      case 'medium':
        toast(notification.message, toastOptions);
        break;
      case 'low':
        toast(notification.message, { ...toastOptions, duration: 3000 });
        break;
    }
  }

  // Get toast duration based on priority
  private getToastDuration(priority: string): number {
    switch (priority) {
      case 'urgent': return 8000;
      case 'high': return 6000;
      case 'medium': return 4000;
      case 'low': return 3000;
      default: return 4000;
    }
  }

  // Play notification sound
  private playNotificationSound(priority: string) {
    if (!('Audio' in window)) return;
    
    try {
      // You can add different sounds for different priorities
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = priority === 'urgent' ? 0.8 : 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Send message via WebSocket
  private send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // Schedule reconnection
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      if (this.userId) {
        this.connect(this.userId, this.userType);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Setup global event listeners
  private setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.ws?.readyState !== WebSocket.OPEN) {
        if (this.userId) {
          this.connect(this.userId, this.userType);
        }
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      if (this.userId) {
        this.connect(this.userId, this.userType);
      }
    });
  }

  // API Methods for notification management
  async getNotifications(limit = 50, offset = 0, unreadOnly = false): Promise<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
  }> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const params = new URLSearchParams({
        userId: this.userId || '',
        userType: this.userType,
        limit: limit.toString(),
        offset: offset.toString(),
        unreadOnly: unreadOnly.toString()
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      throw new Error('Failed to fetch notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0, total: 0 };
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          userType: this.userType
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const notificationService = new NotificationService();
