package de.nixis.web.disco.db.entity;

import java.util.Date;

/**
 *
 * @author nico.rehwaldt
 */
public class PlaylistPosition {

  private String trackId;

  private long position;

  private Date date;

  public PlaylistPosition(String trackId, Date date, long position) {
    this.trackId = trackId;
    this.position = position;
    this.date = date;
  }

  public PlaylistPosition() {
  }

  public long getPosition() {
    return position;
  }

  public String getTrackId() {
    return trackId;
  }

  public void setPosition(long position) {
    this.position = position;
  }
}
