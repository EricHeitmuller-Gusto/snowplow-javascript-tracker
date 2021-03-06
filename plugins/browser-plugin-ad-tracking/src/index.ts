/*
 * Copyright (c) 2021 Snowplow Analytics Ltd, 2010 Anthon Pang
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { BrowserPlugin, BrowserTracker } from '@snowplow/browser-tracker-core';
import {
  buildAdClick,
  buildAdConversion,
  buildAdImpression,
  AdClickEvent,
  AdImpressionEvent,
  AdConversionEvent,
  CommonEventProperties,
} from '@snowplow/tracker-core';

const _trackers: Record<string, BrowserTracker> = {};

/**
 * Adds advertisement tracking functions
 */
export function AdTrackingPlugin(): BrowserPlugin {
  return {
    activateBrowserPlugin: (tracker) => {
      _trackers[tracker.id] = tracker;
    },
  };
}

/**
 * Track an ad being served
 *
 * @param string impressionId Identifier for a particular ad impression
 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
 * @param number cost Cost
 * @param string bannerId Identifier for the ad banner displayed
 * @param string zoneId Identifier for the ad zone
 * @param string advertiserId Identifier for the advertiser
 * @param string campaignId Identifier for the campaign which the banner belongs to
 * @param object Custom context relating to the event
 * @param timestamp number or Timestamp object
 */
export function trackAdImpression(
  event: AdImpressionEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(buildAdImpression(event), event.context, event.timestamp);
    }
  });
}

/**
 * Track an ad being clicked
 *
 * @param string clickId Identifier for the ad click
 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
 * @param number cost Cost
 * @param string targetUrl (required) The link's target URL
 * @param string bannerId Identifier for the ad banner displayed
 * @param string zoneId Identifier for the ad zone
 * @param string impressionId Identifier for a particular ad impression
 * @param string advertiserId Identifier for the advertiser
 * @param string campaignId Identifier for the campaign which the banner belongs to
 * @param object Custom context relating to the event
 * @param timestamp number or Timestamp object
 */
export function trackAdClick(
  event: AdClickEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(buildAdClick(event), event.context, event.timestamp);
    }
  });
}

/**
 * Track an ad conversion event
 *
 * @param string conversionId Identifier for the ad conversion event
 * @param number cost Cost
 * @param string category The name you supply for the group of objects you want to track
 * @param string action A string that is uniquely paired with each category
 * @param string property Describes the object of the conversion or the action performed on it
 * @param number initialValue Revenue attributable to the conversion at time of conversion
 * @param string advertiserId Identifier for the advertiser
 * @param string costModel The cost model. 'cpa', 'cpc', or 'cpm'
 * @param string campaignId Identifier for the campaign which the banner belongs to
 * @param object Custom context relating to the event
 * @param timestamp number or Timestamp object
 */
export function trackAdConversion(
  event: AdConversionEvent & CommonEventProperties,
  trackers: Array<string> = Object.keys(_trackers)
) {
  trackers.forEach((t) => {
    if (_trackers[t]) {
      _trackers[t].core.track(buildAdConversion(event), event.context, event.timestamp);
    }
  });
}