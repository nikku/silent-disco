package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackIdBase extends Base {

  private String trackId;

  public TrackIdBase(String trackId) {
    this.trackId = trackId;
  }

  public TrackIdBase() {
    
  }

  public String getTrackId() {
    return trackId;
  }

  public void setTrackId(String trackId) {
    this.trackId = trackId;
  }
}
