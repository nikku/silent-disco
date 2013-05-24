package de.nixis.web.disco.db.entity;

import org.bson.types.ObjectId;
import com.github.jmkgreen.morphia.annotations.Embedded;
import com.github.jmkgreen.morphia.annotations.Entity;
import com.github.jmkgreen.morphia.annotations.Id;

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
  private PlaylistPosition position;

  public Room() {
  }

  public Room(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setPosition(PlaylistPosition position) {
    this.position = position;
  }

  public PlaylistPosition getPosition() {
    return position;
  }

  public String getId() {
    return id.toString();
  }
}
