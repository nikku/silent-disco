package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class StartTrack extends TrackOperation {

  private int position;

  public StartTrack() {

  }

  public void setPosition(int position) {
    this.position = position;
  }

  public int getPosition() {
    return position;
  }
}
