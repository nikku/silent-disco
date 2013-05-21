package de.nixis.web.disco.db.entity;

/**
 * A sound cloud user
 *
 * @author nico.rehwaldt
 */
public class User {

  private String username;

  private String permalink_url;

  public User() {

  }

  public User(String username, String permalink_url) {
    this.username = username;
    this.permalink_url = permalink_url;
  }

  public String getPermalink_url() {
    return permalink_url;
  }

  public void setPermalink_url(String permalink_url) {
    this.permalink_url = permalink_url;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }


}
