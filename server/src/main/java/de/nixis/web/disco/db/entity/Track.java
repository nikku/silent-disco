package de.nixis.web.disco.db.entity;

import java.util.Date;

import org.bson.types.ObjectId;
import com.github.jmkgreen.morphia.annotations.Embedded;
import com.github.jmkgreen.morphia.annotations.Entity;
import com.github.jmkgreen.morphia.annotations.Id;

/**
 *
 * @author nico.rehwaldt
 */
@Entity
public class Track {

  @Id
  private ObjectId trackId;

  /**
   * The soundcloud id of the track
   */
  private String id;

  private String artwork_url;

  private Date addedDate;

  private String permalink_url;

  private String title;

  @Embedded
  private User user;

  private long duration;

  private String roomName;

  private boolean deleted = false;

  public Track() {

  }

  public Track(String id, String artwork_url, String permalink_url, String title, User user, long duration, String roomName) {
    this.artwork_url = artwork_url;
    this.permalink_url = permalink_url;
    this.title = title;
    this.user = user;
    this.duration = duration;
    this.roomName = roomName;

    this.id = id;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getArtwork_url() {
    return artwork_url;
  }

  public void setArtwork_url(String artwork_url) {
    this.artwork_url = artwork_url;
  }

  public Date getAddedDate() {
    return addedDate;
  }

  public void setAddedDate(Date addedDate) {
    this.addedDate = addedDate;
  }

  public String getPermalink_url() {
    return permalink_url;
  }

  public void setPermalink_url(String permalink_url) {
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

  public String getTrackId() {
    return trackId.toString();
  }
}
