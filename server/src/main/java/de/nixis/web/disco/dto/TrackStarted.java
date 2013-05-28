package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackStarted extends TrackOperation {

  private int position;

  public TrackStarted(String trackId, int position, String user) {
    super(trackId, user);

    this.position = position;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }
}
