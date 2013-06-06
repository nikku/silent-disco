package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Position;

/**
 *
 * @author nico.rehwaldt
 */
public class MoveTrack extends TrackOperation {

  private TrackPosition oldPosition;

  private TrackPosition newPosition;

  private Position playlistPosition;

  public MoveTrack() {

  }

  public TrackPosition getOldPosition() {
    return oldPosition;
  }

  public void setOldPosition(TrackPosition oldPosition) {
    this.oldPosition = oldPosition;
  }

  public TrackPosition getNewPosition() {
    return newPosition;
  }

  public void setNewPosition(TrackPosition newPosition) {
    this.newPosition = newPosition;
  }

  public Position getPlaylistPosition() {
    return playlistPosition;
  }

  public void setPlaylistPosition(Position playlistPosition) {
    this.playlistPosition = playlistPosition;
  }
}
