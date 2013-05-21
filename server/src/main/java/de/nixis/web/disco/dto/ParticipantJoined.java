package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ParticipantJoined extends Base {

  private String name;

  public ParticipantJoined() {
    
  }

  public ParticipantJoined(String name) {

    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
