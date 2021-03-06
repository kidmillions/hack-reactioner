/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                node: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                force: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            app_files: {
                src: ['app/app.js', 'index.js'],
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    clearRequireCache: true
                },
            src: ['test/**/*.js']
            }
        },

        nodemon: {
            dev: {
                script: 'server/index.js'
            }
        },
        jade: {       
            compile: {
                options: {
                    data: {
                        debug: false
                    },
                },
                files: [{
                        cwd: "app/",
                        src: "**/*.jade",
                        dest: "app/",
                        expand: true,
                        ext: ".html"
                        }] 
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            test: {
                files: ['<%= jshint.app_files.src %>'],
                tasks: ['mochaTest']
            },
            app_lint: {
                files:  ['<%= jshint.app_files.src %>'],
                tasks:['jshint:app_files']
            },
            jade_compile: {
                files: ['<%= jade.compile.files[0].src %>'],
                tasks:['jade:compile']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-jade');

    // Default task.
    grunt.registerTask('default', ['nodemon']);

};
