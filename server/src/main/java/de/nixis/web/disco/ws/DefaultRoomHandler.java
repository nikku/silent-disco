package de.nixis.web.disco.ws;

import de.nixis.web.disco.room.AbstractRoomHandler;

import de.nixis.web.disco.dto.ChannelJoined;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import de.nixis.web.disco.db.Disco;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;
import de.nixis.web.disco.dto.AddTrack;
import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelJoin;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ParticipantJoined;
import de.nixis.web.disco.dto.ParticipantLeft;
import de.nixis.web.disco.dto.Text;
import de.nixis.web.disco.dto.TrackAdded;
import de.nixis.web.disco.room.RoomContext;
import io.netty.channel.Channel;

/**
 *
 * @author nico.rehwaldt
 */
public class DefaultRoomHandler extends AbstractRoomHandler<Base> {

  @Override
  public void handleMessage(RoomContext ctx, Base message) {

    Map<Channel, String> channels = ctx.channelMap();

    String participant = channels.get(ctx.channel());

    if (message instanceof ChannelJoin) {
      ChannelJoin join = (ChannelJoin) message;

      String roomName = ctx.getRoomName();
      participant = join.getParticipantName();

      Room room = Disco.getRoom(roomName);
      List<Track> tracks = Disco.getTracks(roomName);

      List<String> participants = new ArrayList<String>(ctx.participants());

      ctx.channelMap().put(ctx.channel(), participant);

      sendAll(ctx, ctx.channel(), new ParticipantJoined(participant));

      send(ctx, new ChannelJoined(participant, participants, tracks, room));
    } else
    if (message instanceof ChannelLeave) {
      channels.remove(ctx.channel());
      sendAll(ctx, new ParticipantLeft(participant));
    } else
    if (message instanceof Text) {
      Text text = (Text) message;

      text.setAuthor(participant);
      sendAll(ctx, ctx.channel(), message);
    } else
    if (message instanceof AddTrack) {
      AddTrack addTrack = (AddTrack) message;

      Track track = addTrack.getTrack();
      track.setAddedDate(new Date());

      Disco.addTrack(track, ctx.getRoomName());

      sendAll(ctx, new TrackAdded(track));
    }
  }
}
