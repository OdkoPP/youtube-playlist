// Generate and display youtube playlist element with controll buttons and listed videos
function displayList() {
    getAllVideos().then(
        suc => {
            $('#ytp-container').remove();

            if( suc.length > 0 ) {
                $(`
                    <div id="ytp-container">
                        <div id="ytp-list-controll">
                                <button id="ytp-list-controll-next"> Next </button>
                                <button id="ytp-list-controll-empty"> Empty list</button>
                        </div>
                        <div id="ytp-list-container">
                            ${ suc.map( (v, i) => `
                                <div class="ytp-list-item" title="${ v.name }">
                                    <img class="ytp-list-item-img" src="${ v.img }">
                                    <div class="ytp-list-item-delete" data-video-index="${ i }" title="Remove from list">-</div>
                                </div>
                            `).join('') }
                        </div>
                    </div>
                `).appendTo('#masthead');

                $('.ytp-list-item-delete').off('click').on('click', ( e ) => {
                    const videoIndex = $( e.target ).data('video-index');
                    
                    if( videoIndex !== undefined ) {
                        removeVideoFromList( videoIndex );
                    } else {
                        displayList();
                    }
                });

                $('#ytp-list-controll-next').off('click').on('click', () => {
                    if( suc.length === 0) {
                        alert('no next')
                    } else {
                        playNext();
                    }
                });
    
                $('#ytp-list-controll-empty').off('click').on('click', () => {                
                    emptyList();
                });
            }
        },
        err => console.log( err )
    );
}

// Display "+" button inside every video thumbnail
var displayAddButtonTimeout;
function displayAddButton() {
    window.clearTimeout( displayAddButtonTimeout );

    displayAddButtonTimeout = setTimeout( () => {
        $('.ytp-add').remove();

        $('div#dismissable.ytd-compact-video-renderer, div#dismissable.ytd-grid-video-renderer, div#dismissable.ytd-video-renderer').each( (i, e) => {
            $(`<div class="ytp-add" title="Add to list">+</div>`).prependTo( e );
        });

        $('.ytp-add').off('click').on('click', (e) => {
            const videoContainer = $( e.target ).parent();
            const videoId   = videoContainer.find('a').attr('href').trim().split('v=')[1];
            const videoName = videoContainer.find('a h3').text().trim();
            const videoImg  = videoContainer.find('#thumbnail img').attr('src');
            addVideoToList( videoId, videoName, videoImg );
        });
    }, 100);
}

// Add one video to list
function addVideoToList( id, name, img ) {
    return new Promise ( (resolve, reject) => {
        getAllVideos().then(
            suc => {
                suc.push({
                    id: id,
                    name: name,
                    img: img
                });

                setAllVideos( suc ).then(
                    suc => {
                        displayList();
                        resolve();
                    },
                    err => reject( err )
                );
            },
            err => reject( err )
        );
    });
}

// Remove one video from list with specified list index
function removeVideoFromList( index ) {
    return new Promise ( (resolve, reject) => {
        getAllVideos().then(
            suc => {
                if( suc.length ) {
                    suc.splice( index, 1 );   
    
                    setAllVideos( suc ).then(
                        suc => {
                            displayList();
                            resolve();
                        },
                        err => reject( err )
                    );
                } else {
                    console.log('Nothing to remove');
                }
            },
            err => reject( err )
        );
    });
}

// Remove all videos from list
function emptyList() {    
    return setAllVideos( [] ).then(
        suc => displayList(),
        err => reject( err )
    );
}

// Play next video from list
var nextVideoTimeout;
function playNext() {
    window.clearTimeout( nextVideoTimeout );

    nextVideoTimeout = setTimeout( () => {
        getAllVideos().then(
            suc => {
                if( suc.length ) {
                    const nextVideo = suc[0];
                    removeVideoFromList( 0 ).then(
                        suc => window.location.href = "/watch?v=" + nextVideo.id,
                        err => console.log( err )
                    )
                }
            },
            err => console.log( err )
        );
    }, 100);
}

// Display list element with listed videos
$("body").on("DOMSubtreeModified", "#masthead #container", () => {
    displayList();

    // Play next video after current video ended
    $("video").off("ended").on("ended", () => {
        playNext();
    });
});

// Display add buttons when images are loaded
$("body").on("DOMSubtreeModified", "#dismissable img", () => {
    displayAddButton();
});
