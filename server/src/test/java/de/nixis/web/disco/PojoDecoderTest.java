package de.nixis.web.disco;

import static org.fest.assertions.Assertions.assertThat;

import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.Test;

import de.nixis.web.disco.json.DecodeHelper;

/**
 *
 * @author nico.rehwaldt
 */
public class PojoDecoderTest {

  @Test
  public void testAttrNamePattern0() {

    Pattern p = DecodeHelper.ATTR_NAME_PATTERN;
    Matcher matcher = p.matcher("\"foo\"");

    assertThat(matcher.matches()).isTrue();

    assertThat(matcher.groupCount()).isEqualTo(2);
    assertThat(matcher.group(1)).isEqualTo("foo");
  }

  @Test
  public void testAttrNamePattern1() {

    Pattern p = DecodeHelper.ATTR_NAME_PATTERN;
    Matcher matcher = p.matcher("'foo'");

    assertThat(matcher.matches()).isTrue();

    assertThat(matcher.groupCount()).isEqualTo(2);
    assertThat(matcher.group(2)).isEqualTo("foo");
  }

  @Test
  public void testPayloadPattern() {

    Pattern p = DecodeHelper.PAYLOAD_PATTERN;
    Matcher matcher = p.matcher("{\"foo\": 12 }");

    assertThat(matcher.matches()).isTrue();

    assertThat(matcher.groupCount()).isEqualTo(2);
    assertThat(matcher.group(1)).isEqualTo("\"foo\"");

    assertThat(matcher.group(2)).isEqualTo("12 ");
  }
}
