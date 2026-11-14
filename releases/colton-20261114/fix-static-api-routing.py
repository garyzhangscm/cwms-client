"""Patch a supplied site Nginx template without storing private site configuration.

Usage: python3 fix-static-api-routing.py INPUT OUTPUT
Validate the rendered candidate with nginx -t before applying it.
"""
from pathlib import Path
import sys

def patch(text):
    rules = [
        ('^/(?:.*/)?', '^/(?!api/)(?:.*/)?'),
        (r'location ~* \.mjs$', r'location ~* ^/(?!api/).*\.mjs$'),
        (r'location ~* \.(?:js|mjs|css|json|map)$',
         r'location ~* ^/(?!api/).*\.(?:js|mjs|css|json|map)$'),
    ]
    for old, new in rules:
        if old not in text and text.count(new) == 1:
            continue
        if text.count(old) != 1:
            raise ValueError('Unexpected template; review the static route rules manually.')
        text = text.replace(old, new)
    return text

if __name__ == '__main__':
    Path(sys.argv[2]).write_text(patch(Path(sys.argv[1]).read_text()))
