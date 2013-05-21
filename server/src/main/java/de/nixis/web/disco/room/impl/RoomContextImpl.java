package de.nixis.web.disco.room.impl;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import de.nixis.web.disco.room.RoomContext;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomContextImpl implements RoomContext {

  private final ChannelHandlerContext channelCtx;

  private final Map<Channel, String> channelMap;
  
  private final String roomName;

  public RoomContextImpl(String roomName, ChannelHandlerContext channelCtx, Map<Channel, String> channelMap) {
    this.roomName = roomName;
    this.channelCtx = channelCtx;
    this.channelMap = channelMap;
  }

  public Executor executor() {
    return channelCtx.executor();
  }

  public Channel channel() {
    return channelCtx.channel();
  }

  public Set<Channel> channels() {
    return channelMap.keySet();
  }

  public Map<Channel, String> channelMap() {
    return channelMap;
  }

  public Collection<String> participants() {
    return channelMap.values();
  }

  public String getRoomName() {
    return roomName;
  }
}
