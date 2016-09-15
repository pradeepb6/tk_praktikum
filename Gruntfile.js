module.exports = function(grunt) {

    grunt.initConfig({
        // configure nodemon
        nodemon: {
            dev: {
                script: 'server.js'
            }
        },
        watch: {
            scripts: {
                files: ["app/js/*.js"], // the watched files
                options: {
                    spawn: false // makes the watch task faster
                }
            },
            webpage:{
                files: ["**/*.html"]
            }
        }
    });

    // load nodemon
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['nodemon', 'watch']);

};