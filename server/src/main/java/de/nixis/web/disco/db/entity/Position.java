package de.nixis.web.disco.db.entity;

import java.util.Date;

/**
 *
 * @author nico.rehwaldt
 */
public class Position {

  public enum Status {
    PLAYING,
    STOPPED
  }

  private String trackId;

  private Date date;

  private Status status;

  public Position(String trackId, Status status, Date date) {
    this.trackId = trackId;
    this.date = date;
    this.status = status;
  }

  public Position() {
  }

  public String getTrackId() {
    return trackId;
  }

  public Status getStatus() {
    return status;
  }

  public Date getDate() {
    return date;
  }
}
