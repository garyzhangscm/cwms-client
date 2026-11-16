# Colton allocation mode UI

Apply allocation-mode.patch from the November 13 archived frontend source root.
It restores the existing Allocation Mode component controls while retaining the rules list.
The live outbound image already serves GET and PUT at /outbound/outbound-configuration/allocation-mode.

Image: localhost/mes-web-local:allocation-ui-20261115-01
Image ID: sha256:185077c6dd4d3fb9e553e19c05a567cfe086d1e19b2ea5a2a23c01b5de6dfa86
Browser entry: main-DNR4DXJG.js
Nginx: colton-web-login-route-20261114-01

Verified Angular production build and isolated browser read/save/reload and rules search.
Verified the deployed entry and login page, and synchronized the frontend startup manifest.
