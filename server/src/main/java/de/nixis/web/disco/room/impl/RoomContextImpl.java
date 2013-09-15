package de.nixis.web.disco.room.impl;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.Executor;

import de.nixis.web.disco.dto.Participant;
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

  private final Executor executor;

  private final Room room;
  private final Channel channel;

  public RoomContextImpl(ChannelHandlerContext channelCtx, Room room) {
    this(room, channelCtx.channel(), channelCtx.executor());
  }

  public RoomContextImpl(Room room, Channel channel, Executor executor) {
    this.room = room;
    this.executor = executor;
    this.channel = channel;
  }

  public Executor executor() {
    return executor;
  }

  public Channel channel() {
    return channel;
  }

  public Set<Channel> channels() {
    return room.channels();
  }

  public Map<Channel, String> channelMap() {
    return room.channelMap();
  }

  public Room room() {
    return room;
  }

  public <T> Attribute<T> attr(AttributeKey<T> key) {
    return room.attr(key);
  }

  public RoomContext forChannel(Channel newChannel) {
    return new RoomContextImpl(room, newChannel, executor);
  }
}
