package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackPosition {

  private int position = -1;

  public TrackPosition() {
  }

  public TrackPosition(int position) {
    this.position = position;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }
}
