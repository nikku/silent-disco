package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Position;

/**
 *
 * @author nico.rehwaldt
 */
public class MoveTrack extends TrackOperation implements PlaylistPositionSync {

  private TrackPosition from;

  private TrackPosition to;

  private Position playlistPosition;

  public MoveTrack() {

  }

  public TrackPosition getFrom() {
    return from;
  }

  public void setFrom(TrackPosition from) {
    this.from = from;
  }

  public TrackPosition getTo() {
    return to;
  }

  public void setTo(TrackPosition to) {
    this.to = to;
  }

  public Position getPlaylistPosition() {
    return playlistPosition;
  }

  public void setPlaylistPosition(Position playlistPosition) {
    this.playlistPosition = playlistPosition;
  }
}
