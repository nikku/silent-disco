package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class ChannelLeave extends Base {

  private String reason;

  public ChannelLeave() {
  }

  public ChannelLeave(String reason) {
    this.reason = reason;
  }

  public String getReason() {
    return reason;
  }
}
