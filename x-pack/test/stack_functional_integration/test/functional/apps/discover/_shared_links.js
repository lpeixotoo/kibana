
import expect from 'expect.js';

import {
  bdd,
  esClient
} from '../../../support';

import PageObjects from '../../../support/page_objects';

bdd.describe('shared links', function describeIndexTests() {
  let baseUrl;
  // The message changes for Firefox < 41 and Firefox >= 41
  // const expectedToastMessage = 'Share search: URL selected. Press Ctrl+C to copy.';
  // const expectedToastMessage = 'Share search: URL copied to clipboard.';
  // Pass either one.
  const expectedToastMessage = /Share search: URL (selected\. Press Ctrl\+C to copy\.|copied to clipboard\.)/;

  bdd.before(function () {
    baseUrl = PageObjects.common.getHostPort();

    const fromTime = '2015-09-19 06:31:44.000';
    const toTime = '2015-09-23 18:31:44.000';

    PageObjects.common.debug('discover');
    return PageObjects.common.navigateToApp('discover')
    .then(function () {
      PageObjects.common.debug('setAbsoluteRange');
      return PageObjects.header.setAbsoluteRange(fromTime, toTime);
    })
    .then(function () {
      //After hiding the time picker, we need to wait for
      //the refresh button to hide before clicking the share button
      return PageObjects.common.sleep(1000);
    });
  });


  bdd.describe('shared link', function () {
    bdd.it('should show "Share a link" caption', function () {
      const expectedCaption = 'Share a link';
      return PageObjects.discover.clickShare()
      .then(function () {
        PageObjects.common.saveScreenshot('Discover-share-link');
        return PageObjects.discover.getShareCaption();
      })
      .then(function (actualCaption) {
        expect(actualCaption).to.be(expectedCaption);
      });
    });

    bdd.it('should show the correct formatted URL', function () {
      const expectedUrl = baseUrl
        + '/app/kibana?_t=1453775307251#'
        + '/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0),time'
        + ':(from:\'2015-09-19T06:31:44.000Z\',mode:absolute,to:\'2015-09'
        + '-23T18:31:44.000Z\'))&_a=(columns:!(_source),index:\'logstash-'
        + '*\',interval:auto,query:(query_string:(analyze_wildcard:!t,query'
        + ':\'*\')),sort:!(\'@timestamp\',desc))';
      return PageObjects.discover.getSharedUrl()
      .then(function (actualUrl) {
        // strip the timestamp out of each URL
        expect(actualUrl.replace(/_t=\d{13}/,'_t=TIMESTAMP'))
          .to.be(expectedUrl.replace(/_t=\d{13}/,'_t=TIMESTAMP'));
      });
    });

    bdd.it('should show toast message for copy to clipboard', function () {
      return PageObjects.discover.clickCopyToClipboard()
      .then(function () {
        return PageObjects.header.getToastMessage();
      })
      .then(function (toastMessage) {
        PageObjects.common.saveScreenshot('Discover-copy-to-clipboard-toast');
        expect(toastMessage).to.match(expectedToastMessage);
      })
      .then(function () {
        return PageObjects.header.waitForToastMessageGone();
      });
    });

    // TODO: verify clipboard contents
    bdd.it('shorten URL button should produce a short URL', function () {
      const re = new RegExp(baseUrl + '/goto/[0-9a-f]{32}$');
      return PageObjects.discover.clickShortenUrl()
      .then(function () {
        return PageObjects.common.try(function tryingForTime() {
          PageObjects.common.saveScreenshot('Discover-shorten-url-button');
          return PageObjects.discover.getShortenedUrl()
          .then(function (actualUrl) {
            expect(actualUrl).to.match(re);
          });
        });
      });
    });

    // NOTE: This test has to run immediately after the test above
    bdd.it('should show toast message for copy to clipboard', function () {
      return PageObjects.discover.clickCopyToClipboard()
      .then(function () {
        return PageObjects.header.getToastMessage();
      })
      .then(function (toastMessage) {
        expect(toastMessage).to.match(expectedToastMessage);
      })
      .then(function () {
        return PageObjects.header.waitForToastMessageGone();
      });
    });
  });
});