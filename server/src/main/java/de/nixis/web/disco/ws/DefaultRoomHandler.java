package de.nixis.web.disco.ws;

import de.nixis.web.disco.dto.PlaylistPositionSync;
import de.nixis.web.disco.dto.TrackAndPosition;
import de.nixis.web.disco.room.AbstractRoomHandler;

import de.nixis.web.disco.dto.ChannelJoined;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import de.nixis.web.disco.db.Disco;
import de.nixis.web.disco.db.entity.Position;
import de.nixis.web.disco.db.entity.Position.Status;
import de.nixis.web.disco.db.entity.Room;
import de.nixis.web.disco.db.entity.Track;
import de.nixis.web.disco.dto.AddTrack;
import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelJoin;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ChannelOpen;
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
import de.nixis.web.disco.dto.UndoRemoveTrack;
import de.nixis.web.disco.room.RoomContext;
import io.netty.channel.Channel;

/**
 *
 * @author nico.rehwaldt
 */
public class DefaultRoomHandler extends AbstractRoomHandler<Base> {

  private static final Logger LOGGER = Logger.getLogger(DefaultRoomHandler.class.getName());

//  static {
//    Logger rootLogger = Logger.getLogger("");
//    rootLogger.setLevel(Level.ALL);
//    rootLogger.addHandler(new ConsoleHandler());
//  }

  @Override
  public void handleMessage(RoomContext ctx, Base message) {

    Map<Channel, String> channels = ctx.channelMap();

    String participantId = channels.get(ctx.channel());

    if (participantId == null &&
      !(message instanceof ChannelJoin) &&
      !(message instanceof ChannelOpen)) {

      LOGGER.log(Level.FINER, "Ignoring out of order message: {0}", message);
      return;
    }

    LOGGER.log(Level.FINER, "Handling message: {0}", message);

    if (message instanceof ChannelJoin) {
      ChannelJoin join = (ChannelJoin) message;

      // check if already joined,
      // if so leave before new join
      if (participantId != null) {
        handleMessage(ctx, new ChannelLeave());
      }

      String roomName = ctx.room().id();

      String participantName = findFreeName(ctx, join.getParticipantName());

      Participant newParticipant = new Participant(participantName);

      Room room = Disco.getRoom(roomName);
      List<Track> tracks = Disco.getTracks(roomName);

      Map<String, Participant> participantsMap = ctx.room().participantsMap();
      List<Participant> oldParticipants = new ArrayList<Participant>(participantsMap.values());

      participantsMap.put(newParticipant.getId(), newParticipant);
      ctx.channelMap().put(ctx.channel(), newParticipant.getId());

      sendAll(ctx, ctx.channel(), new ParticipantJoined(newParticipant));

      send(ctx, new ChannelJoined(newParticipant, oldParticipants, tracks, room));
    } else
    if (message instanceof ChannelLeave) {
      channels.remove(ctx.channel());

      if (participantId != null) {
        Participant participant = ctx.room().participantsMap().remove(participantId);

        if (participant != null) {
          sendAll(ctx, new ParticipantLeft(participantId));
        }
      }
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

      Disco.addTrack(track, ctx.room().id(), position);

      sendAll(ctx, new TrackAdded(track, position, participantId));
    } else
    if (message instanceof RemoveTrack) {
      RemoveTrack removeTrack = (RemoveTrack) message;
      Disco.delete(removeTrack.getTrackId());

      sendAll(ctx, new TrackRemoved(removeTrack.getTrackId(), participantId));
    } else
    if (message instanceof UndoRemoveTrack) {
      UndoRemoveTrack undoRemoveTrack = (UndoRemoveTrack) message;
      TrackAndPosition trackAndPosition = Disco.undelete(undoRemoveTrack.getTrackId());

      sendAll(ctx, new TrackAdded(trackAndPosition.getTrack(), trackAndPosition.getPosition(), participantId));
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
      TrackPosition newPosition = moveTrack.getTo();

      Disco.moveTrack(trackId, newPosition);

      sendAll(ctx, ctx.channel(), new TrackMoved(newPosition, trackId, participantId));
    }

    if (message instanceof PlaylistPositionSync) {
      PlaylistPositionSync syncMessage = (PlaylistPositionSync) message;
      Position position = syncMessage.getPlaylistPosition();

      if (position != null) {
        position.setDate(new Date());
        position.setStatus(Status.PLAYING);
      }

      Disco.updatePlaylistPosition(ctx.room().id(), position);
    }
  }

  private String findFreeName(RoomContext ctx, String baseName) {
    Map<String, Participant> participantsMap = ctx.room().participantsMap();

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

  @Override
  public void handleWriteFailure(RoomContext ctx) {
    LOGGER.info("Write failure from channel");
    handleMessage(ctx, new ChannelLeave("Timeout"));
  }
}
