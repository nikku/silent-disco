package de.nixis.web.disco.db.entity;

/**
 * A sound cloud user
 *
 * @author nico.rehwaldt
 */
public class User {

  private String name;

  private String permalink_url;

  public User() {

  }

  public User(String name, String permalink_url) {
    this.name = name;
    this.permalink_url = permalink_url;
  }
}
