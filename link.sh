#!/bin/bash
rm -rf client/src/GameCommon.ts server/src/game/GameCommon.ts
ln common/src/GameCommon.ts server/src/game
ln common/src/GameCommon.ts client/src