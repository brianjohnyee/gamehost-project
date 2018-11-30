const None = undefined;

var enumerate = function(arr) { 
    var k=0; return arr.map(function(e) {
        e._idx = k++;
        Vue.set(e, 'showComments', false);
        Vue.set(e, 'comments', []);
        Vue.set(e, 'addingComment', false);
        Vue.set(e, 'newComment', '');
    });
};

var submitMovie = function(){
    window.location.href = '/hw4test/default/index';
}

var app = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {

    },
    methods: {
        submitMovie: submitMovie,


    }
});

