package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ParticipantJoined extends Base {

  private Participant user;

  public ParticipantJoined() {

  }

  public ParticipantJoined(Participant user) {

    this.user = user;
  }

  public Participant getUser() {
    return user;
  }

  public void setUser(Participant user) {
    this.user = user;
  }
}
