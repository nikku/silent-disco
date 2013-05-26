package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackAdded extends Base {

  private Track track;

  private TrackPosition position;

  public TrackAdded(Track track, TrackPosition position) {
    this.track = track;
    this.position = position;
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
}
