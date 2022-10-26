# Validation action for Triple-T/gradle-play-publisher

This unnoficial action validates store assets from a [Triple-T/gradle-play-publisher](https://github.com/Triple-T/gradle-play-publisher) repository. Action made by [TrianguloY](https://github.com/TrianguloY) for own proyects, but made publicly so others can benefit from it.

Note that not all checks are performed. The idea is to add missing checks as soon as I have time and knowledge to implement them. You can create an [issue](https://github.com/TrianguloY/action-validate-Triple-T/issues) if you want to report a missing check, [PRs](CONTRIBUTING.md) are also welcomed.

Current checks, validated for all sourceSet, locales and tracks:
- `Missing default-language.txt`: The file _$appFolder/src/[sourceSet]/play/default-locale.txt_ must exist.
- `Invalid default-language.txt`: The file _$appFolder/src/[sourceSet]/play/default-locale.txt_ must match an [available language](https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages).
- `Invalid listing locale`: locale folders under _$appFolder/src/[sourceSet]/play/listings_ must match an [available language](https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages).
- `title.txt too large`: The file _$appFolder/src/[sourceSet]/play/listings/[locale]/title.txt_ must be 30 or less characters long (if exists).
- `short-description.txt too large`: The file _$appFolder/src/[sourceSet]/play/listings/[locale]/short-description.txt_ must be 80 or less characters long (if exists).
- `full-description.txt too large`: The file _$appFolder/src/[sourceSet]/play/listings/[locale]/full-description.txt_ must be 4000 or less characters long (if exists).
- `Invalid release-notes locale`: locale folders under _$appFolder/src/[sourceSet]/play/release-notes_ must match an [available language](https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages).
- `Changelog too large`: The files _$appFolder/src/[sourceSet]/play/release-notes/[locale]/[track].txt_ must be 500 or less characters long.
- `Too many images in icon`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/icon/_ must have 1 image (png|jpg|jpeg) or less.
- `Too many images in feature-graphic`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/feature-graphic/_ must have 1 image (png|jpg|jpeg) or less.
- `Too many images in phone-screenshots`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/phone-screenshots/_ must have 8 images (png|jpg|jpeg) or less.
- `Too many images in tablet-screenshots`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/tablet-screenshots/_ must have 8 images (png|jpg|jpeg) or less.
- `Too many images in large-tablet-screenshots`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/large-tablet-screenshots/_ must have 8 images (png|jpg|jpeg) or less.
- `Too many images in tv-banner`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/tv-banner/_ must have 1 image (png|jpg|jpeg) or less.
- `Too many images in tv-screenshots`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/tv-screenshots/_ must have 8 images (png|jpg|jpeg) or less.
- `Too many images in wear-screenshots`: The folder _${appFolder}/src/[sourceSet]/play/listings/[locale]/graphics/wear-screenshots/_ must have 8 images (png|jpg|jpeg) or less.


## Inputs

**`appFolder`**: The folder where the source is. Default `"app"`, which is the most common one, so an _./app/src/[sourceSet]/play_ directory exists on the root. \
For example, specifying "android/app" means that an _./android/app/src/[sourceSet]/play_ directory exists on the root.

**`ignore`**: A comma-separated list of checks to ignore. Default is an empty list (nothing is ignored). The checks must be specified with the id above, for example: `Changelog too large, title.txt too large` will not report nor fail if the changelogs or the title are longer than required (they will still be logged though). Note that if you want to ignore all errors you can also set the action with `continue-on-error: true`.

## Example usages

Minimum action sample
```yaml
name: Validate Triple-T store files
# template from https://github.com/TrianguloY/action-validate-Triple-T

on:      
  # Run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  validation:
    runs-on: ubuntu-latest
    steps:
      - name: Download project files
        uses: actions/checkout@v3
      
      - name: Validate Triple-T files
        uses: TrianguloY/action-validate-Triple-T@v1
```

Complete sample
```yaml
name: Validate Triple-T store files
# template from https://github.com/TrianguloY/action-validate-Triple-T

on:
  # run this worflow on branch push
  push:
      
  # run this worflow on pull requests
  pull_request:
      
  # Run this workflow manually from the Actions tab
  workflow_dispatch:

jobs:
  validation:
    runs-on: ubuntu-latest
    steps:
      - name: Download project files
        uses: actions/checkout@v3
      
      - name: Validate Triple-T files
        uses: TrianguloY/action-validate-Triple-T@v1
        continue-on-error: true
        with:
          appFolder: 'code/app'
          ignore: 'Changelog too large, title.txt too large'
```
