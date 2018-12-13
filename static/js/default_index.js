// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy
        var sent_content = self.vue.form_content; //
        var sent_date = self.vue.form_date;
        var user = self.vue.user_email_is;
        var sent_format = self.vue.form_format;

        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content,
                post_date: self.vue.form_date,
                post_format: self.vue.form_format,
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                self.vue.form_date = "";
                self.vue.form_format = "";
                self.vue.seen = false;
                // Adds the post to the list of posts.
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_content: sent_content,
                    post_format: sent_format,
                    post_date: sent_date,
                    post_author: user,
                    post_user: 0,
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

// used to use self.process_post function so it is needed to modify the stuff
// do this after the replies work doesnt nesscary need
    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                console.log(data)
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();

                for(var b in data.post_list){
                    console.log(data.post_list[b].match_info);
                }
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };
// probably need for reply content but technically dont need just to make the post
// do this after the reples work
    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like.
        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // Did I like it?
            // If I do e._smile = e.like, then Vue won't see the changes to e._smile .
            //hw4
            console.log(e);
            Vue.set(e, '_add_reply', false);
            Vue.set(e, 'newReply', '');
            Vue.set(e, 'replies', []);
            Vue.set(e, 'showReply', false);
            Vue.set(e, 'addingReply', false);
            Vue.set(e, '_edit_post', false);
            Vue.set(e, '_edit_reply', false);
            Vue.set(e, 'date_location', false);
            Vue.set(e, 'tourney_details', true);
            Vue.set(e, 'matches_results', false);
            Vue.set(e, 'tourney_format', false);
            Vue.set(e, 'join_post', false);
            Vue.set(e, '_joined', []);
            Vue.set(e,  e.join);
            Vue.set(e, 'show_joined', false);
            Vue.set(e, 'bracket', '');
            Vue.set(e, 'participants', []);
            Vue.set(e, 'match_info', {});
        });
    };

//hw4
    self.add_reply = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._add_reply = true;
        console.log("hi");

    };

    self.update_match = function(post_idx){
        var p = self.vue.post_list[post_idx];
        let obj = {
            post_id: p.id,
            match_info: JSON.stringify(p.match_info)
        }

        console.log(obj);

        $.post(update_matches, obj, function(data){
            console.log("Update Matches: " + data)
        });
    };

// going off movie example
// these functions are to create replies
// used in the project
    self.saveReply = function (post_idx){
        var p = self.vue.post_list[post_idx];
        p._add_reply = false;
        console.log("bye");
        var newReply = {
            reply_id: self.vue.post_list[post_idx].id,
            reply_content: self.vue.post_list[post_idx].newReply,
        }
        $.post(set_replies_url, newReply, function(response){
            //dont know if it is needed
            newReply['id'] = response.new_reply_id;
            self.vue.post_list[post_idx].replies.push(newReply);
        });
    };

    self.showReply = function (post_idx){
        var id = self.vue.post_list[post_idx].id;
        var url = get_replies_url + '?id=' + id;
        self.vue.post_list[post_idx].showReply = true;
        $.post(url, function(response) {
            self.vue.post_list[post_idx].replies = response.replies;
        });
    };

    self.hideReply = function (post_idx) {
        self.vue.post_list[post_idx].showReply = false;
    };

    self.toggleAddingComment = function(post_idx) {
        self.vue.post_list[post_idx].addingReply = !self.vue.post_list[post_idx].addingReply;
    };


// editing a post
// i dont think this will be need but will just be kept in case
    self.post_editer = function (post_idx) {
        var p = self.vue.post_list[post_idx];
        p._edit_post = true;
    };

    self.done_edit = function(post_idx) {
        console.log(post_idx);
        var p = self.vue.post_list[post_idx];
        console.log(p.post_content);
        p._edit_post = false;
        self.send_content(post_idx);
    };

    self.send_content = function(post_idx){
        self.vue.title_save_pending = true;
        var p = self.vue.post_list[post_idx];
        $.post(edit_post_url,{
            post_id: p.id,
            post_content: p.post_content
        });
    };

// dont know why i have but ima just keep it there
    self.get_title = function () {
        $.getJSON(get_title_url, function(data) {
            self.vue.post_content = data.post_content
        }
        );
    };


