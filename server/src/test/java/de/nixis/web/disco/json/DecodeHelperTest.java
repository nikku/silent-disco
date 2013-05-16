package de.nixis.web.disco.json;

import static org.fest.assertions.Assertions.assertThat;

import org.junit.Test;

import de.nixis.web.disco.dto.Foo;

/**
 *
 * @author nico.rehwaldt
 */
public class DecodeHelperTest {


  @Test
  public void testDecode() {

    String msg = "{\"foo\":{ \"bar\": \"asdf\" }}";

    Foo decodedFoo = DecodeHelper.decode(msg, Foo.class);

    assertThat(decodedFoo.getBar()).isEqualTo("asdf");
  }
}
