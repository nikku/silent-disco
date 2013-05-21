package de.nixis.web.disco.ws;

import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import java.util.Map;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ChannelOpen;
import de.nixis.web.disco.room.RoomHandler;
import de.nixis.web.disco.room.impl.RoomContextImpl;
import de.nixis.web.disco.ws.RoomAwareWebSocketHandler.ChannelEvent;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundMessageHandlerAdapter;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomAwareHandler extends ChannelInboundMessageHandlerAdapter<Base> {

  public static final AttributeKey<String> ROOM_ID = new AttributeKey<String>("roomId");

  private static final Rooms rooms = new RoomsImpl();

  private final RoomHandler roomHandler;

  public RoomAwareHandler(RoomHandler roomHandler) {
    this.roomHandler = roomHandler;
  }

  @Override
  public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {

    if (evt == ChannelEvent.OPEN) {
      handleMessage(ctx, new ChannelOpen());
    }

    if (evt == ChannelEvent.CLOSE) {
      handleMessage(ctx, new ChannelLeave());
    }
  }

  public void messageReceived(ChannelHandlerContext ctx, Base msg) throws Exception {
    handleMessage(ctx, msg);
  }

  /**
   * Handle a message in a generic way.
   *
   * @param ctx
   * @param message
   */
  public void handleMessage(ChannelHandlerContext ctx, Base message) {

    String roomId = ctx.channel().attr(ROOM_ID).get();
    if (roomId == null) {
      throw new RuntimeException("No room id set");
    }

    Map<Channel, String> channelMap = rooms.get(roomId);

    RoomContextImpl roomContext = new RoomContextImpl(roomId, ctx, channelMap);

    roomHandler.handleMessage(roomContext, message);
  }

  /**
   * Extracts the room id from the websocket url
   */
  public static class RoomIdExtractor extends ChannelInboundMessageHandlerAdapter<FullHttpRequest> {

    public void messageReceived(ChannelHandlerContext ctx, FullHttpRequest msg) throws Exception {
      String uri = msg.getUri();

      Matcher matcher = Pattern.compile("/([^/]+)/websocket").matcher(uri);

      if (matcher.matches()) {
        ctx.channel().attr(RoomAwareHandler.ROOM_ID).set(matcher.group(1));
      } else {
        throw new RuntimeException("Failed to extract room id from uri " + uri);
      }

      msg.retain();
      ctx.nextInboundMessageBuffer().add(msg);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        FullHttpResponse response = new DefaultFullHttpResponse(
                    HTTP_1_1, HttpResponseStatus.BAD_REQUEST,
            Unpooled.wrappedBuffer((cause.getMessage()).getBytes()));

        ctx.channel().write(response).addListener(ChannelFutureListener.CLOSE);
    }
  }

  ///////// helper stuff ////////////////////////////////////////

  private interface Rooms {
    public Map<Channel, String> get(Object key);
  }

  private static class RoomsImpl extends ConcurrentSkipListMap<String, Map<Channel, String>> implements Rooms {

    @Override
    public Map<Channel, String> get(Object key) {
      Map<Channel, String> channelMap = super.get(key);

      if (channelMap == null) {
        channelMap = new ConcurrentSkipListMap<Channel, String>();
        put((String) key, channelMap);
      }

      return channelMap;
    }
  }
}
