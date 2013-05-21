package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackAdded extends Base {

  private Track track;

  public TrackAdded(Track track) {
    this.track = track;
  }

  public void setTrack(Track track) {
    this.track = track;
  }

  public Track getTrack() {
    return track;
  }
}
