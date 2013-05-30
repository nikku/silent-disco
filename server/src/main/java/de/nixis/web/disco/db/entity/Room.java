package de.nixis.web.disco.db.entity;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import org.bson.types.ObjectId;
import com.github.jmkgreen.morphia.annotations.Embedded;
import com.github.jmkgreen.morphia.annotations.Entity;
import com.github.jmkgreen.morphia.annotations.Id;
import io.netty.channel.Channel;

/**
 *
 * @author nico.rehwaldt
 */
@Entity
public class Room {

  @Id
  private ObjectId id;

  private String name;

  @Embedded
  private Position position;

  public Room() {
  }

  public Room(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setPosition(Position position) {
    this.position = position;
  }

  public Position getPosition() {
    return position;
  }

  public String getId() {
    return id.toString();
  }

  public Set<Channel> channels() {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public Map<Channel, String> channelMap() {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }

  public Collection<String> participantIds() {
    throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
  }
}
