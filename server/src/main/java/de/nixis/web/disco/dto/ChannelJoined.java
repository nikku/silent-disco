package de.nixis.web.disco.dto;

import java.util.List;

import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class ChannelJoined extends ParticipantJoined {

  private List<Participant> participants;

  private List<Track> tracks;

  private Room room;

  public ChannelJoined(Participant user, List<Participant> participants, List<Track> tracks, Room room) {
    super(user);

    this.tracks = tracks;
    this.participants = participants;

    this.room = room;
  }

  public ChannelJoined() {
  }

  public List<Participant> getParticipants() {
    return participants;
  }

  public Room getRoom() {
    return room;
  }

  public void setParticipants(List<Participant> participants) {
    this.participants = participants;
  }

  public void setRoom(Room room) {
    this.room = room;
  }

  public List<Track> getTracks() {
    return tracks;
  }

  public void setTracks(List<Track> tracks) {
    this.tracks = tracks;
  }
}
