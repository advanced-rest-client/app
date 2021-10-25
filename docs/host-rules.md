# host rules

An element to render a list of host rule mappings.

## Host rules

ARC's host rules allows to create internal mapping for the request engine to alter the connection URI keeping original `Host` header.
This allows to tests virtual hosts configuration on the server.

When a request is made the rules are evaluated one after another to produce final request URL. This allows to define multiple rules that works on a previous evaluated URL.
Lear more about host rules in [ARC's wiki](https://github.com/advanced-rest-client/arc-electron/wiki/Host-rules).
