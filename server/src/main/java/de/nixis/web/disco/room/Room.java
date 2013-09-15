package de.nixis.web.disco.room;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentSkipListMap;

import de.nixis.web.disco.dto.Participant;
import io.netty.channel.Channel;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public interface Room {

  public String id();

  public Map<Channel, String> channelMap();

  public Set<Channel> channels();

  public <T> Attribute<T> attr(AttributeKey<T> key);

  Map<String, Participant> participantsMap();
}
