package de.nixis.web.disco.db.entity;

import java.util.Date;

import org.bson.types.ObjectId;
import com.google.code.morphia.annotations.Embedded;
import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;

/**
 *
 * @author nico.rehwaldt
 */
@Entity
public class Track {

  @Id
  private ObjectId id;

  private String artwork_url;

  private Date created_at;

  private String permalink_url;

  private String title;

  @Embedded
  private User user;

  private long duration;

  private String roomName;

  private boolean deleted = false;

  public Track() {

  }

  public Track(String artwork_url, Date created_at, String permalink_url, String title, User user, long duration, String roomName) {
    this.artwork_url = artwork_url;
    this.created_at = created_at;
    this.permalink_url = permalink_url;
    this.title = title;
    this.user = user;
    this.duration = duration;
    this.roomName = roomName;
  }

  public String getId() {
    return id.toString();
  }

  public String getArtworkUrl() {
    return artwork_url;
  }

  public void setArtworkUrl(String artwork_url) {
    this.artwork_url = artwork_url;
  }

  public Date getCreatedAt() {
    return created_at;
  }

  public void setCreatedAt(Date created_at) {
    this.created_at = created_at;
  }

  public String getPermalinkUrl() {
    return permalink_url;
  }

  public void setPermalinkUrl(String permalink_url) {
    this.permalink_url = permalink_url;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public long getDuration() {
    return duration;
  }

  public void setDuration(long duration) {
    this.duration = duration;
  }

  public String getRoomName() {
    return roomName;
  }

  public void setRoomName(String roomName) {
    this.roomName = roomName;
  }
}
