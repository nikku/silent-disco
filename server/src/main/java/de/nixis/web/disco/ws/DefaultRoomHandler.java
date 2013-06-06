package de.nixis.web.disco.ws;

import de.nixis.web.disco.room.AbstractRoomHandler;

import de.nixis.web.disco.dto.ChannelJoined;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentSkipListMap;
import de.nixis.web.disco.db.Disco;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;
import de.nixis.web.disco.dto.AddTrack;
import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelJoin;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.MoveTrack;
import de.nixis.web.disco.dto.ParticipantJoined;
import de.nixis.web.disco.dto.ParticipantLeft;
import de.nixis.web.disco.dto.StartTrack;
import de.nixis.web.disco.dto.StopTrack;
import de.nixis.web.disco.dto.Text;
import de.nixis.web.disco.dto.TrackAdded;
import de.nixis.web.disco.dto.TrackPosition;
import de.nixis.web.disco.dto.TrackStarted;
import de.nixis.web.disco.dto.TrackStopped;
import de.nixis.web.disco.dto.Participant;
import de.nixis.web.disco.dto.RemoveTrack;
import de.nixis.web.disco.dto.TrackMoved;
import de.nixis.web.disco.dto.TrackRemoved;
import de.nixis.web.disco.room.RoomContext;
import io.netty.channel.Channel;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public class DefaultRoomHandler extends AbstractRoomHandler<Base> {

  private static final AttributeKey<Map<String, Participant>> PARTICIPANTS = new AttributeKey<Map<String, Participant>>("Participants");

  @Override
  public void handleMessage(RoomContext ctx, Base message) {

    Map<Channel, String> channels = ctx.channelMap();

    String participantId = channels.get(ctx.channel());

    if (message instanceof ChannelJoin) {
      ChannelJoin join = (ChannelJoin) message;

      String roomName = ctx.getRoomName();

      String participantName = findFreeName(ctx, join.getParticipantName());

      Participant newParticipant = new Participant(participantName);

      Room room = Disco.getRoom(roomName);
      List<Track> tracks = Disco.getTracks(roomName);

      Map<String, Participant> participantsMap = getParticipants(ctx);
      List<Participant> oldParticipants = new ArrayList<Participant>(participantsMap.values());

      participantsMap.put(newParticipant.getId(), newParticipant);
      ctx.channelMap().put(ctx.channel(), newParticipant.getId());

      sendAll(ctx, ctx.channel(), new ParticipantJoined(newParticipant));

      send(ctx, new ChannelJoined(newParticipant, oldParticipants, tracks, room));
    } else
    if (message instanceof ChannelLeave) {
      channels.remove(ctx.channel());

      if (participantId != null) {
        getParticipants(ctx).remove(participantId);
      }

      sendAll(ctx, new ParticipantLeft(participantId));
    } else
    if (message instanceof Text) {
      Text text = (Text) message;

      text.setAuthor(participantId);
      sendAll(ctx, ctx.channel(), message);
    } else
    if (message instanceof AddTrack) {
      AddTrack addTrack = (AddTrack) message;

      Track track = addTrack.getTrack();
      TrackPosition position = addTrack.getPosition();

      track.setAdded(new Date());

      Disco.addTrack(track, ctx.getRoomName(), position);

      sendAll(ctx, new TrackAdded(track, position, participantId));
    } else
    if (message instanceof RemoveTrack) {
      RemoveTrack removeTrack = (RemoveTrack) message;
      Disco.remove(removeTrack.getTrackId());

      sendAll(ctx, ctx.channel(), new TrackRemoved(removeTrack.getTrackId(), participantId));
    } else
    if (message instanceof StartTrack) {
      StartTrack startTrack = (StartTrack) message;

      String trackId = startTrack.getTrackId();
      int position = startTrack.getPosition();

      Disco.startPlay(trackId, position);

      sendAll(ctx, ctx.channel(), new TrackStarted(trackId, position, participantId));
    } else
    if (message instanceof StopTrack) {
      StopTrack stopTrack = (StopTrack) message;

      String trackId = stopTrack.getTrackId();
      Disco.stopPlay(trackId);

      sendAll(ctx, ctx.channel(), new TrackStopped(trackId, participantId));
    } else
    if (message instanceof MoveTrack) {
      MoveTrack moveTrack = (MoveTrack) message;

      String trackId = moveTrack.getTrackId();
      TrackPosition newPosition = moveTrack.getNewPosition();

      Disco.moveTrack(trackId, newPosition);

      sendAll(ctx, ctx.channel(), new TrackMoved(newPosition, trackId, participantId));
    }
  }

  private Map<String, Participant> getParticipants(RoomContext ctx) {
    Attribute<Map<String, Participant>> participantsAttr = ctx.attr(PARTICIPANTS);
    participantsAttr.setIfAbsent(new ConcurrentSkipListMap<String, Participant>());

    return participantsAttr.get();
  }

  private String findFreeName(RoomContext ctx, String baseName) {
    Map<String, Participant> participantsMap = getParticipants(ctx);

    Collection<Participant> participants = participantsMap.values();

    int suffix = -1;
    String name;
    boolean available;

    do {
      name = (suffix != -1 ? String.format("%s (%s)", baseName, suffix): baseName);
      available = true;

      for (Participant p: participants) {
        if (p.getName().equals(name)) {
          available = false;
          suffix++;

          break;
        }
      }
    } while (!available);

    return name;
  }
}
