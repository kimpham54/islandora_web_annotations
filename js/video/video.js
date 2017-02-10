
var user = "anonymous";

jQuery(document).ready(function() {
    $ = jQuery;
    user = Drupal.settings.islandora_web_annotations.user;

    // Hide Lib related permission fields
    jQuery(".annotator-checkbox").hide();

    if(Drupal.settings.islandora_web_annotations.view === false){
        jQuery(".vjs-showannotations-annotation").hide();
        jQuery(".vjs-statistics-annotation").hide();
    }

    if(Drupal.settings.islandora_web_annotations.create == false) {
        jQuery(".vjs-new-annotation").hide();
    }

    jQuery("#islandora_videojs_html5_api").addClass("video-js");
    jQuery("#islandora_videojs_html5_api").attr("preload", "none");

    preload="none"

    var objectUri = window.location.href;
    objectUri = objectUri.replace("%3A", ":");
    objectUri = objectUri.replace("#", "");

    var options = {
        optionsAnnotator: {
            permissions: { },
            store: {
                // The endpoint of the store on your server.
                prefix: "http://localhost:8000/islandora_web_annotations",
                emulateJSON: true,
                annotationData: {uri:objectUri},
                urls: {
                    create: '/create',
                    update: '/update',
                    destroy: '/delete'
                },
                loadFromSearch:{
                    limit:100,
                    uri: objectUri,
                }
            },
            richText: {
                tinymce:{
                    selector: "li.annotator-item textarea",
                    plugins: "media image insertdatetime link code",
                    menubar: false,
                    toolbar_items_size: 'small',
                    extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code ",
                }
            },
            annotator: {}, //Annotator core
        },
        optionsVideoJS: {techOrder: ["html5","flash"]},
        optionsRS: {},
        optionsOVA: {posBigNew:'none'/*,NumAnnotations:20*/},
    }

    //Load the plugin Open Video Annotation
    try {

        var targetDiv = jQuery(".video-js").first().parent().parent();
        ova = new OpenVideoAnnotation.Annotator(targetDiv, options);
    }
    catch(e){
        alert(e)
    }

    //change the user (Experimental)
    ova.setCurrentUser(user);
    $('#username').change(function () {
        ova.setCurrentUser($(this).val());
    });

    ova.annotator.subscribe('annotationViewerShown', function(viewer, annotations){
        if(jQuery(".annotator-hl.active").length > 0) {
            applyPermissionsOnView(annotations);
            var left = jQuery(".annotator-hl.active").first().find("div").first().css("left");
            left = left.substr(0, left.length - 2);
            var width = jQuery(".annotator-hl.active").first().find("div").first().width();
            var newleft = Number(left) + Number(width) / 2;
            jQuery(".annotator-viewer").first().css({left: newleft + "px"});

            var top = jQuery(".annotator-hl.active").first().find("div").first().css("top");
            top = top.substr(0, top.length - 2);
            top = Number(top) + 30;
            jQuery(".annotator-viewer").first().css({top: top + "px"});

        } else {
            if(jQuery(".vjs-selectionbar-RS").first().is(":visible") === true) {
                positionAnnotatorForm(".annotator-viewer");
            }
        }
    });

    ova.annotator.subscribe('annotationEditorShown', function(viewer, annotations){
        if(jQuery(".islandora-oralhistories-object").length > 0){
            positionAnnotatorForm(".annotator-editor");
        }

    });

    ova.annotator.subscribe('beforeAnnotationUpdated', function(annotation){
        annotation.author = ova.currentUser;
    });
});

function applyPermissionsOnView(annotations){

    var createdByMe = (user == annotations[0].user) ? true:false;

    jQuery(".annotator-edit").hide();
    jQuery(".annotator-delete").hide();

    if(Drupal.settings.islandora_web_annotations.edit_any === true || (Drupal.settings.islandora_web_annotations.edit_own === true && createdByMe === true)) {
        jQuery(".annotator-edit").show();
    }
    if(Drupal.settings.islandora_web_annotations.delete_any === true || (Drupal.settings.islandora_web_annotations.delete_own === true && createdByMe === true)) {
        jQuery(".annotator-delete").show();
    }

}

function positionAnnotatorForm(formSelector){
    var left = jQuery(".vjs-selectionbar-RS").first().css("left");
    left = left.substr(0, left.length - 2);
    var width = jQuery(".vjs-selectionbar-RS").first().width();
    var newleft = Number(left) + Number(width) / 2;
    jQuery(formSelector).first().css({left: newleft + "px"});

    var height = jQuery(document.getElementsByTagName("video")[0]).height();
    var top = height - 20;
    jQuery(formSelector).first().css({top: top + "px"});

}
