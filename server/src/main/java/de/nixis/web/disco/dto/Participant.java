package de.nixis.web.disco.dto;

import org.bson.types.ObjectId;

/**
 *
 * @author nico.rehwaldt
 */
public class Participant implements Comparable<Participant> {

  private ObjectId id;

  private String name;

  public Participant(String name) {
    this.name = name;

    this.id = new ObjectId();
  }

  public Participant() {
  }

  public String getId() {
    return id.toString();
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int compareTo(Participant o) {
    return o.id.compareTo(id);
  }
}
