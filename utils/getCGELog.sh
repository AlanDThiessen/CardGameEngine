#!/bin/sh
##############################################################
#
# This script performs a backup of the SimpleWar app data
# from your phone.  It then converts the backup file to a tar
# file, and extracts the "cge.log" file from the tar file.
#
##############################################################
#
# Required:
# - Android Debug Bridge
# - Android Backup Extractor:
#      https://github.com/nelenkov/android-backup-extractor
#
##############################################################

adb backup com.example.simplewar
#java -jar abe.jar unpack backup.ab SimpleWar.tar
dd if=backup.ab bs=1 skip=24|openssl zlib -d > SimpleWar.tar
tar -xvf SimpleWar.tar --strip-components 4 'apps/com.example.simplewar/f/files/cge.log'

