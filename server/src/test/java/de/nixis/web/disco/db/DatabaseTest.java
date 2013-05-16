package de.nixis.web.disco.db;

import java.net.UnknownHostException;
import org.junit.Test;

import com.google.code.morphia.Datastore;
import com.google.code.morphia.Morphia;
import com.mongodb.Mongo;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;

/**
 *
 * @author nico.rehwaldt
 */
public class DatabaseTest {

  @Test
  public void databaseTest() throws UnknownHostException {

      Mongo mongo = new Mongo("localhost");

      Morphia morphia = new Morphia();
      morphia.map(Track.class).map(Room.class);

      Datastore datastore = morphia.createDatastore(mongo, "my_database");

      System.out.println(datastore.createQuery(Track.class).asList());
  }
}
