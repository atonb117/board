/**
 * @fileOverview This file has functions related to board user view. This view calling from board header view.
 * Available Object:
 *	this.model						: board user model.
 */
if (typeof App == 'undefined') {
    App = {};
}
/**
 * BoardUsers View
 * @class BoardUsersView
 * @constructor
 * @extends Backbone.View
 */
App.BoardUsersView = Backbone.View.extend({
    /**
     * Constructor
     * initialize default values and actions
     */
    initialize: function(options) {
        if (!_.isUndefined(this.model) && this.model !== null) {
            this.model.showImage = this.showImage;
        }
        this.is_admin = options.is_admin;
        this.model.bind('change:is_admin', this.showBoardUserActions, this);
        this.render();
    },
    tagName: 'li',
    className: 'form-inline navbar-btn btn-xs pull-left js-board-user-avatar-click dropdown nav',
    template: JST['templates/board_users_view'],
    /**
     * Events
     * functions to fire on events (Mouse events, Keyboard Events, Frame/Object Events, Form Events, Drag Events, etc...)
     */
    events: {
        'click .js-show-board-user-action': 'showBoardUserActions',
        'click .js-show-confirm-delete-board-member': 'showConfirmDeleteBoardUser',
        'click .js-delete-board-member': 'deleteBoardMember',
    },
    /**
     * render()
     * populate the html to the dom
     * @param NULL
     * @return object
     *
     */
    render: function() {
        this.$el.html(this.template({
            user: this.model,
            is_admin: this.is_admin
        }));
        this.showTooltip();
        return this;
    },
    showBoardUserActions: function() {
        this.$el.find('.js-show-board-user-action-response').html(new App.BoardUserActionsView({
            model: this.model,
            is_admin: this.is_admin
        }).el);
    },
    showConfirmDeleteBoardUser: function(e) {
        e.preventDefault();
        this.$el.find('.js-show-board-user-action-response').html(new App.BoardUserRemoveConfirmView({
            model: this.model,
            authuser: authuser.user,
        }).el);
        return false;
    },
    /**
     * deleteBoardMember()
     * delete board member
     * @param e
     * @type Object(DOM event)
     * @return false
     *
     */
    deleteBoardMember: function(e) {
        var self = this;
        var target = $(e.currentTarget);
        this.$el.remove();
        this.model.url = api_url + 'boards_users/' + this.model.attributes.id + '.json';
        this.model.destroy();
        return false;
    }
});
