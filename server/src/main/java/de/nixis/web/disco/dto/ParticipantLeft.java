package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ParticipantLeft extends Base {

  private String userId;

  public ParticipantLeft() {

  }

  public ParticipantLeft(String userId) {

    this.userId = userId;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String id) {
    this.userId = id;
  }
}
