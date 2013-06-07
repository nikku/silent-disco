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

  private int position;

  public Position(String trackId, int position, Status status) {
    this.trackId = trackId;
    this.date = new Date();
    this.status = status;
    this.position = position;
  }

  public Position() {
  }

  public String getTrackId() {
    return trackId;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public int getPosition() {
    return position;
  }
}
