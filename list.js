// Generate and display youtube playlist element with controll buttons and listed videos
function displayList() {
    getAllVideos().then(
        suc => {
            $('#ytp-list-container').remove();
            $('#ytp-container').remove();

            $(`
                <div id="ytp-container">
                    <div id="ytp-list-controll">
                        ${ suc.length > 0 ? `
                            <button id="ytp-list-controll-next"> Next </button>
                            <button id="ytp-list-controll-empty"> Empty list</button>
                        `: ""}
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
            `).appendTo('#page-manager');

            $('.ytp-list-item-delete').off('click').on('click', ( e ) => {
                const videoIndex = $( e.target ).data('video-index');
                
                if( videoIndex !== undefined ) {
                    removeVideoFromList( videoIndex );
                } else {
                    displayList();
                }
            });

            if( suc.length > 0 ) {
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
function displayAddButton() {
    $('.ytp-add').remove();

    $('div#dismissable.ytd-compact-video-renderer').each( (i, e) => {
        $(`<div class="ytp-add" title="Add to list">+</div>`).appendTo( e );
    });

    $('.ytp-add').off('click').on('click', (e) => {
        const videoContainer = $( e.target ).parent();
        const videoId   = videoContainer.find('a').attr('href').trim().split('v=')[1];
        const videoName = videoContainer.find('a h3').text().trim();
        const videoImg  = videoContainer.find('#thumbnail img').attr('src');
        addVideoToList( videoId, videoName, videoImg );
    });
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
function playNext() {   
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
}

// Display list element when 'page-manager' element is ready
var checkPageManagerElementExist = setInterval( () => {
    if ($('#page-manager').length) {
        clearInterval( checkPageManagerElementExist );
        displayList();
    }
}, 100);

// Display add buttons when images are loaded 
$("body").on('DOMSubtreeModified', "#items #dismissable img", () => {   
    displayAddButton();
});

// Play next video after current video ended
$('video').on('ended', () => {
    playNext();
});
