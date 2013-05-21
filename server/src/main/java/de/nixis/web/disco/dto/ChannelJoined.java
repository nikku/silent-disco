package de.nixis.web.disco.dto;

import java.util.List;

import de.nixis.web.disco.db.entity.PlaylistPosition;
import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class ChannelJoined extends ParticipantJoined {

  private List<String> participants;

  private List<Track> tracks;

  private PlaylistPosition playlistPosition;

  public ChannelJoined(String name) {
    super(name);
  }

  public ChannelJoined() {
  }

  public List<String> getParticipants() {
    return participants;
  }

  public PlaylistPosition getPlaylistPosition() {
    return playlistPosition;
  }

  public void setParticipants(List<String> participants) {
    this.participants = participants;
  }

  public void setPlaylistPosition(PlaylistPosition playlistPosition) {
    this.playlistPosition = playlistPosition;
  }

  public List<Track> getTracks() {
    return tracks;
  }

  public void setTracks(List<Track> tracks) {
    this.tracks = tracks;
  }
}
