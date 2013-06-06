package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackPosition {

  private String previous;

  public TrackPosition() {
  }

  public TrackPosition(String previous) {
    this.previous = previous;
  }

  public String getPrevious() {
    return previous;
  }

  public void setPrevious(String previous) {
    this.previous = previous;
  }
}
