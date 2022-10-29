// import
const { lstatSync, readdirSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

// inputs
const ignored = process.env.INPUT_IGNORE.split(/ *, */);
const appFolder = process.env.INPUT_APPFOLDER;

// main
function main(){
  
  // check folder
  if(!existsSync(appFolder)) {
    error("Invalid app folder", appFolder, `Folder '${appFolder}' does not exists. You can change it with the 'appFolder' input variable`);
    return;
  }

  // header
  console.log("Validating files:");

  // foreach sourceSet
  const srcPath = join(appFolder, 'src');
  if(!existsSync(srcPath)) log('SKIP', `No src folder found (${srcPath}), is 'appFolder' input correct?`);
  else dirs(srcPath).forEach(([sourceSet, sourceSetPath]) => {
    log(`SourceSet '${sourceSet}':`); 
    pad(()=>{

      // check default language file
      const defaultLanguagePath = join(sourceSetPath, "play", "default-language.txt");
      // check exists
      if(!existsSync(defaultLanguagePath)){
        log('ERROR', `'default-language.txt'`);
        error("Missing default-language.txt", defaultLanguagePath, `The file 'default-language.txt' (${defaultLanguagePath}) is missing. It just needs to contain the default locale (for example "en-US").`);
      }else{
        // and check valid
        const defaultLanguage = readFileSync(defaultLanguagePath).toString().trim();
        if(!validLocales.includes(defaultLanguage)){
          log('ERROR', `'default-language.txt'`);
          error("Invalid default-language.txt", defaultLanguagePath, `The file 'default-language.txt' (${defaultLanguagePath}) is not a valid Play Store locale: https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages`);      
        }else{
          log('OK', `'default-language.txt'`);
        }
      }

      // for each listing locale
      const listingsPath = join(sourceSetPath, "play", "listings");
      if(!existsSync(listingsPath)) log('SKIP', `No listings folder found (${listingsPath}), skipped`);
      else dirs(listingsPath).forEach(([locale, localePath]) => {
        const validLocale = validLocales.includes(locale);
        log(validLocale?'OK':'ERROR', `Listing locale '${locale}':`);

        // check locale label
        if(!validLocale){
          error("Invalid listing locale", localePath, `The locale '${locale}' (${localePath}) is not a valid Play Store locale: https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages`);
        }

        pad(()=>{

          // check files length
          ([
            ["title.txt", 30],
            ["short-description.txt", 80],
            ["full-description.txt", 4000],
          ]).forEach(([file, limit]) => {

            // get file
            const filePath = join(localePath, file);
            if(existsSync(filePath)){
              // file exists, check content length
              const size = readFileSync(filePath).toString().trim().length;
              log(size>limit?"ERROR":"OK", `'${file}' length: ${size}/${limit}`);
              if(size > limit) {
                // invalid length, error
                error(`${file} too large`, filePath, `File '${file}' (${filePath}) must be ${limit} or less characters long, current length: ${size}.`);
              }
            }else{
              // no file
              log("SKIP", `'${file}': not found, skipped`);
            }
          });

          // check images properties
          ([
            ["icon", 1, 512, 512],
            ["feature-graphic", 1, 1024, 500],
            ["phone-screenshots", 8, [320, 3840], [320, 3840]],
            ["tablet-screenshots", 8, [320, 3840], [320, 3840]],
            ["large-tablet-screenshots", 8, [320, 3840], [320, 3840]],
            ["tv-banner", 1, 1280, 720],
            ["tv-screenshots", 8, [320, 3840], [320, 3840]],
            ["wear-screenshots", 8, [320, 3840], [320, 3840]],
          ]).forEach(([folder, maxImages, validWidth, validHeight]) => {
            folder = join('graphics', folder);

            // get folder
            const folderPath = join(localePath, folder);
            if(existsSync(folderPath)){
              // folder exists, get images
              const images = files(folderPath).filter(([file, _]) => /\.(png|jpg|jpeg)$/.test(file));

              // check amount
              log(images.length>maxImages?'ERROR':'OK', `'${folder}/' images: ${images.length}/${maxImages}`);
              if(images.length > maxImages){
                // too many images
                error(`Too many images in ${folder}`, folderPath, `Folder '${folder}' (${folderPath}) must have ${maxImages} or less images (png, jpg or jpeg) but has ${images.length}.`);
              }

              // check each image
              pad(() => images.forEach(([image, imagePath])=>{

                // check dimensions
                const [width, height] = getDimensions(imagePath);
                const compare = (value, range) => (typeof range) == 'number' ? value == range : value >= range[0] && value <= range[1];
                const validDimensions = compare(width, validWidth) && compare(height, validHeight);
                log(validDimensions ? 'OK' : 'ERROR', `'${image}' width: ${width}/${JSON.stringify(validWidth)}, height: ${height}/${JSON.stringify(validHeight)}`);

                if(!validDimensions){
                  // invalid dimensions, error
                  const txt = (range) => (typeof range) == 'number' ? range : `between ${range[0]} and ${range[1]}`;
                  error(`Invalid {folder} image dimensions`, imagePath, `The ${folder} image ${image} (${imagePath}) must have width ${txt(validWidth)}, has ${width}; and height ${txt(validHeight)}, has ${height}`);
                }

              }));

            }else{
              // no file
              log("SKIP", `'${folder}/': not found, skipped`);
            }

          });

        });
      });

      // for each release locale
      const releaseNotesPath = join(sourceSetPath, "play", "release-notes");
      if(!existsSync(releaseNotesPath)) log('SKIP', `No release-notes folder found (${releaseNotesPath}), skipped`);
      else dirs(releaseNotesPath).forEach(([locale, localePath]) => {
        // check locale label
        const validLocale = validLocales.includes(locale);
        log(validLocale?'OK':'ERROR', `Release-notes locale '${locale}':`);

        if(!validLocale){
          // invalid locale, error
          error("Invalid release-notes locale", localePath, `The locale '${locale}' (${localePath}) is not a valid Play Store locale: https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages`);
        }

        pad(()=>{
          // for each release file
          files(localePath).filter(([file,_])=>file.endsWith(".txt")).forEach(([release, releasePath]) => {
            // check content length
            const limit = 500;
            const size = readFileSync(releasePath).toString().trim().length;
            log(size>limit?"ERROR":"OK", `'${release}' length: ${size}/${limit}`);
            if(size > limit) {
              // invalid length, error
              error("Changelog too large", releasePath, `File '${release}' (${releasePath}) must be ${limit} or less characters long, current length: ${size}.`);
            }
          });
        });

      });
    });

  });

  // end
  console.log("Validation finished");
}

///////////////////////////////////////////////////////////////////////////

// Logic Utils

// https://support.google.com/googleplay/android-developer/answer/9844778#zippy=%2Cview-list-of-available-languages
// [...document.querySelectorAll("div.zippy-overflow:nth-child(9) > div:nth-child(1) > ul:nth-child(2) > li")].map(e=>e.innerHTML.split('–')[1].trim())
const validLocales = ["af", "sq", "am", "ar", "hy-AM", "az-AZ", "bn-BD", "eu-ES", "be", "bg", "my-MM", "ca", "zh-HK", "zh-CN", "zh-TW", "hr", "cs-CZ", "da-DK", "nl-NL", "en-IN", "en-SG", "en-ZA", "en-AU", "en-CA", "en-GB", "en-US", "et", "fil", "fi-FI", "fr-CA", "fr-FR", "gl-ES", "ka-GE", "de-DE", "el-GR", "gu", "iw-IL", "hi-IN", "hu-HU", "is-IS", "id", "it-IT", "ja-JP", "kn-IN", "kk", "km-KH", "ko-KR", "ky-KG", "lo-LA", "lv", "lt", "mk-MK", "ms", "ms-MY", "ml-IN", "mr-IN", "mn-MN", "ne-NP", "no-NO", "fa", "fa-AE", "fa-AF", "fa-IR", "pl-PL", "pt-BR", "pt-PT", "pa", "ro", "rm", "ru-RU", "sr", "si-LK", "sk", "sl", "es-419", "es-ES", "es-US", "sw", "sv-SE", "ta-IN", "te-IN", "th", "tr-TR", "uk", "ur", "vi", "zu"];




// GitHub utils

let padding = 0;
function log(label, message=undefined) {
  if(message == undefined) [label, message] = ["",label];
  console.log(`[ ${label.padMiddle(5, ' ')} ]    ${''.padStart(padding,' ')}${message}`); 
}
function pad(f){ padding+=4; f(); padding-=4; }

function error(title, file, message) {
  if(ignored.includes(title)) return;
  process.exitCode = 1; 
  console.log(`\n::error file=${file},title=${title}::${message}\n`); 
}



// NodeJs Utils

function dirs(folder) {
  return readdirSync(folder)
    .map(subfolder => [subfolder, join(folder, subfolder)])
    .filter(([subfolder, path]) => lstatSync(path).isDirectory());
}
function files(folder) {
  return readdirSync(folder)
    .map(file => [file, join(folder, file)])
    .filter(([file, path]) => lstatSync(path).isFile());
}



// image utils

function getDimensions(path){
  // path as input to sanitize it
  return execSync('file -f -', {input:path}).toString().trim().match(/[\d]+ *x *[\d]+/).pop().split(/ *x */);
}



// Javascript utils

String.prototype.padMiddle = function(length, char){
  // adpated from https://stackoverflow.com/a/55891581
  	return this
    	.padStart(this.length + Math.floor((length-this.length)/2), char)
    	.padEnd(length,char);
}


// start
main();
