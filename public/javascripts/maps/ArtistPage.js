(function(global) {

    var Control = nokia.mh5.ui.Control,
        Carousel = nokia.mh5.ui.Carousel,
        List = nokia.mh5.ui.List,
        RowLayout = nokia.mh5.ui.RowLayout;

    if (!global.lastfm) {
        global.lastfm = {};
    }

    if (global.lastfm.ArtistPage) {
        return;
    }

    global.lastfm.ArtistPage = {
            layout: {
                type: RowLayout
            },
            cssClass: "mh5Page lastfm_ArtistPage",
            children: ["header", "artistHeader", "albums", "bio"],
            header: {
                control: Control,
                cssClass: "lastfm_header"
            },
            artistHeader: {
                control: Control,
                cssClass: "lastfm_overview mh5_standardBackgroundColorDark",
                dataDidChange: function(data) {
                    var innerHTML = "", image, imgSrc;

                    if (data) {
                        image = data.image;
                        imgSrc = (image["#text"] || (image.length && (image.filter(function (img) {
                            return img.size == "medium";
                        })[0]["#text"] || image[0]["#text"])));

                        innerHTML =
                            "<div>" +
                                "<div>" + data.name + "</div>" +
                                ((data.stats && data.stats.playcount) ? ("<div>" + data.stats.playcount + " plays</div>") : "") +
                            "</div>" +
                            (imgSrc ? "<img src=\"" + imgSrc + "\"/>" : "");
                    }
                    this.root.innerHTML = innerHTML;
                }
            },

            bio: {
                control: Control,
                cssClass: "lastfm_artistBio",
                dataDidChange: function(data) {
                    var innerHTML = "";
                    if (data && data.bio && data.bio.content) {
                        innerHTML = "<span>" + data.bio.summary + "</span>";
                    }
                    this.root.innerHTML = innerHTML;
                }
            },

            albums: {
                control: Carousel,
                dataDidChange: function(data) {
                    var i, image, images, thumbnailSrc, imageSrc;

                    this.imagePool = data ?  data.filter(function (item) {
                            image = item.image;
                            return image && (image.size == "medium" || image.some(function (img) {
                                return img.size == "medium";
                            }));
                        }).map(function (item) {
                            images = [].concat(item.image);
                            for (i = 0; (image = images[i]); i++) {
                                if (image.size === "medium") {
                                    thumbnailSrc = image["#text"];
                                } else if (image.size === "large" || image.size === "extralarge") {
                                    imageSrc = image["#text"];
                                }
                            }
                            return {
                                thumbnailSrc: thumbnailSrc,
                                imageSrc: imageSrc || thumbnailSrc
                            };
                        }) : [];
                }
            },

            model: {
                artistName: undefined
            },

            setModel: function(model) {
                if (model.artistName && model.artistName !== this.model.artistName) {
                    //clean the page
                    this.artistHeader.data = this.bio.data = this.albums.data = null;
                    this.model.artistName = model.artistName;
                    LastFmSearchAdapter.getArtistInfo(model.artistName, function(artistInfo) {
                        this.artistHeader.data = artistInfo;
                        this.bio.data = artistInfo;
                    }.bind(this),
                    function() {
                        //TODO show notification
                        //There's no notification...
                        //TODO remove comment about missing notification
                        console.log("error");
                    }.bind(this));
                    LastFmSearchAdapter.getTopAlbums(model.artistName, function(albums) {
                        this.albums.data = albums;
                    }.bind(this),
                    function() {
                        //TODO show notification
                        console.log("error");
                    }.bind(this));
                }
            }
        };
})(window);
