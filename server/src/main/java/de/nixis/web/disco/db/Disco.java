package de.nixis.web.disco.db;

import java.net.UnknownHostException;
import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import com.github.jmkgreen.morphia.Datastore;
import com.github.jmkgreen.morphia.Morphia;
import com.github.jmkgreen.morphia.query.Query;
import com.github.jmkgreen.morphia.query.UpdateOperations;
import com.github.jmkgreen.morphia.query.UpdateResults;
import com.mongodb.MongoClient;
import de.nixis.web.disco.db.entity.Position;
import de.nixis.web.disco.db.entity.Position.Status;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;
import de.nixis.web.disco.dto.TrackAndPosition;
import de.nixis.web.disco.dto.TrackPosition;

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

  public static void stopPlay(String trackId) {
    Track track = getTrack(trackId);
    if (track == null) {
      throw new RuntimeException("#stopPlay(): track not found with id " + trackId);
    }

    updatePlaylistPosition(track.getRoomName(), new Position(track.getTrackId(), 0, Status.STOPPED));
  }

  public static void startPlay(String trackId, int position) {

    Track track = getTrack(trackId);
    if (track == null) {
      throw new RuntimeException("#startPlay(): track not found with id " + trackId);
    }

    updatePlaylistPosition(track.getRoomName(), new Position(track.getTrackId(), position, Status.PLAYING));
  }

  private static Track getLastTrack(String roomName) {
    return getDatastore().find(Track.class).filter("roomName =", roomName).order("-added, -position").limit(1).get();
  }

  public static List<Track> getTracks(String roomName) {
    return getTracksByRoomQuery(roomName).asList();
  }

  private static Track getTrackAtPosition(String roomName, int position) {
    return getTracksByRoomQuery(roomName).offset(position).limit(1).get();
  }

  private static Query<Track> getTracksByRoomQuery(String roomName) {
    return getDatastore().find(Track.class).order("position, added").filter("deleted", false).filter("roomName =", roomName);
  }

  public static void moveTrack(String trackId, TrackPosition position) {

    Track track = getTrack(trackId);
    if (track == null) {
      return;
    }

    updateTrackPosition(track, position);

    getDatastore().merge(track);
  }

  public static void delete(String trackId) {

    Track track = getTrack(trackId);
    if (track == null) {
      return;
    }

    track.setDeleted(true);

    getDatastore().merge(track);
  }

  public static TrackAndPosition undelete(String trackId) {

    Track track = getTrack(trackId);
    if (track == null) {
      return null;
    }

    track.setDeleted(false);

    getDatastore().merge(track);

    return new TrackAndPosition(track, getTrackPosition(track));
  }

  public static Track addTrack(Track track, String roomName, TrackPosition position) {

    // make sure room exists
    getRoom(roomName);

    track.setRoomName(roomName);

    Track lastTrack = getLastTrack(roomName);

    if (lastTrack != null) {
      track.setPosition(lastTrack.getPosition() + 1);
    }

    if (position != null) {
      updateTrackPosition(track, position);
    }

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

  private static TrackPosition getTrackPosition(Track track) {
    long count = getDatastore()
               .find(Track.class)
                 .filter("roomName =", track.getRoomName())
                 .filter("position <", track.getPosition())
                 .countAll();

    // TODO: unsafe cast from long to int
    return new TrackPosition((int) count);
  }

  private static void updateTrackPosition(Track track, TrackPosition position) {

    long pos = 0;

    if (position.getPosition() != 0) {

      Track previous = getTrackAtPosition(track.getRoomName(), position.getPosition());
      if (previous == null) {
        return;
      }

      pos = previous.getPosition() + 1;
    }

    Query<Track> query = getDatastore()
        .find(Track.class)
          .filter("roomName = ", track.getRoomName())
          .filter("position >= ", pos);

    UpdateOperations<Track> updateOperation = getDatastore().createUpdateOperations(Track.class).inc("position", 1);

    UpdateResults<Track> updateResult = getDatastore().update(query, updateOperation);

    track.setPosition(pos);
  }

  public static void updatePlaylistPosition(String roomName, Position position) {
    Room room = getRoomByNameQuery(roomName).get();

    room.setPosition(position);

    getDatastore().merge(room);
  }
}
