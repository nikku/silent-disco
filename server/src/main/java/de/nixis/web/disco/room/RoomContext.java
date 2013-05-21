package de.nixis.web.disco.room;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;

import io.netty.channel.Channel;

/**
 *
 * @author nico.rehwaldt
 */
public interface RoomContext {

  public Executor executor();

  public Channel channel();

  public Collection<String> participants();

  public Set<Channel> channels();

  public Map<Channel, String> channelMap();

  public String getRoomName();
}
