package de.nixis.web.disco.dto;

import de.nixis.web.disco.dto.Base;

/**
 *
 * @author nico.rehwaldt
 */
public class ChannelJoined extends Base {

  private String name;

  public ChannelJoined(String name) {

    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
