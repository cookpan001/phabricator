/**
 * @provides javelin-behavior-global-drag-and-drop
 * @requires javelin-behavior
 *           javelin-dom
 *           javelin-uri
 *           javelin-mask
 *           phabricator-drag-and-drop-file-upload
 */

JX.behavior('global-drag-and-drop', function(config) {
  if (!JX.PhabricatorDragAndDropFileUpload.isSupported()) {
    return;
  }

  var pending = 0;
  var files = [];
  var errors = false;

  if (config.ifSupported) {
    JX.$(config.ifSupported).style.display = '';
  }

  var page = JX.$('phabricator-standard-page');
  var drop = new JX.PhabricatorDragAndDropFileUpload(page)
    .setURI(config.uploadURI)
    .setViewPolicy(config.viewPolicy)
    .setChunkThreshold(config.chunkThreshold);

  drop.listen('didBeginDrag', function() {
    JX.Mask.show('global-upload-mask');
    JX.DOM.show(JX.$(config.instructions));
  });

  drop.listen('didEndDrag', function() {
    JX.Mask.hide('global-upload-mask');
    JX.DOM.hide(JX.$(config.instructions));
  });

  drop.listen('willUpload', function() {
    pending++;
  });

  drop.listen('didUpload', function(f) {
    files.push(f);

    pending--;
    if (pending === 0 && !errors) {
      // If whatever the user dropped in has finished uploading, send them to
      // their uploads.
      var uri;
      uri = JX.$U(config.browseURI);
      var ids = [];
      for (var ii = 0; ii < files.length; ii++) {
        ids.push(files[ii].getID());
      }
      uri.setQueryParam('h', ids.join(','));

      files = [];

      uri.go();
    }
  });

  drop.listen('didError', function() {
    pending--;
    errors = true;
  });

  drop.start();
});
