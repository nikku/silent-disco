package de.nixis.web.disco.ws;

import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ChannelOpen;
import de.nixis.web.disco.room.Room;
import de.nixis.web.disco.room.RoomHandler;
import de.nixis.web.disco.room.impl.RoomContextImpl;
import de.nixis.web.disco.ws.RoomAwareWebSocketHandler.ChannelEvent;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;
import io.netty.util.AttributeMap;
import io.netty.util.DefaultAttributeMap;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomAwareHandler extends SimpleChannelInboundHandler<Base> {

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

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, Base msg) throws Exception {
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

    Room room = rooms.get(roomId);

    RoomContextImpl roomContext = new RoomContextImpl(roomId, ctx, room);

    roomHandler.handleMessage(roomContext, message);
  }

  /**
   * Extracts the room id from the websocket url
   */
  public static class RoomIdExtractor extends SimpleChannelInboundHandler<FullHttpRequest> {

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest msg) throws Exception {
      String uri = msg.getUri();

      Matcher matcher = Pattern.compile("/([^/]+)/websocket").matcher(uri);

      if (matcher.matches()) {
        ctx.channel().attr(RoomAwareHandler.ROOM_ID).set(matcher.group(1));
      } else {
        throw new RuntimeException("Failed to extract room id from uri " + uri);
      }

      msg.retain();
      ctx.fireChannelRead(msg);
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

  protected interface Rooms {
    public Room get(Object key);
  }

  private static class RoomsImpl extends ConcurrentSkipListMap<String, Room> implements Rooms {

    @Override
    public Room get(Object key) {
      Room room = super.get(key);

      if (room == null) {
        room = new RoomImpl();
        put((String) key, room);
      }

      return room;
    }
  }

  private static class RoomImpl extends ConcurrentSkipListMap<Channel, String> implements de.nixis.web.disco.room.Room {

    private final AttributeMap attributes = new DefaultAttributeMap();

    public Map<Channel, String> channelMap() {
      return this;
    }

    public Set<String> participantIds() {
      return new HashSet<String>(this.values());
    }

    public Set<Channel> channels() {
      return this.keySet();
    }

    public <T> Attribute<T> attr(AttributeKey<T> key) {
      return attributes.attr(key);
    }
  }
}
