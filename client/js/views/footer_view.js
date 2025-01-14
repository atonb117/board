/**
 * @fileOverview This file has functions related to list view. This view calling from application view and board view.
 * boardActivities() used for sync @see boardActivities function below
 * Available Object:
 *	this.model						: board model. It contain all board based object @see Available Object in App.BoardView
 */
if (typeof App == 'undefined') {
    App = {};
}
/**
 * Footer View
 * @class FooterView
 * @constructor
 * @extends Backbone.View
 */
App.FooterView = Backbone.View.extend({
    template: JST['templates/footer'],
    className: 'row navbar navbar-default list-group-item-text',
    /**
     * Events
     * functions to fire on events (Mouse events, Keyboard Events, Frame/Object Events, Form Events, Drag Events, etc...)
     */
    events: {
        'click .js-open-popover': 'openPopup',
        'click .js-show-organizations-board-from': 'showOrganizationsBoardFrom',
        'click .js-show-board-add-form': 'showBoardAddForm',
        'click .js-show-organizations-add-form': 'showOrganizationsAddForm',
        'click .js-show-instant-card-from': 'showInstantCardFrom',
        'click .js-show-chat': 'showChat',
        'click .js-show-boards-list': 'showBoardsList',
        'click .js-collapse-myboards': 'collapseMyBoards',
        'click .js-collapse-closedboards': 'collapseClosedBoards',
        'click .js-collapse-starred-boards': 'collapseStarredBoards',
        'click .js-expand-myboards': 'expandMyBoards',
        'click .js-expand-closedboards': 'expandClosedBoards',
        'click .js-expand-starred-boards': 'expandStarredBoards',
        'keyup .js-search-boards': 'showSearchBoards',
        'click .js-all-activities': function() {
            $('.js-all-activity-list').removeClass('hide');
            $('.js-boards-activity-list').addClass('hide');
            $('#js-load-link2').removeClass('hide');
            $('#js-load-link1').addClass('hide');
            this.userActivities(false, 2);
        },
        'click .js-all-user-activities': 'showUserActivities',
        'click .js-product-beat-action': 'actionBeat',
        'click .js-board-activities': function() {
            is_append_activities = true;
            $('#js-notification-load-more').removeClass('js-all-load-more').addClass('js-board-load-more');
            $('#js-notification-load-more-all').removeClass('js-all-load-more-all').addClass('js-board-load-more-all');
            $('.js-all-activity-list').addClass('hide');
            $('.js-boards-activity-list').removeClass('hide');
            $('#js-load-link2').addClass('hide');
            $('#js-load-link1').removeClass('hide');
            this.boardActivities();
        },
        'click .js-all-board-activities': 'showBoardActivities',
        'click .js-notification-menu': 'notificationMenu',
        'keyup .js-search': 'qSearch',
        'click .js-close-popover': 'closePopup',
        'click .js-search': 'showSearchMsg',
        'focusout .js-search': 'searchClose',
        'submit form.js-instantCardAddForm': 'addInstantCard',
        'click .js-show-notification': 'showNotification',
        'click .js-back-boards-list': 'showBackBoardsList',
        'click .js-board-load-more': function(e) {
            e.preventDefault();
            this.loadMore('board', '1');
            return false;
        },
        'click .js-all-load-more': function(e) {
            e.preventDefault();
            this.loadMore('user', '1');
            return false;
        },
        'click .js-board-load-more-all': function(e) {
            e.preventDefault();
            this.loadMore('board', '0');
            return false;
        },
        'click .js-all-load-more-all': function(e) {
            e.preventDefault();
            this.loadMore('user', '0');
            return false;
        },
        'click .js-enable-desktop-notification': 'enabledesktopNotification',
        'click .js-show-board-import-form': 'showBoardImportForm',
        'change .js-board-import-file': 'importBoard',
    },
    /**
     * Constructor
     * initialize default values and actions
     */
    initialize: function(options) {
        if (!_.isUndefined(this.model) && this.model !== null) {
            this.model.showImage = this.showImage;
        }
        this.music_content = '';
        if (!_.isUndefined(App.music) && App.music.music_content !== null) {
            this.music_content = App.music.music_content;
        }
        this.music_name = '';
        if (!_.isUndefined(App.music) && App.music.music_name !== null) {
            this.music_name = App.music.music_name;
        }
        this.board_id = options.board_id;
        this.board = options.board;
        _.bindAll(this, 'renderClosedBoards', 'renderStarredBoards');
        if (!_.isUndefined(App.boards)) {
            App.boards.bind('add remove change', this.renderClosedBoards);
        }
    },
    /**
     * render()
     * populate the html to the dom
     * @param NULL
     * @return object
     *
     */
    render: function() {
        this.model.is_show_enable_notification = false;
        var current_param = Backbone.history.fragment;
        var current_param_split = current_param.split('/');
        this.showTooltip();
        this.model.current_param = (current_param.indexOf('changepassword') === -1 && current_param.indexOf('login') === -1 && current_param.indexOf('forgotpassword') === -1 && current_param.indexOf('register') === -1 && current_param.indexOf('activation') === -1) ? current_param_split[0] : '';
        if (typeof Notification != 'undefined') {
            this.model.is_show_enable_notification = (Notification.permission == 'default') ? true : false;
        }
        if (typeof Notification != 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission(function(permission) {
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                if (permission === 'granted') {
                    var notification = new Notification('Desktop notification enabled.');
                }
            });
        }
        this.$el.html(this.template({
            model: this.model,
            board_id: this.board_id,
        }));
        var board_activities = new App.FooterView({
            model: authuser
        });
        if (_.isEmpty(this.board_id)) {
            if (!_.isUndefined(authuser.user)) {
                if (authuser.user.notify_count > 0) {
                    $('#js-notification-count').removeClass('hide').html(authuser.user.notify_count);
                    favicon.badge(authuser.user.notify_count);
                } else {
                    favicon.badge(0);
                    $('#js-notification-count').addClass('hide');
                }
                clearInterval(set_interval_id);
                set_interval_id = setInterval(function() {
                    board_activities.userActivities(false, 1);
                }, 10000);
            }
            $('#js-load-link1').addClass('hide');
            $('#js-load-link2').addClass('hide');
        } else {
            $('#js-load-link2').addClass('hide');
        }


        return this;
    },
    /**
     * actionBeat()
     * show instant card add form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    actionBeat: function(e) {
        var type = $(e.currentTarget).data('type');
        var set_type = '';
        var set_icon = '';
        var set_animation = '';
        var remove_animation = '';
        var remove_icon = '';
        var volume = false;
        if (type === 'off') {
            volume = true;
            set_type = 'on';
            set_icon = 'icon-volume-up';
            set_animation = 'tada-animation';
            remove_icon = 'icon-volume-off text-muted';
        } else {
            set_type = 'off';
            set_icon = 'icon-volume-off text-muted';
            remove_icon = 'icon-volume-up';
            remove_animation = 'tada-animation';
        }
        var music_content = '';
        if (!_.isUndefined(authuser.user) && !_.isUndefined(authuser.user.is_productivity_beats)) {
            var user = new App.User();
            user.url = api_url + 'users/' + authuser.user.id + '.json';
            user.set('id', parseInt(authuser.user.id));
            user.save({
                'is_productivity_beats': volume
            });
            authuser.user.is_productivity_beats = volume;
            var Auth = JSON.parse(window.sessionStorage.getItem('auth'));
            Auth.user.is_productivity_beats = volume;
            window.sessionStorage.setItem('auth', JSON.stringify(Auth));
            $(e.currentTarget).data('type', set_type);
            $(e.currentTarget).find('i').removeClass(remove_icon).addClass(set_icon);
            $(e.currentTarget).find('i').removeClass(remove_animation).addClass(set_animation);
            if (!_.isEmpty(App.music.music_content) && App.music.music_content != 'NULL') {
                var repeatMusic = new App.MusicRepeatView();
                repeatMusic.continueMusic();
            }
        } else {
            if (volume === true) {
                window.sessionStorage.setItem('music_play', "1");
            } else {
                window.sessionStorage.setItem('music_play', "0");
            }
            $(e.currentTarget).data('type', set_type);
            $(e.currentTarget).find('i').removeClass(remove_icon).addClass(set_icon);
            $(e.currentTarget).find('i').removeClass(remove_animation).addClass(set_animation);
            if (window.sessionStorage.getItem('music_play') !== undefined && window.sessionStorage.getItem('music_play') === "1") {
                var repeatMus = new App.MusicRepeatView();
                repeatMus.continueMusic();
            }
        }
        return false;
    },
    /**
     * showInstantCardFrom()
     * show instant card add form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showInstantCardFrom: function(e) {
        e.preventDefault();
        var instantCardAdd = new App.InstantCardAdd({
            board_id: '',
            list_id: ''
        });
        var cardAddView = new App.InstantCardAddView({
            model: instantCardAdd,
            board: this.board
        });
        return false;
    },
    /**
     * showChat()
     * show chat form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showChat: function(e) {
        e.preventDefault();
        var chat = new App.ChatView({
            model: chat,
        });
        return false;
    },
    /**
     * showBackBoardsList()
     * Back to Boards list form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showBackBoardsList: function(e) {
        var target = $(e.target);
        target.parents('li.dropdown').addClass('open');
        $('li.js-back').remove();
        this.showBoardsList(e);
        return false;
    },
    /**
     * openPopup()
     * show dropdown
     * @param e
     * @type Object(DOM event)
     * @return false
     */
    openPopup: function(e) {
        var target = $(e.target).parents('.dropdown:first');
        target.addClass('open').siblings('.dropdown.open').removeClass('open');
        var headerH = $('header').height();
        var footerH = $('footer').height();
        var windowH = $(window).height();
        var boardH = windowH - headerH - footerH - 14;
        var boardlistH = $(e.target).next('.sidebar-boards-list').height();
        if (boardlistH > boardH) {
            $(e.target).next('.sidebar-boards-list').css({
                'max-height': boardH - 35
            });
            $(e.target).next('.sidebar-boards-list').addClass('vertical-scrollbar');
        }
        return false;
    },
    /**
     * showOrganizationsBoardFrom()
     * show organizations and board add link
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showOrganizationsBoardFrom: function(e) {
        e.preventDefault();
        $('.js-show-boards-list-response').removeClass('hide');
        $('.js-boards-list-container-search').addClass('hide');
        $('.js-boards-list-container').addClass('hide');
        $('.js-qsearch-container').addClass('hide');
        var target = $(e.target);
        var parent = target.parents('.js-show-add-boards-list');
        var insert = $('.js-show-boards-list-response', parent);
        $(new App.OrganizationsBoardFormView({}).el).insertAfter(insert);
        $('.js-show-boards-list-response').html('');
        return false;
    },
    /**
     * showBoardAddForm()
     * show board add form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showBoardAddForm: function(e) {
        var workflow_template = new App.WorkFlowTemplateCollection();
        workflow_template.url = api_url + 'workflow_templates.json';
        workflow_template.fetch({
            success: function(model, response) {
                var templates = '';
                $('li.js-back').remove();
                var target = $(e.target);
                var parent = target.parents('.js-show-add-boards-list');
                var insert = $('.js-show-boards-list-response', parent);
                $('.js-show-boards-list-response').html(new App.BoardAddView({
                    model: workflow_template
                }).el).find('#inputtemplatelist').select2({
                    formatResult: function(repo) {
                        markup = '<div class="clearfix"><span class="show">' + repo.text + '</span><span class="show small">' + repo.id + '</span></div>';
                        return markup;
                    }
                });
            }
        });
        return false;
    },
    /**
     * showOrganizationsAddForm()
     * show board add form
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    showOrganizationsAddForm: function(e) {
        $('li.js-back').remove();
        var target = $(e.target);
        var parent = target.parents('.js-show-add-boards-list');
        var insert = $('.js-show-boards-list-response', parent);
        $('.js-show-boards-list-response').html(new App.OrganizationAddView().el);
        return false;
    },
    /**
     * searchClose()
     * close
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    searchClose: function() {
        $('.search-container').removeClass('search-tab');
        $("#js-loader-img").addClass('hide');
        $("#res").addClass('hide');
        $("#nres").addClass('hide');

        return false;
    },
    /**
     * closePopup()
     * hide opened dropdown
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    closePopup: function(e) {
        var target = $(e.target);
        target.parents('li.dropdown').removeClass('open');
        $('li.js-back').remove();
        return false;
    },
    /**
     * showBoardsList()
     * display board lists
     * @param e
     * @type Object(DOM event)
     *
     */
    showBoardsList: function() {
        $('.js-boards-list-container-search').removeClass('hide');
        $('.js-boards-list-container').addClass('hide');
        $('.js-qsearch-container').removeClass('hide');
        $('.js-show-boards-list-response').addClass('hide');
        $('li.js-back').remove();
        var recent_boards = '';
        var my_boards = '';
        var self = this;
        self.boards = App.boards;
        if (!_.isUndefined(App.boards)) {
            App.boards.bind('add remove change', this.renderClosedBoards);
        }
        if (!_.isEmpty(role_links.where({
                slug: 'view_my_boards'
            }))) {
            var view_my_board = $('.js-myboard-list');
            view_my_board.html('');
            var is_displayed = false;
            if (!_.isEmpty(App.boards.models)) {
                _.each(App.boards.models, function(board) {
                    if (board.attributes.is_closed === false || board.attributes.is_closed === 'f') {
                        is_displayed = true;
                        view_my_board.append(new App.MyBoardsListingView({
                            model: board,
                            authuser: authuser,
                            attributes: {
                                class: 'js-show-board-star'
                            }
                        }).el);
                    }
                });
            }
            if (!is_displayed) {
                view_my_board.html(new App.MyBoardsListingView({
                    model: null,
                    authuser: authuser,
                    attributes: {
                        class: 'clearfix text-center'
                    }
                }).el);
            }
        }
        this.renderStarredBoards();
        this.renderClosedBoards();

    },
    /**
     * renderStarredBoards()
     * collapse my board lists
     * @return false
     *
     */
    renderStarredBoards: function() {
        this.boards = App.boards;
        if (!_.isEmpty(this.boards) && !_.isEmpty(role_links.where({
                slug: 'view_stared_boards'
            }))) {
            var view_starred_board = $('.js-board-starred-list');
            view_starred_board.html('');
            var is_displayed = false;
            if (!_.isEmpty(App.boards.models)) {
                _.each(App.boards.models, function(board) {
                    var starred = board.boards_stars.findWhere({
                        board_id: parseInt(board.id),
                        user_id: parseInt(authuser.user.id),
                        is_starred: true
                    });
                    if (!_.isUndefined(starred) && !_.isEmpty(starred) && (board.attributes.is_closed !== true && board.attributes.is_closed !== 't')) {
                        is_displayed = true;
                        view_starred_board.append(new App.StartedBoardsListingView({
                            model: board,
                            authuser: authuser,
                            attributes: {
                                class: 'js-show-board-star'
                            }
                        }).el);
                    }
                });
            }
            if (!is_displayed) {
                view_starred_board.html(new App.StartedBoardsListingView({
                    model: null,
                    authuser: authuser,
                    attributes: {
                        class: 'clearfix text-center'
                    }
                }).el);
            }
        }
    },
    /**
     * renderClosedBoards()
     * collapse my board lists
     * @return false
     *
     */
    renderClosedBoards: function() {
        if (!_.isEmpty(role_links.where({
                slug: 'view_closed_boards'
            }))) {
            var view_closed_board = $('.js-closedboard-list');
            view_closed_board.html('');
            var is_displayed = false;
            if (!_.isEmpty(App.boards.models)) {
                _.each(App.boards.models, function(board) {
                    if (board.attributes.is_closed === true) {
                        is_displayed = true;
                        view_closed_board.append(new App.ClosedBoardsListingView({
                            model: board,
                            attributes: {
                                class: 'js-show-board-closed panel-default well-sm clearfix'
                            }
                        }).el);
                    }
                });
            }
            if (!is_displayed) {
                view_closed_board.html(new App.ClosedBoardsListingView({
                    model: null,
                    attributes: {
                        class: 'clearfix text-center'
                    }
                }).el);
            }
        }
    },
    /**
     * collapseMyBoards()
     * collapse my board lists
     * @return false
     *
     */
    collapseMyBoards: function() {
        $('.js-myboard-list').addClass('hide');
        $('.js-collapse-myboards').addClass('hide');
        $('.js-expand-myboards').removeClass('hide');
        return false;
    },
    /**
     * expandMyBoards()
     * expand my board lists
     * @return false
     *
     */
    expandMyBoards: function() {
        $('.js-myboard-list').removeClass('hide');
        $('.js-collapse-myboards').removeClass('hide');
        $('.js-expand-myboards').addClass('hide');
        return false;
    },
    /**
     * collapseMyClosedBoards()
     * collapse my closed board lists
     * @return false
     *
     */
    collapseClosedBoards: function() {
        $('.js-closedboard-list').addClass('hide');
        $('.js-collapse-closedboards').addClass('hide');
        $('.js-expand-closedboards').removeClass('hide');
        return false;
    },
    /**
     * expandMyClosedBoards()
     * expand my closed board lists
     * @return false
     *
     */
    expandClosedBoards: function() {
        $('.js-closedboard-list').removeClass('hide');
        $('.js-collapse-closedboards').removeClass('hide');
        $('.js-expand-closedboards').addClass('hide');
        return false;
    },
    /**
     * collapseStarredBoards()
     * collapse starred board lists
     * @return false
     *
     */
    collapseStarredBoards: function() {
        $('.js-board-starred-list').addClass('hide');
        $('.js-collapse-starred-boards').addClass('hide');
        $('.js-expand-starred-boards').removeClass('hide');
        return false;
    },
    /**
     * expandStarredBoards()
     * expand starred board lists
     * @return false
     *
     */
    expandStarredBoards: function() {
        $('.js-board-starred-list').removeClass('hide');
        $('.js-collapse-starred-boards').removeClass('hide');
        $('.js-expand-starred-boards').addClass('hide');
        return false;
    },
    /**
     * showSearchBoards()
     * display board search form
     * @param e
     * @type Object(DOM event)
     *
     */
    showSearchBoards: function(b) {
        sd = [16, 17, 18, 27, 20];
        nc = [37, 39, 38, 40];
        var self = this;
        if (!(e = b.keyCode, 0 <= checkKeycode(nc, e)) && !(c = b.keyCode, 0 <= checkKeycode(sd, c))) {
            var q = $('#inputBoardSearch').val();
            if (q === '') {
                $('.js-show-add-boards-list').removeClass("pre-scrollable");
                $('js-show-add-boards-list').removeClass("vertical-scrollbar");
                this.$el.find('.js-boards-list-container').nextAll('.js-board-search-result').remove();
                this.showBoardsList(b);
            } else {
                $('.js-show-add-boards-list').addClass("pre-scrollable");
                $('js-show-add-boards-list').addClass("vertical-scrollbar");
                var filtered_boards = App.boards.search(q);
                var boards = new App.BoardCollection();
                if (!_.isEmpty(filtered_boards._wrapped)) {
                    $.unique(filtered_boards._wrapped);
                }
                boards.add(filtered_boards._wrapped);
                var style = '';
                this.$el.find('.js-boards-list-container').nextAll('.js-board-search-result').remove();
                _.each(boards.models, function(board) {
                    if (board.attributes.background_picture_url) {
                        background_picture_url = board.attributes.background_picture_url.replace('_XXXX.jpg', '_b.jpg');
                        style = 'background-image:url(' + board.attributes.background_picture_url + ');';
                    } else if (board.attributes.background_pattern_url) {
                        background_pattern_url = board.attributes.background_pattern_url.replace('_XXXX.jpg', '_n.jpg');
                        style = 'background-image:url(' + background_pattern_url + ');';
                    } else if (board.attributes.background_color) {
                        style = 'background-color:' + board.attributes.background_color + ';';
                    } else {
                        style = '';
                    }

                    $(new App.ShowSearchBoardsView({
                        model: board,
                        style: style,
                        className: 'clearfix js-board-search-result',
                        attributes: {
                            style: style
                        },
                    }).el).insertAfter(self.$el.find('.js-boards-list-container'));

                    $('.js-boards-list-container').append();
                    $('.js-boards-list-container-search').addClass('hide');
                    $('.js-boards-list-container').removeClass('hide');

                });
                if (boards.models.length === 0) {
                    $(new App.ShowSearchBoardsView({
                        model: null,
                        style: style,
                        className: 'clearfix js-board-search-result',
                    }).el).insertAfter(self.$el.find('.js-boards-list-container'));
                }
            }
        }
    },
    /**
     * userActivities()
     * display user activiteis
     * @param e
     * @type Object(DOM event)
     *
     */
    userActivities: function(bool, mode) {
        var self = this;
        var activities = new App.ActivityCollection();
        var view_activity = $('#js-all-activities');
        var Auth = JSON.parse(window.sessionStorage.getItem('auth'));
        if (_.isUndefined(authuser.user.last_activity_id)) {
            authuser.user.last_activity_id = Auth.user.last_activity_id;
        }
        favCount = parseInt(Auth.user.notify_count);
        if (mode == 1) {
            query_string = '&last_activity_id=' + authuser.user.last_activity_id;
            activities.url = api_url + 'users/' + authuser.user.id + '/activities.json?type=all' + query_string;
        } else {
            $('#js-activity-loader').remove();
            view_activity.append('<li class="col-xs-12" id="js-activity-loader"><span class="cssloader"></span></li>');
            activities.url = api_url + 'users/' + authuser.user.id + '/activities.json';
        }
        activities.fetch({
            cache: false,
            success: function() {
                $('#js-activity-loader').remove();
                if (!_.isEmpty(activities.models)) {
                    var last_activity = _.min(activities.models, function(activity) {
                        return activity.id;
                    });
                    last_user_activity_id = last_activity.id;
                    $('.notification-list').removeClass('notification-empty');
                    $('#js-notification-load-more').removeClass('hide');
                    var count = 0;
                    activities.each(function(activity) {
                        if (parseInt(activity.attributes.user_id) !== parseInt(authuser.user.id)) {
                            count += 1;
                        }
                    });
                    var update_last_activity = _.max(activities.models, function(activity) {
                        return activity.id;
                    });
                    if (mode == 1) {
                        favCount += parseInt(count);
                        favicon.badge(favCount);
                        if (parseInt(favCount) > 0) {
                            $('#js-notification-count').removeClass('hide').html(favCount);
                        } else {
                            $('#js-notification-count').addClass('hide');
                        }
                        Auth = JSON.parse(window.sessionStorage.getItem('auth'));
                        Auth.user.last_activity_id = update_last_activity.id;
                        Auth.user.notify_count = favCount;
                        window.sessionStorage.setItem('auth', JSON.stringify(Auth));
                        authuser.user.last_activity_id = update_last_activity.id;
                    } else if (mode == 2) {
                        if (favCount > 0) {
                            Auth = JSON.parse(window.sessionStorage.getItem('auth'));
                            var user = new App.User();
                            user.url = api_url + 'users/' + authuser.user.id + '.json';
                            user.set('id', parseInt(authuser.user.id));
                            user.save({
                                'last_activity_id': update_last_activity.id
                            });
                            authuser.user.notify_count = 0;
                            Auth.user.notify_count = 0;
                            favicon.badge(0);
                            $('#js-notification-count').addClass('hide');
                            window.sessionStorage.setItem('auth', JSON.stringify(Auth));
                        }
                    }
                    activities.each(function(activity) {
                        activity.from_footer = true;

                        if (mode == 1 && parseInt(activity.attributes.user_id) !== parseInt(authuser.user.id) && Notification.permission === 'granted') {
                            var icon = window.location.pathname + 'img/logo-icon.png';
                            if (activity.attributes.type != 'add_comment' && activity.attributes.type != 'edit_comment') {
                                var cardLink = activity.attributes.card_name;
                                activity.attributes.comment = activity.attributes.comment.replace('##ORGANIZATION_LINK##', _.escape(activity.attributes.organization_name));
                                activity.attributes.comment = activity.attributes.comment.replace('##USER_NAME##', _.escape(activity.attributes.full_name));
                                activity.attributes.comment = activity.attributes.comment.replace('##CARD_LINK##', cardLink);
                                activity.attributes.comment = activity.attributes.comment.replace('##LABEL_NAME##', activity.attributes.label_name);
                                activity.attributes.comment = activity.attributes.comment.replace('##CARD_NAME##', activity.attributes.card_name);
                                activity.attributes.comment = activity.attributes.comment.replace('##DESCRIPTION##', activity.attributes.card_description);
                                activity.attributes.comment = activity.attributes.comment.replace('##LIST_NAME##', activity.attributes.list_name);
                                activity.attributes.comment = activity.attributes.comment.replace('##BOARD_NAME##', activity.attributes.card_description);
                            } else if (activity.attributes.type === 'add_comment') {
                                activity.attributes.comment = _.escape(activity.attributes.full_name) + ' commented in card ' + activity.attributes.card_name + ' ' + activity.attributes.comment;
                            }
                            new Notification(activity.attributes.comment, {
                                icon: icon
                            });
                        }
                        var view = new App.ActivityView({
                            model: activity,
                            type: 'all'
                        });
                        if (mode == 1) {
                            view_activity.prepend(view.render().el).find('.timeago').timeago();
                        } else {
                            if ($('.js-list-activity-' + activity.id, view_activity).length === 0) {
                                view_activity.append(view.render().el).find('.timeago').timeago();
                            }
                        }
                        if (bool && parseInt(activity.attributes.user_id) !== parseInt(authuser.user.id)) {
                            // Update board view code starting
                            if (!_.isUndefined(activity.attributes.card_id) && activity.attributes.card_id !== 0 && !_.isUndefined(activity.attributes.board_id) && parseInt(activity.attributes.board_id) === parseInt(self.board_id)) { // Update Card
                                var card = self.board.cards.findWhere({
                                    id: parseInt(activity.attributes.card_id)
                                });
                                if (activity.attributes.type === 'add_card' || activity.attributes.type === 'copy_card') {
                                    var new_card = new App.Card();
                                    new_card.set(activity.attributes.card);
                                    new_card.set('id', parseInt(activity.attributes.card.id));
                                    new_card.set('board_id', parseInt(activity.attributes.card.board_id));
                                    new_card.set('list_id', parseInt(activity.attributes.card.list_id));
                                    new_card.set('user_id', parseInt(activity.attributes.card.user_id));
                                    var card_list = self.board.lists.findWhere({
                                        id: parseInt(activity.attributes.list_id)
                                    });
                                    new_card.list = card_list;
                                    self.board.cards.add(new_card);
                                    if (!_.isUndefined(card_list)) {
                                        card_list.set('cards', activity.attributes.card);
                                    }
                                }
                                if (!_.isUndefined(card)) {
                                    if (activity.attributes.type === 'add_card_duedate') {
                                        card.set('start', activity.attributes.revisions.new_value.due_date);
                                    } else if (activity.attributes.type === 'delete_card_duedate') {
                                        card.set('start', activity.attributes.revisions.new_value.due_date);
                                    }
                                    if (!_.isEmpty(activity.attributes.revisions)) {
                                        card.set(activity.attributes.revisions.new_value);
                                    }
                                    if (activity.attributes.type === 'add_card_checklist') {
                                        var new_checklist = new App.CheckList();
                                        new_checklist.set(activity.attributes.checklist);
                                        new_checklist.set('id', parseInt(activity.attributes.checklist.id));
                                        new_checklist.set('user_id', parseInt(activity.attributes.checklist.user_id));
                                        new_checklist.set('card_id', parseInt(activity.attributes.checklist.card_id));
                                        if (activity.attributes.checklist.checklists_items !== null) {
                                            _.each(activity.attributes.checklist.checklists_items, function(checklists_item) {
                                                var new_item = new App.CheckListItem();
                                                new_item.set(checklists_item);
                                                new_item.set('id', parseInt(checklists_item.id));
                                                new_item.set('user_id', parseInt(checklists_item.user_id));
                                                new_item.set('card_id', parseInt(checklists_item.card_id));
                                                new_item.set('checklist_id', parseInt(checklists_item.checklist_id));
                                                new_item.set('position', parseFloat(checklists_item.position));
                                                self.board.checklist_items.add(new_item);
                                            });
                                            checklist_items = self.board.checklist_items.where({
                                                card_id: parseInt(activity.attributes.checklist.card_id)
                                            });
                                            items = new App.CheckListItemCollection();
                                            items.add(checklist_items);
                                            completed_count = items.filter(function(checklist_item) {
                                                return checklist_item.get('is_completed') === true || checklist_item.get('is_completed') == 'true' || checklist_item.get('is_completed') == 't';
                                            }).length;
                                            total_count = items.models.length;
                                            card.set('checklist_item_completed_count', completed_count);
                                            card.set('checklist_item_count', total_count);
                                        }
                                        self.board.checklists.add(new_checklist);
                                    } else if (activity.attributes.type === 'add_card_label') {
                                        var filtered_labels = self.board.labels.where({
                                            card_id: activity.attributes.card_id
                                        });
                                        self.board.labels.remove(filtered_labels, {
                                            silent: true
                                        });
                                        var i = 1;
                                        _.each(activity.attributes.labels, function(label) {
                                            var new_label = new App.Label();
                                            new_label.set(label);
                                            new_label.set('id', parseInt(label.id));
                                            new_label.set('label_id', parseInt(label.label_id));
                                            new_label.set('card_id', parseInt(label.card_id));
                                            new_label.set('list_id', parseInt(label.list_id));
                                            new_label.set('board_id', parseInt(label.board_id));
                                            var options = {
                                                silent: true
                                            };
                                            if (i === activity.attributes.labels.length) {
                                                options.silent = false;
                                            }
                                            self.board.labels.add(new_label, options);
                                            i++;
                                        });
                                        card.set('cards_labels', activity.attributes.labels);
                                    } else if (activity.attributes.type === 'add_card_voter') {
                                        if (_.isUndefined(card.attributes.cards_voters) || card.attributes.cards_voters === null) {
                                            card.set('cards_voters', []);
                                        }
                                        card.attributes.cards_voters.push(activity.attributes.voter);
                                        var new_voter = new App.CardVoter();
                                        new_voter.set(activity.attributes.voter);
                                        new_voter.set('id', parseInt(activity.attributes.voter.id));
                                        new_voter.set('user_id', parseInt(activity.attributes.voter.user_id));
                                        new_voter.set('card_id', parseInt(activity.attributes.voter.card_id));
                                        card.card_voters.add(new_voter);
                                    } else if (activity.attributes.type === 'add_card_voter') {
                                        card.set('cards_users', activity.attributes.user);
                                    } else if (activity.attributes.type === 'add_checklist_item') {
                                        var new_item = new App.CheckListItem();
                                        new_item.set(activity.attributes.item);
                                        new_item.set('id', parseInt(activity.attributes.item.id));
                                        new_item.set('user_id', parseInt(activity.attributes.item.user_id));
                                        new_item.set('card_id', parseInt(activity.attributes.item.card_id));
                                        new_item.set('checklist_id', parseInt(activity.attributes.item.checklist_id));
                                        new_item.set('position', parseFloat(activity.attributes.item.position));
                                        self.board.checklist_items.add(new_item);
                                        var added_checklist_items = self.board.checklist_items.where({
                                            card_id: parseInt(activity.attributes.card_id)
                                        });
                                        items = new App.CheckListItemCollection();
                                        items.add(added_checklist_items);
                                        var added_completed_count = items.filter(function(checklist_item) {
                                            return checklist_item.get('is_completed') === true || checklist_item.get('is_completed') == 'true' || checklist_item.get('is_completed') == 't';
                                        }).length;
                                        var added_total_count = items.models.length;
                                        card.set('checklist_item_completed_count', added_completed_count);
                                        card.set('checklist_item_count', added_total_count);
                                    } else if (activity.attributes.type === 'update_card_checklist') {
                                        checklist = self.board.checklists.findWhere({
                                            id: parseInt(activity.attributes.checklist.id)
                                        });
                                        if (!_.isUndefined(checklist)) {
                                            checklist.set(activity.attributes.checklist);
                                            checklist.set('id', parseInt(activity.attributes.checklist.id));
                                            checklist.set('user_id', parseInt(activity.attributes.checklist.user_id));
                                            checklist.set('card_id', parseInt(activity.attributes.checklist.card_id));
                                            checklist.set('position', parseFloat(activity.attributes.checklist.position));
                                        }
                                    } else if (activity.attributes.type === 'update_card_checklist_item' || activity.attributes.type === 'moved_card_checklist_item') {
                                        var checklist_item = self.board.checklist_items.findWhere({
                                            id: parseInt(activity.attributes.item.id)
                                        });
                                        if (!_.isUndefined(checklist_item)) {
                                            checklist_item.set(activity.attributes.item);
                                            checklist_item.set('id', parseInt(activity.attributes.item.id));
                                            checklist_item.set('user_id', parseInt(activity.attributes.item.user_id));
                                            checklist_item.set('card_id', parseInt(activity.attributes.item.card_id));
                                            checklist_item.set('checklist_id', parseInt(activity.attributes.item.checklist_id));
                                            checklist_item.set('position', parseFloat(activity.attributes.item.position));
                                            checklist_items = self.board.checklist_items.where({
                                                card_id: parseInt(activity.attributes.card_id)
                                            });
                                            items = new App.CheckListItemCollection();
                                            items.add(checklist_items);
                                            completed_count = items.filter(function(checklist_item) {
                                                return checklist_item.get('is_completed') === true || checklist_item.get('is_completed') == 'true' || checklist_item.get('is_completed') == 't';
                                            }).length;
                                            total_count = items.models.length;
                                            card.set('checklist_item_completed_count', completed_count);
                                            card.set('checklist_item_count', total_count);
                                        }
                                    } else if (activity.attributes.type === 'add_card_user') {
                                        var new_user = new App.CardUser();
                                        new_user.set(activity.attributes.user);
                                        new_user.set('id', parseInt(activity.attributes.user.id));
                                        new_user.set('user_id', parseInt(activity.attributes.user.user_id));
                                        new_user.set('card_id', parseInt(activity.attributes.user.card_id));
                                        card.users.add(new_user);
                                    } else if (activity.attributes.type === 'add_comment') {
                                        card.list.collection.board.activities.add(activity);
                                    } else if (activity.attributes.type === 'add_card_attachment') {
                                        var new_attachment = new App.CardAttachment();
                                        new_attachment.set(activity.attributes.attachment);
                                        new_attachment.set('id', parseInt(activity.attributes.attachment.id));
                                        new_attachment.set('board_id', parseInt(activity.attributes.attachment.board_id));
                                        new_attachment.set('list_id', parseInt(activity.attributes.attachment.list_id));
                                        new_attachment.set('card_id', parseInt(activity.attributes.attachment.card_id));
                                        self.board.attachments.add(new_attachment);
                                    } else if (activity.attributes.type === 'change_card_position') {
                                        card.set('position', activity.attributes.card.position);
                                        var card_new_list = self.board.lists.findWhere({
                                            id: parseInt(activity.attributes.list_id)
                                        });
                                        if (!_.isUndefined(App.boards) && !_.isUndefined(App.boards.get(parseInt(activity.attributes.board_id)))) {
                                            var updated_card_list_cards = self.board.cards.where({
                                                list_id: parseInt(activity.attributes.list_id)
                                            });
                                            App.boards.get(parseInt(activity.attributes.board_id)).lists.get(parseInt(activity.attributes.list_id)).set('card_count', (updated_card_list_cards.length === 0) ? 0 : updated_card_list_cards.length - 1);
                                        }
                                        card_new_list.set('card_count', card_new_list.attributes.card_count + 1);
                                        card.list = card_new_list;
                                        card.set('list_id', parseInt(activity.attributes.list_id));
                                        var cards_attachments = self.board.attachments.where({
                                            card_id: parseInt(activity.attributes.card_id)
                                        });
                                        var k = 1;
                                        if (!_.isUndefined(cards_attachments) && cards_attachments.length > 0) {
                                            _.each(cards_attachments, function(cards_attachment) {
                                                var options = {
                                                    silent: true
                                                };
                                                if (k === cards_attachments.length) {
                                                    options.silent = false;
                                                }
                                                self.board.attachments.findWhere({
                                                    id: parseInt(cards_attachment.attributes.id)
                                                }).set({
                                                    list_id: parseInt(activity.attributes.list_id)
                                                }, options);
                                                k++;
                                            });
                                        }
                                    } else if (activity.attributes.type === 'delete_card_attachment') {
                                        self.board.attachments.remove(self.board.attachments.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                    } else if (activity.attributes.type === 'delete_card_comment') {
                                        self.board.activities.remove(self.board.activities.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                    } else if (activity.attributes.type === 'delete_checklist') {
                                        self.board.checklists.remove(self.board.checklists.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                        self.board.checklist_items.remove(self.board.checklist_items.where({
                                            checklist_id: parseInt(activity.attributes.foreign_id)
                                        }));
                                        var checklist_items = self.board.checklist_items.where({
                                            card_id: parseInt(activity.attributes.card_id)
                                        });
                                        items = new App.CheckListItemCollection();
                                        items.add(checklist_items);
                                        var completed_count = items.filter(function(checklist_item) {
                                            return checklist_item.get('is_completed') === true || checklist_item.get('is_completed') == 'true' || checklist_item.get('is_completed') == 't';
                                        }).length;
                                        var total_count = items.models.length;
                                        card.set('checklist_item_completed_count', completed_count);
                                        card.set('checklist_item_count', total_count);
                                    } else if (activity.attributes.type === 'delete_checklist_item') {
                                        self.board.checklist_items.remove(self.board.checklist_items.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                        var update_checklist_items = self.board.checklist_items.where({
                                            card_id: parseInt(activity.attributes.card_id)
                                        });
                                        items = new App.CheckListItemCollection();
                                        items.add(update_checklist_items);
                                        var update_completed_count = items.filter(function(checklist_item) {
                                            return checklist_item.get('is_completed') === true || checklist_item.get('is_completed') == 'true' || checklist_item.get('is_completed') == 't';
                                        }).length;
                                        var update_total_count = items.models.length;
                                        card.set('checklist_item_completed_count', update_completed_count);
                                        card.set('checklist_item_count', update_total_count);
                                    } else if (activity.attributes.type === 'delete_card_users') {
                                        card.users.remove(card.users.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                    } else if (activity.attributes.type === 'unvote_card') {
                                        card.card_voters.remove(card.card_voters.findWhere({
                                            id: parseInt(activity.attributes.foreign_id)
                                        }));
                                    } else if (activity.attributes.type === 'delete_card') {
                                        self.board.cards.remove(card);
                                    }
                                }
                            } else if (!_.isUndefined(activity.attributes.list_id) && activity.attributes.list_id !== 0 && !_.isUndefined(activity.attributes.board_id) && parseInt(activity.attributes.board_id) === parseInt(self.board_id)) { // Update List
                                var list = self.board.lists.findWhere({
                                    id: parseInt(activity.attributes.list_id)
                                });
                                if (activity.attributes.type === 'add_list') {
                                    var new_list = new App.List();
                                    new_list.set(activity.attributes.list);
                                    new_list.set('id', parseInt(activity.attributes.list.id));
                                    new_list.set('board_id', parseInt(activity.attributes.list.board_id));
                                    new_list.set('lists_cards', []);
                                    self.board.lists.add(new_list);
                                    self.board.set('lists', activity.attributes.list);

                                    if (!_.isUndefined(App.boards) && !_.isUndefined(App.boards.get(new_list.attributes.board_id))) {
                                        App.boards.get(new_list.attributes.board_id).lists.add(new_list);
                                    }

                                }
                                if (!_.isUndefined(list)) {
                                    list.set(activity.attributes.revisions.new_value);
                                    if (activity.attributes.type === 'delete_list') {
                                        var removed_list_cards = self.board.cards.where({
                                            list_id: parseInt(list.attributes.id)
                                        });
                                        self.board.cards.remove(removed_list_cards, {
                                            silent: true
                                        });
                                        list.collection.board.lists.remove(list);
                                        self.board.lists.remove(list);
                                    } else if (activity.attributes.type === 'change_list_position') {
                                        if (activity.attributes.list.board_id !== list.attributes.board_id) {
                                            self.board.lists.remove(list);
                                        } else {
                                            list.set('position', parseFloat(activity.attributes.list.position));
                                        }
                                    } else if (activity.attributes.type === 'moved_list_card') {
                                        var cards = self.board.cards.where({
                                            list_id: parseInt(activity.attributes.list_id)
                                        });
                                        var j = 1;
                                        if (!_.isUndefined(cards) && cards.length > 0) {
                                            _.each(cards, function(card) {
                                                var options = {
                                                    silent: true
                                                };
                                                if (j === cards.length) {
                                                    options.silent = false;
                                                }
                                                self.board.cards.findWhere({
                                                    id: parseInt(card.attributes.id)
                                                }).set({
                                                    list_id: parseInt(activity.attributes.foreign_id)
                                                }, options);
                                                j++;
                                            });
                                        }
                                    } else if (activity.attributes.type === 'archived_card') {
                                        var list_cards = self.board.cards.where({
                                            list_id: parseInt(activity.attributes.list_id)
                                        });
                                        var l = 1;
                                        if (!_.isUndefined(list_cards) && list_cards.length > 0) {
                                            _.each(list_cards, function(card) {
                                                var options = {
                                                    silent: true
                                                };
                                                if (l === list_cards.length) {
                                                    options.silent = false;
                                                }
                                                self.board.cards.findWhere({
                                                    id: parseInt(card.attributes.id)
                                                }).set({
                                                    is_archived: true
                                                }, options);
                                                l++;
                                            });
                                        }
                                    }
                                }
                            } else if (!_.isUndefined(self.board) && !_.isUndefined(activity.attributes.board_id) && !_.isUndefined(activity.attributes.board_id) && parseInt(activity.attributes.board_id) === parseInt(self.board_id)) { // Update Board
                                self.board.set(activity.attributes.revisions.new_value);
                                if (activity.attributes.type === 'add_board_user') {
                                    self.board.board_users.add(activity.attributes.board_user);
                                } else if (activity.attributes.type === 'delete_board_user') {
                                    self.board.board_users.remove(self.board.board_users.findWhere({
                                        id: activity.attributes.foreign_id
                                    }));
                                }
                            }
                        }
                    });
                }
                var headerH = $('header').height();
                var windowH = $(window).height();
                var footerH = $('footer').height();
                var notificationH = windowH - footerH;
                var boardH = windowH - headerH - footerH - 14;
                $('.notification-list').css({
                    'height': notificationH - 100,
                    'overflow-y': 'scroll'
                });
            }
        });
    },
    /**
     * boardActivities()
     * display board activiteis, sync every 10 sec and update the board view.
     * Update the board view based on activity type.
     * @param e
     * @type Object(DOM event)
     *
     */
    boardActivities: function() {
        var view_activity = $('#js-board-activities');
        var self = this;
        var Auth = JSON.parse(window.sessionStorage.getItem('auth'));
        var clicked_notification_count = 0,
            clicked_all_notification_count = 0;
        var activities = new App.ActivityCollection();
        activities.url = api_url + 'boards/' + authuser.board_id + '/activities.json';
        activities.storeName = 'activity';
        $('#js-activity-loader').remove();
        view_activity.append('<li class="col-xs-12" id="js-activity-loader"><span class="cssloader"></span></li>');
        if (!_.isUndefined(authuser.user) && _.isUndefined(authuser.user.last_activity_id)) {
            authuser.user.last_activity_id = 0;
        }
        activities.fetch({
            success: function(models, response, options) {
                $('#js-activity-loader').remove();
                if (!_.isEmpty(activities.models)) {
                    activities.each(function(activity) {
                        activity.from_footer = true;
                        var all_activity = $('#js-all-activities');
                        var view = new App.ActivityView({
                            model: activity,
                            board: self.board
                        });
                        if ($('.js-list-activity-' + activity.id, view_activity).length === 0) {
                            view_activity.append(view.render().el).find('.timeago').timeago();
                        }
                    });
                    var last_board_activity = _.min(activities.models, function(activity) {
                        return activity.id;
                    });
                    load_more_last_board_activity_id = last_board_activity.id;
                    if ($('#js-notification-count').html() > 0) {
                        var max_last_user_activity = _.max(activities.models, function(activity) {
                            return activity.id;
                        });
                        var user = new App.User();
                        user.url = api_url + 'users/' + authuser.user.id + '.json';
                        user.set('id', parseInt(authuser.user.id));
                        user.save({
                            'last_activity_id': last_board_activity.id
                        });
                        authuser.user.notify_count = 0;
                        Auth.user.notify_count = 0;
                        favicon.badge(0);
                        $('#js-notification-count').addClass('hide');
                        window.sessionStorage.setItem('auth', JSON.stringify(Auth));
                    }
                }
                var headerH = $('header').height();
                var windowH = $(window).height();
                var footerH = $('footer').height();
                var notificationH = windowH - footerH;
                var boardH = windowH - headerH - footerH - 14;
                $('.notification-list').css({
                    'height': notificationH - 100,
                    'overflow-y': 'scroll'
                });
            }
        });
    },
    /**
     * notificationMenu()
     * display activiteis
     * @param e
     * @type Object(DOM event)
     *
     */
    notificationMenu: function(e) {
        e.preventDefault();
        if (!_.isUndefined(authuser) && !_.isEmpty(authuser) && authuser.board_id !== 0) {

            $('.js-notification-response-container').html(new App.NotificationMenuView({
                user: authuser
            }).el);
        } else {
            this.userActivities();
        }
    },
    /**
     * qSearch()
     * search board, list, card
     * @param e
     * @type Object(DOM event)
     *
     */
    qSearch: function(e) {
        e.preventDefault();
        $('.search-container').addClass('search-tab');
        $("#js-loader-img").removeClass('hide');
        $("#res").addClass('hide');
        $("#nres").addClass('hide');
        $('.js-search').autocomplete({
            minLength: 1,
            appendTo: "footer",
            source: function(request, _response) {
                var elastic_search = new App.ElasticSearchCollection();
                elastic_search.url = api_url + 'search.json';
                var q = $(e.target).val();
                if (q !== '' && e.which !== 38 && e.which !== 40 && e.which !== 39 && e.which !== 47) {
                    elastic_search.fetch({
                        data: {
                            q: q,
                            token: api_token
                        },
                        success: function(model, response) {
                            var self = this;
                            self.result = response;
                            var content = '';
                            var cards = new App.CardCollection();
                            cards.add(response.result);
                            var card_names = cards.pluck('name');
                            var res_suggestion = response.suggestion;
                            if (!_.isEmpty(response.result)) {
                                $("#js-loader-img").addClass('hide');
                                $("#res").addClass('hide');
                                $("#nres").addClass('hide');
                            } else {
                                $("#js-loader-img").addClass('hide');
                                $("#nres").removeClass('hide');
                                $("#res").addClass('hide');
                            }
                            if (!_.isEmpty(response.hits) && !_.isEmpty(response.hits.hits)) {
                                content = new App.SearchResultView({
                                    model: response.hits.hits
                                }).el;
                            } else {
                                content = 'No results.';
                            }
                            $('.js-show-search-result').html(content);
                            $('.js-boards-list-container-search').addClass('hide');

                            mappedItems = $.map(self.result.result, function(item) {
                                item.url = '#/board/' + item.board_id;
                                if (item.type == 'cards') {
                                    item.url = '#/board/' + item.board_id + '/card/' + item.id;
                                }
                                var result = {};
                                result.label = item.name;
                                result.value = item.name;
                                result.id = item.id;
                                result.board_name = item.board_name;
                                result.list_name = item.list_name;
                                result.type = item.type;
                                result.board_id = item.board_id;
                                result.url = item.url;
                                return result;
                            });
                            return _response(mappedItems);
                        }
                    });
                }
            },
            select: function(event, ui) {
                var board_id = ui.item.board_id;
                var card_id = ui.item.card_id;
                var current_path = window.location.hash;
                var current_items = current_path.split('/');
                if (current_items !== undefined && current_items[2] !== undefined && current_items[2] === board_id) {
                    if (card_id !== undefined && card_id !== null && ($('#js-card-' + card_id).length !== 0)) {
                        $('#js-card-' + card_id).trigger('click');
                    }
                } else {
                    window.location.hash = ui.item.url;
                    window.location.reload();
                }
                return false;
            },
            position: {
                my: 'right top',
                at: 'right bottom'
            }
        }).data('autocomplete')._renderItem = function(ul, item) {
            var inner_text = '';
            if (item.type == 'cards') {
                inner_text = '<span class="pull-left"><span class="card-id">#' + item.id + '</span></span><span class="col-xs-6 nav">' + item.label + '</span><span class="text-right pull-right col-xs-4">' + item.board_name + ' &raquo; ' + item.list_name + ' &raquo; Card</span>';
            }
            if (item.type == 'lists') {
                inner_text = '<span class="pull-left"><span class="card-id">#' + item.id + '</span></span><span class="col-xs-6 nav">' + item.label + '</span><span class="text-right pull-right col-xs-4">' + item.board_name + ' &raquo; List</span>';
            }
            if (item.type == 'boards') {
                inner_text = '<span class="pull-left"><span class="card-id">#' + item.id + '</span></span><span class="col-xs-6 nav">' + item.label + '</span><span class="text-right pull-right col-xs-4">Board</span>';
            }
            return $('<li></li>')
                .data('item.autocomplete', item)
                .append($('<a href="' + item.url + '">' + inner_text + '</a>'))
                .appendTo(ul);
        };
    },
    /**
     * showSearchMsg()
     * display search result
     * @param e
     * @type Object(DOM event)
     *
     */
    showSearchMsg: function(e) {
        e.preventDefault();
        $('.js-show-search-result').html(new App.ShowSearchMessageView({
            model: this.model
        }).el);
    },
    addInstantCard: function(e) {
        e.preventDefault();
        $('li.dropdown').removeClass('open');
        var self = this;
        var data = $(e.target).serializeObject();
        var card = new App.Card();
        card.url = api_url + 'boards/' + data.board_id + '/lists/' + data.list_id + '/cards.json';
        card.save(data);
    },
    showNotification: function(e) {
        e.preventDefault();

        if (!_.isEmpty(this.board_id)) {
            this.$el.find('.js-board-activities').click();
        } else {
            this.$el.find('.js-all-activities').click();
        }
    },
    showBoardActivities: function(e) {
        e.preventDefault();
        var modalView = new App.ModalActivityView({
            model: this.model,
            type: 'board'
        });
        modalView.show();
        return false;
    },
    showUserActivities: function(e) {
        e.preventDefault();
        var modalView = new App.ModalActivityView({
            model: this.model,
            type: 'user'
        });
        modalView.show();
        return false;
    },
    /**
     * loadMore()
     * load more
     * @param e
     * @type Object(DOM event)
     * @mode Object(DOM event)
     * @return false
     */
    loadMore: function(type, mode) {
        var view_activity, query_string = '';
        var self = this;
        var activities = new App.ActivityCollection();
        if (type === 'user') {
            view_activity = $('#js-all-activities');
            query_string = (last_user_activity_id !== 0 && !_.isUndefined(last_user_activity_id)) ? '&last_activity_id=' + last_user_activity_id : '';
            activities.url = api_url + 'users/' + authuser.user.id + '/activities.json?type=all' + query_string;
        } else {
            view_activity = $('#js-board-activities');
            query_string = (load_more_last_board_activity_id !== 0 && !_.isUndefined(load_more_last_board_activity_id)) ? '&last_activity_id=' + load_more_last_board_activity_id : '';
            activities.url = api_url + 'boards/' + authuser.board_id + '/activities.json?type=all' + query_string;
        }
        self.$('#js-empty', view_activity).remove();
        $('#js-activity-loader').remove();
        view_activity.append('<li class="col-xs-12" id="js-activity-loader"><span class="cssloader"></span></li>');
        activities.fetch({
            success: function() {
                $('#js-activity-loader').remove();
                var last_activity_id = _.min(activities.models, function(activity) {
                    return activity.id;
                });
                if (type === 'user') {
                    last_user_activity_id = last_activity_id.id;
                } else {
                    load_more_last_board_activity_id = last_activity_id.id;
                }
                if (type == 'user') {
                    $('#js-load-link2').removeClass('hide');
                    $('#js-load-link1').addClass('hide');
                } else if (type == 'board') {
                    $('#js-load-link1').removeClass('hide');
                    $('#js-load-link2').addClass('hide');
                }
                if (!_.isEmpty(activities.models)) {
                    $('.notification-list').removeClass('notification-empty');
                    $('.js-empty').remove();
                    modeType = 'all';
                    if (mode == 1) {
                        modeType = '';
                    }
                    activities.each(function(activity) {
                        var view = new App.ActivityView({
                            model: activity,
                            board: self.board,
                            type: modeType
                        });
                        view_activity.append(view.render().el).find('.timeago').timeago();
                    });
                } else {
                    if (type == 'user') {
                        $('#js-load-link2').addClass('hide');
                    } else if (type == 'board') {
                        $('#js-load-link1').addClass('hide');
                    }
                }
            }
        });
        return false;
    },
    /**
     * enabledesktopNotification()
     * enable desktop notification
     * @param e
     * @type Object(DOM event)
     *
     */
    enabledesktopNotification: function(e) {
        e.preventDefault();
        var self = this;
        Notification.requestPermission(function(permission) {
            // Whatever the user answers, we make sure we store the information
            if (!('permission' in Notification)) {
                Notification.permission = permission;
            }
            // If the user is okay, let's create a notification
            if (permission === 'granted') {
                var notification = new Notification('Desktop notification enabled.');
            }
        });
    },
    /**
     * showBoardImportForm()
     * show Board Import Form
     * @param e
     * @type Object(DOM event)
     *
     */
    showBoardImportForm: function(e) {
        e.preventDefault();
        var form = $('#js-board-import');
        $('.js-board-import-file', form).trigger('click');
        return false;
    },
    /**
     * importBoard()
     * import Board
     * @param e
     * @type Object(DOM event)
     *
     */
    importBoard: function(e) {
        e.preventDefault();
        $('#js-board-import-loader').removeClass('hide');
        var self = this;
        var form = $('form#js-board-import');
        var fileData = new FormData(form[0]);
        var board = new App.Board();
        board.url = api_url + 'boards.json';
        board.save(fileData, {
            type: 'POST',
            data: fileData,
            processData: false,
            cache: false,
            contentType: false,
            error: function(e, s) {
                $('#js-board-import-loader').addClass('hide');
            },
            success: function(model, response) {
                $('#js-board-import-loader').addClass('hide');
                if (!_.isUndefined(response.id)) {
                    app.navigate('#/board/' + response.id, {
                        trigger: true,
                        replace: true
                    });
                } else {
                    var error = 'Unable to import. please try again.';
                    if (!_.isUndefined(response.error)) {
                        error = response.error;
                    }
                    self.flash('danger', error);

                }
            }
        });
    }
});
