#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 [directory]"
  echo "Adds .mp3 and .m4a files in the specified directory, to the playlist."
  exit 1
fi

OUTPUT="$(dirname "$0")/playlist.txt"

find $1 -iname "*.mp3" -or -iname "*.m4a" > $OUTPUT
