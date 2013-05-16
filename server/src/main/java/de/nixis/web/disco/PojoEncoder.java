package de.nixis.web.disco;

import java.io.StringWriter;
import org.codehaus.jackson.map.ObjectMapper;
import de.nixis.web.disco.dto.Base;
import io.netty.buffer.MessageBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToMessageEncoder;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;

/**
 *
 * @author nico.rehwaldt
 */
class PojoEncoder extends MessageToMessageEncoder<Base> {

  @Override
  protected void encode(ChannelHandlerContext ctx, Base msg, MessageBuf<Object> out) throws Exception {

    System.out.println("Encoding " + msg);
    
    StringWriter writer = new StringWriter();

    ObjectMapper mapper = new ObjectMapper();
    mapper.writeValue(writer, msg);

    out.add(new TextWebSocketFrame(writer.toString()));
  }
}
