package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackOperation extends Base {

  private String trackId;

  private String user;

  public TrackOperation(String trackId, String user) {
    this.trackId = trackId;
    this.user = user;
  }

  public TrackOperation() {

  }

  public String getTrackId() {
    return trackId;
  }

  public void setTrackId(String trackId) {
    this.trackId = trackId;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public String getUser() {
    return user;
  }
}
