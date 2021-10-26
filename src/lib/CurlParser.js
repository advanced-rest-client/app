/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/**
 * @license
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 Elgs Qian Chen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * https://github.com/elgs/curl-parser
 */

/**  
 * @param {string} ch
 * @returns {boolean} true if ch is a whitespace character.
 */
const whitespace = (ch) => {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
};


export class CurlParser {
  /**
   * List of curl flags that are boolean typed; this helps with parsing a command like `curl -abc value` to know whether 'value' belongs to '-c' or is just a positional argument instead.
   */
  get boolOptions() {
    return ['#', 'progress-bar', '-', 'next', '0', 'http1.0', 'http1.1', 'http2',
      'no-npn', 'no-alpn', '1', 'tlsv1', '2', 'sslv2', '3', 'sslv3', '4', 'ipv4', '6', 'ipv6',
      'a', 'append', 'anyauth', 'B', 'use-ascii', 'basic', 'compressed', 'create-dirs',
      'crlf', 'digest', 'disable-eprt', 'disable-epsv', 'environment', 'cert-status',
      'false-start', 'f', 'fail', 'ftp-create-dirs', 'ftp-pasv', 'ftp-skip-pasv-ip',
      'ftp-pret', 'ftp-ssl-ccc', 'ftp-ssl-control', 'g', 'globoff', 'G', 'get',
      'ignore-content-length', 'i', 'include', 'I', 'head', 'j', 'junk-session-cookies',
      'J', 'remote-header-name', 'k', 'insecure', 'l', 'list-only', 'L', 'location',
      'location-trusted', 'metalink', 'n', 'netrc', 'N', 'no-buffer', 'netrc-file',
      'netrc-optional', 'negotiate', 'no-keepalive', 'no-sessionid', 'ntlm', 'O',
      'remote-name', 'oauth2-bearer', 'p', 'proxy-tunnel', 'path-as-is', 'post301', 'post302',
      'post303', 'proxy-anyauth', 'proxy-basic', 'proxy-digest', 'proxy-negotiate',
      'proxy-ntlm', 'q', 'raw', 'remote-name-all', 's', 'silent', 'sasl-ir', 'S', 'show-error',
      'ssl', 'ssl-reqd', 'ssl-allow-beast', 'ssl-no-revoke', 'socks5-gssapi-nec', 'tcp-nodelay',
      'tlsv1.0', 'tlsv1.1', 'tlsv1.2', 'tr-encoding', 'trace-time', 'v', 'verbose', 'xattr',
      'h', 'help', 'M', 'manual', 'V', 'version'
    ];
  }

  /**
   * Parses the command.
   * @param {string} curl
   */
  parse(curl) {
    if (!curl.trim()) {
      return;
    }
    const cmd = this.parseCommand(curl, {
      boolFlags: this.boolOptions
    });
    if (cmd._[0] !== "curl") {
      throw new Error('Not a curl command');
    }

    const req = this.extractRequest(cmd);
    return req;
  }

  /**
   * extractRelevantPieces returns an object with relevant pieces extracted from cmd, the parsed command. This accounts for
   * multiple flags that do the same thing and return structured data that makes it easy to spit out Go code.
   * @param {any} cmd
   */
  extractRequest(cmd) {
    const relevant = {
      url: "",
      method: "",
      headers: [],
      data: {}
    };

    // curl supports multiple URLs but we'll just use the first
    if (cmd._.length > 1) {
      relevant.url = cmd._[1]; // position 1 because index 0 is the curl command itself
    }

    // gather the headers together
    if (cmd.H) {
      relevant.headers = relevant.headers.concat(cmd.H);
    }
    if (cmd.header) {
      relevant.headers = relevant.headers.concat(cmd.header);
    }

    // set method to HEAD?
    if (cmd.I || cmd.head) {
      relevant.method = "HEAD";
    }

    // between -X and --request, prefer the long form I guess
    if (cmd.request && cmd.request.length > 0) {
      relevant.method = cmd.request[cmd.request.length - 1].toUpperCase();
    } else if (cmd.X && cmd.X.length > 0) {
      relevant.method = cmd.X[cmd.X.length - 1].toUpperCase(); // if multiple, use last (according to curl docs)
    }

    // join multiple request body data, if any
    const dataAscii = [];
    const dataFiles = [];
    const loadData = (d) => {
      if (!relevant.method) {
        relevant.method = "POST";
      }
      for (let i = 0; i < d.length; i++) {
        if (d[i].length > 0 && d[i][0] === "@") {
          dataFiles.push(d[i].substr(1));
        } else {
          dataAscii.push(d[i]);
        }
      }
    };
    if (cmd.d) {
      loadData(cmd.d);
    }
    if (cmd.data) {
      loadData(cmd.data);
    }
    if (cmd["data-binary"]) {
      loadData(cmd["data-binary"]);
    }
    if (dataAscii.length > 0) {
      relevant.data.ascii = dataAscii.join("&");
    }
    if (dataFiles.length > 0) {
      relevant.data.files = dataFiles;
    }

    // between -u and --user, choose the long form...
    let basicAuthString = "";
    if (cmd.user && cmd.user.length > 0) {
      basicAuthString = cmd.user[cmd.user.length - 1];
    } else if (cmd.u && cmd.u.length > 0) {
      basicAuthString = cmd.u[cmd.u.length - 1];
    }

    if (basicAuthString.length > 0) {
      const basicAuthSplit = basicAuthString.indexOf(":");
      if (basicAuthSplit > -1) {
        relevant.basicAuth = {
          user: basicAuthString.substr(0, basicAuthSplit),
          pass: basicAuthString.substr(basicAuthSplit + 1)
        };
      } else {
        relevant.basicAuth = {
          user: basicAuthString,
          pass: "<PASSWORD>"
        };
      }
    }

    // default to GET if nothing else specified
    if (!relevant.method) {
      relevant.method = "GET";
    }
    return relevant;
  }

