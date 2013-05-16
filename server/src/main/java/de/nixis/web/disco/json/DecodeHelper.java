package de.nixis.web.disco.json;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.codehaus.jackson.map.ObjectMapper;

import de.nixis.web.disco.dto.Base;

/**
 *
 * @author nico.rehwaldt
 */
public class DecodeHelper {

  public static <T> T decode(String text, Class<T> cls) {

    try {
      Message message = parse(text);

      ObjectMapper mapper = new ObjectMapper();

      return (T) mapper.readValue(message.content, message.cls);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private static final String ATTR_NAME_PATTERN_STR = "(?:\"(.*)\"|'(.*)')";

  private static final String ATTR_PATTERN_STR = "\\s*([^:]+)\\s*:\\s*(.+)\\s*\\";

  private static final String PAYLOAD_PATTERN_STR = "^\\s*\\{" + ATTR_PATTERN_STR + "}\\s*$";

  public static final Pattern ATTR_NAME_PATTERN;
  public static final Pattern PAYLOAD_PATTERN;

  static {
    ATTR_NAME_PATTERN = Pattern.compile(ATTR_NAME_PATTERN_STR);
    PAYLOAD_PATTERN = Pattern.compile(PAYLOAD_PATTERN_STR, Pattern.MULTILINE);
  }

  private static Message parse(String text) throws IOException {

    Matcher matcher = PAYLOAD_PATTERN.matcher(text);

    if (!matcher.matches()) {
      throw new IOException("Failed to parse message: Invalid json");
    }

    String name = matcher.group(1);
    String content = matcher.group(2);

    Matcher nameMatcher = ATTR_NAME_PATTERN.matcher(name);

    if (!nameMatcher.matches()) {
      throw new IOException("Failed to parse message: Invalid json");
    }

    if (nameMatcher.group(1) == null) {
      name = nameMatcher.group(2);
    } else {
      name = nameMatcher.group(1);
    }

    name = name.substring(0, 1).toUpperCase() + name.substring(1);

    try {
      Class<?> cls = Class.forName(Base.class.getPackage().getName() +  "." + name);

      return new Message(cls, content);
    } catch (ClassNotFoundException e) {
      throw new IOException("Failed to parse message: Unknown");
    }
  }

  private static class Message {

    private final Class<?> cls;
    private final String content;

    public Message(Class<?> cls, String content) {
      this.cls = cls;
      this.content = content;
    }
  }
}
