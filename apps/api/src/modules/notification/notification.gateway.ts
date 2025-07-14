import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    // Lấy userId từ query string khi connect
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(userId);
      // console.log(`User ${userId} joined room`);
    }
  }

  handleDisconnect(client: any) {}

  // Hàm này sẽ được gọi khi admin xác nhận đơn
  notifyOrderConfirmed(userId: string, orderData: any) {
    this.server.to(userId).emit('order_confirmed', orderData);
  }
} 