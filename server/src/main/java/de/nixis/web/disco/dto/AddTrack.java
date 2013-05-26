package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class AddTrack extends Base {

  private Track track;

  private TrackPosition position;

  public AddTrack() {
  }

  public AddTrack(Track track, TrackPosition position) {
    this.track = track;
    this.position = position;
  }
  
  public Track getTrack() {
    return track;
  }

  public TrackPosition getPosition() {
    return position;
  }
}
