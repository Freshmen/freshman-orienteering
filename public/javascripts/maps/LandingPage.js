(function(global) {
    if (!global.lastfm) {
        global.lastfm = {};
    }
    if (global.lastfm.LandingPage) {
        return;
    }

    var RowLayout = nokia.mh5.ui.RowLayout,
        ColumnLayout = nokia.mh5.ui.ColumnLayout,
        Control = nokia.mh5.ui.Control,
        Map = nokia.mh5.components.Map,
        Container = nokia.mh5.ui.Container,
        Search = nokia.mh5.components.Search,
        List = nokia.mh5.ui.List;


    var EventListItem = new nokia.mh5.Class(Control, function (parent) {

        return {
            rootHtmlElementName: "li",
            cssClass: "lastfm_eventListItem",
            constructor: function(props, parentContainer) {
                parent.constructor.call(this, props, parentContainer);
                this.update();
            },

            update: function() {
                var innerHTML = "<div>";
                if (this.eventName) {
                    innerHTML += "<div class='lastfm_eventTitle'>" + this.eventName + "</div>";
                }
                if (this.name) {
                    innerHTML += "<div class='lastfm_eventAddress'>" + this.name + "</div>";
                }

                if (this.address) {
                    innerHTML += "<div class='lastfm_eventAddress'>" + this.address + "</div>";
                }
                innerHTML += "</div>";
                if (this.eventImage) {
                    innerHTML += "<img src=" + this.eventImage + ">";
                }
                this.root.innerHTML = innerHTML;
            }
        };
     });

    global.lastfm.LandingPage = {
        cssClass: "lastfm_LandingPage mh5_Page",
        layout: {
            type: RowLayout
        },
        children: ["header", "searchBar", "notification", "map", "listContainer", "details"],
        header: {
            control: Control,
            cssClass: "lastfm_header"
        },
        searchBar: {
            control: Container,
            cssClass: "mh5_baseBackgroundColor",
            layout: {
                type: ColumnLayout
            },
            children: ["button", "search"],
            button: {
                control: nokia.mh5.ui.SegmentedButton,
                cssClass: "mh5_SegmentedIconButton mh5_mode mh5_ColumnLayout lastfm_search_options_button",
                items: [
                    {value: "geo", iconClass: "lastfm_search_options_segment lastfm_geosearch"},
                    {value: "artist", iconClass: "lastfm_search_options_segment lastfm_artistsearch"}
                ],
                onValueChange: function(value) {
                    var text = value == "geo" ? "Search by Location" : "Search by Artist name",
                        searchParams = this.parent.search.parameters;
                    this.parent.search.input.placeholder = text;
                    searchParams.method = value + ".getevents";
                }
            },
            search: {
                control: Search,
                searchAdapter: LastFmSearchAdapter,
                input: {
                    placeholder: "Search by Location"
                },
                cssClass: "mh5_Search mh5_box-flex1",
                parameters: {
                    method: "artist.getevents"
                },
                listeners: {
                    success: function(e) {
                        var results = e.data.results,
                            page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
                        if (results.length > 0) {
                            page.notification.visible = false;
                            page.model.items = results;
                        } else {
                             page.notification.timeout = nokia.mh5.ui.Notification.TIMEOUT_DEFAULT;
                             page.notification.text = "No events found.";
                        }
                    },
                    error: function(e) {
                        var page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
                        page.notification.timeout = nokia.mh5.ui.Notification.TIMEOUT_DEFAULT;
                        page.notification.text = e.data.message || "There was an error processing your request.";
                    },
                    beforesearch: function(e) {
                        var page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
                        page.notification.timeout = nokia.mh5.ui.Notification.TIMEOUT_INFINITY;
                        page.notification.text = "Searching ...";
                        page.notification.visible = true;
                        page.model.items = [];
                    },
                    clear: function() {
                        this.getRootOwnerByClass(nokia.mh5.ui.Page).model.items = [];
                    }
                }
            }
        },
        notification: {
           control: nokia.mh5.ui.Notification,
           visible: false
        },
        map: {
            control: Map,
            cssClass: "mh5_Map mh5_box-flex1",
            addressLookup: false,
            suggestions: false,

            infoBubble: {
                content: ["title", "description"],
                listeners: {
                    click: function() {
                        this.parent.parent._showDetails(this.poi.data);
                    }
                }
            },

            listeners: {
                poiclick: function(e) {
                    var poi = e.data[0],
                        event = poi.data;
                    if (!poi.infoBubble) {
                        this.hideInfoBubble();
                        this.showInfoBubble(poi, {
                            content: ["title", "description"],
                            title: event.eventName,
                            description: event.address,
                            left: event.eventImage
                        });
                    }
                    e.preventDefault();
                }
            }
        },
        listContainer: {
            control: Container,
            cssClass: "lastfm_listContainer",
            children: ["gap", "list"],
            vScroll: true,
            bounce: false,
            visible: false,
            layout: {
                type: RowLayout
            },
            gap: {
                control: Control,
                cssClass: "lastfm_gap",
                onClick: function() {
                    this.parent.visible = false;
                    this.parent.parent.map.passive = false;
                }
            },
            list: {
                control: List,
                cssClass: "mh5_List",
                itemClass: EventListItem,
                itemsDidChange: function(items) {
                    var self = this;

                    self.constructor.prototype.itemsDidChange.apply(self, arguments);

                    if (items && items.length) {

                        if ("_timeoutId" in self) {
                            global.clearTimeout(self._timeoutId);
                            delete self._timeoutId;
                        }

                        self._timeoutId = global.setTimeout(function () {
                            var parent = self.parent,
                                root = self.root;

                            // This piece of code adds additional empty space if the list of events is too small to
                            // cover the map below.
                            root.style.height = root.parentNode.style.height = root.parentNode.parentNode.style.height =
                                (root.offsetHeight + parent.gap.root.offsetHeight < parent.root.offsetHeight) ? "100%" : "auto";
                            parent._scroll.refresh();
                        }, 0);
                    }
                },
                listeners: {
                    tap: function(event) {
                        var page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
                        page._showDetails(event.data.item);
                    }
                }
            },
            visibleDidChange: function(visible) {
                this.constructor.prototype.visibleDidChange.apply(this, arguments);
                var page = this.parent;
                if (visible) {
                    page.map.passive = true;
                } else if (!visible && !page.details.visible) {
                    page.map.passive = false;
                    page.map.resize();
                }
            }

        },
        details: {
            control: nokia.mh5.components.PlaceDetails,
            visible: false,
            listeners: {
                update: function(e) {
                    var lfmEvent = e.data;
                    //differentiate between last fm events and nokia places. The event overview is shown only for events
                    if (!lfmEvent || !lfmEvent.eventId) {
                        this.overview.visible = false;
                        this.artistTitle.visible = false;
                        this.artistList.visible = false;
                    } else {
                        this.overview.root.innerHTML =
                            "<div class='lastfm_content'>" +
                                "<div class='lastfm_eventName'>" + lfmEvent.eventName + "</div>" +
                                "<div> <span>Date</span>: " + lfmEvent.startDate + "<span> Attendance</span>: " + lfmEvent.attendance + "</div>" +
                            "</div>" +
                            (lfmEvent.eventImage? "<img src=\"" + lfmEvent.eventImage + "\"/>" : "");

                        this.overview.visible = true;
                        this.artistList.items = lfmEvent.artists;
                        if (this.artistList.items.length > 0) {
                            this.artistTitle.visible = true;
                            this.artistList.visible = true;
                        }
                    }
                },
                nearby: function(event) {
                    event.preventDefault();
                }
            },
            actions: {
                share: null,
                route: null
            },
            customContent: [{
                name: "gap",
                before: "summary",
                cssClass: "lastfm_gap",
                onClick: function() {
                    this.parent.visible = false;
                    this.parent.parent.map.passive = false;
                }
            }, {
                name: "overview",
                before: "summary",
                cssClass: "lastfm_overview mh5_standardBackgroundColorDark"
            }, {
                name: "artistTitle",
                after: "actions",
                cssClass: "lastfm_artistTitle",
                innerHTML: "<span>Artists</span>"
            }, {
                name: "artistList",
                cssClass: "lastfm_ArtistList mh5_List",
                before: "spinner",
                control: List,
                layout: {
                    type: nokia.mh5.ui.AutoLayout
                },
                itemClass: new nokia.mh5.Class(Control, function (parent) {
                    return {
                        rootHtmlElementName: "li",
                        cssClass: "lastfm_artistListItem",
                        constructor: function(props, parentContainer) {
                            parent.constructor.call(this, props, parentContainer);
                            this.update();
                        },
                        update: function() {
                            var innerHTML = "";
                            if (this.name) {
                                innerHTML += "<span>" + this.name + "</span>";
                            }
                            this.root.innerHTML = innerHTML;
                        }
                    };
                }),

                listeners: {
                    tap: function(e) {
                        if (e.data.item.name) {
                            nokia.mh5.app.controller.switchTo("artist", {artistName: e.data.item.name});
                        } else {
                            var page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
                            page.notification.timeout = nokia.mh5.ui.Notification.TIMEOUT_DEFAULT;
                            page.notification.text = "There was an error processing your request.";
                        }
                    }
                }
            }],
            visibleDidChange: function(visible, oldVisible) {
                this.constructor.prototype.visibleDidChange.apply(this, arguments);
                var page = this.parent;
                if (visible) {
                    page.map.passive = true;
                } else if (!visible && oldVisible) {
                    //check for oldVisible make sure that details was visible before
                    page.map.pois = page.model.items;
                    if (!page.listContainer.visible) {
                        page.map.passive = false;
                        page.map.resize();
                        var selectedPoi = page.map.getPois(this.place, true);
                        if (selectedPoi) {
                            page.map.hideInfoBubble();
                            page.map.showInfoBubble(selectedPoi, {
                                content: ["title", "description"],
                                title: selectedPoi.data.eventName,
                                description: selectedPoi.data.address,
                                left: selectedPoi.data.eventImage
                            });
                        }
                    }
                }
            }
        },

        _showDetails: function(item) {
            var poi = this.map.getPois(item, true);
            this.map.hideInfoBubble();
            this.map.pois = [];
            this.map.addPoi(poi);
            this.details.place = item;
            this.details.visible = true;
            this.listContainer.visible = false;
            setTimeout(function() {
                if (this.details.visible) {
                    this.map.moveTo(getMapCenterToShowPoiInGap.call(this, poi, -poi.image.height/2, this.details.gap, this.map));
                }
            }.bind(this), 1000);
        },

        model: {
            method: "geo.getevents",
            location: null,
            items: []
        },

        build: function() {
            this.constructor.prototype.build.call(this);
            this.searchBar.button.select("geo");
            Control.watch(this.model, "items", this, function (items) {
                if (!items) {
                    items = [];
                }
                this.listContainer.list.items = items;
                this.details.visible = false;
                this.details.place = null;

                nokia.mh5.app.controller.updateHistoryEntry();

                if (items.length > 0) {
                    this.map.zoom = 14;
                    this.listContainer.visible = true;
                    setTimeout(function() {
                        this.map.pois = items;
                        if (this.listContainer.visible) {
                            var poi = this.map.pois[0];
                            this.map.moveTo(getMapCenterToShowPoiInGap.call(this, poi, -poi.image.height/2, this.listContainer.gap, this.map));
                        }
                    }.bind(this), 1000);
                } else {
                    this.listContainer.visible = false;
                }
            });
        },

        setModel: function(model) {
            if (model.items && model.items !== this.model.items) {
                this.model.items = model.items;
            }
        }
    };

    var getMapCenterToShowPoiInGap = function(poi, offset, gap, map) {
        var gapRoot = gap.root,
            centerCoordGlobal = map.geoToPoint(map.center),
            centerCoordDOM = {
                x: map.size.width / 2,
                y: map.size.height / 2
            },
            poiCoordGlobal = map.geoToPoint(poi),
            dxOldPosToCenterGlobal = centerCoordGlobal.x - poiCoordGlobal.x,
            dyOldPosToCenterGlobal = centerCoordGlobal.y - poiCoordGlobal.y,
            poiCoordDom = {
                x: centerCoordDOM.x - dxOldPosToCenterGlobal,
                y: centerCoordDOM.y - dyOldPosToCenterGlobal
            },
            poiNewCoordDom = {
                x: map.size.width / 2,
                y: gapRoot.offsetTop + gapRoot.offsetHeight/ 2
            },
            dx = poiNewCoordDom.x - poiCoordDom.x,
            dy = poiNewCoordDom.y - poiCoordDom.y,
            newCenterGlobal = {
                x: centerCoordGlobal.x - dx,
                y: centerCoordGlobal.y - dy + offset
            };
        return map.pointToGeo(newCenterGlobal);
    };
})(window);
