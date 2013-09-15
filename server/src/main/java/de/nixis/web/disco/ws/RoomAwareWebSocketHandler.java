package de.nixis.web.disco.ws;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomAwareWebSocketHandler extends WebSocketServerProtocolHandler {

  public static enum ChannelEvent {
    OPEN, CLOSE
  }

  public RoomAwareWebSocketHandler(String uri) {
    super(uri);
  }

  @Override
  public void channelUnregistered(ChannelHandlerContext ctx) throws Exception {
    ctx.fireUserEventTriggered(ChannelEvent.CLOSE);

    super.channelUnregistered(ctx);
  }

  @Override
  public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
    if (evt == WebSocketServerProtocolHandler.ServerHandshakeStateEvent.HANDSHAKE_COMPLETE) {
      ctx.fireUserEventTriggered(ChannelEvent.OPEN);
      return;
    }

    super.userEventTriggered(ctx, evt);
  }

  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    super.channelRead(ctx, msg);

    if (msg instanceof CloseWebSocketFrame) {
      ctx.fireUserEventTriggered(ChannelEvent.CLOSE);
    }
  }
}