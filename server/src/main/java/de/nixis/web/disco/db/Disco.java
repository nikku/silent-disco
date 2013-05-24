package de.nixis.web.disco.db;

import java.net.UnknownHostException;
import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import com.github.jmkgreen.morphia.Datastore;
import com.github.jmkgreen.morphia.Morphia;
import com.github.jmkgreen.morphia.query.Query;
import com.mongodb.MongoClient;
import de.nixis.web.disco.db.entity.PlaylistPosition;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class Disco {

  public static Datastore DATA_STORE;

  private static String MONGO_DB_HOST = "localhost";
  private static String MONGO_DB_NAME = "silent-disco";

  public static Track getTrack(String id) {
    return getDatastore().get(Track.class, new ObjectId(id));
  }

  public static Room getRoom(String name) {
    Room room = getRoomByNameQuery(name).get();

    if (room == null) {
      room = new Room(name);
      getDatastore().save(room);
    }

    return room;
  }

  public static void startPlay(String trackId) {

    Track track = getTrack(trackId);
    if (track == null) {
      throw new RuntimeException("#startPlay(): track not found with id " + trackId);
    }

    Room room = getRoomByNameQuery(track.getRoomName()).get();

    room.setPosition(new PlaylistPosition(track.getTrackId(), new Date(), 0));

    getDatastore().merge(room);
  }

  public static List<Track> getTracks(String roomName) {
    return getTracksByRoomQuery(roomName).asList();
  }

  private static Query<Track> getTracksByRoomQuery(String roomName) {
    return getDatastore().find(Track.class).filter("roomName =", roomName);
  }

  public static Track addTrack(Track track, String roomName) {

    // make sure room exists
    getRoom(roomName);

    track.setRoomName(roomName);

    getDatastore().save(track);

    return track;
  }

  public static Datastore createDatastore(String host, String name) throws UnknownHostException {
    MongoClient mongoClient = new MongoClient(host);

    Morphia morphia = new Morphia();
    morphia.map(Track.class).map(Room.class);

    Datastore ds = morphia.createDatastore(mongoClient, name);

    ds.ensureIndexes();
    ds.ensureCaps();

    return ds;
  }

  public static Datastore getDatastore() {
    if (DATA_STORE == null) {
      try {
        DATA_STORE = createDatastore(MONGO_DB_HOST, MONGO_DB_NAME);
      } catch (UnknownHostException e) {
        throw new RuntimeException("Failed to connect to database", e);
      }
    }

    return DATA_STORE;
  }

  private static Query<Room> getRoomByNameQuery(String name) {
    return getDatastore().find(Room.class, "name =", name);
  }
}
