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
#
##############################################################

adb backup com.intuitiveengineer.cgetest
dd if=backup.ab bs=1 skip=24|openssl zlib -d > CGETest.tar
tar -xvf CGETest.tar --strip-components 4 'apps/com.intuitiveengineer.cgetest/f/files/cge.log'

