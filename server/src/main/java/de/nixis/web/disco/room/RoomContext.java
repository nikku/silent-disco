package de.nixis.web.disco.room;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;

import io.netty.channel.Channel;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public interface RoomContext {

  public Executor executor();

  /**
   * Returns the current channel.
   *
   * @return
   */
  public Channel channel();

  /**
   * Returns all channels.
   *
   * @return
   */
  public Set<Channel> channels();

  public Map<Channel, String> channelMap();

  public <T> Attribute<T> attr(AttributeKey<T> key);

  public Room room();

  public RoomContext forChannel(Channel channel);
}