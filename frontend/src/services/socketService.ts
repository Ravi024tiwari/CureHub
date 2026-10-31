import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private currentToken: string | null = null

  /**
   * Connect to Socket.IO server with JWT auth handshake
   */
  public connect(token: string): Socket {
    // If socket already connected or connecting with the same token, reuse
    if (this.socket && this.currentToken === token && !this.socket.disconnected) {
      return this.socket
    }

    // Clean up previous socket if any
    // so that it will not create the fake connection 
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.currentToken = token

    // Socket server URL (default to backend port 5000 in dev)
    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:5000'

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to CureHealth Real-Time WebSocket Gateway')
    })

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ WebSocket Gateway connection notice:', error.message)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('ℹ️ WebSocket Gateway disconnected:', reason)
    })

    return this.socket
  }

  /**
   * Graceful disconnection on user logout
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.currentToken = null
      console.log('🛑 Real-time socket disconnected gracefully')
    }
  }

  /**
   * Listen to an event
   */
  public on<T = any>(event: string, callback: (data: T) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Remove listener from an event
   */
  public off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  /**
   * Emit an event to the server
   */
  public emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    }
  }

  /**
   * Get raw socket instance
   */
  public getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Check connection status
   */
  public isConnected(): boolean {
    return !!this.socket && this.socket.connected
  }
}

export const socketService = new SocketService()
export default socketService

