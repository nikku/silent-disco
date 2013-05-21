package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ParticipantLeft extends Base {

  private String name;

  public ParticipantLeft() {
    
  }

  public ParticipantLeft(String name) {

    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
