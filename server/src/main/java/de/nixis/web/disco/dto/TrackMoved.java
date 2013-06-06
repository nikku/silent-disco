package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackMoved extends TrackOperation {

  private TrackPosition newPosition;

  public TrackMoved(TrackPosition newPosition, String trackId, String user) {
    super(trackId, user);
    
    this.newPosition = newPosition;
  }

  public TrackMoved() {

  }

  public TrackPosition getNewPosition() {
    return newPosition;
  }

  public void setNewPosition(TrackPosition newPosition) {
    this.newPosition = newPosition;
  }
}
