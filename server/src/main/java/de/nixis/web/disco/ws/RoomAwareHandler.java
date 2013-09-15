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
import de.nixis.web.disco.dto.Participant;
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
      // channel leave may be sent out of order
      // (e.g. when a timeout occurs)
      if (message instanceof ChannelLeave) {
        handleOutOfOrderChannelLeave(ctx, (ChannelLeave) message);
      } else {
        throw new RuntimeException("No room id set");
      }

      // nothing to do
      return;
    }

    handleRoomMessage(roomId, ctx, message);
  }

  protected void handleOutOfOrderChannelLeave(ChannelHandlerContext ctx, ChannelLeave message) {

    Set<Room> connectedRooms = rooms.getByChannel(ctx.channel());
    for (Room connectedRoom: connectedRooms) {
      RoomContextImpl roomContext = new RoomContextImpl(ctx, connectedRoom);
      roomHandler.handleMessage(roomContext, message);
    }
  }

  protected void handleRoomMessage(String roomId, ChannelHandlerContext ctx, Base message) {
    Room room = rooms.get(roomId);

    RoomContextImpl roomContext = new RoomContextImpl(ctx, room);

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

    /**
     * Get room with the specified id
     *
     * @param key
     * @return
     */
    public Room get(Object key);

    /**
     * Returns all rooms a channel is associated with
     *
     * @param channel
     * @return
     */
    Set<Room> getByChannel(Channel channel);
  }

  private static class RoomsImpl extends ConcurrentSkipListMap<String, Room> implements Rooms {

    @Override
    public Room get(Object key) {
      Room room = super.get(key);

      String id = (String) key;

      if (room == null) {
        room = new RoomImpl(id);
        put(id, room);
      }

      return room;
    }

    /**
     * Returns all rooms a channel is associated with
     *
     * @param channel
     * @return
     */
    public Set<Room> getByChannel(Channel channel) {
      Set<Room> result = new HashSet<Room>();

      for (Room room : values()) {
        if (room.channels().contains(channel)) {
          result.add(room);
        }
      }
      return result;
    }
  }

  private static class RoomImpl implements de.nixis.web.disco.room.Room {

    private final AttributeMap attributes = new DefaultAttributeMap();

    private final Map channelMap = new ConcurrentSkipListMap<Channel, String>();

    private final String id;

    public RoomImpl(String id) {
      this.id = id;
    }

    public String id() {
      return id;
    }

    public Map<Channel, String> channelMap() {
      return channelMap;
    }

    public Set<String> participantIds() {
      return new HashSet<String>(channelMap.values());
    }

    public Set<Channel> channels() {
      return channelMap.keySet();
    }

    public <T> Attribute<T> attr(AttributeKey<T> key) {
      return attributes.attr(key);
    }

    private static final AttributeKey<Map<String, Participant>> PARTICIPANTS = new AttributeKey<Map<String, Participant>>("Participants");

    public Map<String, Participant> participantsMap() {
      Attribute<Map<String, Participant>> participantsAttr = attr(PARTICIPANTS);
      participantsAttr.setIfAbsent(new ConcurrentSkipListMap<String, Participant>());

      return participantsAttr.get();
    }
  }
}
