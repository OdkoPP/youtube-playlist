const videosListStorageKeyName = "videos";
const browser = browser || chrome;

function getAllVideos() {
    return browser.storage.local.get( videosListStorageKeyName ).then(
        suc => ( suc[videosListStorageKeyName] !== undefined ) ? suc[videosListStorageKeyName] : [],
        err => 'Failed to get all videos'
    );
}

function setAllVideos( allVideos ) {
    return browser.storage.local.set( {[videosListStorageKeyName]:allVideos} ).then(
        suc => allVideos,
        err => 'Failed to set all accounts'
    );
}
