package de.nixis.web.disco.room.impl;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;

import de.nixis.web.disco.room.Room;
import de.nixis.web.disco.room.RoomContext;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomContextImpl implements RoomContext {

  private final ChannelHandlerContext channelCtx;

  private final Room room;

  private final String roomName;

  public RoomContextImpl(String roomName, ChannelHandlerContext channelCtx, Room room) {
    this.roomName = roomName;
    this.channelCtx = channelCtx;
    this.room = room;
  }

  public Executor executor() {
    return channelCtx.executor();
  }

  public Channel channel() {
    return channelCtx.channel();
  }

  public Set<Channel> channels() {
    return room.channels();
  }

  public Map<Channel, String> channelMap() {
    return room.channelMap();
  }

  public Set<String> participantIds() {
    return room.participantIds();
  }

  public String getRoomName() {
    return roomName;
  }

  public <T> Attribute<T> attr(AttributeKey<T> key) {

    return room.attr(key);
  }
}
