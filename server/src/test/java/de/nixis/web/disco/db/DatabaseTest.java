package de.nixis.web.disco.db;

import static org.fest.assertions.Assertions.assertThat;

import java.net.UnknownHostException;
import java.util.Date;
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
import de.nixis.web.disco.db.entity.User;

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

    Track track = new Track("1234112", "http://foo/aw", "http://foo", "foo", new User("klaus", "http://klaus"), 200000, "FOO");

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
  public void databaseIntegrationTest() {

    Room room = Disco.getRoom("foobar");

    assertThat(room.getName()).isEqualTo("foobar");

    Room roomAgain = Disco.getRoom("foobar");

    assertThat(roomAgain.getName()).isEqualTo(room.getName());

    Track track = Disco.addTrack(new Track(), room.getName(), null);

    assertThat(track.getRoomName()).isEqualTo(room.getName());

    List<Track> tracks = Disco.getTracks(room.getName());

    assertThat(tracks).hasSize(1);

    Track firstTrack = tracks.get(0);

    assertThat(firstTrack.getTrackId()).isEqualTo(track.getTrackId());

    Disco.startPlay(firstTrack.getTrackId());

    Room roomPlaying = Disco.getRoom(room.getName());

    Position positionPlaying = roomPlaying.getPosition();

    assertThat(positionPlaying).isNotNull();
    assertThat(positionPlaying.getTrackId()).isEqualTo(firstTrack.getTrackId());
    assertThat(positionPlaying.getStatus()).isEqualTo(Status.PLAYING);

    Disco.stopPlay(firstTrack.getTrackId());

    Disco.addTrack(new Track(), room.getName(), null);
    
    Room roomAfterStop = Disco.getRoom(room.getName());

    Position positionAfterStop = roomAfterStop.getPosition();

    assertThat(positionAfterStop).isNotNull();
    assertThat(positionAfterStop.getTrackId()).isEqualTo(firstTrack.getTrackId());
    assertThat(positionAfterStop.getStatus()).isEqualTo(Status.STOPPED);

    assertThat(Disco.getTracks(room.getName())).hasSize(2);
  }
}
