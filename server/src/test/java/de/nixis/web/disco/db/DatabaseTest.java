package de.nixis.web.disco.db;

import static org.fest.assertions.Assertions.assertThat;

import java.net.UnknownHostException;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.github.jmkgreen.morphia.Datastore;
import com.github.jmkgreen.morphia.Key;
import de.nixis.web.disco.db.entity.Position;
import de.nixis.web.disco.db.entity.Position.Status;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;
import de.nixis.web.disco.db.entity.SoundCloudUser;
import de.nixis.web.disco.dto.TrackPosition;

/**
 *
 * @author nico.rehwaldt
 */
public class DatabaseTest {

  private Datastore datastore;

  @Before
  public void before() throws UnknownHostException {
    datastore = Disco.createDatastore("localhost", "test-disco");

    Disco.DATA_STORE = datastore;
  }

  @After
  public void after() {

    Disco.DATA_STORE = null;

    datastore.delete(datastore.find(Track.class));
    datastore.delete(datastore.find(Room.class));

    datastore.getMongo().close();
  }

  @Test
  public void databaseTest() throws UnknownHostException {

    Room room = new Room("FOO");
    datastore.save(room);

    Track track = new Track("1234112", "http://foo/aw", "http://foo", "foo", new SoundCloudUser("klaus", "http://klaus"), 200000, "FOO");

    Key<Track> key = datastore.save(track);

    Object id = key.getId();

    assertThat(datastore.exists(key)).isNotNull();

    Track fromDB = datastore.get(Track.class, id);

    assertThat(fromDB).isNotNull();
    assertThat(fromDB.getId()).isEqualTo(track.getId());

    Room roomFromDB = datastore.find(Room.class, "name =", fromDB.getRoomName()).get();

    assertThat(roomFromDB).isNotNull();
    assertThat(roomFromDB.getId()).isEqualTo(room.getId());
  }

  @Test
  public void shouldCreateRoom() {

    // when
    Room room = Disco.getRoom("foobar");
    Room roomAgain = Disco.getRoom("foobar");

    // then
    assertThat(room.getName()).isEqualTo("foobar");
    assertThat(roomAgain.getName()).isEqualTo(room.getName());
  }

  @Test
  public void shouldAddTrack() {

    // given
    Room room = Disco.getRoom("foobar");

    // when
    Track track = Disco.addTrack(new Track(), room.getName(), null);
    List<Track> tracks = Disco.getTracks(room.getName());
    Track firstTrack = tracks.get(0);

    // then
    assertThat(track.getRoomName()).isEqualTo(room.getName());
    assertThat(tracks).hasSize(1);

    assertThat(firstTrack.getTrackId()).isEqualTo(track.getTrackId());
  }

  @Test
  public void shouldPlayTrack() {

    // given
    Room room = Disco.getRoom("foobar");
    Track track = Disco.addTrack(new Track(), room.getName(), null);

    // when
    Room roomNotPlaying = Disco.getRoom(room.getName());
    Disco.startPlay(track.getTrackId(), 0);
    Room roomPlaying = Disco.getRoom(room.getName());

    Position positionInitial = roomNotPlaying.getPosition();
    Position positionPlaying = roomPlaying.getPosition();

    // then
    assertThat(positionInitial).isNull();

    assertThat(positionPlaying).isNotNull();
    assertThat(positionPlaying.getTrackId()).isEqualTo(track.getTrackId());
    assertThat(positionPlaying.getStatus()).isEqualTo(Status.PLAYING);
  }

  @Test
  public void shouldPlayTrackAtPosition() {
    // given
    Room room = Disco.getRoom("foobar");
    Track track = Disco.addTrack(new Track(), room.getName(), null);

    // when
    Disco.startPlay(track.getTrackId(), 2000);
    Room roomPlaying = Disco.getRoom(room.getName());

    Position positionPlaying = roomPlaying.getPosition();

    // then
    assertThat(positionPlaying.getPosition()).isEqualTo(2000);
  }

  @Test
  public void shouldStopTrack() {

    // given
    Room room = Disco.getRoom("foobar");
    Track track = Disco.addTrack(new Track(), room.getName(), null);

    // when
    Disco.startPlay(track.getTrackId(), 0);
    Disco.stopPlay(track.getTrackId());

    Room roomAfterStop = Disco.getRoom(room.getName());

    Position positionAfterStop = roomAfterStop.getPosition();

    // then
    assertThat(positionAfterStop).isNotNull();
    assertThat(positionAfterStop.getTrackId()).isEqualTo(track.getTrackId());
    assertThat(positionAfterStop.getStatus()).isEqualTo(Status.STOPPED);
  }

  @Test
  public void shouldIncrementPositionOnAdd() {

    // given
    Room room = Disco.getRoom("foobar");

    // when
    Track track0 = Disco.addTrack(new Track(), room.getName(), null);
    Track track1 = Disco.addTrack(new Track(), room.getName(), null);
    Track track2 = Disco.addTrack(new Track(), room.getName(), null);

    // then
    assertThat(track0.getPosition()).isLessThan(track1.getPosition());
    assertThat(track1.getPosition()).isLessThan(track2.getPosition());
  }

  @Test
  public void shouldMoveTrack() {

    // given
    Room room = Disco.getRoom("foobar");

    Track track0 = Disco.addTrack(new Track(), room.getName(), null);
    Track track1 = Disco.addTrack(new Track(), room.getName(), null);
    Track track2 = Disco.addTrack(new Track(), room.getName(), null);

    // when
    // move track0 behind track1
    Disco.moveTrack(track0.getTrackId(), new TrackPosition(track1.getTrackId()));

    List<Track> tracksAfterMove0 = Disco.getTracks(room.getName());

    // move track2 to front
    Disco.moveTrack(track2.getTrackId(), new TrackPosition(null));

    List<Track> tracksAfterMove1 = Disco.getTracks(room.getName());

    // then
    assertThat(tracksAfterMove0.get(0).getTrackId()).isEqualTo(track1.getTrackId());
    assertThat(tracksAfterMove0.get(1).getTrackId()).isEqualTo(track0.getTrackId());
    assertThat(tracksAfterMove0.get(2).getTrackId()).isEqualTo(track2.getTrackId());

    assertThat(tracksAfterMove1.get(0).getTrackId()).isEqualTo(track2.getTrackId());
    assertThat(tracksAfterMove1.get(1).getTrackId()).isEqualTo(track1.getTrackId());
    assertThat(tracksAfterMove1.get(2).getTrackId()).isEqualTo(track0.getTrackId());
  }

  @Test
  public void shouldDeleteTracks() {

    // given
    Room room = Disco.getRoom("foobar");

    Track track0 = Disco.addTrack(new Track(), room.getName(), null);
    Track track1 = Disco.addTrack(new Track(), room.getName(), null);
    Track track2 = Disco.addTrack(new Track(), room.getName(), null);

    // when
    Disco.remove(track1.getTrackId());

    List<Track> tracksAfterRemove = Disco.getTracks(room.getName());

    // then
    assertThat(tracksAfterRemove).excludes(track1);
  }
}
