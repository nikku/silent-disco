package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ChannelJoin extends Base {

  private String participantName;

  public String getParticipantName() {
    return participantName;
  }

  public void setParticipantName(String name) {
    this.participantName = name;
  }
}
