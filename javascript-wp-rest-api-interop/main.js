const showdownext = require('./showdown-ext/showdown-ext').shodownext;
showdownext.init();

const fs = require('fs')
const path = require('path');
const crypto = require('crypto');
// var $ = require('jquery')
const WCAPI = require('@woocommerce/woocommerce-rest-api').default;
var FormData = require('formdata-node');
var Blob = require('node-blob');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

// var shasum = crypto.createHash('md5')
// const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const HttpStatus = require("http-status-codes");
const WPAPI = require('wpapi');
const LLMSAPI = require('llms-api-node');

const rootUrl = 'http://localhost:120';
const wpRootUrl = 'http://localhost:120/wp-json';
const mail = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const username = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const pass = 'XXXXXXXXXXXXXXXXXXXXXX';

var wp = new WPAPI({
    endpoint: wpRootUrl,
    username: username,
    password: pass
});

var llms = new LLMSAPI({
    authMethod: 'basic',
    url: rootUrl,
    consumerKey: mail,
    consumerSecret: pass
});

var wc = new WCAPI({
    url: rootUrl,
    consumerKey: 'ck_458dafac61616491d6357f787268672b53721d06',
    consumerSecret: 'cs_566108d69771be97ae0c2ff1e7b843d53bb4147e'
});

const CourseRequest =
{
    id: -1,
    title: "",
    content:
    {
        rendered: "",
        protected: false
    }
}

const LessonRequest =
{
    parent_id: -1,
    course_id: -1,
    id: -1,
    title: "",
    content:
    {
        rendered: "",
        protected: false
    }
}

const SectionRequest =
{
    parent_id: -1,
    title: "Curriculum"
}

function jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
}

var req = jsonCopy(CourseRequest);

// llms.getAsync('/sections')
//     .then(response => {
//         lesson = JSON.parse(response.body);
//     });


async function updateAll(llmsConfig) {

    // var res = await wp.get()
    var route = wp.root("wc/v3/products");
    var res = await route.get();
    console.log();

    for (var courseConfig of llmsConfig) {
        courseRequest = jsonCopy(CourseRequest);
        if (
            !courseConfig.hasOwnProperty("id") ||
            courseConfig.course_id < 0) {
            delete courseRequest.id;
            await makeCourse(courseConfig, courseRequest);
        }
        else {
            response = await llms.getAsync('/courses/' + courseConfig.course_id);
            if (response.statusCode != HttpStatus.OK) {
                delete courseRequest.id;
                await makeCourse(courseConfig, courseRequest);
            }
            // TODO
            // else {
            //     courseRequest.id = courseConfig.course_id;
            //     await updateCourse(courseConfig, courseRequest);
            // }
        }
    }
}

async function makeCourse(courseConfig, courseRequest) 
{
    courseRequest.title = courseConfig.title;
    courseRequest.protected = courseConfig.protected;
    courseRequest.slug = courseConfig.slug;
    var courseResponse = await llms.postAsync('/courses', courseRequest);
    if (courseResponse.statusCode == HttpStatus.CREATED) {
        // Create course content
        var course = JSON.parse(courseResponse.body);
        courseConfig.course_id = course.id;

        var sectionRequest = jsonCopy(SectionRequest);
        sectionRequest.parent_id = courseConfig.course_id;
        var sectionResponse = await llms.postAsync('/sections', sectionRequest);
        if (sectionResponse.statusCode == HttpStatus.CREATED) {
            var section = JSON.parse(sectionResponse.body);
            courseConfig.section_id = section.id;
            await updateOrMakeCourseLessons(courseConfig);

            // Set course image
            courseRequest = jsonCopy(CourseRequest);
            var route = wp.root("llms/v1/courses/" + courseConfig.course_id);
            try {
                response = await route.update({
                    featured_media: courseConfig.image_id
                });
            }
            catch (e) {
                return;
            }

            // Set course keywords
            //TODO
            var route = wp.root("llms/v1/courses/" + courseConfig.course_id);
            var postResponse = null;
            try {
                postResponse = await route.update(
                    {
                        meta_data:
                            [
                                {
                                    key: "keywords",
                                    value:
                                        courseConfig.hasOwnProperty("keywords") ?
                                            courseConfig.keywords.join() :
                                            ""
                                }
                            ]
                    }
                );

                console.log();
            }
            catch (e) {

            }
        }

        // Create a product
        // TODO update in create
        var productResponse = await wc.post("products", {
            name: courseRequest.title,
            type: "simple"
        });

        if (productResponse.status == HttpStatus.CREATED) {
            courseConfig.product_id = productResponse.data.id;

            var route = wp.root("wc/v3/products/" + courseConfig.product_id);
            var postResponse = null;
            try {
                postResponse = await route.update(
                    {
                        name: courseConfig.title,
                        virtual: true,
                        regular_price: courseConfig.price,
                        sold_individually: true,
                        images: [
                            { src: courseConfig.image_url }
                        ],
                        meta_data:
                            [
                                {
                                    key: "keywords",
                                    value:
                                        courseConfig.hasOwnProperty("keywords") ?
                                            courseConfig.keywords.join() :
                                            ""
                                },
                                { key: "product_type", value: "course" },
                                { key: "course_id", value: courseConfig.course_id },
                            ]
                    }
                );

                console.log();
            }
            catch (e) {
                console.log(e);
                return;
            }
        }
    }
}

