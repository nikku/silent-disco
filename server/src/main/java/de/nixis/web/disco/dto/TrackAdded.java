package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackAdded extends Base {

  private Track track;

  private TrackPosition position;

  private String user;

  public TrackAdded(Track track, TrackPosition position, String user) {
    this.track = track;
    this.position = position;
    this.user = user;
  }

  public void setTrack(Track track) {
    this.track = track;
  }

  public Track getTrack() {
    return track;
  }

  public TrackPosition getPosition() {
    return position;
  }

  public void setPosition(TrackPosition position) {
    this.position = position;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public String getUser() {
    return user;
  }
}
