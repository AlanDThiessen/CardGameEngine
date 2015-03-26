#!/usr/bin/env bash


echo "Copy App/Test Scripts..."

PROJECT_ROOT_DIR=$1
CGE_APP_DIR="$PROJECT_ROOT_DIR/../js"
CGE_TEST_DIR="$PROJECT_ROOT_DIR/../../tests/js/specs"
CGE_DEST_DIR="cge"
TEST_DEST_DIR="tests"

for platform in $CORDOVA_PLATFORMS; do
    assets="$PROJECT_ROOT_DIR/platforms/$platform/assets/www/js"

    echo "mkdir $assets/$CGE_DEST_DIR"
    `mkdir $assets/$CGE_DEST_DIR`
    echo "mkdir $assets/$TEST_DEST_DIR"
    `mkdir $assets/$TEST_DEST_DIR`

    echo "cp -r $CGE_APP_DIR/* $assets/$CGE_DEST_DIR/"
    `cp -r $CGE_APP_DIR/* $assets/$CGE_DEST_DIR/`
    echo "cp -r $CGE_TEST_DIR/* $assets/$TEST_DEST_DIR/"
    `cp -r $CGE_TEST_DIR/* $assets/$TEST_DEST_DIR/`
done

