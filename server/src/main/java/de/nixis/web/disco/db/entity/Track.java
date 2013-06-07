package de.nixis.web.disco.db.entity;

import java.util.Date;

import org.bson.types.ObjectId;
import org.codehaus.jackson.annotate.JsonIgnore;
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

  private Date added;

  private String permalink_url;

  private String title;

  @Embedded
  private SoundCloudUser user;

  private long duration;

  private String roomName;

  @JsonIgnore
  private boolean deleted = false;

  /**
   * The position of the track in the track list
   */
  @JsonIgnore
  private long position = 0;

  public Track() {

  }

  public Track(String id, String artwork_url, String permalink_url, String title, SoundCloudUser user, long duration, String roomName) {
    this.artwork_url = artwork_url;
    this.permalink_url = permalink_url;
    this.title = title;
    this.user = user;
    this.duration = duration;
    this.roomName = roomName;

    this.added = new Date();

    this.id = id;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public boolean isDeleted() {
    return deleted;
  }

  public void setDeleted(boolean deleted) {
    this.deleted = deleted;
  }

  public long getPosition() {
    return position;
  }

  public void setPosition(long position) {
    this.position = position;
  }

  public String getArtwork_url() {
    return artwork_url;
  }

  public void setArtwork_url(String artwork_url) {
    this.artwork_url = artwork_url;
  }

  public Date getAdded() {
    return added;
  }

  public void setAdded(Date added) {
    this.added = added;
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

  public SoundCloudUser getUser() {
    return user;
  }

  public void setUser(SoundCloudUser user) {
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

  @Override
  public String toString() {
    return "Track(id=" + getTrackId() + ")";
  }
}