async function updateOrMakeCourseLessons(courseConfig) {
    var courseLessonsPath = path.join(__dirname, courseConfig.path);
    const items = fs.readdirSync(courseLessonsPath);

    for (const file of items) {
        if (file.endsWith(".png") || file.endsWith(".jpg")) {
            var fullname = path.join(courseLessonsPath, file);
            var image = fs.readFileSync(fullname);
            var hash = crypto.createHash('md5').update(image).digest('hex');
            if (
                !courseConfig.hasOwnProperty("image_hash") ||
                courseConfig.image_hash !== hash) {
                var route = null;
                if (courseConfig.hasOwnProperty("image_id")) {
                    route = wp.root("wp/v2/media/" + courseConfig.image_id);
                    await route.delete();
                }

                var postResponse = null;
                try {
                    postResponse = await wp.media().file(image, 'cirrus_product_' + file).create({
                        title: 'cirrus_product_' + file,
                        media_type: "image"
                    });
                    courseConfig.image_hash = hash;
                    courseConfig.image_id = postResponse.id;
                    courseConfig.image_url = postResponse.source_url;
                }
                catch (e) {
                    console.log(e);
                }
            }

            continue;
        }
        else if (!file.endsWith(".md")) continue;
        var fullname = path.join(courseLessonsPath, file);
        var stat = fs.statSync(fullname);
        var markdown = fs.readFileSync(fullname, { encoding: 'utf-8' });
        var hash = crypto.createHash('md5').update(markdown).digest('hex');
        var lessonRequest = jsonCopy(LessonRequest);
        if (courseConfig.lessons.hasOwnProperty(file)) {
            if (courseConfig.lessons[file].hash === hash) {
                console.log(courseConfig.name + ": " + file + " already up to date.");
                continue;
            }

            courseConfig.lessons[file].hash = hash
            var html = await markdownToHtml(markdown);
            lessonRequest.title = path.basename(file, ".md").replace(/^[^A-Za-z]+/, '');
            lessonRequest.slug = courseConfig.slug + "-" + lessonRequest.title;
            lessonRequest.content.rendered = html;
            lessonRequest.id = courseConfig.lessons[file].id;
            lessonRequest.course_id = courseConfig.course_id;
            lessonRequest.parent_id = courseConfig.section_id;

            response = await llms.getAsync('/lessons/' + lessonRequest.id);
            if (response.statusCode != HttpStatus.OK) {
                delete lessonRequest.id;
                await makeLesson(courseConfig, lessonRequest, file);
            }
            else await updateLesson(courseConfig, lessonRequest);
        }
        else {
            courseConfig.lessons[file] = {};
            courseConfig.lessons[file].hash = hash
            var html = await markdownToHtml(markdown);
            lessonRequest.title = path.basename(file, ".md").replace(/^[^A-Za-z]+/, '');
            lessonRequest.slug = courseConfig.slug + "-" + lessonRequest.title;
            lessonRequest.content.rendered = html;
            delete lessonRequest.id;
            lessonRequest.course_id = courseConfig.course_id;
            lessonRequest.parent_id = courseConfig.section_id;

            await makeLesson(courseConfig, lessonRequest, file);
        }
    }
}

async function makeLesson(courseConfig, lessonRequest, file) {
    // Response
    var response = await llms.postAsync(
        '/lessons',
        lessonRequest);
    if (response.statusCode == HttpStatus.CREATED) {
        var lesson = JSON.parse(response.body);
        courseConfig.lessons[file].id = lesson.id;
    }
}

async function updateLesson(courseConfig, lessonRequest) {
    // Response
    var response = await llms.postAsync(
        '/lessons/' + lessonRequest.id,
        lessonRequest);
    if (response.statusCode == HttpStatus.OK) {
        console.log("updated with success");
        // var lesson = JSON.parse(response.body);
        // courseConfig.lessons[file].id = lesson.id;        
    }
}

async function markdownToHtml(markdown) {
    return await showdownext.makeHtml(markdown);
}

var llmsConfigPath = path.join(__dirname, '/content/config.json');
var data = fs.readFileSync(llmsConfigPath, { encoding: 'utf-8' });
var llmsConfig = JSON.parse(data);
updateAll(llmsConfig).then(() => {
    console.log("");
    fs.writeFileSync(llmsConfigPath, JSON.stringify(llmsConfig, null, 2), { encoding: 'utf8', flag: 'w' })
});