// editing a reply. Dont need these functions since not editing
    self.reply_editer = function (post_idx) {
        window.location.href = '/start/default/index';
        var p = self.vue.post_list[post_idx];
        console.log(post_idx);
        p._edit_reply = true;
        console.log(p._edit_reply);
    };

    self.done_edit_reply = function(post_idx) {
        console.log("in done_edit_reply");
        var p = self.vue.post_list[post_idx];
        p._edit_reply = false;
        self.send_content_reply(post_idx);
    };

    self.send_content_reply = function(post_idx){
        self.vue.title_save_pending_reply = true;
        var p = self.vue.post_list[post_idx];
        console.log("in send_content_reply");
        console.log(p.replies.reply_content);
        $.post(edit_reply_url,{
            reply_id: self.vue.post_list[post_idx].id,
            reply_content: self.vue.post_list[post_idx].newReply,
        });
    };
// above is not needed

// project functions
    self.test = function(){
        window.location.href = '/hw4test/default/game_selection';
    }

    self.tourney_details = function (post_idx){
        self.vue.post_list[post_idx].tourney_details = !self.vue.post_list[post_idx].tourney_details;
        self.vue.post_list[post_idx].join_post = false;
        self.vue.post_list[post_idx].show_joined = false;
        self.vue.post_list[post_idx].matches_results = false;
        console.log(self.vue.post_list[post_idx].tourney_details);
    };


    self.matches_results = function (post_idx){
        self.vue.post_list[post_idx].matches_results = !self.vue.post_list[post_idx].matches_results;
        self.vue.post_list[post_idx].join_post = false;
        self.vue.post_list[post_idx].show_joined = false;
        self.vue.post_list[post_idx].tourney_details = false;
        console.log(self.vue.post_list[post_idx].tourney_details);
    };


    self.join_post = function(post_idx){
        self.vue.post_list[post_idx].join_post = !self.vue.post_list[post_idx].join_post;
        self.vue.post_list[post_idx].tourney_details = false;
        self.vue.post_list[post_idx].show_joined = false;
        self.vue.post_list[post_idx].matches_results = false;
    };

    self.actually_join_post = function(post_idx){
        console.log("actually_join_post");
        var p = self.vue.post_list[post_idx];
        p.join = !p.join;
        $.post(set_join_url, {
            post_id: p.id,
            join: p.join
        });
    };

    self.show_joined = function(post_idx) {
        var p = self.vue.post_list[post_idx];
        self.vue.post_list[post_idx].show_joined = !self.vue.post_list[post_idx].show_joined;
        self.vue.post_list[post_idx].tourney_details = false;
        self.vue.post_list[post_idx].join_post = false;
        self.vue.post_list[post_idx].matches_results = false;

        $.getJSON(get_join_url, {post_id: p.id}, function (data) {
            p._joined = data.joined;
        })
    };

    // To clone JSON object from API to Javascript obj
    self.jsonCopy = function(src) {
        return JSON.parse(JSON.stringify(src));
    }

    self.bracket = function(post_idx) {
        var p = self.vue.post_list[post_idx];
        $.getJSON(get_join_url, {post_id: p.id}, function(data){
            console.log(data)
            let d = data.joined;
            p.participants = d.map(function(i){return i});

            if(self.vue.post_list[post_idx].bracket == false){
                self.vue.post_list[post_idx].bracket = true;
            }
            else {
                self.vue.post_list[post_idx].bracket = false;
            }

        });
    };

    self.show_form = function(){
        self.vue.seen = true;
    }

    self.show_bracket = function(post_idx) {
        var po = self.vue.post_list[post_idx];
        $.getJSON(show_match_info, {post_id: po.id}, function(data) {
            self.vue.post_list[post_idx].match_info = self.jsonCopy(data.d);
            if(self.vue.post_list[post_idx].bracket == ''){
                self.vue.post_list[post_idx].bracket = self.vue.post_list[post_idx].post_format;
            }
            else {
                self.vue.post_list[post_idx].bracket = '';
            }
        });
    }

    self.get_joined_participants = function(post_idx){
        var p = self.vue.post_list[post_idx];
        var part = [];
        $.getJSON(get_join_url, {post_id: p.id}, function(data){
            console.log(data)
            let d = data.joined;
            for(var asf in d) {
                console.log(asf);
                part.push(d[asf].user_email);
                console.log(part);
            }

            self.add_participants_in_match(post_idx, part);
        });
    }

    self.load_match = function(post_idx) {
        self.get_joined_participants(post_idx);
    }

    self.FourRoundRoundOnePairOne = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round1.player1 = winner;
    }

    self.FourRoundRoundOnePairTwo = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round1.player2 = winner;
    }

    self.FourRoundRoundTwoRoundThree = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round3 = winner;
    }

    self.EightRoundRoundOnePairOne = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round1.player1 = winner;
    }

    self.EightRoundRoundOnePairTwo = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round1.player2 = winner;
    }

    self.EightRoundRoundOnePairThree = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round2.player1 = winner;
    }

    self.EightRoundRoundOnePairFour = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round2.round2.player2 = winner;
    }

    self.EightRoundRoundTwoPairOne = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round3.round1.player1 = winner;
    }

    self.EightRoundRoundTwoPairTwo = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round3.round1.player2 = winner;
    }

    self.EightRoundRoundThreePairOne = function(post_idx, winner) {
        self.vue.post_list[post_idx].match_info.round4 = winner;
    }




    self.add_participants_in_match = function(post_idx, part) {
        var po = self.vue.post_list[post_idx];
        $.getJSON(show_match_info, {post_id: po.id}, function(data) {
            self.vue.post_list[post_idx].match_info = self.jsonCopy(data.d);

            let lengthA = Object.keys(self.vue.post_list[post_idx].match_info.round1).length
            console.log("Length" + lengthA);

            for(let i = 0; i < lengthA; i++){

                var test1 = " ";
                var test2 = " ";

                try {
                    test1 = part[i*2];
                } catch(err) {

                }

                try {
                    test2 = part[i*2+1];
                } catch(err) {

                }
                console.log("here");

                let a = i + 1;
                test1 = "'" + test1 + "'";
                test2 = "'" + test2 + "'";

                console.log(test1);
                console.log(test2);


                var strs = "self.vue.post_list[post_idx].match_info.round1.round" + a +".player1 = " + String(test1);
                var str2 = "self.vue.post_list[post_idx].match_info.round1.round" + a +".player2 = " + String(test2);

                console.log(strs);
                console.log("try here");
                eval(strs);
                console.log("Here")
                eval(str2);
            }

            if(self.vue.post_list[post_idx].bracket == ''){
                self.vue.post_list[post_idx].bracket = self.vue.post_list[post_idx].post_format;
            }
            else {
                self.vue.post_list[post_idx].bracket = '';
            }
        });
    }

    self.progress = function(post_idx, i){
        console.log(post_idx);
        console.log(i);
        // self.vue.post_list[post_idx].participants[i].round2 = true;
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            form_date: "",
            form_format: "",
            post_list: [],
            star_indices: [1, 2, 3, 4, 5],
            form_reply: "",
            title_save_pending: false,
            post_content: [],
            is_logged_in: is_logged_in,
            user_email_is: user_email_is,
            title_save_pending_reply: false,
            reply_content: [],
            seen: false,
            brian: "",
            n: 0,
        },
        methods: {
            FourRoundRoundOnePairOne: self.FourRoundRoundOnePairOne,
            FourRoundRoundOnePairTwo: self.FourRoundRoundOnePairTwo,
            FourRoundRoundTwoRoundThree: self.FourRoundRoundTwoRoundThree,

            EightRoundRoundOnePairOne: self.EightRoundRoundOnePairOne,
            EightRoundRoundOnePairTwo: self.EightRoundRoundOnePairTwo,
            EightRoundRoundOnePairThree: self.EightRoundRoundOnePairThree,
            EightRoundRoundOnePairFour: self.EightRoundRoundOnePairFour,
            EightRoundRoundTwoPairOne: self.EightRoundRoundTwoPairOne,
            EightRoundRoundTwoPairTwo: self.EightRoundRoundTwoPairTwo,
            EightRoundRoundThreePairOne: self.EightRoundRoundThreePairOne,

            load_match: self.load_match,
            get_joined_participants: self.get_joined_participants,
            update_match: self.update_match,
            progress: self.progress,
            show_bracket: self.show_bracket,
            add_post: self.add_post,
            bracket: self.bracket,
            test: self.test,
            // Likers.
            like_mouseover: self.like_mouseover,
            like_mouseout: self.like_mouseout,
            like_click: self.like_click,
            // Show/hide who liked.
            show_likers: self.show_likers,
            hide_likers: self.hide_likers,
            // Star ratings.
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
            //hw4
            add_reply: self.add_reply,
            adding_reply: self.adding_reply,
            saveReply: self.saveReply,
            showReply: self.showReply,
            hideReply: self.hideReply,
            date_location: self.date_location,
            tourney_details: self.tourney_details,
            matches_results: self.matches_results,
            tourney_format: self.tourney_format,
            join_post: self.join_post,
            show_joined: self.show_joined,
            actually_join_post: self.actually_join_post,
            show_form: self.show_form,
            toggleAddingComment: self.toggleAddingComment,
            post_editer: self.post_editer,
            done_edit: self.done_edit,
            send_content: self.send_content,
            reply_editer: self.reply_editer,
            done_edit_reply: self.done_edit_reply,
            send_content_reply: self.send_content_reply,
        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();
    }

    // Gets the posts.
    self.get_posts();
    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
