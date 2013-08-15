package de.nixis.web.disco.ws;

import java.util.List;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
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
  protected void decode(ChannelHandlerContext ctx, WebSocketFrame frame, List<Object> out) throws Exception {
    super.decode(ctx, frame, out);

    if (frame instanceof CloseWebSocketFrame) {
      ctx.fireUserEventTriggered(ChannelEvent.CLOSE);
    }
  }
}