  parseCommand(input, options = {}) {
    const result = {
      _: []
    }; // what we return
    let cursor = 0; // iterator position
    // token = "";       // current token (word or quoted string) being built

    // trim leading $ or # that may have been left in
    input = input.trim();
    if (input.length > 2 && (input[0] === '$' || input[0] === '#') && whitespace(input[1])) {
      input = input.substr(1)
        .trim();
    }

    for (cursor = 0; cursor < input.length; cursor++) {
      if (whitespace(input[cursor])) {
        continue;
      }
      if (input[cursor] === "-") {
        flagSet();
      } else {
        unflagged();
      }
    }

    return result;
    // flagSet handles flags and it assumes the current cursor
    // points to a first dash.
    function flagSet() {
      if (cursor < input.length - 1 && input[cursor + 1] === "-") {
        return longFlag();
      }
      cursor++; // skip leading dash
      while (cursor < input.length && !whitespace(input[cursor])) {
        const flagName = input[cursor];
        if (typeof result[flagName] === 'undefined') {
          result[flagName] = [];
        }
        cursor++; // skip the flag name
        if (boolFlag(flagName)) {
          result[flagName] = true;
        } else if (Array.isArray(result[flagName])) {
          result[flagName].push(nextString());
        }
      }
    }

    // longFlag consumes a "--long-flag" sequence and
    // stores it in result.
    function longFlag() {
      cursor += 2; // skip leading dashes
      const flagName = nextString("=");
      if (boolFlag(flagName)) {
        result[flagName] = true;
      } else {
        if (typeof result[flagName] === 'undefined') {
          result[flagName] = [];
        }
        if (Array.isArray(result[flagName])) {
          result[flagName].push(nextString());
        }
      }
    }

    // unflagged consumes the next string as an unflagged value,
    // storing it in the result.
    function unflagged() {
      result._.push(nextString());
    }

    /**
     * @param {string} flag
     * @returns {boolean} whether a flag is known to be boolean type
     */
    function boolFlag(flag) {
      if (Array.isArray(options.boolFlags)) {
        for (let i = 0; i < options.boolFlags.length; i++) {
          if (options.boolFlags[i] === flag) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * skips any leading whitespace and consumes the next
     * space-delimited string value and returns it. If endChar is set,
     * it will be used to determine the end of the string. Normally just
     * unescaped whitespace is the end of the string, but endChar can
     * be used to specify another end-of-string.
     * 
     * @param {string=} endChar
     * @returns {string}
     */
    function nextString(endChar) {
      for (; cursor < input.length && whitespace(input[cursor]); cursor++); // skip whitespace

      let str = "";
      let quoted = false;
      let quoteCh = "";
      let escaped = false;

      if (input[cursor] === '"' || input[cursor] === "'") {
        quoted = true;
        quoteCh = input[cursor];
        cursor++;
      }

      for (; cursor < input.length; cursor++) {
        if (quoted) {
          if (input[cursor] === quoteCh && !escaped) {
            cursor++; // skip closing quote
            return str;
          }
        }
        if (!quoted) {
          if (!escaped) {
            if (whitespace(input[cursor])) {
              return str;
            }
            if (endChar && input[cursor] === endChar) {
              cursor++; // skip the endChar
              return str;
            }
          }
        }
        if (!escaped && input[cursor] === "\\") {
          escaped = true;
          continue
        }
        str += input[cursor];
        escaped = false;
      }

      return str;
    }
  }
}
