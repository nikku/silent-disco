package de.nixis.web.disco.ws;


import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.json.DecodeHelper;
import io.netty.buffer.MessageBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageDecoder;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

/**
 *
 * @author nico.rehwaldt
 */
public class PojoDecoder extends MessageToMessageDecoder<TextWebSocketFrame> {

  @Override
  protected void decode(ChannelHandlerContext ctx, TextWebSocketFrame frame, MessageBuf<Object> out) throws Exception {

    String msg = frame.text();

    Base base = DecodeHelper.decode(msg, Base.class);

    out.add(base);
  }
}
