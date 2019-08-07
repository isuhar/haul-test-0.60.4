#!/usr/bin/env bash
./../node_modules/typescript/bin/tsc $@ -m commonjs --lib dom,es6  --noImplicitAny \
 noCyrillicInStringLiteralsRule.ts \
 noImportImmutableRule.ts \
 noReactComponentUsageRule.ts
