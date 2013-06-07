package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackMoved extends TrackOperation {

  private TrackPosition to;

  public TrackMoved(TrackPosition to, String trackId, String user) {
    super(trackId, user);

    this.to = to;
  }

  public TrackMoved() {

  }

  public TrackPosition getTo() {
    return to;
  }

  public void setTo(TrackPosition to) {
    this.to = to;
  }
}
