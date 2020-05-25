// Generate and display youtube playlist element with control buttons and listed videos
function displayList() {
    getAllVideos().then(
        suc => {
            $('#ytp-container').remove();

            if(suc.length > 0) {
                $(`
                    <div id="ytp-container">
                        <div id="ytp-list-control">
                            <button id="ytp-list-control-next"> Next </button>
                            <button id="ytp-list-control-empty"> Empty list</button>
                        </div>
                        <div id="ytp-list">
                            ${ suc.map( (v, i) => `
                                <div class="ytp-list-item" title="${ v.name }" data-id="${ v.id }">
                                    <img class="ytp-list-item-img" src="${ v.img }">
                                    <div class="ytp-list-item-delete" data-video-index="${ i }" title="Remove from list">-</div>
                                </div>
                            `).join('') }
                        </div>
                    </div>
                `).appendTo('#masthead');

                $('#ytp-list').height( $(window).height() - ($('#ytp-list').offset().top - $(window).scrollTop()) );

                $('.ytp-list-item-delete').off('click').on('click', e => {
                    const videoIndex = $(e.target).data('video-index');
                    
                    if(videoIndex !== undefined) {
                        removeVideoFromList(videoIndex);
                    } else {
                        displayList();
                    }
                });

                $('#ytp-list-control-next').off('click').on('click', () => {
                    playNext();
                });
    
                $('#ytp-list-control-empty').off('click').on('click', () => {
                    emptyList();
                });

                $('#ytp-container').off('scroll').on('scroll', e => {
                    e.stopPropagation();
                });

                $('#ytp-list').sortable({
                    update: (event, ui) => {
                        const newVideoIdsOrder = [];
                        $(event.target).find('.ytp-list-item').each( (i, e) => newVideoIdsOrder.push($(e).data('id')));

                        getAllVideos().then(
                            suc => {
                                newVideosOrder = [];
                                for(let videoId of newVideoIdsOrder) {
                                    newVideosOrder.push(suc.filter( e => e.id == videoId)[0]);
                                }
                                setAllVideos(newVideosOrder).then(
                                    () => {
                                        displayList();
                                    },
                                    err => reject(err)
                                );
                            },
                            err => console.log(err)
                        );
                    }
                });
                  
            }
        },
        err => console.log(err)
    );
}

// Display "+" button inside every video thumbnail
var displayAddButtonTimeout;
function displayAddButton() {
    window.clearTimeout(displayAddButtonTimeout);

    displayAddButtonTimeout = setTimeout( () => {
        $('.ytp-add').remove();

        const videContainerId = 'div#dismissable';
        const videContainerClasses = [
            'ytd-rich-grid-video-renderer',    // Home screen
            'ytd-video-renderer',              // Search screen
            'ytd-compact-video-renderer'       // Player screen
        ];
        $(videContainerId + '.' + videContainerClasses.join(', ' + videContainerId + '.')).each( (i, e) => {
            $(`<div class="ytp-add" title="Add to list">+</div>`).prependTo(e);
        });

        $('.ytp-add').off('click').on('click', e => {
            const videoContainer = $( e.target ).parent();
            const videoId   = videoContainer.find('a').attr('href').trim().split('v=')[1];
            const videoName = videoContainer.find('#details h3').text().trim();
            const videoImg  = videoContainer.find('#thumbnail img').attr('src');
            addVideoToList(videoId, videoName, videoImg);
        });
    }, 100);
}

// Add one video to list
function addVideoToList(id, name, img) {
    return new Promise ( (resolve, reject) => {
        getAllVideos().then(
            suc => {
                suc.push({
                    id: id,
                    name: name,
                    img: img
                });

                setAllVideos(suc).then(
                    suc => {
                        displayList();
                        resolve();
                    },
                    err => reject(err)
                );
            },
            err => reject(err)
        );
    });
}

// Remove one video from list with specified list index
function removeVideoFromList(index) {
    return new Promise ( (resolve, reject) => {
        getAllVideos().then(
            suc => {
                if(suc.length) {
                    suc.splice(index, 1);   
    
                    setAllVideos(suc).then(
                        suc => {
                            displayList();
                            resolve();
                        },
                        err => reject(err)
                    );
                } else {
                    console.log('Nothing to remove');
                }
            },
            err => reject(err)
        );
    });
}

// Remove all videos from list
function emptyList() {    
    return setAllVideos([]).then(
        suc => displayList(),
        err => reject(err)
    );
}

// Play next video from list
var nextVideoTimeout;
function playNext() {
    window.clearTimeout(nextVideoTimeout);

    nextVideoTimeout = setTimeout( () => {
        getAllVideos().then(
            suc => {
                if(suc.length) {
                    const nextVideo = suc[0];
                    removeVideoFromList(0).then(
                        suc => window.location.href = '/watch?v=' + nextVideo.id + '&fullscreen=' + document.fullscreen,
                        err => console.log(err)
                    )
                }
            },
            err => console.log(err)
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
