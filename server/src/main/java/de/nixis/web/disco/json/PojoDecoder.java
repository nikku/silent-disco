package de.nixis.web.disco.json;


import java.util.List;
import de.nixis.web.disco.dto.Base;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageDecoder;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

/**
 *
 * @author nico.rehwaldt
 */
public class PojoDecoder extends MessageToMessageDecoder<TextWebSocketFrame> {

  @Override
  protected void decode(ChannelHandlerContext ctx, TextWebSocketFrame frame, List<Object> out) throws Exception {

    String msg = frame.text();

    Base base = DecodeHelper.decode(msg, Base.class);

    out.add(base);
  }
}
