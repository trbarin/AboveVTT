import { Library } from './library.js'

/**
 * A track is a representation of an audio file on the internet
 */
class Track {
    /**
     * The name of the track
     * @type {string}
     */
    name;

    /**
     * The source url of the track
     * @type {string}
     */
    src;

    /**
     * A list of tags about the track
     * @type {Array.<string>}
     */
    tags = [];

    /**
     * @param {string} name
     * @param {string} src
     */
    constructor(name, src) {
        this.name = name;
        this.src = src;
    }

    /**
     * @param {Array} tags
     */
    setTags(tags) {
        this.tags = tags;
    }

    /**
     * @param {*} obj
     * @returns {Track}
     */
    static assign(obj) {
        return Object.assign(new Track(), obj);
    }
}

/**
 * The track library singleton
 * @extends {Library<Track>}
 */
class TrackLibrary extends Library {
    constructor() {
        super(new Track());
         if (localStorage.getItem("Soundpads") != null) { // import old sound pad tracks. I'm not deleting this local storage in case we make folders/playlists and can use the data there.
            window.SOUNDPADS = $.parseJSON(localStorage.getItem("Soundpads"));
            const newTracks = [];
            const updateTracks = new Map();

            for(let pad in  window.SOUNDPADS){
                for(let folder in window.SOUNDPADS[pad]){
                    for(let i in window.SOUNDPADS[pad][folder]){
                        let t = window.SOUNDPADS[pad][folder][i];
                        const track = new Track(t.name, t.src);
                        track.setTags = [folder];
                        const existingTrack = this.find(track.name, track.src);
                        if ( typeof existingTrack === 'undefined' ) {
                            newTracks.push(track);
                        } else {
                            updateTracks.set(existingTrack[0], track);
                        }
                    }
                }
            }
            console.log('Importing new tracks')
            console.table(newTracks)
            this.create(...newTracks);

            console.log('Importing exiting tracks')
            console.table(Object.fromEntries(updateTracks))
            this.batchUpdate(updateTracks);
            localStorage.removeItem("Soundpads");
        }
    }

    filterTrackLibrary(searchFilter = ''){
        let tracks = $('#track-list .audio-row');
      
        tracks.show();           
        if(searchFilter != ''){
            let filterArray = searchFilter.split(" ");
            let regex = new RegExp( filterArray.join( "|" ), "i");
            tracks.filter(item => !regex.test(tracks[item].textContent) && 
                !this.find(tracks[item].textContent, tracks[item].dataset.src)[1].tags
                    .some(function(tag) { return regex.test(tag); }))
                        .hide();
        }

    }
    /**
     *
     * @param {string} name
     * @param {string} src
     * @returns {[string, Track]}
     */
    find(name, src) {
        return [...this.map()].find(([_, track]) => track.name === name || track.src === src);
    }
    deleteTrack(id){
        this.delete(id);
    }
    addTrack(name, src, tags=[]){
        const track = new Track(name, src);  
        track.tags = tags;
        this.create(track);
    }
    /**
     * Import a csv of tracks into the track library
     * @param {string} csv
     */
    importCSV(csv) {
        const importList = $.csv.toObjects(csv);
        const newTracks = [];
        const updateTacks = new Map();

        importList.forEach(t => {
            const track = new Track(t.name, t.src);
            track.tags = t.tags.split("|");
            const existingTrack = this.find(track.name, track.src);
            if ( typeof existingTrack === 'undefined' ) {
                newTracks.push(track);
            } else {
                updateTacks.set(existingTrack[0], track);
            }
        });

        console.log('Importing new tracks')
        console.table(newTracks)
        this.create(...newTracks);

        console.log('Importing exiting tracks')
        console.table(Object.fromEntries(updateTacks))
        this.batchUpdate(updateTacks);
    }
}

const trackLibrary = new TrackLibrary();


export { Track, trackLibrary };
