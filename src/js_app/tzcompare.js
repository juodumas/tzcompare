/* global timezoneJS, TZDATA, TZ_BY_COUNTRY */

var _tz = timezoneJS.timezone;
_tz.loadingScheme = _tz.loadingSchemes.MANUAL_LOAD;
_tz.loadZoneDataFromObject(TZDATA);
timezoneJS.Date.prototype.$fmt = Date.prototype.$fmt;

var ViewModel = function() {
  var self = this,
      now = new Date();

  self.countries = Object.keys(TZ_BY_COUNTRY);
  self.timezones = [];
  
  var zones = timezoneJS.timezone.zones,
      categories = {
        'Africa': 1, 'America': 1, 'Antarctica': 1, 'Arctic': 1, 'Asia': 1,
        'Atlantic': 1, 'Australia': 1, 'Europe': 1, 'Indian': 1, 'Pacific': 1,
        'US': 1
      };
  Object.keys(zones).forEach(function(timezone) {
    var tz = timezone.split('/');
    if (tz[1] && categories[tz[0]]) {
      self.timezones.push(timezone);
    }
  });
  self.timezones.sort();
  
  self.country = ko.observable();
  self.timezone = ko.observable();
  self.clocks = ko.observableArray();
  self.minutes = ko.observable(now.getHours() * 60 + now.getMinutes());
  self.now = ko.computed(function() {
    var minutes = self.minutes(),
        hours = Math.floor(minutes / 60);
    now.setHours(hours);
    now.setMinutes(minutes - hours * 60);
    return now;
  });

  // Timezone filtering by country.
  self.timezones_filtered = ko.observable(self.timezones);
  ko.computed(function() {
    var country = self.country(),
        timezones = self.timezones;
    if (!country) {
      self.timezones_filtered(timezones);
      return;
    }
    timezones = TZ_BY_COUNTRY[country];
    self.timezones_filtered(timezones);
    if (timezones.length == 1) {
      self.timezone(timezones[0]);
    }
    return timezones;
  });
  
  var lpad0 = function(x) {
    return x < 10 ? '0' + x : x;
  };

  self.add_clock = function(tz) {
    if (tz === undefined) {
      tz = self.timezone();
      if (!tz) {
        alert('Please select a timezone.');
        return;
      }
    }
    else if (tz && !timezoneJS.timezone.zones[tz]) {
      return;
    }
    var tz_country = '';
    if (tz) {
      var countries = Object.keys(TZ_BY_COUNTRY);
      for (var i = 0, len_i = countries.length; i < len_i; i++) {
        var tzs_by_country = TZ_BY_COUNTRY[countries[i]];
        for (var j = 0, len_j = tzs_by_country.length; j < len_j; j++) {
          if (tzs_by_country[j] == tz) {
            tz_country = countries[i];
            break;
          }
        }
      }
    }

    var timezone = {
      timezone: tz ? tz : 'Local time',
      country: tz_country,
      computed: ko.computed(function() {
        var dt = new timezoneJS.Date(self.now(), tz),
        offset = dt.getTimezoneOffset(),
        day;
        switch(dt.getDay()) {
          case 0: day = 'Sunday'; break;
          case 1: day = 'Monday'; break;
          case 2: day = 'Tuesday'; break;
          case 3: day = 'Wednesday'; break;
          case 4: day = 'Thursday'; break;
          case 5: day = 'Friday'; break;
          case 6: day = 'Saturday'; break;
        }
        return {
          date: dt.$fmt('%H:%M'),
          day: day,
          offset_gmt: (offset > 0 ? '-' : '') + lpad0(Math.round(Math.abs(offset) / 60)) + ':' + lpad0(Math.abs(offset) % 60),
          offset: offset
        };
      })
    };
    self.clocks.push(timezone);
    self.clocks.sort(function(a, b) { return a.computed().offset < b.computed().offset; });
  };
  self.remove_clock = function(clock) {
    self.clocks.remove(clock);
  };

  // Generate bookmarking URL.
  self.bookmark = ko.computed(function() {
    var clocks = self.clocks(),
        timezones = [];
    clocks.forEach(function(clock) {
      if (clock.timezone == 'Local time') {
        return;
      }
      timezones.push(clock.timezone);
    });
    return '?clocks=' + encodeURIComponent(timezones.join('+'));
  });

  // Add a local (browser) time clock.
  self.add_clock('');
  // Restore clocks by reading the 'clocks' GET parameter.
  var timezones = /[?&]clocks=([^&]+)/.exec(window.location.search);
  if (timezones) {
    timezones = decodeURIComponent(timezones[1]).split('+');
    timezones.forEach(function(timezone) {
      self.add_clock(timezone);
    });
  }
};

ko.applyBindings(new ViewModel());
