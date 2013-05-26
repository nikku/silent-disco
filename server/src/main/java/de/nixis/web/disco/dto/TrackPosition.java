package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackPosition {

  private String beforeId;

  private String afterId;

  public TrackPosition(String beforeId, String afterId) {
    this.beforeId = beforeId;
    this.afterId = afterId;
  }

  public String getBeforeId() {
    return beforeId;
  }

  public void setBeforeId(String beforeId) {
    this.beforeId = beforeId;
  }

  public String getAfterId() {
    return afterId;
  }

  public void setAfterId(String afterId) {
    this.afterId = afterId;
  }
}
